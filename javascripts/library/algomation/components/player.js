/*global, window, _ */

"use strict";

var algo = algo || {};

/**
 *
 * @param container - the container for the player, components will only be selected within the container
 * @param algorithmID - optional algorithm ID
 * @param testing - true if we are being used on the editor page for testing.
 * @constructor
 */
algo.Player = function (container) {

    // save container

    this.container = container;

    // determine if we are running as the embedded player or not

    this.embedded = algo.App.I.getParameter('embedded', false);

    // are we running as part of a tutorial ( we must be embedded )

    this.tutorialMode = this.embedded ? !!algo.App.I.getParameter('tutorial', false) : false;

    // set flag to indicate if we are being used as a test window

    this.testing = algo.G.testing;

    // allow native generators only if testing AND es6=true query string is present ( the editor which opens
    // the test window will set the es6 flag is possible )

    this.nativeGenerators = this.testing && (algo.App.I.getParameter('es6', false));

    // if we are being used to show a featured algorithm this DOM property will represent the ID

    var featuredID = algo.G.featuredid;

    // start loading the algorithm right away, since we need access to title, description source code etc,
    // although the worker will also have to load the algorithm source
    // NOTE: The algorithm ID can be supplied programmatically i.e. when we are used for testing with the editor
    // or from the query string when on the standalone player page or from the flashed featuredID

    this.algorithmID = featuredID || algo.App.I.getParameter('algorithm');

    algo.Algorithm.load(this.algorithmID, _.bind(function (error, algorithm) {

        if (error === K.API_NO_ERROR && algorithm) {

            // save algorithm

            this.algorithm = algorithm;

            // restart will initialize or restart the algorithm

            this.restart();

            // update surface scaling on resize

            $(window).resize(_.bind(this.scaleSurface, this));

        } else {

            algo.App.I.message("Error", "<p>There was a problem loading the algorithm.</p><b>Error:</b>" + K.errorToString(error), _.bind(function () {

                algo.App.I.goHome();

            }));
        }

    }, this));

    // show loading message

    if (!this.embedded) {
        new algo.components.FlashMessage("Loading...", "The algorithm is loading, please wait...", true);
    }

    // subscribe to events

    amplify.subscribe('algorithm-restart', this, _.bind(this.restart, this));

    amplify.subscribe('algorithm-continue', this, _.bind(this.continue, this));

    amplify.subscribe('algorithm-speed', this, _.bind(this.setSpeed, this));

    amplify.subscribe('algorithm-mode', this, _.bind(this.setPlayMode, this));

    amplify.subscribe('algorithm-fork', this, _.bind(this.forkAlgorithm, this));

    amplify.subscribe('algorithm-edit', this, _.bind(this.editAlgorithm, this));

    // activate all tooltips within the player DOM section

    if (!this.embedded) {
        $('[data-element="player-dom"] [data-toggle="tooltip"]').tooltip();
    } else {

        // for the embedded player, make any random click on the surface navigate to the player
        // NOTE: When in tutorial mode we open in _blank, otherwise it opens in _top

        var surface = $('.algo-surface-embedded');

        surface.css({cursor: 'pointer'});

        surface.on('click', _.bind(function (e) {

            if (this.algorithm) {
                var uri = algo.App.I.preferredPlayerLink(this.algorithm);
                window.open(uri, this.tutorialMode ? "_blank" : "_top");
            }

        }, this));
    }
 

    // activate all tooltips within the editor DOM section

    if (!this.embedded) {
        $('[data-element="player-dom"] [data-toggle="tooltip"]').tooltip({container: 'body'});
    }
};

/**
 * show the embedded player footer if we are embedded and only the first time we are called
 */
