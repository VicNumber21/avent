(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.avent = factory();
  }
}(this, function () {
  var EventEmitterUtils = {};

  EventEmitterUtils.createEventQueue = function () {
    return {
      queue: [],
      callbacks: {}
    }
  };

  EventEmitterUtils.callbackExists = function () {
    //TODO
    return false;
  };

  EventEmitterUtils.removeCallbacks = function (events, name, fn, ctx) {
    //TODO
  };

  EventEmitterUtils.cloneCallbacks = function (events, name) {
    var clone = [];
    var callbacks = events.callbacks[name] || [];

    for (var it = 0; it < callbacks.length; ++it) {
      clone.push(callbacks[it]);
    }

    return clone;
  };

  EventEmitterUtils.dispatchEvents = function () {
    var events = this._events || EventEmitterUtils.createEventQueue();
    delete events.timer;

    var queue = events.queue;
    events.queue = [];

    for (var it = 0; it < queue.length; ++it) {
      var dispatchingEvent = queue[it];
      var callbacks = EventEmitterUtils.cloneCallbacks(events, dispatchingEvent.name);

      for (var cbIt = 0; cbIt < callbacks.length; ++cbIt) {
        var cb = callbacks[cbIt];
        cb.fn.apply(cb.ctx, dispatchingEvent.args);
      }
    }
  };

  EventEmitterUtils.setDispatchingTimer = function () {
    var events = this._events;

    if (!events.timer) {
      events.timer = setTimeout(EventEmitterUtils.dispatchEvents.bind(this), 0);
    }
  };


  var Avent = {};

  Avent.on = function (name, fn, ctx) {
    var events = this._events = this._events || EventEmitterUtils.createEventQueue();
    var eventCallbacks = events.callbacks[name] = events.callbacks[name] || [];

    if (!EventEmitterUtils.callbackExists(eventCallbacks, fn, ctx)) {
      eventCallbacks.push({
        fn: fn,
        ctx: ctx
      });
    }

    return this;
  };

  Avent.once = function (name, fn, ctx) {
    var off = Avent.off.bind(this);
    var wrappedFn = function () {
      off(name, fn, ctx);
      fn.apply(ctx, arguments);
    };

    wrappedFn.originalFn = fn;

    return Avent.on.call(this, name, wrappedFn, ctx);
  };

  Avent.off = function (name, fn, ctx) {
    var events = this._events;

    if (events) {
      if (!name && !fn && !ctx) {
        delete this._events;
      }
      else if (name && events.callbacks[name]) {
        EventEmitterUtils.removeCallbacks(events, name, fn, ctx);
      }
      else if (!name) {
        var names = Object.keys(events.callbacks);

        for (var it = 0; it < names.length; ++it) {
          EventEmitterUtils.removeCallbacks(events, names[it], fn, ctx);
        }
      }
    }
  };

  Avent.trigger = function (name) {
    var events = this._events;

    if (events && events.callbacks[name]) {
      var args = [];

      for (var it = 0; it < arguments.length; ++it) {
        args.push(arguments[it]);
      }

      events.queue.push({
        name: name,
        args: args
      });

      EventEmitterUtils.setDispatchingTimer.call(this);
    }
  };

  Avent.eventify = function (obj, emitter) {
    if (typeof obj === 'function') {
      obj = obj.prototype;
    }

    if (emitter) {
      obj.on = Avent.on.bind(emitter);
      obj.on = Avent.once.bind(emitter);
      obj.on = Avent.off.bind(emitter);
    }
    else {
      obj.on = Avent.on;
      obj.once = Avent.once;
      obj.off = Avent.off;
      obj.trigger = Avent.trigger;
    }
  };


  var EventEmitter = function () {};
  EventEmitter.prototype.on = Avent.on;
  EventEmitter.prototype.once = Avent.once;
  EventEmitter.prototype.off = Avent.off;
  EventEmitter.prototype.trigger = Avent.trigger;
  EventEmitter.prototype.eventify = function (obj) {
    Avent.eventify(obj, this);
  };

  Avent.EventEmitter = EventEmitter;

  return Avent;
}));
