"use strict";

var algo = algo || {};

/**
 * The client side representation of an algorithm object.
 * create with JSON returned by an API call.
 * @param json
 * @constructor
 */
algo.Algorithm = function (json) {

    // we maintain the algorithm in JSON format but provide getters/setters for the various properties
    // that can be read or updated by the client

    this.json = json;

    // we main a dirty flag for modified properties

    this._dirty = false;

    // id is read only of course

    Object.defineProperty(this, 'id', {
        enumerable: true,
        get       : function () {
            return this.json._id;
        }
    });

    // title is read/write and always has tags removed

    Object.defineProperty(this, 'title', {
        enumerable: true,
        get       : function () {
            return this.json.title;
        },
        set       : function (str) {

            var t = _.stripTags(str || '').trim();

            if (t !== this.json.title) {
                this.json.title = t;
                this.dirty = true;
            }
        }
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        get       : function () {
            return this.json.description;
        },
        set       : function (str) {

            var t = _.stripTags(str || '').trim();

            if (t !== this.json.description) {
                this.json.description = t;
                this.dirty = true;
            }
        }
    });

    Object.defineProperty(this, 'created', {
        enumerable: true,
        get       : function () {
            return this.json.created;
        }
    });

    Object.defineProperty(this, 'modified', {
        enumerable: true,
        get       : function () {
            return this.json.modified;
        }
    });

    Object.defineProperty(this, 'featuredSlug', {
        enumerable: true,
        get       : function () {
            return this.json.featuredSlug;
        }
    });

    Object.defineProperty(this, 'creator', {
        enumerable: true,
        get       : function () {
            return this.json.creator;
        }
    });

    Object.defineProperty(this, 'creatorid', {
        enumerable: true,
        get       : function () {
            return this.json.creator._id;
        }
    });

    Object.defineProperty(this, 'es5', {
        enumerable: true,
        get       : function () {
            return this.json.es5;
        }
    });

    Object.defineProperty(this, 'es6', {
        enumerable: true,
        get       : function () {
            return this.json.es6;
        },
        set       : function (str) {

            if (str !== this.json.es6) {
                this.json.es6 = str;
                this.dirty = true;
            }
        }
    });

    Object.defineProperty(this, 'error', {
        enumerable: true,
        get       : function () {
            return this.json.error;
        }
    });

    Object.defineProperty(this, 'errorLocation', {
        enumerable: true,
        get       : function () {
            return this.json.errorLocation;
        }
    });

    Object.defineProperty(this, 'api', {
        enumerable: true,
        get       : function () {
            return this.json.api;
        },
        set       : function (api) {
            if (api !== this.json.api) {
                this.json.api = api;
                this.dirty = true;
            }
        }
    });

    Object.defineProperty(this, 'dirty', {
        enumerable: true,
        get       : function () {
            return this._dirty;
        },
        set       : function (d) {
            if (d !== this._dirty) {
                this._dirty = d;
                amplify.publish('algorithm-dirty-changed', this);
            }
        }
    });
};

/**
 * revisions are not loaded as part of the algorithm but can be requested from an existing algorithm ( which
 * we assume the user has already loaded in the editor for example )
 * NOTE: Revisions do not become part of the object after loading so that we don't have to manage their state e.g.
 * always having the correct set of revisions ( e.g. after subsequent loads or saves or updates from another machine etc )
 * @param callback
 */
