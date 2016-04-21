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
});
