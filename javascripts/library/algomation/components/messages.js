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
 * the vcr control at the top of the animation
 * @param selector
 */
algo.components.Messages = function (selector) {

    // get our outer element

    this.outer = selector;

    // add the template to our outer element

    this.inner = $('[data-template="message-template"]').clone();

    this.inner.appendTo(this.outer);

    // get references to list elements (.title, .step, .description, .variables)

    algo.Util.propertiesFromElements(this.inner, this);

    // reset to initial state

    this.reset();

    // subscribe to events

    amplify.subscribe('algorithm-loaded', this, _.bind(function(algorithm) {

        this.algorithm = algorithm;

        this.introduction();

    }, this));

};

/**
 * when we reach a pause in the algorithm
 * @param s
 */
algo.components.Messages.prototype.pause = function (options) {


    // show variables if any

    if (options && options.variables && _.keys(options.variables).length) {

        this.variables.html('');

        _.each(options.variables, function (value, key) {
			var divValue = "";
			if (key=="resultado"){
				divValue = '<div class="variable-value" id="resultado">' + value + '</div>';
			}else{
				divValue = '<div class="variable-value">' + value + '</div>';
			}
            $('<div class="variable-name">' + key + '</div>' + divValue).appendTo(this.variables);
			if ( key == "i" && (value%19) == 0 && value != "0"){
				html2canvas($(".algo-surface"), {
					onrendered: function(canvas) {
						var imagen = $('<img style="-webkit-user-select: none;" src="'+canvas.toDataURL("image/png")+'" width="1366" height="600">');
						divPDF.append(imagen);
						imagenes.push(canvas.toDataURL("image/jpeg"));
					}
				});
			}
        }, this);

        this.variablesBlock.removeClass('hidden');

    } else {

        this.variablesBlock.addClass('hidden');
    }

    // show step and description

    if (options && options.step) {

        this.step.html(options.step);
        this.stepBlock.removeClass('hidden');

        // scroll step element into view first time only
        if (this.first) {
            this.first = false;
            this.stepBlock[0].scrollIntoView(false);
        }

    } else {
        this.stepBlock.addClass('hidden');
    }

};

/**
 * when the algorithm is complete
 * @param s
 */
algo.components.Messages.prototype.done = function (options) {

    // calling pause will hide the last variables and messages and its useful to leave those alone
    //this.pause(options);

};

/**
 * when the user clicks continues the algorithm
 */
algo.components.Messages.prototype.continue = function () {


};

/**
 * reset to initial state, typically when restarting an algorithm
 */
algo.components.Messages.prototype.reset = function () {

    // show title and description if we have an algorithm

    if (this.algorithm) {

        this.introduction();
    }
};

/**
 * show the introduction information for an algorithm. Name, description, author etc
 */
algo.components.Messages.prototype.introduction = function () {

    // display algorithm properties

    this.title.html(this.algorithm.title);

    this.description.html(this.algorithm.description || "None");

    this.author.html(_.sprintf('<a href="/useralgorithms?userid=%s">%s</a>', this.algorithm.creator._id, this.algorithm.creator.username));

    this.stepBlock.addClass('hidden');

    this.variablesBlock.addClass('hidden');

    // set flag so we know the first time we are paused, we scroll the step element into view the first time only

    this.first = true;

};


