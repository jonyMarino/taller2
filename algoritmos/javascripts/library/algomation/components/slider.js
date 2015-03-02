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
 * constructor for slider requires the outer HTML element as a JQuery selector
 * @param {JQuery} element
 * @constructor
 */
algo.components.Slider = function(element) {

    // keep outer element
    this.element = element;

    // create the track and thumb
    this.track = $('<div class="algo-slider-track"></div>');
    this.track.appendTo(this.element);

    this.thumb = $('<div class="algo-slider-thumb"></div>');
    this.thumb.appendTo(this.track);

    // thumb can be focused
    this.thumb.attr('tabindex', '0');

    // dot at center of thumb
    this.dot = $('<div class="algo-slider-thumb-dot"></div>');
    this.dot.appendTo(this.thumb);


    // set initial empty range
    this._max = 0; this._value = 0;

    // defaults to enabled
    this.enabled = true;

    // perform initial layout
    this.layout();

    // layout on window size as well
    $(window).resize(_.bind(this.layout, this));

    // bind mouse events for thumb

    this.thumb.bind('mousedown', _.bind(this.mouseDownThumb, this));

    // capture mouse up / blur on the window/document to cancel dragging
    // NOTE: This is on the document so that we capture wherever the mouse ends up

    // also bind mouseup on window to ensure we get when mouse is outside of window

    $(document).bind('mouseup', _.bind(this.mouseUp, this));

    $(window).bind('mouseup', _.bind(this.mouseUp, this));

    // mouse moves are detected on the document so we can can catch moves beyond an elements client area

    $(document).bind('mousemove', _.bind(this.mouseMove, this));

    // sink thumb keyboard events ( only the thumb can be focused )

    this.thumb.keydown(_.bind(this.keyboard, this));

    // sink regular clicks anywhere in the slider for jumping directly to a certain position

    this.element.bind('click', _.bind(this.onClick, this));

    // sink blur / focusout to drop capture

    this.element.bind('blur focusout', _.bind(this.cancelDrag, this));

    // add accessors for max and value properties, when these are changed programmatically any
    // active drag operation is cancelled.

    Object.defineProperty(this, 'max', {
        enumerable: true,
        get       : function () {

            return this._max;
        },
        set       : function (v) {

            this.cancelDrag();
            this._max = v;
            this.positionThumb();
            this.updateTicks();

            // disable if no range
            this.setEnabled(!!this._max);
        }
    });

    Object.defineProperty(this, 'value', {
        enumerable: true,
        get       : function () {

            return this._value;
        },
        set       : function (v) {

            // clamp
            v = Math.max(0, Math.min(this._max, v));

            // ignore if already set
            if (this._value !== v) {
                this.cancelDrag();
                this._value = v;
                this.positionThumb();
                amplify.publish('slider-value-changed', this, this._max, this._value);
            }
        }
    });
};

/**
 * update ticks to current range, re-use ticks where possible
 */
algo.components.Slider.prototype.updateTicks = function() {

    // save current ticks, faster to re-use than create
    var temp = this.ticks ? this.ticks.slice() : null;

    // if the ticks will exceed a certain density then don't draw them...say 8 pixel separation

    if (this.trackWidth / this._max > 4) {

        this.ticks = [];

        for (var i = 0; i <= this._max; i += 1) {

            var x = -1 + (algo.components.Slider.kTHUMB_WIDTH / 2) +
                (this.trackWidth - algo.components.Slider.kTHUMB_WIDTH + 2) / this._max * i;

            // use an existing tick if we can

            var tick;
            if (temp && temp.length) {
                tick = temp.pop();
            } else {
                tick = $('<div class="slider-tick"></div>');
            }
            tick.css({
                left: x + 'px'
            });

            tick.appendTo(this.track);

            this.ticks.push(tick);
        }
    }

    // anything left in temp should be removed
    _.each(temp, function(tick) {
        tick.remove();
    });
};

/**
 * enable or disable state
 * @param b
 */
algo.components.Slider.prototype.setEnabled = function(b) {

    if (b !== this.enabled) {

        this.enabled = b;

        if (this.enabled) {
            this.element.css({opacity: 1});
            this.thumb.removeClass("noselect nomouse");
        } else {
            this.element.css({opacity: 0.5});
            this.thumb.addClass("noselect nomouse");
        }

        this.cancelDrag();
    }
};

/**
 * handle keyboard events for the thumb
 * @param e
 */
