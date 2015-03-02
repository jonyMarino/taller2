/*global, window, _ */

/**
 * global namespace for app
 */
var algo = algo || {};

/**
 * constants shared by all versions of the player
 * @type {number}
 */

algo.kPLAYING = 1;
algo.kPAUSED = 2;
algo.kDONE = 3;

/**
 * playback speeds transitions
 * @type {number}
 */
algo.kFAST = 200;
algo.kNORMAL = 500;
algo.kSLOW = 1000;

/**
 * play mode, continuous or single step
 * @type {number}
 */
algo.kSINGLE_STEP = 1;
algo.kCONTINUOUS = 2;