var expect = require('chai').expect;
var Eventified = require('./util/eventified');
var EventLogger = require('./util/event.logger');


describe('On', function () {
  this.timeout(1000);
  var ctx = {};

  beforeEach(function () {
    ctx = {
      e: new Eventified(),
      logger: new EventLogger()
    }
  });

  it('catches single event without args', function (done) {
    ctx.e.on('first', ctx.logger.createCallback('first'));
    ctx.e.trigger('first'); /* ===> */ var expect = {name: 'first', args: []};
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });

  it('catches single event with 1 argument', function (done) {
    ctx.e.on('string', ctx.logger.createCallback('string'));
    ctx.e.trigger('string', 'my test string'); /* ===> */ var expect = {name: 'string', args: ['my test string']};
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });

  it('catches single event with 2 arguments', function (done) {
    ctx.e.on('int, double', ctx.logger.createCallback('int, double'));
    ctx.e.trigger('int, double', 35, 6.789); /* ===> */ var expect = {name: 'int, double', args: [35, 6.789]};
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });

  it('catches single event with 3 arguments', function (done) {
    ctx.e.on('knock-knock', ctx.logger.createCallback('knock-knock'));
    ctx.e.trigger('knock-knock', {abs: 34}, [1, 4, 10], NaN); /* ===> */
                                  var expect = {name: 'knock-knock', args: [{abs: 34}, [1, 4, 10], NaN]};
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });

  it('triggers event asynchronous', function (done) {
    ctx.e.on('async', ctx.logger.createCallback('async'));
    ctx.e.trigger('async'); /* ===> */ var expectAsync = {name: 'async', args: []};
    ctx.logger.createCallback('sync')('fake'); /* ===> */ var expectSync = {name: 'sync', args: ['fake']};
    ctx.e.completeTest(done, ctx.logger, [expectSync, expectAsync]);
  });

  it('keeps order of events', function (done) {
    ctx.e.on('2', ctx.logger.createCallback('2'));
    ctx.e.on('1', ctx.logger.createCallback('1'));
    ctx.e.on('3', ctx.logger.createCallback('3'));

    ctx.e.trigger('1'); /* ===> */ var expect1 = {name: '1', args: []};
    ctx.e.trigger('2', 2); /* ===> */ var expect2 = {name: '2', args: [2]};
    ctx.e.trigger('3', 'ok!'); /* ===> */ var expect3 = {name: '3', args: ['ok!']};

    ctx.e.completeTest(done, ctx.logger, [expect1, expect2, expect3]);
  });

  it('is handled in order as added', function (done) {
    ctx.e.on('hi', ctx.logger.createCallback('1')); /* ===> */ var expect1 = {name: '1', args: []};
    ctx.e.on('hi', ctx.logger.createCallback('2')); /* ===> */ var expect2 = {name: '2', args: []};
    ctx.e.on('hi', ctx.logger.createCallback('3')); /* ===> */ var expect3 = {name: '3', args: []};

    ctx.e.trigger('hi');

    ctx.e.completeTest(done, ctx.logger, [expect1, expect2, expect3]);
  });

  it('is handled as many times as triggered', function (done) {
    ctx.e.on('wow!', ctx.logger.createCallback('wow!'));

    ctx.e.trigger('wow!', 'cool!'); /* ===> */ var expect1 = {name: 'wow!', args: ['cool!']};
    ctx.e.trigger('wow!'); /* ===> */ var expect2 = {name: 'wow!', args: []};
    ctx.e.trigger('wow!', 1, 2); /* ===> */ var expect3 = {name: 'wow!', args: [1, 2]};

    ctx.e.completeTest(done, ctx.logger, [expect1, expect2, expect3]);
  });

  it('can be added just once without context', function (done) {
    var cb = ctx.logger.createCallback('event');
    ctx.e.on('event', cb);
    ctx.e.on('event', cb);
    ctx.e.on('event', cb);

    ctx.e.trigger('event'); /* ===> */ var expect = {name: 'event', args: []};

    ctx.e.completeTest(done, ctx.logger, [expect]);
  });

  it('can be added just once in the same context', function (done) {
    var cb = ctx.logger.createCallback('boom');
    ctx.e.on('boom', cb, ctx);
    ctx.e.on('boom', cb, ctx);
    ctx.e.on('boom', cb, ctx);

    ctx.e.trigger('boom'); /* ===> */ var expect = {name: 'boom', args: []};

    ctx.e.completeTest(done, ctx.logger, [expect]);
  });

  it('can be added multiple times in different contexts', function (done) {
    var cb = ctx.logger.createCallback('boom');
    var ctx1 = {}, ctx2 = {}, ctx3 = 'marker';
    ctx.e.on('boom', cb, ctx1);
    ctx.e.on('boom', cb, ctx2);
    ctx.e.on('boom', cb, ctx3);

    ctx.e.trigger('boom'); /* ===> */ var expect = {name: 'boom', args: []};

    ctx.e.completeTest(done, ctx.logger, [expect, expect, expect]);
  });

  it('throws error if not initialized properly', function () {
    delete ctx.e._eventEmitter._eventDispatcher;

    expect(ctx.e.on.bind(ctx.e)).to.throw(Error, /Avent: uninitialized event dispatcher/);
  });
});
