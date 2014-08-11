require.config({
    paths: {
        "mocha" : "../mocha/mocha",
        "chai" : "../chai/chai",
        "jsonp" : "../jsonp",
        "q" : "../q/q"
    },
    shim : {
        "jsonp" : ['q'],
        "chai" : ['mocha']
    }
});

