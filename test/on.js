var expect = require('chai').expect;
var Avent = require('../avent');

var Eventified = function () {
  this._initEventEmitter();
};

Avent.eventify(Eventified);

//TODO move to test utils
var EventLogger =  function ()
{
  this._eventLog = [];
};

EventLogger.prototype.logEvent = function (name) {
  this._eventLog.push({
    name: name,
    args: Array.prototype.slice.call(arguments, 1)
  });
};

EventLogger.prototype.eventLog = function () {
  return this._eventLog;
};

describe('On', function () {
  this.timeout(1000);

  it('catches single event without args', function (done) {
    var eventified = new Eventified();

    var eventLogger = new EventLogger();
    eventified.on('first', eventLogger.logEvent.bind(eventLogger, 'first'));

    eventified.on('done', function () {
      expect(eventLogger.eventLog()).to.be.deep.equal([{
        name: 'first',
        args: []
      }]);

      done();
    });

    eventified._eventEmitter.trigger('first');
    eventified._eventEmitter.trigger('done');
  });

  it('TBD');
});
