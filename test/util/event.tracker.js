var EventTracker =  function ()
{
  this._eventLog = [];
};

EventTracker.prototype._trackEvent = function (name) {
  this._eventLog.push({
    name: name,
    args: Array.prototype.slice.call(arguments, 1)
  });
};

EventTracker.prototype.createCallback = function (name) {
  return this._trackEvent.bind(this, name);
};

EventTracker.prototype.eventLog = function () {
  return this._eventLog;
};

module.exports = EventTracker;
