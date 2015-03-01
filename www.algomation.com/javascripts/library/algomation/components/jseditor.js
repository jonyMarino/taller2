"use strict";

var UndoManager = require("ace/undomanager").UndoManager;

/**
 * namespaces for the render library
 * @namespace algo
 */
var algo = algo || {};

/**
 * @namespace
 */
algo.components = algo.components || {};

/*

 required options for the editor constructor

 {
 readOnly : boolean;
 jqs      : jquery selector for the outer most element of editor including the toolbar is code is editable
 editorID : id of actual ACE editor element ( e.g. 'editor' ) not a CSS/Sizzle selector
 }

 */

/**
 * read/write javascript editor for algorithm creation, editing
 * @param options - options for the editor
 * @param selector
 */
algo.components.JSEditor = function (options) {

    // turn options into our properties

    _.extend(this, options);

    // get toolbar components as properties as well

    algo.Util.propertiesFromElements(this.jqs, this);

    // setup ACE editor

    this.editor = ace.edit(this.editorID);

    // enable/disable syntex checking via a web worker

    this.editor.getSession().setUseWorker(this.useWorker);

    this.editor.setTheme("ace/theme/github");

    this.editor.getSession().setMode("ace/mode/javascript");

    this.editor.setHighlightActiveLine(true);

    this.setReadOnly(this.readOnly);

    // hijack the ACE find command and redirect to our find dialog
    this.editor.commands.addCommand({
        name: "unfind",
        bindKey: {
            win: "Ctrl-F",
            mac: "Command-F"
        },
        exec: _.bind(function() {
            this.find();
            return true;
        }, this),
        readOnly: true
    });

    // add the pretty code shortcut
    this.editor.commands.addCommand({
        name: "pretty",
        bindKey: {
            win: "Ctrl-Shift-P",
            mac: "Command-Shift-P"
        },
        exec: _.bind(function() {
            this.pretty();
            return true;
        }, this),
        readOnly: true
    });

    // subscribe to IDE events

    amplify.subscribe('algorithm-loaded', this, this.algorithmLoaded);

    amplify.subscribe('undo-algorithm', this, _.bind(this.undo, this));

    amplify.subscribe('redo-algorithm', this, _.bind(this.redo, this));

    amplify.subscribe('find-algorithm', this, _.bind(this.find, this));

    // provide a getter/setter for the source

    Object.defineProperty(this, 'es6', {
        enumerable: true,
        get       : function () {
            return this.editor.getValue();
        },
        set       : function(s) {
            this.editor.setValue(s);
        }
    });

    // sink events according to whether we are editable or not

    if (!this.readOnly) {

        // change handler updates source of algorithm

        this.editor.getSession().on('change', _.bind(function (e) {

            // ignore changes unless we have a loaded algorithm and only if the source has changed

            if (this.algorithm) {

                var source = this.editor.getValue();

                if (source !== this.algorithm.es6) {

                    this.algorithm.es6 = source;
                }
            }

        }, this));
    }

    // selection change controls cut/copy/paste/find/replace buttons

    this.editor.getSession().selection.on('changeSelection', _.bind(this.selectionChanged, this));

};

/**
 * when the selection is changed in the editor
 * @param e
 */
algo.components.JSEditor.prototype.selectionChanged = function (e) {

    this.selection = this.editor.session.getTextRange(this.editor.getSelectionRange());

};

/**
 * when an algorithm is loaded
 * @param a
 */
algo.components.JSEditor.prototype.algorithmLoaded = function (a) {

    // set algorithm and setup source for editing

    this.algorithm = a;

    if (this.editor.getValue() != this.algorithm.es6) {

        this.editor.setValue(this.algorithm.es6, -1);

        this.editor.clearSelection();

        // start undo/redo from here so user can't undo to empty document

        this.editor.getSession().setUndoManager(new UndoManager());

    }

};

/**
 * clear the selection
 */
algo.components.JSEditor.prototype.clearSelection = function() {
    this.editor.clearSelection();
};

/**
 * goto and highlight a specific line, this is typically used when the players stops a source line, not during
 * actual editing
 * @param {number} line
 * @param {number} column
 */
algo.components.JSEditor.prototype.gotoLine = function (line, column) {

    // clear selection then goto line and optional column

    this.editor.selection.clearSelection();

    this.editor.scrollToLine(line - 1, true, true);

    this.editor.moveCursorTo(line - 1, column || 0, true);

};

/**
 * the following are all event handlers for when the editor is used to display a running algorithm
 * @param options
 */
