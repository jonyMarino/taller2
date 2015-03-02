/*global */

"use strict";

var algo = algo || {};


algo.App = function () {

    // singleton instance

    algo.App.I = this;

    // add underscore string mixin

    _.mixin(_.str.exports());

    // use {{ }} for underscore templates

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // parse query string parameters

    this.qs = this.getQueryStrings();

    // Every time a modal is shown, if it has an autofocus element, focus on it.

    $('.modal').on('shown.bs.modal', function() {

        $(this).find('[autofocus]').focus();

    });

    // disable backspace functionality except for editable form fields. You can also disable this feature
    // by calling algo.App.I.enableBackspace();
    // Tags in which backspace is ignored are: [input, select, textarea] or anything with the disable
    // attribute, readonly attribute or contenteditable attribute ( which is used by the summernote html editor )

    var rx = /INPUT|SELECT|TEXTAREA/i;

    $(document).bind("keydown keypress", _.bind(function (e) {

        if (e.which == 8) { // 8 == backspace

            // this feature can be turned off e.g. for certain admin screens
            if (this._enableBackspace) {
                return;
            }

            // if heading for the editable area of the summernote html editor then allow
            if (e.target.hasAttribute('contenteditable')) {
                return;
            }

            if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
                e.preventDefault();
            }
        }

    }, this));
};

/**
 * reenable backspace for everything
 */
algo.App.prototype.enableBackspace = function() {

    this._enableBackspace = true;
};

/**
 * simple runtime assert
 * @param expression
 * @param msg
 */
algo.App.prototype.assert = function (expression, msg) {

    if (!expression) {

        console.error("ASSERT FAILED:" + msg);

        throw new Error(msg);
    }
}


/**
 * get a named query string
 * @param {string} name
 * @returns {string}
 */
algo.App.prototype.getParameter = function (name) {

    return this.qs[name];
};

/**
 * return the named query strings as an associative array
 * @returns {object}
 */
algo.App.prototype.getQueryStrings = function () {

    var assoc = {};
    var decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
    };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        if (key.length > 1) {
            assoc[decode(key[0])] = decode(key[1]);
        }
    }

    return assoc;
};

/**
 * return true if the user agent reports firefox
 * @returns {boolean}
 */
