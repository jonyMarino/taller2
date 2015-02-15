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
algo.components.Vcr = function (selector, controller) {

    // save our controller

    this.controller = controller;

    // get our outer element

    this.outer = selector;

    // fetch all the buttons etc as properties

    algo.Util.propertiesFromElements($('.algo-vcr'), this);

    // create slider

    this.slider = new algo.components.Slider(this.sliderContainer);

    // reset to initial state

    this.reset();

    // always skip if skip=true in query string

    this.forceSkip = algo.App.I.getParameter('skip');

    // subscribe to IDE events

    amplify.subscribe('algorithm-loaded', this, _.bind(function (algorithm) {

        // save algorithm and show introductory info

        this.algorithm = algorithm;

        // if user is the creator then show edit button, otherwise show the fork button
        // UNLESS, controller is in testing mode, in which case both buttons are left hidden

        if (!this.controller.testing) {

            if (this.algorithm.creator._id === algo.App.I.getUserID()) {
                this.editLink.removeClass('hidden');
            }
        }

    }, this));

};

/**
 * when we reach a pause in the algorithm
 * @param s
 */
algo.components.Vcr.prototype.pause = function (options) {

    if (this.controller.playMode === algo.kCONTINUOUS || options.autoskip || this.forceSkip) {

        // just wait for the current transition time and continue

        this.boundContinue = this.boundContinue || _.bind(this.continue, this);

        if (this.pauseDelay) clearTimeout(this.pauseDelay);

        this.pauseDelay = _.delay(this.boundContinue, this.controller.transitionSpeed);

    } else {

        // in single step mode wait for the user to click the continue button and enable slider

        this.nextBtn.removeClass('disabled');
        this.slider.setEnabled(true);
    }
};

/**
 * timer used to restart after a pause
 */
algo.components.Vcr.prototype.pauseDelay;

/**
 * when the algorithm is complete
 * @param s
 */
algo.components.Vcr.prototype.done = function () {


    //if (this.controller.playMode === algo.kCONTINUOUS || this.forceSkip) {
    if (this.forceSkip) {

        // disable continue/restart button

        this.nextBtn.addClass('disabled');
        this.slider.setEnabled(false);

        // just wait for the current transition time and continue

        this.boundRestart = this.boundRestart || _.bind(this.restartLinkClick, this);

        if (this.restartDelay) clearTimeout(this.restartDelay);

        this.restartDelay = _.delay(this.boundRestart, this.controller.transitionSpeed);

    } else {

        // turn the continue button into a restart button and enabled slider

        this.nextBtn.text("Restart");
        this.nextBtn.removeClass('disabled');
        this.slider.setEnabled(true);
    }
};

/**
 * when the user clicks continue
 */
algo.components.Vcr.prototype.continue = function () {

    if (this.controller.playState === algo.kDONE) {

        // reset flag that ensures we only nest one pause/continue pair

        this.pauseDelay = null;

        // disable continue button

        this.nextBtn.addClass('disabled');

        // disable slider
        this.slider.setEnabled(false);

        // tell the controller to continue

        amplify.publish('algorithm-restart');

    } else {

        // reset flag that ensures we only nest one pause/continue pair

        this.pauseDelay = null;

        // disable continue button

        this.nextBtn.addClass('disabled');

        // disable slider

        this.slider.setEnabled(false);

        // tell the controller to continue

        amplify.publish('algorithm-continue');
    }
};

/**
 * reset to initial state, typically when restarting an algorithm
 */
algo.components.Vcr.prototype.reset = function () {

    // clear any delayed code

    if (this.pauseDelay) clearTimeout(this.pauseDelay);

    if (this.restartDelay) clearTimeout(this.restartDelay);

    // ensure continue button has the correct text

    this.nextBtn.text("Continue");

    // set button states according to controller state

    this.setButtonStates();

    // reset slider to zero history

    this.slider.setMaxAndValue(0, 0);
}

