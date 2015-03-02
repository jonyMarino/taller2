/**
 * Contains constants that are shared between client and server, literally...this file is included in
 * client side views and within the node-js code
 */

var K = {

    // API error codes

    API_NO_ERROR: 0,

    API_ERROR_BAD_CREDENTIALS: 1,

    API_ERROR_USERNAME_INVALID: 2,

    API_ERROR_USERNAME_TAKEN: 3,

    API_ERROR_EMAIL_INVALID: 4,

    API_ERROR_EMAIL_TAKEN: 5,

    API_ERROR_PASSWORD_INVALID: 6,

    API_ERROR_ACCOUNT_NOT_FOUND: 7,

    API_RESET_TOKEN_INVALID: 8,

    API_SAVE_ERROR: 9,

    API_EMAIL_ERROR: 10,

    API_CONNECTION_ERROR: 11,

    API_PASSWORDS_MISMATCH: 12,

    API_ALGORITHM_CREATE_ERROR: 13,

    API_NOT_AUTHORIZED: 14,

    API_ALGORITHM_NOT_FOUND: 15,

    API_IO_ERROR: 16,

    API_SEARCH_ERROR: 17,

    API_BAD_SLUG: 18,

    API_DB_ERROR: 19,

    API_ERROR_UNKNOWN: -1,

    // base address for client side API's

    API_URI: '/api/v1/'
};

/**
 * returns a string message for a constants representing an API error
 * @param error
 * @returns {string}
 */
K.errorToString = function (error) {

    switch (error) {
        case K.API_NO_ERROR:
            return 'No Error';
        case K.API_ERROR_BAD_CREDENTIALS:
            return 'Incorrect user name or password.';
        case K.API_ERROR_USERNAME_INVALID:
            return 'Username is not valid.';
        case K.API_ERROR_USERNAME_TAKEN:
            return 'Username is already registered.';
        case K.API_ERROR_EMAIL_INVALID:
            return 'Email address is not valid.';
        case K.API_ERROR_EMAIL_TAKEN:
            return 'Email address is already registered.';
        case K.API_ERROR_PASSWORD_INVALID:
            return 'Password is not valid.';
        case K.API_ERROR_ACCOUNT_NOT_FOUND:
            return 'No matching account was found';
        case K.API_RESET_TOKEN_INVALID:
            return 'Invalid reset token';
        case K.API_SAVE_ERROR:
            return 'Problem saving changes';
        case K.API_EMAIL_ERROR:
            return 'Problem sending email.';
        case K.API_CONNECTION_ERROR:
            return 'Problem connecting to algomation.com';
        case K.API_PASSWORDS_MISMATCH:
            return "Passwords do not match.";
        case K.API_ALGORITHM_CREATE_ERROR:
            return "Problem creating algorithm.";
        case K.API_ALGORITHM_NOT_FOUND:
            return "Algorithm not found.";
        case K.API_BAD_SLUG:
            return "Invalid slug";
        case K.API_IO_ERROR:
            return "File I/O error.";
        case K.API_DB_ERROR:
            return "Problem accessing database.";
        default:
            return 'Unrecognized error. You might not be able to connect to algomation.com right now.'
    }

};

// this regex is used to validate ob both the client side and server side and also acts a constraint on the mongoose schema
// for accounts
K.passwordRegex = /^[a-zA-Z0-9~`!@#$%^&*\(\)_\-\+={}\[\]|\\:;"'<,>.?\/]{4,50}$/;

// very permissive email regex....accepts any non-whitespace in the form X@Y.Z, no length limits
K.emailRegex = /^\S+@\S+\.\S+$/;

// very restrictive username regex, lowercase letters/numbers 4:20
K.usernameRegex = /^[a-z0-9]{4,20}$/;

// export constants if we are on the server side

var module = module || {};

module.exports = K;








