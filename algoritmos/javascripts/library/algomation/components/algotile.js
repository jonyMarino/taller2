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
 * a algorithm tile is used for displaying algorithms in lists etc.
 * @param {algo.Algorithm} a - the algorithm we represent
 * @param {Object}  options - [layout, featuredSlug]
 * @constructor
 */
algo.components.AlgorithmTile = function(a, options) {

    this.algorithm = a;

    this.element = algo.Util.cloneTemplate('algorithm-tile');

    algo.Util.propertiesFromElements(this.element, this);

    this.title.html(_.prune(this.algorithm.title || "No Title", 100));

    this.title.attr('href', algo.App.I.preferredPlayerLink(this.algorithm));

    this.playerLink.attr('href', algo.App.I.preferredPlayerLink(this.algorithm));

    this.description.html(_.prune(this.algorithm.description || "No Description", 400));

    this.author.html(this.algorithm.creator.username);

    this.author.attr('href', '/useralgorithms?userid=' + this.algorithm.creatorid);

    this.created.html("Created: " + moment(this.algorithm.created).calendar());

    this.modified.html("Modified: " + moment(this.algorithm.modified).calendar());

    // make edit/delete link visible if the creator is the signed in user, otherwise show the fork link

    if (algo.App.I.getUserID() === this.algorithm.creator._id) {
        this.editLink.removeClass('hidden');

        // featured algorithms cannot be deleted
        if (!this.algorithm.featuredSlug) {
            this.deleteLink.removeClass('hidden');
        }

    } else {
        this.forkLink.removeClass('hidden');
    }

    // apply options

    // two column layout for tiles in its container

    if (options && options.layout === 'double') {
        this.element.addClass('algorithm-tile-double');
    }

    if (options && options.featuredSlug) {
        this.featuredSlug.removeClass('hidden');
        this.featuredSlug.text(this.algorithm.featuredSlug);
    }

    // save options for later use

    this.options = options;

    // activate all tooltips on our elements

    this.element.tooltip();

};


/**
 * when the edit link is clicked
 * @param e
 */
algo.components.AlgorithmTile.prototype.editLinkClick = function(e) {

    algo.App.I.goEdit(this.algorithm.id);
};

/**
 * when the delete link is clicked, just publish an event, the owning page/component will have to do the dirty work
 * @param e
 */
algo.components.AlgorithmTile.prototype.deleteLinkClick = function(e) {

    amplify.publish('algorithm-delete', this, this.algorithm);

};


/**
 * when the fork link is clicked
 * @param e
 */
algo.components.AlgorithmTile.prototype.forkLinkClick = function(e) {

    algo.App.I.goFork(this.algorithm.id);
};

/**
 * when the featured slug anchor is clicked, this is admin only
 * @param e
 */
algo.components.AlgorithmTile.prototype.featuredSlugClick = function(e) {

    this.options.featuredSlug(this.algorithm);
};