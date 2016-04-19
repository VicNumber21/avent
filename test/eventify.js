var expect = require('chai').expect;
var Avent = require('../avent');

describe('Eventify', function () {
  it('works with simple object', function () {
    var eventified = {};
    Avent.eventify(eventified);

    expect(eventified).to.respondTo('on');
    expect(eventified).to.respondTo('once');
    expect(eventified).to.respondTo('off');
    expect(eventified).not.to.respondTo('trigger');

    expect(eventified).has.ownProperty('_eventEmitter');
    expect(eventified._eventEmitter).to.respondTo('trigger');
    expect(eventified._eventEmitter).to.respondTo('setLogger');
    expect(eventified._eventEmitter).to.respondTo('clearLogger');
  });

  it('works with object prototype', function () {
    var Eventified = function () {
      this._initEventEmitter();
    };

    Avent.eventify(Eventified);
    var eventified = new Eventified();

    expect(eventified).to.respondTo('on');
    expect(eventified).to.respondTo('once');
    expect(eventified).to.respondTo('off');
    expect(eventified).not.to.respondTo('trigger');

    expect(eventified).has.ownProperty('_eventEmitter');
    expect(eventified._eventEmitter).to.respondTo('trigger');
    expect(eventified._eventEmitter).to.respondTo('setLogger');
    expect(eventified._eventEmitter).to.respondTo('clearLogger');
  });

  it('works with custom emitter', function () {
    var Eventified = function () {
      this._emitter = new Avent.EventEmitter();
      this._emitter.eventify(this);
    };

    var eventified = new Eventified();

    expect(eventified).to.respondTo('on');
    expect(eventified).to.respondTo('once');
    expect(eventified).to.respondTo('off');
    expect(eventified).not.to.respondTo('trigger');

    expect(eventified).has.ownProperty('_emitter');
    expect(eventified._emitter).to.respondTo('trigger');
    expect(eventified._emitter).to.respondTo('setLogger');
    expect(eventified._emitter).to.respondTo('clearLogger');
  });
});
