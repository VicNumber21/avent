(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.avent = factory();
  }
}(this, function () {
  var EventDispatcherUtils = {
    _anonymousId: 0
  };

  EventDispatcherUtils.generateLoggerName = function () {
    return 'Anonymous Avent ' + (++this._anonymousId);
  };

  EventDispatcherUtils.isCallbackEqualToFn = function (cb, fn) {
    return (cb.fn === fn) || (cb.fn.originalFn && cb.fn.originalFn === fn);
  };

  EventDispatcherUtils.isCallbackInContext = function (cb, ctx) {
    return cb.ctx === ctx;
  };


  var EventDispatcher = function () {
    this._queue = [];
    this._callbacks = {};
    this._loggers = {};
  };

  EventDispatcher.prototype.callbackExists = function (name, fn, ctx) {
    var ret = false;
    var callbacks = this._callbacks[name] || [];

    for (var it = 0; !ret && it < callbacks.length; ++it) {
      var cb = callbacks[it];
      ret = EventDispatcherUtils.isCallbackEqualToFn(cb, fn) && EventDispatcherUtils.isCallbackInContext(cb, ctx);
    }

    return ret;
  };

  EventDispatcher.prototype.addCallback = function (name, fn, ctx) {
    if (!this.callbackExists(name, fn, ctx)) {
      this.log('add callback for', name, [fn, ctx]);

      var callbacks = this._callbacks[name] = this._callbacks[name] || [];

      callbacks.push({
        fn: fn,
        ctx: ctx
      });
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

  EventDispatcher.prototype.removeCallbacks = function (name, fn, ctx) {
    this.log('remove callbacks for', name, [fn, ctx]);

    var keptCallbacks = [];
    var currentCallbacks = this._callbacks[name] || [];

    if (fn || ctx) {
      for (var it = 0; it < currentCallbacks.length; ++it) {
        var cb = currentCallbacks[it];
        var sameFn = EventDispatcherUtils.isCallbackEqualToFn(cb, fn);
        var sameCtx = EventDispatcherUtils.isCallbackInContext(cb, ctx);
        var isDeadCb = (fn && sameFn && ctx && sameCtx) || (fn && sameFn && !ctx) || (!fn && ctx && sameCtx);

        if (!isDeadCb) {
          keptCallbacks.push(cb);
        }
      }
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


  var EventEmitter = function () {
    this._eventDispatcher = new EventDispatcher();
  };

  EventEmitter.prototype.on = function (name, fn, ctx) {
    if (!this._eventDispatcher) {
      throw new Error('Uninitialized event dispatcher');
    }

    this._eventDispatcher.addCallback(name, fn, ctx);

    return this;
  };

  EventEmitter.prototype.once = function (name, fn, ctx) {
    var off = EventEmitter.prototype.off.bind(this);
    var wrappedFn = function () {
      off(name, fn, ctx);
      fn.apply(ctx, arguments);
    };

    wrappedFn.originalFn = fn;

    return EventEmitter.prototype.on.call(this, name, wrappedFn, ctx);
  };

  EventEmitter.prototype.off = function (name, fn, ctx) {
    if (this._eventDispatcher) {
      if (name) {
        this._eventDispatcher.removeCallbacks(name, fn, ctx);
      }
      else {
        this._eventDispatcher.removeAllCallbacks(fn, ctx);
      }
    }
  };

  EventEmitter.prototype.trigger = function (name) {
    if (this._eventDispatcher) {
      var args = [];

      for (var it = 1; it < arguments.length; ++it) {
        args.push(arguments[it]);
      }

      this._eventDispatcher.scheduleDispatching(name, args);
    }
  };

  EventEmitter.prototype.setLogger = function (logger) {
    if (this._eventDispatcher) {
      this._eventDispatcher.setLogger(logger);
    }
  };

  EventEmitter.prototype.clearLogger = function (logger) {
    if (this._eventDispatcher) {
      this._eventDispatcher.clearLogger(logger);
    }
  };

  EventEmitter.prototype.eventify = function (obj) {
    obj.on = EventEmitter.prototype.on.bind(this);
    obj.once = EventEmitter.prototype.once.bind(this);
    obj.off = EventEmitter.prototype.off.bind(this);
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