algo.Player.prototype.showFooter = function () {

    if (this.embedded && this.algorithm && !this.footer) {

        this.footer = algo.Util.cloneTemplate("embeddedFooter-template");

        // set playerLink anchor to open the player

        var link = $('[data-element="playerLink"]', this.footer);

        //var uri = window.location.origin + '/player?algorithm=' + this.algorithm.id;
        var uri = algo.App.I.preferredPlayerLink(this.algorithm);

        link.attr('href', uri);

        link.text(_.prune("Open in Player: " + this.algorithm.title, 128));

        link.attr('title', this.algorithm.title);

        link.attr('target', "_blank");

        // make part of the unscaled iframe versus the surface

        this.footer.appendTo($('body'));

        // animate footer on mouse events

        $('body').mouseenter(_.bind(function () {

            this.footer.css({
                opacity: 1
            });

            if (this.restartButton) {
                this.restartButton.css({
                    opacity: 1
                });
            }

        }, this));

        $('body').mouseleave(_.bind(function () {

            this.footer.css({
                opacity: 0
            });

            if (this.restartButton) {
                this.restartButton.css({
                    opacity: 0
                });
            }

        }, this));
    }

    // show footer if present and delay its fadeout

    if (this.footer) {

        this.footer.css({
            opacity: 1
        });

        _.delay(_.bind(function () {

            this.footer.css({
                opacity: 0
            });

        }, this), 5000);
    }
};

/**
 * get confirmation from user and then fork the algorithm
 */
algo.Player.prototype.forkAlgorithm = function () {

    // ignore if no algorithm loaded yet

    if (!this.algorithm) {
        return;
    }

    algo.App.I.okCancel("Fork Algorithm", "Create a forked copy of this algorithm?", "Fork", _.bind(function (ok) {

        // navigate to editor page with the fork request in the query string

        if (ok) {
            algo.App.I.goto('/editor?fork=' + this.algorithm.id);
        }

    }, this));
};

/**
 * get confirmation from user and then fork the algorithm
 */
algo.Player.prototype.editAlgorithm = function () {

    // ignore if no algorithm loaded yet

    if (!this.algorithm) {
        return;
    }

    algo.App.I.goEdit(this.algorithm.id);
};

/**
 * set play state
 * @param s
 */
algo.Player.prototype.setPlayState = function (s) {

    this.playState = s;
};

/**
 * set the play mode to continuous or single step
 * @param s
 */
algo.Player.prototype.setPlayMode = function (m) {

    this.playMode = m;
};

/**
 * update the transition speed
 * @param s
 */
algo.Player.prototype.setSpeed = function (s) {

    // if in history mode then apply to saved speed as well

    if (this.historyMode) {
        this.historySpeed = s;
    }

    this.transitionSpeed = s;

    this.regenerateTransitionCSS();
};

/**
 * remove the existing style block, if any, and replace with a block containing
 * the CSS definition for the transition speed
 */
algo.Player.prototype.regenerateTransitionCSS = function () {


    // compile as an underscore template, with and without the browser prefix

    var compiled = _.template('<style id="transitionSpeed">.algo-transition{ {{prefix}}transition:all {{speed}}ms ease-in-out;transition:all {{speed}}ms ease-in-out;}</style>', {
        speed : this.transitionSpeed,
        prefix: algo.Util.browserPrefix.css
    });

    // update the CSS rule in the transitionSpeed block

    $('#transitionSpeed').html(compiled);

};

/**
 * remove the existing style block, if any, and replace with a block containing
 * the CSS definition for the transition speed
 */
algo.Player.prototype.regenerateTransitionCSS = function () {


    // compile as an underscore template, with and without the browser prefix. Only certain properties are now animated since
    // some properties animated badly e.g. z-index, visibility etc.

    var animatedProperties = [
        'left',
        'top',
        'width',
        'height',
        'background-color',
        'opacity',
        'transform',
        'border',
        'color',
        'font-size',
        'border-radius',
        'transform-origin',
        'border-color',
        'border-left-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color'
    ];

    var str = _.reduce(animatedProperties, function(memo, p) {

        var v = _.sprintf("%s %dms ease-in-out", p, this.transitionSpeed)
        return memo + ((memo.length) ? "," + v : v);

    }, '', this);


    var pstr = _.reduce(animatedProperties, function(memo, _p) {

        // add prefix where required
        var p = _p;
        if (_p === 'transform' || _p === 'transform-origin') {
            p = algo.Util.browserPrefix.css + _p;
        }

        var v = _.sprintf("%s %dms ease-in-out", p, this.transitionSpeed)
        return memo + ((memo.length) ? "," + v : v);

    }, '', this);

    // we also need to compile a prefix set of properties e.g. for Safari which uses -webkit-transform, -webkit-transform-ofigin

    var compiled = _.template('<style id="transitionSpeed">.algo-transition{ {{prefix}}transition:{{prefixProperties}};transition:{{properties}};}</style>', {
        properties: str,
        prefixProperties: pstr,
        prefix: algo.Util.browserPrefix.css
    });

    // update the CSS rule in the transitionSpeed block

    $('#transitionSpeed').html(compiled);

};

