# avent

[![Build Status](https://semaphoreci.com/api/v1/vic/avent/branches/master/badge.svg)](https://semaphoreci.com/vic/avent) [![Code Climate](https://codeclimate.com/github/VicNumber21/avent/badges/gpa.svg)](https://codeclimate.com/github/VicNumber21/avent) [![Test Coverage](https://codeclimate.com/github/VicNumber21/avent/badges/coverage.svg)](https://codeclimate.com/github/VicNumber21/avent/coverage)

**A**synchronous e**vent**s' library with a guarantee of the preservation of the events' order

## Install

```bash
$ npm install --save avent
```

## Example

````js
var eventified = {
  doThing: function () {
    this._eventEmitter.trigger('thing:done');
  };
};

Avent.eventify(eventified);

// OR

var Eventified = function () {
  this._initEventEmitter();
};

Eventified.prototype.doThing = function () {
  this._eventEmitter.trigger('thing:done');
};

var eventified = new Eventified();

// ...

eventified.on('thing:done', function () {
  console.log('The thing was done!');
});

eventified.doThing();
console.log('Waiting for the thing is done...');

// in console:
// > Waiting for the thing is done...
// > The thing is done!
````

## Key features

1. Asynchronous event triggering. Callback is called after the event loop turn in which it was triggered.
1. Order of events is preserved. First triggered event will be handled first.
1. Events can be added to object or to class
1. By default, an event emitter is a hidden object inside an eventified object. Eventified object provides abilities for external 
user to subscribe on events but not to trigger them.
1. It is possible to eventify objects by external event emitter.
1. There is an event logger which may be customized.
1. It is possible to customize the event system (to rename methods) with minimal reworks on your side.

## Why yet another events' library was created

When I started to work on a project, I had the following requirements for event library:

1. Events must be triggered asynchronously
1. Order of events must be kept unchanged (first triggered, first handled)
1. Zero dependencies

The first was (and is) absolutely mandatory thing for me since I thought (and still think) that mixing synchronous and
asynchronous code is unsafe.
Btw, for the same reason we have asynchronous promises in ECMA standard.

And (surprise!) I was not able to find such library, so in the project I took [Backbone Events](http://backbonejs.org/#Events)
and modified them a bit to introduce asynchronous handling:

```js
Events._originalTrigger = Events.trigger;

Events.trigger = function () {
  var args = arguments;
  var that = this;
  
  setTimeout(function () {
    Events._originalTrigger.apply(that, args);
  }, 0);
};
```

For the project it was a "zero dependency" because Backbone was in dependencies already so I did not introduce
anything new.

It served my needs for a while but at some point I was reported about a defect which was caused by changing order of
events during handling. Most of time ```setTimeout``` worked fine for me, but in some conditions the first triggered
event was handled after the second triggered one and the order change moved application to wrong state.

There was no clue about why it happened... but I had to fix the defect, so I wrote own event library which guarantees
preservation of events' order.

And it was the right decision since we started the new project quite soon and the new project did not need Backbone
but required event system.

This is revisited version of that library with extra features written in hope that I'm not only person who likes
asynchronous events.

## Usage

### Avent.eventify

TODO

### Avent.EventEmitter

TODO

### Avent.EventLogger

TODO

### Custom Logger

TODO

### Renaming methods

TODO

## License

MIT - see [LICENSE](https://raw.githubusercontent.com/VicNumber21/avent/master/LICENSE)
