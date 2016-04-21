(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.avent = factory();
  }
}(this, function () { // eslint-disable-line max-statements
  var EventDispatcherUtils = {
    _anonymousId: 0
  };

  EventDispatcherUtils.generateLoggerName = function () {
    return 'Anonymous Avent ' + (++this._anonymousId);
  };

  EventDispatcherUtils.isCallbackEqualToFn = function (cb, fn) {
    var cbFn = cb.fn.originalFn || cb.fn;
    var newFn = fn && fn.originalFn? fn.originalFn: fn;

    return cbFn === newFn;
  };

  EventDispatcherUtils.isCallbackInContext = function (cb, ctx) {
    return cb.ctx === ctx;
  };


  var EventDispatcher = function () {
    this._queue = [];
    this._callbacks = {};
    this._loggers = {};
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
      this.log('replace callback for', name, [fn, ctx]);

      this._callbacks[name][found.index] = newCb;
    }
    else if (!found) {
      this.log('add callback for', name, [fn, ctx]);

      var callbacks = this._callbacks[name] = this._callbacks[name] || [];

      callbacks.push(newCb);
    }
    else {
      this.log('ignore callback for', name, [fn, ctx]);
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
      this.log('remove all callbacks');
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
    this.log('remove callbacks for', name, [fn, ctx]);

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
    this.log('schedule dispatching for', name, args);

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

    for (var it = 0; it < queue.length; ++it) {
      var dispatchingEvent = queue[it];
      this.log('dispatching', dispatchingEvent.name, dispatchingEvent.args);
      var callbacks = this.cloneCallbacks(dispatchingEvent.name);

      for (var cbIt = 0; cbIt < callbacks.length; ++cbIt) {
        var cb = callbacks[cbIt];
        cb.fn.apply(cb.ctx, dispatchingEvent.args);
      }

      this.log('dispatched', dispatchingEvent.name, dispatchingEvent.args);
    }
  };

  EventDispatcher.prototype.setLogger = function (logger) {
    logger = logger || {};
    logger.name = logger.name || EventDispatcherUtils.generateLoggerName();
    logger.filters = logger.filters || ['*'];
    logger.log = logger.log || console.log.bind(console);

    for (var it = 0; it < logger.filters.length; ++it) {
      this._loggers[logger.filters[it]] = logger;
    }
  };

  EventDispatcher.prototype.clearLogger = function (filters) {
    if (filters) {
      for (var it = 0; it < filters.length; ++it) {
        var eventName = filters[it];
        this.log('clear logger for', eventName);
        delete this._loggers[eventName];
      }
    }
    else {
      this.log('clear all loggers');
      this._loggers = {};
    }
  };

  EventDispatcher.prototype.log = function (description, eventName, extraArgs) {
    var filters = eventName? ['*', eventName]: Object.keys(this._loggers);
    eventName = eventName || [];
    extraArgs = extraArgs || [];

    for (var it = 0; it < filters.length; ++it) {
      var logger = this._loggers[filters[it]];

      if (logger) {
        var args = ['[' + logger.name + '] ' + description + ':'].concat(eventName, extraArgs);
        logger.log.apply(null, args);
      }
    }
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

  eep.setLogger = function (logger) {
    eep._eventDispatcher.call(this).setLogger(logger);
  };

  eep.clearLogger = function (logger) {
    eep._eventDispatcher.call(this).clearLogger(logger);
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


  var Avent = {};

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

  return Avent;
}));
