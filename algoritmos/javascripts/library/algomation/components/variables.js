"use strict";

/**
 * namespaces for the render library
 * @namespace algo
 */
var algo = algo || {};

/**
 * @namespace
 */
algo.player = algo.player || {};

/**
 * the vcr control at the top of the animation
 * @param selector
 */
algo.player.variables = function (selector, controller) {

    // save our controller

    this.controller = controller;

    // get our outer element

    this.outer = $(selector);

    // reset to initial state

    this.reset();

};

/**
 * when we reach a pause in the algorithm
 * @param s
 */
algo.player.variables.prototype.pause = function (options) {

    // remove current variables

    this.tableBody.empty();

    // display all variables

    if (options.variables) {

        _.each(options.variables, function (value, key) {

            // render as a row template into the table

            var row = $('<tr><td>' + key + '</td><td>' + value + '</td></tr>');

            row.appendTo(this.tableBody);

        }, this);
    }
};

/**
 * when the algorithm is complete
 * @param s
 */
algo.player.variables.prototype.done = function (options) {


};

/**
 * when the user clicks continue
 */
algo.player.variables.prototype.continue = function () {


};

/**
 * reset to initial state, typically when restarting an algorithm
 */
algo.player.variables.prototype.reset = function () {

    // removing current DOM and unsink handlers etc

    if (this.inner) {

        this.inner.remove();
    }

    // add the vcr template to our outer element

    this.inner = $('[data-template="variables-template"]').clone();

    this.inner.appendTo(this.outer);

    // find the body of the table

    this.tableBody = $('tbody', this.inner);

    // reset our variables collections

    this.vars = {};
};

