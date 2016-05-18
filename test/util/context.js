var expect = require('chai').expect;
var EventTracker = require('./event.tracker');


var Context = function (createEventified) {
  this.e = createEventified();
  this._tracker = new EventTracker();
  this._expected = [];
};

Context.prototype.createCallback = function (name) {
  return this._tracker.createCallback(name);
};

Context.prototype.prepend = function (result) {
  this._expected.unshift(result);
};

Context.prototype.append = function (result) {
  this._expected.push(result);
};

Context.prototype.completeTest = function (done) {
  this.e.once('beforeToCompleteTest', function () {
    if (this.beforeToCompleteTest) {
      this.beforeToCompleteTest();
    }

    this.e.once('done', function () {
      expect(this._tracker.eventLog()).to.be.deep.equal(this._expected);
      done();
    }, this);

    this.e.trigger('done');
  }, this);

  this.e.trigger('beforeToCompleteTest');
};


module.exports = Context;