algo.components.Slider.prototype.keyboard = function(e) {

    // ignore if disabled

    if (!this.enabled) {
        return true;
    }

    var handled = false;

    if (e.keyCode === 37) {
        this.value -= 1;
        handled = true;
    }

    if (e.keyCode === 39) {
        this.value += 1;
        handled = true;
    }

    if (handled) {
        this.cancelDrag();
    }

    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;

    return !handled;
};

/**
 * set max and value without firing event
 * @param m
 * @param v
 */
algo.components.Slider.prototype.setMaxAndValue = function(m, v) {

    this._max = m;
    this._value = v;
    this.cancelDrag();
    this.positionThumb();
    this.updateTicks();
};

/**
 * layout on construction or window size change
 */
algo.components.Slider.prototype.layout = function() {

    // get width / height of outer element and document offset

    this.trackLeft = this.track.offset().left;
    this.width = this.element.width();
    this.height = this.element.height();

    // first the track bar

    this.track.css({
        left: algo.components.Slider.kTRACK_INSET,
        width: this.width - algo.components.Slider.kTRACK_INSET * 2,
        height: algo.components.Slider.kTRACK_HEIGHT,
        top: (this.height - algo.components.Slider.kTRACK_HEIGHT) >> 1
    });

    this.trackWidth = this.track.width();
    this.trackHeight = this.track.height();

    // position the thumb
    this.positionThumb();

    // re-tick
    this.updateTicks();
};

/**
 * position thumb according to current size and value
 */
algo.components.Slider.prototype.positionThumb = function() {

    this.thumb.css({
        // width calculation allows for inclusive max value and 1 pixel border on each end
        left: this._max ? -1 + (this.trackWidth - algo.components.Slider.kTHUMB_WIDTH + 2) / this._max * this._value : 0,
        width: algo.components.Slider.kTHUMB_WIDTH,
        height: algo.components.Slider.kTHUMB_HEIGHT,
        top: (this.trackHeight - algo.components.Slider.kTHUMB_HEIGHT) >> 1
    });

};

algo.components.Slider.kTRACK_HEIGHT = 4;
algo.components.Slider.kTRACK_INSET = 4;

algo.components.Slider.kTHUMB_WIDTH = 20;
algo.components.Slider.kTHUMB_HEIGHT = 20;

algo.components.Slider.kTHUMB_DOT_WIDTH = 5;
algo.components.Slider.kTHUMB_DOT_HEIGHT = 5;

algo.components.Slider.kTICK_HEIGHT = 8;

/**
 * mouse down in thumb
 * @param e
 */
algo.components.Slider.prototype.mouseDownThumb = function(e) {

    if (!this.dragging && e.which === 1 && this.enabled) {

        this.dragging = true;

        // add hover style for during of hold
        this.thumb.addClass('algo-slider-thumb-hover');
    }
};

/**
 * true only during a thumb drag
 * @type {boolean}
 */
algo.components.Slider.prototype.dragging = false;

/**
 * mouse up, global
 * @param e
 */
algo.components.Slider.prototype.mouseUp= function(e) {

    this.cancelDrag();
};

/**
 * cancel any current dragging
 */
algo.components.Slider.prototype.cancelDrag = function() {

    if (this.dragging) {
        this.dragging = false;
        this.thumb.removeClass('algo-slider-thumb-hover');
    }
};

/**
 * click anywhere inside control
 * @param e
 */
algo.components.Slider.prototype.onClick = function(e) {

    if (!this.dragging && this.enabled) {

        this.setValueFromMouseEvent(e);

    }
};

/**
 * mouse move, global
 * @param e
 */
algo.components.Slider.prototype.mouseMove = function(e) {

    if (this.dragging) {

        this.setValueFromMouseEvent(e);

        e.stopPropagation();

        e.preventDefault();

        return false;
    }
};

/**
 * set value based on given position event x position
 * @param e
 */
algo.components.Slider.prototype.setValueFromMouseEvent = function(e) {

    var x = e.clientX - this.trackLeft;

    // calculate nearest interval in the inclusive range 0..this._max

    var v = Math.round(x / this.trackWidth * this._max);

    // clamp to range of slider

    v = Math.max(0, Math.min(v, this._max));

    // update position of thumb if necessary

    if (v !== this._value) {

        this._value = v;

        this.positionThumb();

        amplify.publish('slider-value-changed', this, this._max, this._value);
    }
}