algo.components.JSEditor.prototype.pause = function (options) {

    // if line was specified there display in the editor
    if (options && options.line) {

        // if a line number was specified then we can just go there, if its a string we must locate in
        // a comment block of the form /*XYZ:*/ e.g. /*innerLoop: This is inner loop. */

        var line = options.line;

        if (_.isString(options.line)) {

            this.editor.find("//=" + options.line, {
                skipCurrent  : false,
                backwards    : false,
                wrap         : true,
                caseSensitive: true,
                wholeWord    : false,
                regExp       : false
            }, true);

            return;
        }

        this.gotoLine(line, 0);
    }

};

/**
 * the final yield or end of algorithm ( which can contain the same options as pause )
 * @param options
 */
algo.components.JSEditor.prototype.done = function (options) {

    this.pause(options);

};

algo.components.JSEditor.prototype.reset = function () {

    this.gotoLine(1,1);
};

/**
 * enable or disable read-only mode
 * @param b
 */
algo.components.JSEditor.prototype.setReadOnly = function (b) {

    this.editor.setReadOnly(b);
};

/**
 * UNDO
 */
algo.components.JSEditor.prototype.undo = function () {

    if (!this.readOnly && this.editor.session.getUndoManager().hasUndo()) {
        this.editor.session.getUndoManager().undo(true);
    } else {
        new algo.components.FlashMessage("No Change", "There is nothing to undo.");
    }
};

/**
 * REDO
 */
algo.components.JSEditor.prototype.redo = function () {

    if (!this.readOnly && this.editor.session.getUndoManager().hasRedo()) {
        this.editor.session.getUndoManager().redo(true);
    } else {
        new algo.components.FlashMessage("No Change", "There is nothing to redo.");
    }
};

/**
 * FIND clicked on main toobar ribbon
 */
algo.components.JSEditor.prototype.find = function () {

    this.toggleFinder();

};

/**
 * toggle finder
 */
algo.components.JSEditor.prototype.toggleFinder = function () {

    if (!this.finder) {

        this.finder = algo.Util.cloneTemplate('editor-find');
        this.finder.appendTo(this.editorElement);

        algo.Util.propertiesFromElements(this.finder, this);

        // do incremental search on key up

        this.findBox.keyup(_.bind(function (e) {

            // if enter pressed treat like a find next, otherwise do an incremental search including current selection

            this.doFind(true, e.keyCode === 13);

        }, this));

    } else {

        this.finder.toggleClass('hidden');

        if (!this.finder.hasClass('hidden')) {
            this.findBox.focus();
        }
    }
};

/**
 * user clicked cancel in finder
 */
algo.components.JSEditor.prototype.findCancelClick = function () {
    this.toggleFinder();
};

/**
 * user clicked find previous
 */
algo.components.JSEditor.prototype.findPreviousClick = function () {

    this.doFind(false, true);
};

/**
 * user clicked find next
 */
algo.components.JSEditor.prototype.findNextClick = function () {

    this.doFind(true, true);
};

/**
 * user clicked replace
 */
algo.components.JSEditor.prototype.findReplaceButtonClick = function () {

    this.editor.replace(this.replaceBox.val());
};

/**
 * user clicked replace all
 */
algo.components.JSEditor.prototype.findReplaceAllButtonClick = function () {

    this.editor.replaceAll(this.replaceBox.val());
};

/**
 * start a find operation
 * @param e
 */
algo.components.JSEditor.prototype.doFind = function (forwards, skipCurrent) {

    var term = this.findBox.val();

    if (term) {

        this.editor.find(term, {
            skipCurrent  : skipCurrent,
            backwards    : !forwards,
            wrap         : this.wrapCheckbox.is(":checked"),
            caseSensitive: this.caseCheckbox.is(":checked"),
            wholeWord    : this.wholeCheckbox.is(":checked"),
            regExp       : false
        });
    }
};

/**
 * prettify the selected range or the entire file
 */
algo.components.JSEditor.prototype.pretty = function () {


    // save starting position of selection/cursor
    var range = this.editor.getSelectionRange();

    // get selected text
    var selection = this.editor.session.getTextRange(range);

    // format selection or entire file
    if (selection) {
        this.editor.insert(js_beautify(selection));
    } else {
        this.editor.setValue(js_beautify(this.editor.getValue()));
    }

    // clear selection and reposition cursor to original location

    this.editor.selection.clearSelection();

    this.editor.moveCursorToPosition(range.start)
};







