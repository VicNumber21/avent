/* eslint-disable callback-return */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.avent = factory();
  }
}(this, function () { // eslint-disable-line max-statements
  var Avent = {};

  var EventDispatcherUtils = {};

  EventDispatcherUtils.originalFn = function (fn) {
    return fn && fn.originalFn? fn.originalFn: fn;
  };

  EventDispatcherUtils.isCallbackEqualToFn = function (cb, fn) {
    return EventDispatcherUtils.originalFn(cb.fn) === EventDispatcherUtils.originalFn(fn);
  };

  EventDispatcherUtils.isCallbackInContext = function (cb, ctx) {
    return cb.ctx === ctx;
  };


  var EventDispatcher = function () {
    this._queue = [];
    this._callbacks = {};
    this._logger = new Avent.EventLogger();
  };
  
  EventDispatcher.prototype.logger = function () {
    return this._logger;
  };

  EventDispatcher.prototype.findCallback = function (name, fn, ctx) {
    var ret = false;
    var callbacks = this._callbacks[name] || [];

    for (var it = 0; !ret && it < callbacks.length; ++it) {
      var cb = callbacks[it];

      if (EventDispatcherUtils.isCallbackEqualToFn(cb, fn) && EventDispatcherUtils.isCallbackInContext(cb, ctx)) {
        ret = {
          cb: cb,
          index: it
        }
      }
    }

    return ret;
  };

  EventDispatcher.prototype.addCallback = function (name, fn, ctx) {
    var newCb = {fn: fn, ctx: ctx};
    var found = this.findCallback(name, fn, ctx);

    if (found && found.cb.fn.originalFn && !fn.originalFn) {
      this.logger().logDebug(['replace callback for event', name, EventDispatcherUtils.originalFn(fn), ctx]);

      this._callbacks[name][found.index] = newCb;
    }
    else if (!found) {
      this.logger().logDebug(['add callback for event', name, EventDispatcherUtils.originalFn(fn), ctx]);

      var callbacks = this._callbacks[name] = this._callbacks[name] || [];

      callbacks.push(newCb);
    }
    else {
      this.logger().logDebug(['ignore callback for event', name, EventDispatcherUtils.originalFn(fn), ctx]);
    }
  };

  EventDispatcher.prototype.removeAllCallbacks = function (fn, ctx) {
    if (fn || ctx) {
      var names = Object.keys(this._callbacks);

      for (var it = 0; it < names.length; ++it) {
        this.removeCallbacks(names[it], fn, ctx);
      }
    }
    else {
      this.logger().logDebug(['remove all callbacks']);
      this._callbacks = {};
    }
  };

  EventDispatcher.prototype.filterOutDeadCallbacks = function (name, fn, ctx) {
    var keptCallbacks = [];
    var currentCallbacks = this._callbacks[name] || [];

    for (var it = 0; it < currentCallbacks.length; ++it) {
      var cb = currentCallbacks[it];
      var sameFn = EventDispatcherUtils.isCallbackEqualToFn(cb, fn);
      var sameCtx = EventDispatcherUtils.isCallbackInContext(cb, ctx);
      var isDeadCb = (fn && sameFn && ctx && sameCtx) || (fn && sameFn && !ctx) || (!fn && ctx && sameCtx);

      if (!isDeadCb) {
        keptCallbacks.push(cb);
      }
    }

    return keptCallbacks;
  };

  EventDispatcher.prototype.removeCallbacks = function (name, fn, ctx) {
    this.logger().logDebug(['remove callbacks for event', name, EventDispatcherUtils.originalFn(fn), ctx]);

    var keptCallbacks = [];

    if (fn || ctx) {
      keptCallbacks = this.filterOutDeadCallbacks(name, fn, ctx);
    }

    if (keptCallbacks.length === 0) {
      delete this._callbacks[name];
    }
    else {
      this._callbacks[name] = keptCallbacks;
    }
  };

  EventDispatcher.prototype.cloneCallbacks = function (name) {
    var callbacks = this._callbacks[name] || [];

    return callbacks.slice(0);
  };

  EventDispatcher.prototype.scheduleDispatching = function (name, args) {
    this.logger().logEvent(name, args);

    if (this._callbacks[name]) {
      this._queue.push({
        name: name,
        args: args
      });

      if (!this._timer) {
        this._timer = setTimeout(this.dispatchEvents.bind(this), 0);
      }
    }
  };

  EventDispatcher.prototype.dispatchEvents = function () {
    delete this._timer;

    var queue = this._queue;
    this._queue = [];

    this.logger().logDebug(['need to dispatch', queue.length, 'event(s)']);

    for (var it = 0; it < queue.length; ++it) {
      var dispatchingEvent = queue[it];
      this.logger().logDebug(['dispatching event', dispatchingEvent.name, '=>', dispatchingEvent.args]);

      var callbacks = this.cloneCallbacks(dispatchingEvent.name);
      this.logger().logDebug([callbacks.length, 'callback(s) found for event', dispatchingEvent.name]);

      for (var cbIt = 0; cbIt < callbacks.length; ++cbIt) {
        var cb = callbacks[cbIt];
        cb.fn.apply(cb.ctx, dispatchingEvent.args);
      }

      this.logger().logDebug(['dispatched event', dispatchingEvent.name, '=>', dispatchingEvent.args]);
    }
  };


  var EventLogger = function () {
    this._fnFilters = [];
    this._eventFilters = {};
  };
  
  EventLogger.Type = {
    Event: 0,
    Debug: 1
  };
  
  EventLogger.constTrue = function () {
    return true;
  };
  
  EventLogger.constTrueDebug = function () {
    return true;
  };

  EventLogger.prototype.forEachFilter = function (eventsOrFns, cb) {
    if (!(eventsOrFns instanceof Array)) {
      eventsOrFns = [eventsOrFns];
    }

    for (var it = 0; it < eventsOrFns.length; ++it) {
      var filter = eventsOrFns[it];
      var filterType = typeof filter;

      if (filterType !== 'string' && filterType !== 'function') {
        throw new Error('Avent: logger filter must be either string or function');
      }

      cb(filter, filterType)
    }
  };

  EventLogger.prototype.on = function (eventsOrFns) {
    eventsOrFns = eventsOrFns || [EventLogger.constTrue];
    
    this.forEachFilter(eventsOrFns, (function (filter, filterType) {
      if (filterType === 'string') {
        this._eventFilters[filter] = true;
      }
      else {
        var index = this._fnFilters.indexOf(filter);

        if (index < 0) {
          this._fnFilters.push(filter);
        }
      }
    }).bind(this));
  };

  EventLogger.prototype.off = function (eventsOrFns) {
    if (eventsOrFns) {
      this.forEachFilter(eventsOrFns, (function (filter, filterType) {
        if (filterType === 'string') {
          delete this._eventFilters[filter];
        }
        else {
          var index = this._fnFilters.indexOf(filter);

          if (index >= 0) {
            this._fnFilters.splice(index, 1);
          }
        }
      }).bind(this));
    }
    else {
      this._fnFilters = [];
      this._eventFilters = {};
    }
  };

  EventLogger.prototype.debugOn = function () {
    if (!this.isDebugOn()) {
      this._fnFilters.unshift(EventLogger.constTrueDebug);
    }
  };

  EventLogger.prototype.debugOff = function () {
    this.off(EventLogger.constTrueDebug);
  };
  
  EventLogger.prototype.isDebugOn = function () {
    return this._fnFilters[0] === EventLogger.constTrueDebug;
  };

  EventLogger.prototype.logEvent = function (name, args) {
    var isEventLogOn = this._eventFilters[name];
    
    for (var it =0; !isEventLogOn && it < this._fnFilters.length; ++ it) {
      isEventLogOn = this._fnFilters[it](name, args);
    }
    
    if (isEventLogOn) {
      this.log(EventLogger.Type.Event, [name, '=>', args]);
    }
  };

  EventLogger.prototype.logDebug = function (loggerArgs) {
    if (this.isDebugOn()) {
      this.log(EventLogger.Type.Debug, loggerArgs);
    }
  };

  EventLogger.prototype.log = function (type, loggerArgs) {
    var formattedArgs = this.formatLog(type, loggerArgs);
    this.printLog.apply(this, formattedArgs);
  };

  EventLogger.prototype.printLog = console.log.bind(console);

  EventLogger.prototype.formatLog = function (type, loggerArgs) {
    return (['Avent:']).concat(loggerArgs);
  };


  var EventEmitter = function () {};
  var eep = EventEmitter.prototype;

  eep.on = function (name, fn, ctx) {
    eep._eventDispatcher.call(this).addCallback(name, fn, ctx);

    return this;
  };

  eep.once = function (name, fn, ctx) {
    var off = eep.off.bind(this);
    var wrappedFn = function () {
      off(name, fn, ctx);
      fn.apply(ctx, arguments);
    };

    wrappedFn.originalFn = fn;

    return eep.on.call(this, name, wrappedFn, ctx);
  };

  eep.off = function (name, fn, ctx) {
    var dispatcher = eep._eventDispatcher.call(this);

    if (name) {
      dispatcher.removeCallbacks(name, fn, ctx);
    }
    else {
      dispatcher.removeAllCallbacks(fn, ctx);
    }
  };

  eep.trigger = function (name) {
    var args = [];

    for (var it = 1; it < arguments.length; ++it) {
      args.push(arguments[it]);
    }

    eep._eventDispatcher.call(this).scheduleDispatching(name, args);
  };

  eep.logger = function () {
    return eep._eventDispatcher.call(this).logger();
  };

  eep.eventify = function (obj) {
    obj.on = eep.on.bind(this);
    obj.once = eep.once.bind(this);
    obj.off = eep.off.bind(this);
  };

  eep._eventDispatcher = function () {
    if (!this._dispatcher) {
      this._dispatcher = new EventDispatcher();
    }

    return this._dispatcher;
  };


  var initEventEmitter = function () {
    this._eventEmitter = new EventEmitter();
    this._eventEmitter.eventify(this);
  };


  Avent.EventEmitter = EventEmitter;

  Avent.eventify = function (obj, emitter) {
    if (typeof obj === 'function') {
      obj = obj.prototype;
      obj._initEventEmitter = initEventEmitter;
    }
    else {
      if (!emitter) {
        emitter = obj._eventEmitter = new EventEmitter();
      }

      emitter.eventify(obj);
    }
  };
  
  Avent.EventLogger = EventLogger;
  
  Avent.setCustomLogger = function (logger) {
    Avent.EventLogger = logger;
  };

  return Avent;
}));