algo.App.prototype.isFireFox = function () {

    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

/**
 * show generic connection error message
 */
algo.App.prototype.connectionError = function () {

    this.message("Problem Encountered", "There was a problem completing that action.</br>Please try again.")
};


/**
 * show the game over dialog with the given header and message.
 * The callback is optional and is called when the dialog closes
 */
algo.App.prototype.message = function (header, message, callback) {

    // create dialog once only on demand

    if (!this.messageDialog) {

        // initialize but don't show

        this.messageDialog = $('[data-dialog=message-dialog]').modal({
            show    : false,
            keyboard: false,
            backdrop: 'static'
        });

        // sink close event

        $('[data-element=close-button]', this.messageDialog).click($.proxy(function () {

            // close dialog

            this.messageDialog.modal('hide');

            // invoke callback if any

            if (this.messageDialog.data('callback')) {

                this.messageDialog.data('callback')();
            }

        }, this));
    }

    // add header and body message

    $('[data-element="message-header"]', this.messageDialog).html(header);

    $('[data-element="message-message"]', this.messageDialog).html(message);

    // save callback in data storage

    this.messageDialog.data('callback', callback);

    // run dialog

    this.messageDialog.modal('show');
};

/**
 * Run the generic Ok/Cancel button dialog and invoke the callback with
 * the given response. The header, message and okText can be customized each invocation.
 * The callback is invoked with true or false, where false means cancel
 */
algo.App.prototype.okCancel = function (header, message, okText, callback) {

    // create dialog once only on demand

    if (!this.okCancelDialog) {

        // initialize but don't show

        this.okCancelDialog = $('[data-dialog=okcancel-dialog]').modal({
            show    : false,
            keyboard: false,
            backdrop: 'static'
        });

        // sink positive / ok button

        $('[data-element=ok-button]', this.okCancelDialog).click($.proxy(function () {

            // close dialog

            this.okCancelDialog.modal('hide');

            // invoke callback

            this.okCancelDialog.data('callback')(true);


        }, this));

        // sink cancel / negative button

        $('[data-element=cancel-button]', this.okCancelDialog).click($.proxy(function () {

            // close dialog

            this.okCancelDialog.modal('hide');

            // invoke callback

            this.okCancelDialog.data('callback')(false);


        }, this));
    }

    // add header and body message

    $('[data-element="message-header"]', this.okCancelDialog).html(header);

    $('[data-element="message-message"]', this.okCancelDialog).html(message);

    $('[data-element=ok-button]', this.okCancelDialog).html(okText || 'Ok');

    // save callback in data storage

    this.okCancelDialog.data('callback', callback);

    // run dialog

    this.okCancelDialog.modal('show');
};

/**
 * return URI for named API call using the current version of the API
 * @param name
 * @constructor
 */
algo.App.prototype.API = function(name) {

    return K.API_URI + name;
};


/**
 * return true of this device supports touch
 * @returns {boolean}
 */
algo.App.prototype.touchable = function () {

    return 'ontouchend' in document;
};

/**
 * get a value from the settings and use the default value if missing
 * @param key
 * @param defaultValue
 */
algo.App.prototype.getSettingsValue = function (key, defaultValue) {

    var s = this.getSettings();

    if (s.hasOwnProperty(key)) {

        return s[key];

    }

    s[key] = defaultValue;

    this.saveSettings();

    return defaultValue;
};

/**
 * set the given settings value
 * @param key
 * @param value
 * @returns {*}
 */
algo.App.prototype.setSettingsValue = function (key, value) {

    var s = this.getSettings();

    s[key] = value;

    this.saveSettings();
};

/**
 * get settings for the signed in player. If there is no signed in player default settings are returned
 * unless they already exist
 */
algo.App.prototype.getSettings = function () {

    if (this.settings) {

        return this.settings;
    }

    var s = {};

    try {
        s = amplify.store("algomation-settings");
    }
    catch (e) {

    }

    // now use the saved settings, if any to extend the default settings object

    this.settings = _.extend({


    }, s);

    return this.settings;

};

/**
 * save the settings object, but only if we have a signed in user
 */
algo.App.prototype.saveSettings = function () {

    // ignore if no settings

    if (!this.settings) {
        return;
    }

    try {
        amplify.store("algomation-settings", this.settings, { type: 'localStorage'});
    }
    catch (e) {

        this.message("Storage Error", "Error:" + e);
    }
};


/**
 * return either the usual /player?algorithm=GUID or /featured/[featured slug]
 */
algo.App.prototype.preferredPlayerLink = function(algorithm) {

    if (algorithm.featuredSlug) {
        return "/algorithm/" + algorithm.featuredSlug
    }

    return "/player?algorithm=" + algorithm.id;
};

/**
 * goto the login page
 */
algo.App.prototype.goLogin = function () {

    this.goto("/login");
};

/**
 * homepage
 */
algo.App.prototype.goHome = function () {

    this.goto("/");
};

/**
 * switch to the forgot password page
 */
algo.App.prototype.goForgot = function () {

    this.goto('/forgot');
};

/**
 * navigator to the editor page for the given ( optional ) algorithm. If no algorithm is supplied the page
 * will create a new one
 */
algo.App.prototype.goEdit = function (id) {

    this.goto('/editor' + (id ? '?algorithm=' + id : ''));
};

/**
 * navigator to the editor page and fork the given algorithm
 */
algo.App.prototype.goFork = function (id) {

    this.goto('/editor' + (id ? '?fork=' + id : ''));
};

/**
 * navigator to the player page for the given ( optional ) algorithm. If no algorithm is supplied the page
 * will create a new one
 */
algo.App.prototype.goPlayer = function (id) {

    this.goto('/player?algorithm=' + id);
};

/**
 * navigate to the given URL
 * @param url
 */
algo.App.prototype.goto = function (url) {

    window.location.href = url;
};

/**
 * return the signed in user name, which is flashed by the server into a certain hidden tag
 */
algo.App.prototype.getUserName = function () {

    return algo.G.username;

};

/**
 * return the signed in user nid, which is flashed by the server into a certain hidden tag
 */
algo.App.prototype.getUserID = function () {

    return algo.G.userid;

};

/**
 * change the URL of the page without navigating.
 *
 * NOTE: Do not pass a path containing protocol/port/authority...just the path e.g '/chess?gameid=1234'
 *
 * @param url
 */
algo.App.prototype.updateURL = function (path) {

    // With browser variations and security restrictions that vary by browser
    // this method is worth protecting.

    try {

        if (window.history) {

            window.history.replaceState({}, document.title, path);
        }
    }
    catch (e) {

    }

};

/**
 * replace current hash without affecting the history
 * @param hash
 */
algo.App.prototype.replaceHash = function (hash) {

    try {

        window.location.hash = hash;
    }
    catch (e) {

    }
};


/**
 * sign in using the given credentials and return results via the callback
 * @param persona
 * @param password
 * @param callback
 */
algo.App.prototype.signIn = function (username, password, callback) {

 /*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('signin'),
        data: {
            username: username,
            password: password
        },

        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(response);


        }, this),

        // login failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * sign in using the given credentials and return results via the callback
 * @param persona
 * @param password
 * @param callback
 */
algo.App.prototype.signOut = function (callback) {
/*
    $.ajax({
        type: "GET",
        url : algo.App.I.API('signout'),

        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(response);


        }, this),

        // login failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};


/**
 * register AND sign in a new user if successful
 * @param username
 * @param email
 * @param password
 * @param callback
 */
algo.App.prototype.register = function (username, email, password, callback) {
/*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('register'),
        data: {
            username: username,
            email   : email,
            password: password
        },

        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(response);

        }, this),

        // login failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};


/**
 * trigger a password reset for the username or email given
 * @param email
 * @param username
 * @param callback
 */
algo.App.prototype.forgot = function (persona, callback) {
 /*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('forgot'),
        data: {
            persona: persona
        },

        dataType: "json",

        // call successful, which doesn't necessarily mean a reset was sent

        success: $.proxy(function (response, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(response);


        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};


/**
 * update the users password
 * @param password
 * @param newpassword
 * @param newemail
 * @param callback
 */
algo.App.prototype.updatePassword = function (newpassword, callback) {

    // supply username and old password since this API will authenticate before proceeding
/*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('updatepassword'),
        data: {
            newpassword: newpassword
        },

        dataType: "json",

        // call successful, which doesn't necessarily mean a reset was sent

        success: $.proxy(function (json, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(json);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * update the users email
 * @param password
 * @param newpassword
 * @param newemail
 * @param callback
 */
algo.App.prototype.updateEmail = function (newemail, callback) {

    // supply username and old password since this API will authenticate before proceeding
/*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('updateemail'),
        data: {
            newemail: newemail
        },

        dataType: "json",

        // call successful, which doesn't necessarily mean a reset was sent

        success: $.proxy(function (json, textStatus, jqXHR) {

            // let the caller figure out the consequences of success or failure

            callback(json);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * reset the password
 * NOTE: There must be a valid username, reset token in the page query string
 * @param newpassword
 * @param callback
 */
algo.App.prototype.resetPassword = function (newpassword, callback) {
/*
    $.ajax({
        type: "POST",
        url : algo.App.I.API('reset'),
        data: {
            username: this.getParameter("username") || "",
            token   : this.getParameter("token") || "",
            password: newpassword
        },

        dataType: "json",

        // call successful, which doesn't necessarily mean a reset was sent

        success: $.proxy(function (response, textStatus, jqXHR) {

            callback(response);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * start a simple worker thread with on other purpose then testing whether generators are supported in workers.
 * Since workers are loaded via an external file it is possible for the test to fail due to an I/O problem
 * @param callback
 */
algo.App.prototype.testGenerators = function(callback) {

    // save callback

    this.testGeneratorCallback = callback;

    // worker for testing if native generators are available

    this.testWorker = new Worker('/javascripts/testworker.js');

    // sink message event and errors ( in generators are not supported the file will generate a syntax error )

    this.testWorker.onmessage = _.bind(this.onTestMessage, this);

    this.testWorker.onerror = _.bind(this.onTestError, this);

    // bind error handler to a time out as well in case there is some unknown problem loading or running the generator

    this.testGeneratorTimeout = setTimeout(_.bind(this.onTestError, this), 5000);

    // post a message to the worker, it doesn't matter what it is.

    this.testWorker.postMessage({});

};

/**
 * cleanup after generator test
 */
algo.App.prototype.endGeneratorTest = function() {

    if (this.testWorker) {
        this.testWorker.terminate();
        this.testWorker = null;
    }

    clearTimeout(this.testGeneratorTimeout);
}

/**
 * if the test worker throws an error
 * @param e
 */
algo.App.prototype.onTestError = function(e) {

    this.endGeneratorTest();

    this.testGeneratorCallback(false);
};

/**
 * if workers support native generators this callback will be fired.
 * @param e
 */
algo.App.prototype.onTestMessage = function(e) {

    this.endGeneratorTest();

    this.testGeneratorCallback(e.data.result);

};

/**
 * reload current page with cache enabled
 */
algo.App.prototype.reloadPage = function() {

    window.location.reload(false);
};

/**
 * run the embedded algorithm dialog with the given algorithmID
 * @param algorithmID
 */
algo.App.prototype.runEmbedDialog = function(algorithmID) {

    // create dialog once only on demand

    if (!this.embedDialog) {

        // initialize but don't show

        this.embedDialog = $('[data-dialog=embed-dialog]').modal({
            show    : false,
            keyboard: false,
            backdrop: 'static'
        });

        // sink close event

        $('[data-element="close-button"]', this.embedDialog).click($.proxy(function () {

            // close dialog

            this.embedDialog.modal('hide');

        }, this));

        // sink changes to width input to validate it and update embed code

        $('[data-element="widthInput"]', this.embedDialog).on('change, keydown paste input', _.bind(function() {

            // divide width by this to get the golden ratio

            var golden = 1.618;

            // acceptable width range

            var minWidth = 450, maxWidth = 900;

            // parse and calculate height, update embed script and height. If not valid remove script
            // and indicate error

            var width = _.toNumber($('[data-element="widthInput"]', this.embedDialog).val());

            if (!_.isNaN(width) && width >= minWidth && width <= maxWidth) {

                // set height and update script

                var height = Math.round(width / golden) >> 0;

                $('[data-element="heightInput"]', this.embedDialog).val(height);

                // remove old errors

                $('[data-element="widthForm"]').removeClass('has-error');

                $('.help-block', this.embedDialog).addClass('hidden');

                // get the algorithm ID

                var algorithmID = this.embedDialog.data('algorithmID');

                // generate embed code

                var template = '<iframe allowfullscreen src="%s/embeddedplayer?embedded=true&algorithm=%s" width="%s" ' +
                               'height="%s" seamless="seamless" frameborder="0" style="border:1px solid lightgray" ' +
                               'scrolling="no"></iframe>';

                $('[data-element="script"]', this.embedDialog).val(_.sprintf(template, window.location.origin, algorithmID, width, height));

            } else {

                // invalid

                $('[data-element="script"]', this.embedDialog).val('');

                $('[data-element="widthForm"]', this.embedDialog).addClass('has-error');

                $('.help-block', this.embedDialog).removeClass('hidden');
            }

        }, this));
    }

    // store current algorithmID in the dialog and reset the width

    this.embedDialog.data("algorithmID", algorithmID);

    $('[data-element="widthInput"]', this.embedDialog).val('900');

    // manually trigger the change event

    $('[data-element="widthInput"]', this.embedDialog).trigger('input');

    // run dialog

    this.embedDialog.modal('show');
};


/**
 * run the share dialog
 * @param algorithmID
 */
algo.App.prototype.runShareDialog = function(algorithm) {

    // create dialog once only on demand

    if (!this.shareDialog) {

        // initialize but don't show

        this.shareDialog = $('[data-dialog=share-dialog]').modal({
            show    : false,
            keyboard: false,
            backdrop: 'static'
        });

        // sink close event

        $('[data-element="close-button"]', this.shareDialog).click($.proxy(function () {

            // close dialog

            this.shareDialog.modal('hide');

        }, this));

    }

    // set the share link

    var link = _.sprintf("%s/player?algorithm=%s", window.location.origin, algorithm.id);

    $('[data-element="shareLink"]', this.shareDialog).val(link);

    // run dialog

    this.shareDialog.modal('show');
};

/**
 * return whatever property is attached to the given key in the local settings object. The default value is
 * created and saved if the value is not present
 * @param {string} key
 * @param {object} [defaultValue] - default value to be returned if the key is not present
 * @returns {object} - the value associated with the key or the defaultValue if not present
 */
algo.App.prototype.getLocalSetting = function(key, defaultValue) {

    // get the local storage object
    var local = algo.localStorage.readLocalObject(algo.App.kSETTINGS_KEY) || {};

    if (local.hasOwnProperty(key)) {
        return local[key];
    }

    // add the key and default value and write back to storage
    local[key] = defaultValue;

    algo.localStorage.writeLocalObject(algo.App.kSETTINGS_KEY, local);

    // return the default value
    return defaultValue;
};
/**
 * write the given object into local storage using the given key
 * @param key
 * @param value
 */
algo.App.prototype.setLocalSetting = function(key, value) {

    // get the local storage object
    var local = algo.localStorage.readLocalObject(algo.App.kSETTINGS_KEY) || {};

    // update value
    local[key] = value;

    // write back the object
    algo.localStorage.writeLocalObject(algo.App.kSETTINGS_KEY, local);
};

/**
 * send a google analytics tracking event
 * @param {string} category
 * @param {string} action
 * @param {string} label
 * @param {number} value
 */
algo.App.prototype.track = function(category, action, label, value) {

    if (algo && algo.G && algo.G.live && ga) {
        try {
            ga('send', 'event', category, action, label, value);
        } catch (e) {}
    }
};



/**
 *
 * @const {string} key for local settings object
 */
algo.App.kSETTINGS_KEY = "algomation_local_settings";






