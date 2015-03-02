/*global */

"use strict";

var algo = algo || {};

algo.localStorage = algo.localStorage || {};

/**
 * Returns true if this environment supports local storage
 * @return {boolean} True if environment supports local storage
 */
algo.localStorage.hasLocalStorage = function() {
    "use strict";

    try {

        return 'localStorage' in window && window.localStorage !== null;

    } catch (e) {

        return false;
    }
};

/**
 * persist the value object as a JSON string using the given key.
 * @param {string} key, the name of the persistent object
 * @param {object} payload, the object to persist
 * @return {boolean} True if the operation was successful
 */
algo.localStorage.writeLocalObject = function (key, payload) {
    "use strict";

    // can't possibly work if there is no local storage

    if (algo.localStorage.hasLocalStorage === false) {
        return false;
    }

    // everything else can throw so avoid that

    try {

        // convert payload to a JSON string

        var json = JSON.stringify(payload);

        // write to storage

        window.localStorage.setItem(key, json);

        // everything worked

        return true;

    } catch(e) {

        // no dice

        return false;

    }
};

/**
 * persist the value object as a JSON string using the given key.
 * @param {string} key, the name of the persistent object
 * @return {object} The de-serialized object associated with the key or null
 */
algo.localStorage.readLocalObject = function (key) {
    "use strict";

    // can't possibly work if there is no local storage

    if (algo.localStorage.hasLocalStorage === false) {
        return null;
    }

    // everything else can throw so avoid that

    try {

        // write to storage

        var json = window.localStorage.getItem(key);

        // convert JSON string back to an object

        var obj  = JSON.parse(json);

        // everything work

        return obj;

    } catch(e) {

        // no dice

        return null;

    }
};

/**
 * remove an item with {@key } key from local storage
 * @param {string} key, the name of the persistent object
 */
algo.localStorage.removeLocalObject = function (key) {
    "use strict";

    // can't possibly work if there is no local storage

    if (algo.localStorage.hasLocalStorage === false) {
        return null;
    }

    // everything else can throw so avoid that

    try {

        // remove and return true it is worked ( or appeared to )

        window.localStorage.removeItem(key);

        return true;

    } catch(e) {

        // no dice

        return false;
    }
};

/**
 * remove all local objects in the list
 * @param {array} list is the name of all the objects to delete
 */
algo.localStorage.removeLocalObjects = function(list) {

    $.each(list, function(index, key) {

        algo.localStorage.removeLocalObject(key);
    });
};

/**
 * Return an array of strings with all the localStorage object keys. Returns an empty array if
 * there are no objects or some other problem occurs
 * @return {array} all local storage keys
 */
algo.localStorage.getAllKeys = function() {
    "use strict";

    var keys = [];

    try {
        for (var i = 0; i < window.localStorage.length; i += 1) {

            var temp = window.localStorage.key(i);

            keys.push(temp);
        }

    } catch(e) {}

    return keys;
};