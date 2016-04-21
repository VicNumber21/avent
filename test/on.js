var Eventified = require('./util/eventified').EventifiedClass;
var Context = require('./util/context');


describe('On', function () {
  this.timeout(1000);
  var ctx;

  beforeEach(function () {
    ctx = new Context(function () {
      return new Eventified();
    });
  });

  it('catches single event without args', function (done) {
    ctx.e.on('first', ctx.createCallback('first'));
    ctx.e.trigger('first'); /* ===> */ ctx.append({name: 'first', args: []});
    ctx.completeTest(done);
  });

  it('catches single event with 1 argument', function (done) {
    ctx.e.on('string', ctx.createCallback('string'));
    ctx.e.trigger('string', 'my test string'); /* ===> */ ctx.append({name: 'string', args: ['my test string']});
    ctx.completeTest(done);
  });

  it('catches single event with 2 arguments', function (done) {
    ctx.e.on('int, double', ctx.createCallback('int, double'));
    ctx.e.trigger('int, double', 35, 6.789); /* ===> */ ctx.append({name: 'int, double', args: [35, 6.789]});
    ctx.completeTest(done);
  });

  it('catches single event with 3 arguments', function (done) {
    ctx.e.on('knock-knock', ctx.createCallback('knock-knock'));
    ctx.e.trigger('knock-knock', {abs: 34}, [1, 4, 10], NaN); /* ===> */
                                  ctx.append({name: 'knock-knock', args: [{abs: 34}, [1, 4, 10], NaN]});
    ctx.completeTest(done);
  });

  it('triggers event asynchronous', function (done) {
    ctx.e.on('async', ctx.createCallback('async'));
    ctx.e.trigger('async'); /* ===> */ ctx.append({name: 'async', args: []});
    ctx.createCallback('sync')('fake'); /* ===> */ ctx.prepend({name: 'sync', args: ['fake']});
    ctx.completeTest(done);
  });

  it('keeps order of events', function (done) {
    ctx.e.on('2', ctx.createCallback('2'));
    ctx.e.on('1', ctx.createCallback('1'));
    ctx.e.on('3', ctx.createCallback('3'));

    ctx.e.trigger('1'); /* ===> */ ctx.append({name: '1', args: []});
    ctx.e.trigger('2', 2); /* ===> */ ctx.append({name: '2', args: [2]});
    ctx.e.trigger('3', 'ok!'); /* ===> */ ctx.append({name: '3', args: ['ok!']});

    ctx.completeTest(done);
  });

  it('is handled in order as added', function (done) {
    ctx.e.on('hi', ctx.createCallback('1')); /* ===> */ ctx.append({name: '1', args: []});
    ctx.e.on('hi', ctx.createCallback('2')); /* ===> */ ctx.append({name: '2', args: []});
    ctx.e.on('hi', ctx.createCallback('3')); /* ===> */ ctx.append({name: '3', args: []});

    ctx.e.trigger('hi');

    ctx.completeTest(done);
  });

  it('is handled as many times as triggered', function (done) {
    ctx.e.on('wow!', ctx.createCallback('wow!'));

    ctx.e.trigger('wow!', 'cool!'); /* ===> */ ctx.append({name: 'wow!', args: ['cool!']});
    ctx.e.trigger('wow!'); /* ===> */ ctx.append({name: 'wow!', args: []});
    ctx.e.trigger('wow!', 1, 2); /* ===> */ ctx.append({name: 'wow!', args: [1, 2]});

    ctx.completeTest(done);
  });

  it('can be added just once without context', function (done) {
    var cb = ctx.createCallback('event');
    ctx.e.on('event', cb);
    ctx.e.on('event', cb);
    ctx.e.on('event', cb);

    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'event', args: []});

    ctx.completeTest(done);
  });

  it('can be added just once in the same context', function (done) {
    var cb = ctx.createCallback('boom');
    ctx.e.on('boom', cb, ctx);
    ctx.e.on('boom', cb, ctx);
    ctx.e.on('boom', cb, ctx);

    ctx.e.trigger('boom'); /* ===> */ ctx.append({name: 'boom', args: []});

    ctx.completeTest(done);
  });

  it('can be added multiple times in different contexts', function (done) {
    var cb = ctx.createCallback('boom');
    var ctx1 = {}, ctx2 = {}, ctx3 = 'marker';
    ctx.e.on('boom', cb, ctx1); /* ===> */ ctx.append({name: 'boom', args: []});
    ctx.e.on('boom', cb, ctx2); /* ===> */ ctx.append({name: 'boom', args: []});
    ctx.e.on('boom', cb, ctx3); /* ===> */ ctx.append({name: 'boom', args: []});

    ctx.e.trigger('boom');

    ctx.completeTest(done);
  });
});