/**
 * set buttons as per controller state
 */
algo.components.Vcr.prototype.setButtonStates = function () {

    // initialize speed and play mode based on controller settings

    this.selectInGroup(this.speedGroup, $('[data-speed="' + this.controller.transitionSpeed + '"]', this.speedGroup));

    this.selectInGroup(this.playGroup, this.controller.playMode === algo.kSINGLE_STEP ? this.singleStepBtn : this.continuousBtn);

};

/**
 * restart clicked
 */
algo.components.Vcr.prototype.restartBtnClick = function () {

    amplify.publish('algorithm-restart');
};

/**
 * next button clicked
 */
algo.components.Vcr.prototype.nextBtnClick = function () {

    this.continue();
};

/**
 * make the btn in group btn-primary and all other buttons btn-default
 * @param group
 * @param btn
 */
algo.components.Vcr.prototype.selectInGroup = function (group, btn) {

    var buttons = $('.btn', group);

    buttons.removeClass('btn-success');
    buttons.addClass('btn-default');

    btn.removeClass('btn-default');
    btn.addClass('btn-success');

};

/**
 * speed changes
 */
algo.components.Vcr.prototype.slowBtnClick = function () {
    this.setSpeed(algo.kSLOW, this.slowBtn);
};

algo.components.Vcr.prototype.normalBtnClick = function () {
    this.setSpeed(algo.kNORMAL, this.normalBtn);
};

algo.components.Vcr.prototype.fastBtnClick = function () {
    this.setSpeed(algo.kFAST, this.fastBtn);
};

/**
 * set speed and highlight the correct toggle button
 * @param ms
 * @param activeBtn
 */
algo.components.Vcr.prototype.setSpeed = function (ms, activeBtn) {

    this.selectInGroup(this.speedGroup, activeBtn);

    // tell listeners about the new speed

    amplify.publish('algorithm-speed', ms);
};

/**
 * play mode controls
 */
algo.components.Vcr.prototype.singleStepBtnClick = function () {

    this.selectInGroup(this.playGroup, this.singleStepBtn);

    // tell listeners about the new mode

    amplify.publish('algorithm-mode', algo.kSINGLE_STEP);

};

/**
 * user clicked ( or somebody wants ) continuous mode
 */
algo.components.Vcr.prototype.continuousBtnClick = function () {

    if (this.controller.playMode !== algo.kCONTINUOUS) {

        this.selectInGroup(this.playGroup, this.continuousBtn);

        amplify.publish('algorithm-mode', algo.kCONTINUOUS);

        // immediately continue if paused

        if (this.controller.playState === algo.kPAUSED) {
            this.continue();
        } else if (this.controller.playState === algo.kDONE) {
            this.restartLinkClick();
        }
    }
};

/**
 * fork button clicked
 */
algo.components.Vcr.prototype.forkLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        this.singleStepBtnClick();
        amplify.publish('algorithm-fork', this.algorithm.id);
    }
};

/**
 * edit button clicked
 */
algo.components.Vcr.prototype.editLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        amplify.publish('algorithm-edit', this.algorithm.id);
    }
};

/**
 * share link
 * @param e
 */
algo.components.Vcr.prototype.shareLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        this.singleStepBtnClick();
        algo.App.I.runShareDialog(this.algorithm);
    }
};

/**
 * embed link
 * @param e
 */
algo.components.Vcr.prototype.embedLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        this.singleStepBtnClick();
        algo.App.I.runEmbedDialog(this.algorithm.id);
    }
};

/**
 * restart link
 * @param e
 */
algo.components.Vcr.prototype.restartLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        amplify.publish('algorithm-restart', this.algorithm.id);
    }
};

/**
 * more link
 * @param e
 */
algo.components.Vcr.prototype.moreLinkClick = function (e) {

    if (e) e.preventDefault();
    if (this.algorithm) {
        algo.App.I.goto("/useralgorithms?userid=" + this.algorithm.creatorid);
    }
};