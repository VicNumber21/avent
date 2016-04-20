var EventLogger =  function ()
{
  this._eventLog = [];
};

EventLogger.prototype._logger = function (name) {
  this._eventLog.push({
    name: name,
    args: Array.prototype.slice.call(arguments, 1)
  });
};

EventLogger.prototype.createCallback = function (name) {
  return this._logger.bind(this, name);
};

EventLogger.prototype.eventLog = function () {
  return this._eventLog;
};

module.exports = EventLogger;
