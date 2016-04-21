var expect = require('chai').expect;
var EventLogger = require('./event.logger');


var Context = function (createEventified) {
  this.e = createEventified();
  this._logger = new EventLogger();
  this._expected = [];
};

Context.prototype.createCallback = function (name) {
  return this._logger.createCallback(name);
};

Context.prototype.prepend = function (result) {
  this._expected.unshift(result);
};

Context.prototype.append = function (result) {
  this._expected.push(result);
};

Context.prototype.completeTest = function (done) {
  this.e.on('beforeToCompleteTest', function () {
    if (this.beforeToCompleteTest) {
      this.beforeToCompleteTest();
    }

    this.e.on('done', function () {
      expect(this._logger.eventLog()).to.be.deep.equal(this._expected);
      done();
    }, this);

    this.e.trigger('done');
  }, this);

  this.e.trigger('beforeToCompleteTest');
};


module.exports = Context;