/**
 * used when the player is on the same page as the editor and is used for testing.
 * This should stop all current activity...although the owner of the player ( the editor )
 * is responsible for DOM cleanup.
 */
algo.Player.prototype.destroy = function () {

    // kill existing worker if there is one

    if (this.worker) {
        this.worker.terminate();
    }

};

/**
 * restarting the algorithm in response to the user clicking the restart button. In theory we should be able
 * to call this.restart but that seems problematic due to state issues. For now we just reload the page
 */
algo.Player.prototype.reload = function () {

    algo.App.I.reloadPage();
};

/**
 * start or start a new version of the algorithm running from the beginning
 */
algo.Player.prototype.restart = function () {

    // ensure we exit history mode before restarting

    this.exitHistoryMode();

    // kill existing worker if there is one

    if (this.worker) {

        this.worker.terminate();
    }

    // empty existing surface

    if (this.surface) {

        this.surface.dom.empty();
    }

    // reset element class

    algo.render.Element.resetClass();

    // create our surface and tell it to run in the DOM

    this.surface = new algo.render.Surface({

        // we are the DOM based version of the surface

        location: algo.render.Surface.DOM,

        // selector for the surface DOM element

        domSelector: $('[data-element="surface"]', this.container)

    });

    // show loading bars

    this.showLoading();

    // if there is an embedded footer, reshow it

    this.showFooter();

    // scale to fix the available space

    this.scaleSurface();

    // create dynamic CSS style block that defines the speed of the transitions

    if (!this.transitionSpeed) {

        this.setSpeed(algo.kNORMAL);
    }

    // set play mode, single step unless embedded player

    if (!this.playMode) {

        this.setPlayMode(this.embedded ? algo.kCONTINUOUS : algo.kSINGLE_STEP);
    }

    // set play state

    this.setPlayState(algo.kPLAYING);

    // reset or create the algorithm controller

    if (this.vcr) {

        this.vcr.reset();

    } else {

        // create vcr and supply ourselves as the controller unless we the embedded player

        if (!this.embedded) {
            this.vcr = new algo.components.Vcr($('[data-element="vcr"]', this.container), this);
            this.vcrContinuous = _.once(_.bind(this.vcr.continuousBtnClick, this.vcr));
        }
    }

    // reset or create the message window

    if (this.messages) {

        this.messages.reset();

    } else {

        if (!this.embedded) {
            this.messages = new algo.components.Messages($('[data-element="messages"]', this.container));
        }
    }

    // initialize history of executed commands, unless embedded where this feature is not available

    if (!this.embedded) {

        this.commandHistory = [];
        this.historyMode = false;

        // subscribe to history slider events

        amplify.subscribe("slider-value-changed", _.bind(_.debounce(function (slider, max, value) {

            this.historyTo(value);

        }, 10), this));
    }

    // reset or create the code editor window in read-only mode

 
    // worker_core.js is the primary thread file, it in turn will load the algorithm.
    // Use the full source if testing, otherwise, use the minified/compressed runtime

    if (this.testing) {
        this.worker = new Worker(_.sprintf('./javascripts/apis/%s/worker_core.js', this.algorithm.api))
    } else {
        this.worker = new Worker(_.sprintf('/javascripts/apis/%1$s/minified/%1$s-min.js', this.algorithm.api));
    }

    // sink message event

    this.worker.onmessage = _.bind(this.onWorkerMessage, this);

    // worker is parameterized with the URI for the source ( and a query string indication if es6 is permitted )
    // Also the worker must know the API version to load.

    var sourceURI = algo.App.I.API('source/' + this.algorithmID);

    // if testing/using native generators, add that flag
    if (this.nativeGenerators) {
        sourceURI += '?es6=true'
    }

    this.worker.postMessage({
        name        : "M_Initialize",
        algorithmURI: sourceURI,
        api         : this.algorithm.api
    });

};

