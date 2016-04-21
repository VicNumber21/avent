var Avent = require('../../avent');


var createEventifiedObject = function () {
  var eventifiedObject = {};
  Avent.eventify(eventifiedObject);
  eventifiedObject.trigger = eventifiedObject._eventEmitter.trigger.bind(eventifiedObject._eventEmitter);

  return eventifiedObject;
};


var EventifiedClass = function () {
  this._initEventEmitter();
  this.trigger = this._eventEmitter.trigger.bind(this._eventEmitter);
};

Avent.eventify(EventifiedClass);


module.exports = {
  EventifiedClass: EventifiedClass,
  createEventifiedObject: createEventifiedObject
};
