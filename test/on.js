var expect = require('chai').expect;
var Avent = require('../avent');
var EventLogger = require('./util/event.logger');

var Eventified = function () {
  this._initEventEmitter();
  this.trigger = this._eventEmitter.trigger.bind(this._eventEmitter);
};

Avent.eventify(Eventified);


describe('On', function () {
  this.timeout(1000);
  var helpers = {};

  beforeEach(function () {
    helpers = {
      eventified: new Eventified(),
      eventLogger: new EventLogger()
    }
  });

  it('catches single event without args', function (done) {
    helpers.eventified.on('first', helpers.eventLogger.logEvent('first'));

    helpers.eventified.on('done', function () {
      expect(helpers.eventLogger.eventLog()).to.be.deep.equal([{
        name: 'first',
        args: []
      }]);

      done();
    });

    helpers.eventified.trigger('first');
    helpers.eventified.trigger('done');
  });

  it('TBD');
});
