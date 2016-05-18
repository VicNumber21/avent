var Avent = require('../../avent');
var EventContext = require('./event.context');

var StandardLogger = Avent.EventLogger;

var CustomLogger = function () {
  console.log('Use CustomLogger');
  StandardLogger.call(this);
  this._ignoreNeedToDispatchMessage = false;
  this._reduceNeedToDispatchMessage = false;
};

var CustomLoggerParent = function () {};
CustomLoggerParent.prototype = StandardLogger.prototype;
CustomLogger.prototype = new CustomLoggerParent();

CustomLogger.prototype.isInternalEvent = function (name, args) {
  return (args[1] === name) || (args[2] === name) || (args[3] === name);
};

CustomLogger.prototype.filterInternalEvents = function (args) {
  var ret = args;

  if (this.isInternalEvent('beforeToCompleteTest', args)) {
    ret = undefined;

    if (args[2] === '=>') {
      this._reduceNeedToDispatchMessage = true;
    }
  } else if (this.isInternalEvent('done', args)) {
    ret = undefined;

    if (args[2] === '=>') {
      this._ignoreNeedToDispatchMessage = true;
    }
  }else if (args[1] === 'need to dispatch') {
    if (this._reduceNeedToDispatchMessage) {
      --ret[2];
      this._reduceNeedToDispatchMessage = false;
    }
    else if (this._ignoreNeedToDispatchMessage) {
      ret = undefined;
      this._ignoreNeedToDispatchMessage = false;
    }
  }

  return ret;
};

CustomLogger.prototype.printLog = function () {
  var args = this.filterInternalEvents(arguments);

  if (args) {
    this._trackLog.apply(this, args);
    console.log.apply(console, args);
  }
};

var LoggerContext = function (createEventified) {
  Avent.setCustomLogger(CustomLogger);
  EventContext.call(this, createEventified);
  this.logger()._trackLog = this.createCallback('log');
  Avent.setCustomLogger(StandardLogger);
};

var LoggerContextParent = function () {};
LoggerContextParent.prototype = EventContext.prototype;
LoggerContext.prototype = new LoggerContextParent();

LoggerContext.prototype.logger = function () {
  return this.e._eventEmitter.logger();
};


module.exports = LoggerContext;