algo.Algorithm.prototype.getRevisions = function (callback) {
/*
    $.ajax({
        type    : "GET",
        url     : algo.App.I.API('revisions'),
        data    : {
            algorithm: this.id
        },
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            if (response.error === K.API_NO_ERROR) {

                // revisions from the server an oldest first in the array, reverse so that newest revisions
                // are at the top

                response.revisions.reverse();

                callback(K.API_NO_ERROR, response.revisions);

            } else {

                // callback with error code
                callback(response.error);
            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // callback with generic error

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * save the algorithm and invoke the call back with the server response
 * @param callback
 */
algo.Algorithm.prototype.save = function (callback) {
 /*
    // PUT update to the server

    $.ajax({
        type    : "PUT",
        url     : algo.App.I.API('algorithm'),
        data    : {
            algorithm  : this.id,
            title      : this.title,
            description: this.description,
            es6        : this.es6,
            api        : this.api
        },
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            // clear dirty flag if successful and callback with error and algorithm ( null if there was an error )

            if (response.error === K.API_NO_ERROR) {
                this.dirty = false;
            }

            callback(response.error, response.algorithm);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * save the algorithm and invoke the call back with the server response
 * @param callback
 */
algo.Algorithm.prototype.delete = function (callback) {
/*
    // PUT update to the server

    $.ajax({
        type    : "DELETE",
        url     : algo.App.I.API('algorithm'),
        data    : {
            algorithm  : this.id
        },
        dataType: "json",

        // success handler

        success: $.proxy(function (response) {

            callback(response.error);

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * load the algorithm and create an instance.
 * NOTE: This is a static method of the class
 * @param callback
 */
algo.Algorithm.load = function (id, callback) {

var algorithmObject = new Object();
algorithmObject._id="5475f3335b77a60200e588be";
algorithmObject.creator={"_id":"543acc96eeea250200e85576","username":"jonathanmarino"};
algorithmObject.errorLocation="";
algorithmObject.error="";
algorithmObject.es6="function* algorithm() {\n\n    \n    var palabra = \"CONSERVATIONALISTZ\";\n    var key = \"ABCZ\";\n    var key2=\"\";\n    var palabraEncriptada = \"\";\n\n   \n\n    yield * encriptar(palabra, key);\n\n\n    yield ({\n        step: \"¡Has concluido! \\n\",\n        variables: {\n            \"palabra\":palabra,\n            \"clave\":key,\n            \"resultado\":palabraEncriptada,\n        }\n    });\n\n    // compare two words, displaying our progress as we go\n    function* encriptar(w1, w2) {\n\n        // get bounds of surface we are displayed on\n        var bounds = algo.BOUNDS.inflate(-10, -100);\n\n        // layout is based on five rows and columns equal to the longest word\n        var layout = new algo.layout.GridLayout(bounds, 3, Math.max(w1.length, w2.length));\n\n        // display both words\n        function displayWord(w, row) {\n            var rectangulo = new Array(w.length);\n            for (var i = 0; i < w.length; i += 1) {\n                var box = layout.getBox(row, i).inflate(-4, -4);\n                    \n                    rectangulo[i] = new algo.render.Rectangle({\n                    state: algo.render.kS_NORMAL,\n                    shape: box,\n                    text: w[i]\n                });\n            }\n            return rectangulo;\n        }\n\n        rCadena=displayWord(w1, 0);\n        \n                //=comienzo\n        yield ({\n            step: _.sprintf(\"Encriptando %s con %s.\", w1, w2),\n            line: \"comienzo\",\n            variables: {\n                \"palabra\": w1,\n                \"clave\": w2\n            }\n        });\n        \n        var clave = new Array(w1.length);\n            for (var i = 0; i < w1.length; i += 1) {\n                var box = layout.getBox(1, i).inflate(-4, -4);\n                    \n                    clave[i] = new algo.render.Rectangle({\n                        state: algo.render.kS_NORMAL,\n                        shape: box,\n                        strokeWidth: 1,\n                        stroke: 'blue',\n                        fill: 'orange',\n                        pen: 'black',\n                        text: \"\"\n                    });\n                yield({\n                    step: _.sprintf(\"Llenar con la clave %s:\\n clave2[i] = clave[i mod clave.length]\", w2),  \n                    variables: {\n                        \"clave\": w2,\n                        \"i\":i,\n                        \"clave2\":key2,\n                    }\n                });\n                clave[i].set({\n                    state: algo.render.kS_NORMAL,\n                    text: w2[i%w2.length],\n                });\n                key2+= w2[i%w2.length];\n                \n            }\n        //\"                  \"\n        var a = new Array(w1.length);\n        rResultado=displayWord(a, 2);\n        \n\n        for(var i=0;i<w1.length;i++){\n            yield * encriptarCaracter(rCadena[i],clave[i],rResultado[i],i);\n        }\n        \n        // destroy any previous display elements\n        //algo.SURFACE.root.children.destroy();\n        \n    }\n    \n    function* encriptarCaracter(cadena,clave,resultado,i){\n        var res=0;\n        cadena.set({\n            strokeWidth: 1,\n            stroke: 'blue',\n            fill: 'orange',\n            pen: 'black',\n\n        });\n    \n        clave.set({\n            strokeWidth: 1,\n            stroke: 'blue',\n            fill: 'orange',\n            pen: 'black',\n        });\n        //=bigrams\n        yield ({\n            step: _.sprintf(\"Encriptando %s con %s: \\n resultado[i]=palabra[i]-ascii(A) + clave2[i] -ascii(A)' mod 26+ascii(A)\", cadena.text,clave.text),\n            variables: {\n                \"palabra\":palabra,\n                \"clave2\":key2,\n                \"i\":i,\n                \"resultado\":palabraEncriptada,\n            }\n            \n        });\n        res = String.fromCharCode((cadena.text.charCodeAt(0)-'A'.charCodeAt(0) + clave.text.charCodeAt(0) -'A'.charCodeAt(0))%26+'A'.charCodeAt(0));\n        palabraEncriptada+=res;\n        resultado.set({\n            text : res,\n        });\n        \n        cadena.set({\n            state: algo.render.kS_NORMAL\n\n        });\n    \n        clave.set({\n            state: algo.render.kS_NORMAL\n        });   \n\n        \n    }\n}";
algorithmObject.api="1.0";
algorithmObject.modified="2014-11-26T17:18:22.321Z";
algorithmObject.created="2014-11-26T15:35:15.247Z";
algorithmObject.description="La idea de este algoritmo es sumar a cada caracter de la palabra a encriptar otro caracter de la clave y para desencriptarlo restar el caracter sumado.\nAlgoritmo:\nescribir la clave hasta llegar a tener la misma cantidad de letras que la palabra a encriptar (de ser menor la clave recomenzar a escribir).\nfor (var i = 0; i < palabra.length; i += 1) {\n  clave2[i] = clave[i mod clave.length]\n}\n\nLuego cada letra de la palabra es es sumada a la letra correspondiente d ela clave \"pegando la vuelta\" si es mayor a Z;\nfor(var i=0;i<w1.length;i++){\n resultado[i]=palabra[i]-ascii(A) + clave2[i] -ascii(A)' mod 26+ascii(A)\n}";
algorithmObject.title="Vigenère";
var algorithm = new algo.Algorithm(algorithmObject);
callback(K.API_NO_ERROR, algorithm);
};

/**
 * create an instance on the server and then load
 * NOTE: This is a static method of the class
 * @param callback
 */
algo.Algorithm.create = function (callback) {

var algorithmObject = {"_id":"5475f3335b77a60200e588be","creator":{"_id":"543acc96eeea250200e85576","username":"jonathanmarino"},"errorLocation":"","error":"","es6":"function* algorithm() {\n\n    \n    var palabra = \"CONSERVATIONALISTZ\";\n    var key = \"ABCZ\";\n    var key2=\"\";\n    var palabraEncriptada = \"\";\n\n   \n\n    yield * encriptar(palabra, key);\n\n\n    yield ({\n        step: \"Has concluido! \\n\",\n        variables: {\n            \"palabra\":palabra,\n            \"clave\":key,\n            \"resultado\":palabraEncriptada,\n        }\n    });\n\n    // compare two words, displaying our progress as we go\n    function* encriptar(w1, w2) {\n\n        // get bounds of surface we are displayed on\n        var bounds = algo.BOUNDS.inflate(-10, -100);\n\n        // layout is based on five rows and columns equal to the longest word\n        var layout = new algo.layout.GridLayout(bounds, 3, Math.max(w1.length, w2.length));\n\n        // display both words\n        function displayWord(w, row) {\n            var rectangulo = new Array(w.length);\n            for (var i = 0; i < w.length; i += 1) {\n                var box = layout.getBox(row, i).inflate(-4, -4);\n                    \n                    rectangulo[i] = new algo.render.Rectangle({\n                    state: algo.render.kS_NORMAL,\n                    shape: box,\n                    text: w[i]\n                });\n            }\n            return rectangulo;\n        }\n\n        rCadena=displayWord(w1, 0);\n        \n                //=comienzo\n        yield ({\n            step: _.sprintf(\"Encriptando %s con %s.\", w1, w2),\n            line: \"comienzo\",\n            variables: {\n                \"palabra\": w1,\n                \"clave\": w2\n            }\n        });\n        \n        var clave = new Array(w1.length);\n            for (var i = 0; i < w1.length; i += 1) {\n                var box = layout.getBox(1, i).inflate(-4, -4);\n                    \n                    clave[i] = new algo.render.Rectangle({\n                        state: algo.render.kS_NORMAL,\n                        shape: box,\n                        strokeWidth: 1,\n                        stroke: 'blue',\n                        fill: 'orange',\n                        pen: 'black',\n                        text: \"\"\n                    });\n                yield({\n                    step: _.sprintf(\"Llenar con la clave %s:\\n clave2[i] = clave[i mod clave.length]\", w2),  \n                    variables: {\n                        \"clave\": w2,\n                        \"i\":i,\n                        \"clave2\":key2,\n                    }\n                });\n                clave[i].set({\n                    state: algo.render.kS_NORMAL,\n                    text: w2[i%w2.length],\n                });\n                key2+= w2[i%w2.length];\n                \n            }\n        //\"                  \"\n        var a = new Array(w1.length);\n        rResultado=displayWord(a, 2);\n        \n\n        for(var i=0;i<w1.length;i++){\n            yield * encriptarCaracter(rCadena[i],clave[i],rResultado[i],i);\n        }\n        \n        // destroy any previous display elements\n        //algo.SURFACE.root.children.destroy();\n        \n    }\n    \n    function* encriptarCaracter(cadena,clave,resultado,i){\n        var res=0;\n        cadena.set({\n            strokeWidth: 1,\n            stroke: 'blue',\n            fill: 'orange',\n            pen: 'black',\n\n        });\n    \n        clave.set({\n            strokeWidth: 1,\n            stroke: 'blue',\n            fill: 'orange',\n            pen: 'black',\n        });\n        //=bigrams\n        yield ({\n            step: _.sprintf(\"Encriptando %s con %s: \\n resultado[i]=palabra[i]-ascii(A) + clave2[i] -ascii(A)' mod 26+ascii(A)\", cadena.text,clave.text),\n            variables: {\n                \"palabra\":palabra,\n                \"clave2\":key2,\n                \"i\":i,\n                \"resultado\":palabraEncriptada,\n            }\n            \n        });\n        res = String.fromCharCode((cadena.text.charCodeAt(0)-'A'.charCodeAt(0) + clave.text.charCodeAt(0) -'A'.charCodeAt(0))%26+'A'.charCodeAt(0));\n        palabraEncriptada+=res;\n        resultado.set({\n            text : res,\n        });\n        \n        cadena.set({\n            state: algo.render.kS_NORMAL\n\n        });\n    \n        clave.set({\n            state: algo.render.kS_NORMAL\n        });   \n\n        \n    }\n}","api":"1.0","modified":"2014-11-26T17:18:22.321Z","created":"2014-11-26T15:35:15.247Z","description":"La idea de este algoritmo es sumar a cada caracter de la palabra a encriptar otro caracter de la clave y para desencriptarlo restar el caracter sumado.\nAlgoritmo:\nescribir la clave hasta llegar a tener la misma cantidad de letras que la palabra a encriptar (de ser menor la clave recomenzar a escribir).\nfor (var i = 0; i < palabra.length; i += 1) {\n  clave2[i] = clave[i mod clave.length]\n}\n\nLuego cada letra de la palabra es es sumada a la letra correspondiente d ela clave \"pegando la vuelta\" si es mayor a Z;\nfor(var i=0;i<w1.length;i++){\n resultado[i]=palabra[i]-ascii(A) + clave2[i] -ascii(A)' mod 26+ascii(A)\n}","title":"Vigenère"};
var algorithm = new algo.Algorithm(algorithmObject);
callback(K.API_NO_ERROR, algorithm);
};

/**
 * fork an existing algorithm the server and then load
 * NOTE: This is a static method of the class
 * @param callback
 */
algo.Algorithm.fork = function (algorithm, callback) {
/*
    $.ajax({
        type    : "POST",
        url     : algo.App.I.API('fork'),
        dataType: "json",
        data    : {
            algorithm: algorithm
        },
        // success handler

        success: $.proxy(function (response) {

            if (response.error === K.API_NO_ERROR) {

                // create algorithm object from JSON

                var algorithm = new algo.Algorithm(response.algorithm);

                callback(K.API_NO_ERROR, algorithm);

            } else {

                callback(response.error);

            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * get algorithms for the signed in user
 * @param persona
 * @param password
 * @param callback
 */
algo.Algorithm.getUserAlgorithms = function (userid, pagesize, page, callback) {
/*
    $.ajax({
        type    : "GET",
        url     : algo.App.I.API('useralgorithms'),
        data    : {
            userid  : userid,
            pagesize: pagesize,
            page    : page
        },
        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response) {

            // if successful create an algorithm instance for each algorithm returned

            if (response.error === K.API_NO_ERROR) {

                var a = _.map(response.algorithms, function (a) {
                    return new algo.Algorithm(a);
                });

                // some of the parameters come back as strings for some reason...$scope.$broadcast('', );

                callback(response.error, a, parseFloat(response.page), parseFloat(response.pages), parseFloat(response.pagesize));

            } else {

                callback(response.error);
            }

        }, this),

        // login failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * paginated algorithm search
 * @param terms
 * @param skip
 * @param limit
 * @param callback
 */
algo.Algorithm.search = function (terms, skip, limit, callback) {
 /*
    $.ajax({
        type    : "GET",
        url     : algo.App.I.API('search'),
        data    : {
            terms: terms,
            skip : skip,
            limit: limit
        },
        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response) {

            // if successful create an algorithm instance for each algorithm returned

            if (response.error === K.API_NO_ERROR) {

                // map algorithm JSON into an actual algorithm object

                var a = _.map(response.results, function (algorithm) {
                    return new algo.Algorithm(algorithm);
                });

                callback(K.API_NO_ERROR, a, response.terms, response.skip, response.limit, response.count);

            } else {

                callback(response.error);
            }

        }, this),

        // login failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * return a list of the featured algorithms
 * @param callback
 */
algo.Algorithm.getFeatured = function (callback) {
/*
    $.ajax({
        type    : "GET",
        url     : algo.App.I.API('getfeatured'),
        dataType: "json",

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response) {

            // if successful create an algorithm instance for each algorithm returned

            if (response.error === K.API_NO_ERROR) {

                // map algorithm JSON into an actual algorithm object

                var a = _.map(response.results, function (algorithm) {
                    return new algo.Algorithm(algorithm);
                });

                callback(K.API_NO_ERROR, a);

            } else {

                callback(response.error);
            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};

/**
 * return a list of the featured algorithms using pagination
 * @param callback
 */
algo.Algorithm.getFeaturedPaginated = function (pageSize, page, callback) {
/*
    $.ajax({
        type    : "GET",
        url     : algo.App.I.API('getfeaturedPaginated'),
        dataType: "json",
        data    : {
            pageSize: pageSize,
            page    : page
        },

        // login successful ( maybe...the caller must interrogate the data object for the actual result )

        success: $.proxy(function (response) {

            // if successful create an algorithm instance for each algorithm returned

            if (response.error === K.API_NO_ERROR) {

                // e.g. {error: 0, results: Array[5], page: "0", pages: 4.4, pagesize: "5"}

                // map algorithm JSON into an actual algorithm object

                var a = _.map(response.results, function (algorithm) {
                    return new algo.Algorithm(algorithm);
                });

                callback(K.API_NO_ERROR, a, parseInt(response.page), parseInt(response.pages), response.pagesize);

            } else {

                callback(response.error);
            }

        }, this),

        // failed

        error: $.proxy(function (jqXHR, textStatus, errorThrown) {

            // failed

            callback(K.API_CONNECTION_ERROR);

        }, this)
    });
*/
};