/**
 * show loading bar for algorithm
 */
algo.Player.prototype.showLoading = function () {

    this.loader = algo.Util.cloneTemplate("loading-template");
    var target = this.embedded ? $('.algo-surface-embedded') : $('.surface-window', this.container);
    this.loader.appendTo(target);

};

/**
 * hide loading bar for algorithm
 */
algo.Player.prototype.hideLoading = function () {

    if (this.loader) {
        this.loader.remove();
        this.loader = null;
    }
};

/**
 * the preferred full size of a surface
 * @type {number}
 */
algo.Player.kSW = 900;
algo.Player.kSH = 556;

/**
 * scale the surface to best use the available space of its parent
 */
algo.Player.prototype.scaleSurface = function () {

    // get inner width and height of surface parent

    var p = this.surface.dom.parent();

    // clamp so that the algorithm surface only scales down not above 1.0

    var pinnerWidth = p.innerWidth();

    var sx = Math.min(algo.Player.kSW, pinnerWidth) / algo.Player.kSW;

    // translate in x so centered if narrower than surface width

    var tx = pinnerWidth > algo.Player.kSW ? (pinnerWidth - algo.Player.kSW) / 2 : 0;

    // limit down scale 1/4

    sx = Math.max(0.20, Math.min(1, sx));

    // get css property names ( including the correctly prefixed version for this browser )

    var s = 'scale(' + sx + ',' + sx + ') translate(' + tx + 'px, 0)';
    var prefixed = algo.render.Element.prefixed('transform');

    var css = {transform: s};
    css[prefixed] = s;

    this.surface.dom.css(css);

    this.surface.scaling = sx;
};

/**
 * typically called from the vcr control when the user wants to continue with the algorithm
 */
algo.Player.prototype.continue = function () {

    // ensure we exit history mode before continuing

    this.exitHistoryMode();

    // ensure we are in playing mode

    this.setPlayState(algo.kPLAYING);

    // tell worker to continue

    this.worker.postMessage({name: "M_Continue"});

};

/**
 * save the given set of rendering commands if we aren't already in history mode and there is a command buffer
 * Also, there ia an arbitrary limit on the length of the commands buffer, after which we ignore more commands
 * @param renderCommands
 */
algo.Player.prototype.saveCommands = function (renderCommands, options) {

    // don't save empty command list AND ignore if we are already in history mode

    if (!this.historyMode && renderCommands && renderCommands.length && this.commandHistory && !this.embedded) {

        if (this.commandHistory.length < algo.Player.kHISTORY_LIMIT) {
            this.surface.restoreParentIds(renderCommands);
            this.commandHistory.push({
                renderCommands: renderCommands,
                options       : options
            });
            this.vcr.slider.setMaxAndValue(this.commandHistory.length, this.commandHistory.length);
        }

    }
};

// max frames we will record in the history buffer
algo.Player.kHISTORY_LIMIT = 1000;

/**
 * update to the given frameIndex, switch into history mode if not already ( saving current surface etc ).
 * @param frameIndex
 */
algo.Player.prototype.historyTo = function (frameIndex) {

    // if we are in history mode then clear surface and reset elements, otherwise enter history mode

    if (!this.historyMode) {
        this.enterHistoryMode();
    }

    // play frames up to frameIndex
    this.surface.executeCommandHistory(this.commandHistory, frameIndex);

    // update source / editor window if on a valid frame

    if (this.commandHistory[frameIndex]) {

        this.editor.pause(this.commandHistory[frameIndex].options);

        // update messages window

        this.messages.pause(this.commandHistory[frameIndex].options);
    }
};

/**
 * prepare for history rewind/fast forward
 */
algo.Player.prototype.enterHistoryMode = function () {

    if (!this.historyMode) {

        // turn off fade in for new elements

        algo.render.Element.fadeIn = false;

        // replace the surface with the temporary history surface

        algo.render.Surface.enterHistoryMode();

        this.surface = algo.SURFACE;

        // save and reset the state of the element class

        algo.render.Element.enterHistoryMode();

        // save current transition speed and set a very high transition speed

        this.historySpeed = this.transitionSpeed;

        // make transitions very fast while fast forwarding through history.

        this.setSpeed(algo.kFAST);

        // flag as in history mode

        this.historyMode = true;

    }
};

