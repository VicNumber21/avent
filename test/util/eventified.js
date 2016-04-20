var expect = require('chai').expect;
var Avent = require('../../avent');

var Eventified = function () {
  this._initEventEmitter();
  this.trigger = this._eventEmitter.trigger.bind(this._eventEmitter);
};

Eventified.prototype.completeTest = function (done, logger, expected) {
  this.on('done', function () {
    expect(logger.eventLog()).to.be.deep.equal(expected);
    done();
  });

  this.trigger('done');
};

Avent.eventify(Eventified);

module.exports = Eventified;
