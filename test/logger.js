var Eventified = require('./util/eventified').EventifiedClass;
var Context = require('./util/logger.context');
var expect = require('chai').expect;


describe('Logger', function () {
  this.timeout(1000);
  var ctx;

  beforeEach(function () {
    ctx = new Context(function () {
      return new Eventified();
    });
  });

  it('logs all events with arguments if on', function (done) {
    ctx.logger().on();
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', []]});
    ctx.e.trigger('second', 2); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'second', '=>', [2]]});
    ctx.completeTest(done);
  });

  it('logs requested event with arguments if on (string filter)', function (done) {
    ctx.logger().on('second');
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first');
    ctx.e.trigger('second', 2); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'second', '=>', [2]]});
    ctx.completeTest(done);
  });

  it('logs requested event with arguments if on (fn filter)', function (done) {
    ctx.logger().on(function (name, args) {
      return (name === 'second') && (args.length === 1);
    });
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first');
    ctx.e.trigger('second', 'one', 2, false);
    ctx.e.trigger('second', 2); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'second', '=>', [2]]});
    ctx.e.trigger('second');
    ctx.completeTest(done);
  });

  it('may be set on then off', function (done) {
    ctx.logger().on();
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', []]});
    ctx.logger().off();
    ctx.e.trigger('second', 2);
    ctx.completeTest(done);
  });
  
  it('disables just a requested filter (string)', function (done) {
    ctx.logger().on(['first', 'second']);
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', []]});
    ctx.e.trigger('second', 2); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'second', '=>', [2]]});
    ctx.logger().off('second');
    ctx.e.trigger('first', 'test'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', ['test']]});
    ctx.e.trigger('second');
    ctx.completeTest(done);
  });
  
  it('disables just a requested filter (fn)', function (done) {
    var firstFilter = function (name) {
      return name === 'first';
    };
    
    var secondFilter = function (name) {
      return name === 'second';
    };
    ctx.logger().on(firstFilter);
    ctx.logger().on(secondFilter);
    var cb = function () {};
    ctx.e.on('first', cb);
    ctx.e.on('second', cb);
    ctx.e.trigger('first'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', []]});
    ctx.e.trigger('second', 2); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'second', '=>', [2]]});
    ctx.logger().off(secondFilter);
    ctx.e.trigger('first', 'test'); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'first', '=>', ['test']]});
    ctx.e.trigger('second');
    ctx.completeTest(done);
  });
  
  it('throws error if filter is not string or function', function () {
    var testFn = function () {
      ctx.logger().on(123)
    };
    
    expect(testFn).to.throw(Error);
  });

  it('logs all events with arguments and debug info if debug is on', function (done) {
    ctx.logger().debugOn();
    var cb = function () {};
    var eventCtx = {};
    ctx.e.once('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'add callback for event','debugOn', cb, eventCtx]});
    ctx.e.on('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'replace callback for event','debugOn', cb, eventCtx]});
    ctx.e.on('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'ignore callback for event','debugOn', cb, eventCtx]});
    ctx.e.off(); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'remove all callbacks']});
    ctx.e.on('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'add callback for event','debugOn', cb, eventCtx]});
    ctx.e.trigger('debugOn', true); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'debugOn', '=>', [true]]});
      ctx.append({name: 'log', args: ['Avent:', 'need to dispatch', 1, 'event(s)']});
      ctx.append({name: 'log', args: ['Avent:', 'dispatching event','debugOn', '=>', [true]]});
      ctx.append({name: 'log', args: ['Avent:', 1, 'callback(s) found for event','debugOn']});
      ctx.append({name: 'log', args: ['Avent:', 'dispatched event','debugOn', '=>', [true]]});
    ctx.completeTest(done);
  });

  it('logs all events with arguments and debug info until debug is off', function (done) {
    ctx.logger().debugOn();
    var cb = function () {};
    var eventCtx = {};
    ctx.e.on('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'add callback for event','debugOn', cb, eventCtx]});
    ctx.e.trigger('debugOn', true); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'debugOn', '=>', [true]]});
    ctx.e.off('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'remove callbacks for event','debugOn', cb, eventCtx]});
    ctx.logger().debugOff();
    ctx.e.on('debugOff', cb, eventCtx);
    ctx.e.trigger('debugOff', false);
    ctx.completeTest(done);
  });

  it('does not break logging when debug gets on then gets off', function (done) {
    ctx.logger().on();
    ctx.logger().debugOn();
    var cb = function () {};
    var eventCtx = {};
    ctx.e.on('debugOn', cb, eventCtx); /* ===> */
      ctx.append({name: 'log', args: ['Avent:', 'add callback for event','debugOn', cb, eventCtx]});
    ctx.e.trigger('debugOn', true); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'debugOn', '=>', [true]]});
    ctx.logger().debugOff();
    ctx.e.on('debugOff', cb, eventCtx);
    ctx.e.trigger('debugOff', false); /* ===> */ ctx.append({name: 'log', args: ['Avent:', 'debugOff', '=>', [false]]});
    ctx.completeTest(done);
  });
});
