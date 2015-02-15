/*global */

"use strict";

var algo = algo || {};

algo.Util = {};

/**
 * calculate the correct browser prefix for this machine
 */
algo.Util.findBrowserPrefix = function () {

    if (!algo.Util.browserPrefix) {
        var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice
                .call(styles)
                .join('')
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                )[1],
            dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

        algo.Util.browserPrefix = {
            dom      : dom,
            lowercase: pre,
            css      : '-' + pre + '-',
            js       : pre[0].toUpperCase() + pre.substr(1)
        };
    }
};

/**
 * make a document fragment with the given tag and properties e.g.
 * makeTag('a', {href: 'www.cnn.com'}, 'Visit CNN', true)
 *
 * @param {string} tag - tag type
 * @param {Object} properties - key/value pairs of attributes for tag
 * @inner {string} inner - inner content of tag
 * @closingTag {boolean} closingTag - defaults to true. Add closing tag
 */
algo.Util.makeTag = function(tag, properties, inner) {

    var t$ = $('<' + tag + '/>');

    if (inner) {
        t$.html(inner);
    }

    _.each(properties, function(value, key) {
        t$.attr(key, value);
    });

    return t$;

};

/**
 * given a JQuery selector, find all the elements with data-element="name" attributes.
 * Then use the value of the attribute to create a property on the target object that
 * has the element has its value.
 * Additionally, if the target has a function property equal to the attribute value + 'Click'
 * then the click event of the target is directed to that function
 * @param container
 * @param target
 */
algo.Util.propertiesFromElements = function (container, target) {

    _.each($('[data-element]', container), function (el) {

        // create named property on target and reference the element

        var $el = $(el), a = $el.attr('data-element');

        target[a] = $el;

        // create click handler for element if named function found

        var f = target[a + 'Click'];

        if (_.isFunction(f)) {
            $el.click(_.bind(f, target));
        }

        // create change handler for element if named function found

        f = target[a + 'Change'];

        if (_.isFunction(f)) {
            $el.click(_.bind(f, target));
        }
    });
};

/**
 * opposite of properties from elements, remove click handlers delete properties
 */
algo.Util.undoPropertiesFromElements = function(container, target)
{
    _.each($('[data-element]', container), function (el) {

        // create named property on target and reference the element

        var $el = $(el), a = $el.attr('data-element');

        delete target[a];

        // undo click handler for element if named function found

        var f = target[a + 'Click'];

        if (_.isFunction(f)) {
            $el.off('click');
        }

        f = target[a + 'Change'];

        if (_.isFunction(f)) {
            $el.off('change');
        }
    });
};

/**
 * add the CSS keyframe animation to the jquery selector set
 * @param jq
 */
algo.Util.cycleOn = function (jq) {

    jq.addClass('algo-cycle');

};

/**
 * remove cycle animation from jquery selector set
 * @param jq
 */
algo.Util.cycleOff = function (jq) {

    jq.removeClass('algo-cycle');
};

/**
 * clone an element with a data-template=NAME. Remove the data template
 * attribute and return the jquery selector
 * @param name
 */
algo.Util.cloneTemplate = function(name) {

    var e = $('[data-template="' + name + '"]').clone();

    e.removeAttr('data-template');

    return e;

};

/**
 * self running function for certain initialization methods
 */
(function () {

    // make browser prefix available to all code via algo.Util.browserPrefix

    algo.Util.findBrowserPrefix();

})();

