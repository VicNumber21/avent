var Eventified = require('./util/eventified').EventifiedClass;
var Context = require('./util/context');

describe('Once', function () {
  this.timeout(1000);
  var ctx;

  beforeEach(function () {
    ctx = new Context(function () {
      return new Eventified();
    });
  });

  it('catches single event', function (done) {
    ctx.e.once('single', ctx.createCallback('single'));
    ctx.e.trigger('single'); /* ===> */ ctx.append({name: 'single', args: []});
    ctx.completeTest(done);
  });

  it('does not catch events after the first one', function (done) {
    ctx.e.once('fire', ctx.createCallback('fire'));
    ctx.e.trigger('fire', 8); /* ===> */ ctx.append({name: 'fire', args: [8]});
    ctx.e.trigger('fire', 500);
    ctx.e.trigger('fire');
    ctx.e.trigger('fire', 1, 2, 3, 4, 5, 6);
    ctx.completeTest(done);
  });

  it('does not affect other handlers', function (done) {
    ctx.e.on('event', ctx.createCallback('on'));
    ctx.e.once('event', ctx.createCallback('once'));

    ctx.e.trigger('event', 17); /* ===> */ ctx.append({name: 'on', args: [17]});
                                /* ===> */ ctx.append({name: 'once', args: [17]});
    ctx.e.trigger('event', 500); /* ===> */ ctx.append({name: 'on', args: [500]});
    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'on', args: []});
    ctx.e.trigger('event', 1, 2, 3, 4, 5, 6); /* ===> */ ctx.append({name: 'on', args: [1, 2, 3, 4, 5, 6]});

    ctx.completeTest(done);
  });

  it('cannot replace the same handler set by "on" without context', function (done) {
    var cb = ctx.createCallback('boo');

    ctx.e.on('event', cb);
    ctx.e.once('event', cb);

    ctx.e.trigger('event', 17); /* ===> */ ctx.append({name: 'boo', args: [17]});
    ctx.e.trigger('event', 500); /* ===> */ ctx.append({name: 'boo', args: [500]});
    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'boo', args: []});
    ctx.e.trigger('event', 1, 2, 3, 4, 5, 6); /* ===> */ ctx.append({name: 'boo', args: [1, 2, 3, 4, 5, 6]});

    ctx.completeTest(done);
  });

  it('is replaced by the same handler set by "on" without context', function (done) {
    var cb = ctx.createCallback('boo');

    ctx.e.once('event', cb);
    ctx.e.on('event', cb);

    ctx.e.trigger('event', 17); /* ===> */ ctx.append({name: 'boo', args: [17]});
    ctx.e.trigger('event', 500); /* ===> */ ctx.append({name: 'boo', args: [500]});
    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'boo', args: []});
    ctx.e.trigger('event', 1, 2, 3, 4, 5, 6); /* ===> */ ctx.append({name: 'boo', args: [1, 2, 3, 4, 5, 6]});

    ctx.completeTest(done);
  });

  it('cannot replace the same handler set by "on" in the same context', function (done) {
    var cb = ctx.createCallback('boo');
    var context = 'my context';

    ctx.e.on('event', cb, context);
    ctx.e.once('event', cb, context);

    ctx.e.trigger('event', 42); /* ===> */ ctx.append({name: 'boo', args: [42]});
    ctx.e.trigger('event', 500); /* ===> */ ctx.append({name: 'boo', args: [500]});
    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'boo', args: []});

    ctx.completeTest(done);
  });

  it('is replaced by the same handler set by "on" in the same context', function (done) {
    var cb = ctx.createCallback('boo');
    var context = 'my context';

    ctx.e.once('event', cb, context);
    ctx.e.on('event', cb, context);

    ctx.e.trigger('event', 42); /* ===> */ ctx.append({name: 'boo', args: [42]});
    ctx.e.trigger('event', 500); /* ===> */ ctx.append({name: 'boo', args: [500]});
    ctx.e.trigger('event'); /* ===> */ ctx.append({name: 'boo', args: []});

    ctx.completeTest(done);
  });

  it('can be added just once without context', function (done) {
    var cb = ctx.createCallback('event');
    ctx.e.once('event', cb); /* ===> */ ctx.append({name: 'event', args: []});
    ctx.e.once('event', cb);
    ctx.e.once('event', cb);

    ctx.e.trigger('event');

    ctx.completeTest(done);
  });

  it('can be added just once in the same context', function (done) {
    var cb = ctx.createCallback('boom');
    ctx.e.once('boom', cb, ctx); /* ===> */ ctx.append({name: 'boom', args: []});
    ctx.e.once('boom', cb, ctx);
    ctx.e.once('boom', cb, ctx);

    ctx.e.trigger('boom');

    ctx.completeTest(done);
  });

  it('can be added multiple times in different contexts', function (done) {
    var cb = ctx.createCallback('boom');
    var ctx1 = {}, ctx2 = {}, ctx3 = 'marker';
    ctx.e.once('boom', cb, ctx1); /* ===> */ ctx.append({name: 'boom', args: []});
    ctx.e.once('boom', cb, ctx2); /* ===> */ ctx.append({name: 'boom', args: []});
    ctx.e.once('boom', cb, ctx3); /* ===> */ ctx.append({name: 'boom', args: []});

    ctx.e.trigger('boom');

    ctx.completeTest(done);
  });
});
