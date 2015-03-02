"use strict";

/**
 * namespaces for the render library
 * @namespace algo
 */
var algo = algo || {};

/**
 * @namespace
 */
algo.components = algo.components || {};

/**
 * the transient popup that appears at the bottom right of the screen to indicate messages to the user.
 * @param selector
 */
algo.components.FlashMessage = function(title, message, progress) {

    // clone the template and position the element off screen in preparation for display

    this.element = algo.Util.cloneTemplate('flash-message');

    // turn DOM elements into properties of this class

    algo.Util.propertiesFromElements(this.element, this);

    // set title and message

    this.title.html(title);

    this.message.html(message);

    // show progress if required

    if (progress) {
        this.progress.removeClass('hidden');
    }

    // append to body and then animate onto the screen

    this.element.appendTo('body');

    _.delay( _.bind(function() {

        this.element.css({
            right: '20px'
        });

    }, this), 1);

    // remove after appropriate delay

    _.delay( _.bind(function() {

        this.element.remove();

    }, this), 3000);
};