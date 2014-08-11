/**
 * An API Library for making JSON P calls without jQuery.
 * @author Christopher Pryce<cpryce@digitalriver.com>
 *
 * Based on JSON and JSONP By Angus Croll
 * http://javascriptweblog.wordpress.com/2010/11/29/json-and-jsonp/
 *
 * Copyright 2013 Christopher Pryce
 * No use restrictions. Code is distributed AS IS with no implicit or explicit warranty
 *
 *
 * Module definition
 * @dependencies Q or an other library that supports CommonJS Promises/A API
 */

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["q"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("q"));
    } else {
        root.jsonp = factory(root.Q);
    }
}(this, function (promisesLib) {
    "use strict";
    return {
        // to provide unique callback identifiers
        callbackCounter: 0,

        /**
         * GETS JSON string from a remote URL
         * @param {String} url The url of the call
         * @param {Function} callback A callback function to run when the script is loaded
         * @param {Object} scope An object to provide scope for the callback
         * @return {Promise} A CommonJS API promise object
         */
        getJSON: function (url, callback, scope) {
            var defer = promisesLib.defer(),
                self = this,
                fn,
                scriptTag,
                script;

            // set a default scope if none exists
            scope = scope || self;

            // create a temporary global function with a incremental key.
            // keeps duplicate functions from being created.
            fn = 'JSONPCallback_' + self.callbackCounter;
            self.callbackCounter += 1;

            window[fn] = self.evalJSONP(defer);

            // add or replace the callback name in the url with our own unique name
            if (url.indexOf('callback=') !== -1) {
                url = url.replace('=callback', '=' + fn);
            } else {
                url += (url.indexOf('?') !== -1 ? '&callback=' + fn : '?callback=' + fn);
            }

            // append a script element to the document.
            scriptTag = document.createElement('SCRIPT');
            scriptTag.src = url;
            script = document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);

            // clean up global function and remove script after the function runs.
            return defer.promise.then(function (data) {
                window[fn] = undefined;
                try {
                    delete window[fn];
                } catch (e) {
                    // ignore error
                }
                try {
                    script.parentNode.removeChild(script);
                } catch (e) {
                    // ignore error
                }

                // chain the promise
                return data;
            }).then(function (data) {
                    // run the callback
                    if (typeof callback === 'function') {
                        callback.call(scope, data);
                    }

                    // chain the promise
                    return data;
                });
        },

        /**
         * Evaluates the JSON object returned from the getJSON call
         * Resolves the passed promise.
         * @param {Promise} defer A Common/JS API promise Object
         */
        evalJSONP: function (defer) {
            // return a closure to run when the script is loaded
            return function (data) {
                var validJSON = false;
                if (typeof data === "string") {
                    try {
                        validJSON = JSON.parse(data);
                    } catch (e) {
                        /* invalid JSON */
                    }
                } else {
                    validJSON = JSON.parse(JSON.stringify(data));
                }

                if (validJSON) {
                    defer.resolve(validJSON);
                } else {
                    defer.reject("JSONP call returned invalid or empty JSON");
                }
            };
        }
    };
}));
