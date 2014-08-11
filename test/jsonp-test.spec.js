// html tests only
(function (root, factory) {
    // AMD
    if (typeof define === "function" && define.amd) {
        require(['config/config'], function () {
            require(['jsonp', '../chai/chai', '../mocha/mocha'], factory);
        });
    } else {
    // Globals
        root.jsonpTest = factory(root.jsonp, root.chai);
    }

}(this, function (jsonp, chai) {
    var expect = chai.expect;

    if (typeof define === "function" && define.amd) {
        window.mocha.setup('bdd');
        window.mocha.reporter('html');
    }

    describe("jsonp lib", function () {
        it("should expose a public method getJSON", function (done) {
            expect(jsonp).to.have.property('getJSON')
                .to.be.a('function');
            done();
        });
    });

    if (typeof define === "function" && define.amd) {
        if (window.mochaPhantomJS) {
            window.mochaPhantomJS.run();
        } else {
            window.mocha.run();
        }
    }
}));
