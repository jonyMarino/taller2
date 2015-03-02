"use strict";

var algo = algo || {};

/**
 * The client side representation of a tutorial object.
 * create with JSON returned by an API call.
 * @param json
 * @constructor
 */
algo.Tutorial = function (json) {

    // we maintain the tutorial in JSON format but provide getters/setters for the various properties
    // that can be read or updated by the client

    this.json = json;

    // id is read only of course

    Object.defineProperty(this, 'id', {
        enumerable: true,
        get       : function () {
            return this.json._id;
        }
    });

    // title is read/write and always has tags removed

    Object.defineProperty(this, 'title', {
        enumerable: true,
        get       : function () {
            return this.json.title;
        },
        set       : function (str) {
            this.json.title = str;
        }
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        get       : function () {
            return this.json.description;
        },
        set       : function (str) {
            this.json.description = str;
        }
    });

    Object.defineProperty(this, 'steps', {
        enumerable: true,
        get       : function () {
            return this.json.steps || [];
        },
        set       : function (steps) {
            this.json.steps = steps || [];
        }
    });

    Object.defineProperty(this, 'order', {
        enumerable: true,
        get       : function () {
            return this.json.order;
        },
        set       : function (order) {
            this.json.order = order;
        }
    });

    Object.defineProperty(this, 'slug', {
        enumerable: true,
        get       : function () {
            return this.json.slug;
        },
        set       : function (slug) {
            this.json.slug = slug;
        }
    });

    Object.defineProperty(this, 'published', {
        enumerable: true,
        get       : function () {
            return this.json.published;
        },
        set       : function (published) {
            this.json.published = published;
        }
    });

    //for (var i = 0; i < 10; i += 1) {
    //
    //    this.steps[i] = {
    //        code     : _.sprintf("var step = %d", i),
    //        html     : _.sprintf("<h3>%s</h3>", "Step + " + i),
    //        algorithm: null
    //    }
    //}

};

/**
 * delete step with given index
 * @param index
 */
algo.Tutorial.prototype.deleteStep = function(index) {

    if (index >= 0 && index < this.steps.length) {
        this.steps.splice(index, 1);
    }
};

/**
 * nudge step left
 * @param index
 */
algo.Tutorial.prototype.nudgeLeft = function(index) {

    if (index > 0 && index < this.steps.length) {
        var temp = this.steps[index-1];
        this.steps[index-1] = this.steps[index];
        this.steps[index] = temp;
    }
};

/**
 * nudge step left
 * @param index
 */
algo.Tutorial.prototype.nudgeRight = function(index) {

    if (index >= 0 && index < this.steps.length-1) {
        var temp = this.steps[index+1];
        this.steps[index+1] = this.steps[index];
        this.steps[index] = temp;
    }
};

/**
 * save the algorithm and invoke the call back with the server response
 * @param callback
 */
algo.Tutorial.prototype.save = function (callback) {
/*
    // PUT update to the server

    $.ajax({
        type    : "PUT",
        url     : algo.App.I.API('tutorial'),
        data    : {
            id         : this.id,
            title      : this.title,
            description: this.description,
            steps      : this.steps,
            slug       : this.slug,
            published  : this.published,
            order      : this.order

        },
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            callback(response.error);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
 */
};

/**
 * delete the tutorial and invoke the call back with the server response
 * @param callback
 */
algo.Tutorial.prototype.delete = function (callback) {
 /*
    // PUT update to the server

    $.ajax({
        type    : "DELETE",
        url     : algo.App.I.API('tutorial'),
        data    : {
            id: this.id
        },
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            callback(response.error);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
  */
};

/**
 * load a tutorial object by id or published slug
 * @param id
 * @param slug
 * @param callback
 */
algo.Tutorial.load = function (id, slug, callback) {
  /*
    $.ajax({
        type: "GET",
        url : algo.App.I.API('tutorial'),
        data: {
            id  : id,
            slug: slug
        },

        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            if (response.error === K.API_NO_ERROR) {

                // create algorithm object from JSON and send to callback

                var tutorial = new algo.Tutorial(response.tutorial);

                callback(K.API_NO_ERROR, tutorial);

            } else {

                // callback with error code
                callback(response.error);
            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // callback with generic error

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * create an instance on the server and then load
 * NOTE: This is a static method of the class
 * @param callback
 * @static
 */
algo.Tutorial.create = function (callback) {
/*
    $.ajax({
        type    : "POST",
        url     : algo.App.I.API('tutorial'),
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            if (response.error === K.API_NO_ERROR) {

                // create algorithm object from JSON

                var tutorial = new algo.Tutorial(response.tutorial);

                callback(K.API_NO_ERROR, tutorial);

            } else {

                callback(response.error);

            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * delete an existing tutorial, admin only enforced on server
 * @param id
 * @param callback
 */
algo.Tutorial.delete = function (id, callback) {
/*
    $.ajax({
        type    : "DELETE",
        url     : algo.App.I.API('tutorial'),
        dataType: "json",
        data: {
            id  : id
        },

        // success handler

        success: $.proxy(function (response) {

            callback(response.error);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};



