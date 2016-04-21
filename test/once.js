var Eventified = require('./util/eventified');
var EventLogger = require('./util/event.logger');

describe('Once', function () {
  this.timeout(1000);
  var ctx = {};

  beforeEach(function () {
    ctx = {
      e: new Eventified(),
      logger: new EventLogger()
    }
  });

  it('catches single event', function (done) {
    ctx.e.once('single', ctx.logger.createCallback('single'));
    ctx.e.trigger('single'); /* ===> */ var expect = {name: 'single', args: []};
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });

  it('does not catch events after the first one', function (done) {
    ctx.e.once('fire', ctx.logger.createCallback('fire'));
    ctx.e.trigger('fire', 8); /* ===> */ var expect = {name: 'fire', args: [8]};
    ctx.e.trigger('fire', 500);
    ctx.e.trigger('fire');
    ctx.e.trigger('fire', 1, 2, 3, 4, 5, 6);
    ctx.e.completeTest(done, ctx.logger,[expect]);
  });
});