/**
 * exit history mode, restore previous surface etc
 */
algo.Player.prototype.exitHistoryMode = function () {

    if (this.historyMode) {

        // turn on fade in for new elements

        algo.render.Element.fadeIn = true;

        // restore the original surface

        algo.render.Surface.exitHistoryMode();

        this.surface = algo.SURFACE;

        // have element class exit history mode

        algo.render.Element.exitHistoryMode();

        // restore transition speed

        this.setSpeed(this.historySpeed);

        this.historyMode = false;
    }
};

/**
 * handles messages from worker thread
 * @param event
 */
algo.Player.prototype.onWorkerMessage = function (event) {

    // get the message name

    var message = event.data.name;

    // handle according to message

    switch (message) {

        // after the worker has been initialized and acknowledges as such

        case "M_Initialize_ACK":
        {

            // hide loading bar

            this.hideLoading();

            // publish event that lets components know that the algorithm is loaded ( at this time the worker
            // is also initialized with the algorithm so we are ready to run/play the algorithm )

            amplify.publish('algorithm-loaded', this.algorithm);

            // if not testing then start playing the algorithm

            if (!this.testing && this.vcrContinuous) {
                this.vcrContinuous();
            }
        }
            break;

        // exception occurred in user algorithm of worker

        case "M_Exception":
        {
            this.hideLoading();

            algo.App.I.message("Unhandled Exception",
                _.sprintf("<div class='alert alert-danger'>The algorithm threw an exception and has been stopped.</div><p><b>Message</b>: %s</p><p><b>Stack:</b>%s</p>",
                    event.data.message, event.data.stack));

            this.worker.terminate();

        }
            break;

        // the worker has reached a pause / yield in the algorithm

        case "M_Pause":
        {
            this.hideLoading();

            // render any accumulated rendering commands, always

            this.surface.executeCommands(event.data.renderCommands);

            this.saveCommands(event.data.renderCommands, event.data.options);

            // if embedded just delay for the transition duration and continue

            if (this.embedded) {

                _.delay(_.bind(this.continue, this), this.transitionSpeed);

                return;

            }

            // update state

            this.setPlayState(algo.kPAUSED);

            // pass options to vcr and variables window for updates

            this.vcr.pause(event.data.options);

            // update source window

            this.editor.pause(event.data.options);

            // update messages window

            this.messages.pause(event.data.options);

        }
            break;

        // the worker has completed the algorithm

        case "M_Done":
        {
            this.hideLoading();

            // render any accumulated rendering commands

            this.surface.executeCommands(event.data.renderCommands);

            // save the commands in the history
            this.saveCommands(event.data.renderCommands, event.data.options);

            // update play state

            this.setPlayState(algo.kDONE);

            // auto-restart the embedded player

            if (this.embedded) {

                // embedded player restart, UNLESS, being used in a tutorial

                if (this.tutorialMode) {
                    this.showRestart();
                } else {
                    _.delay(_.bind(this.restart, this), this.transitionSpeed);
                }

                // post a message to the same domain to indicate the algorithm is complete. Useful on the homepage
                // for showing algorithms to completion

                try {
                    if (parent) {
                        parent.postMessage("algomation-complete", "*");
                    }
                } catch (e) {
                }
                return;
            }

            // tell vcr we are done

            this.vcr.done();

            // update source window

            this.editor.done(event.data.options);

            // update messages window

            this.messages.done(event.data.options);
        }
            break;
    }
};

/**
 * show a centralized restart button on the embedded player
 */
algo.Player.prototype.showRestart = function () {

    this.restartButton = $(_.sprintf('<div class="restart-button-holder"><button class="btn btn-primary">Restart</button></div>'));

    this.restartButton.click(_.bind(function() {
        this.restartButton.remove();
        this.restartButton = null;
        this.restart();
    }, this));

    this.restartButton.appendTo(this.container);
};



