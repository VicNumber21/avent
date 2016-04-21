var createEventifiedObject = require('./util/eventified').createEventifiedObject;
var Context = require('./util/context');


describe('Off', function () {
  this.timeout(1000);
  var ctx;

  beforeEach(function () {
    ctx = new Context(createEventifiedObject);
  });

  it('removes event after it is triggered', function (done) {
    ctx.e.on('do', ctx.createCallback('do'));
    ctx.e.trigger('do');
    ctx.e.trigger('do', 1);
    ctx.e.off('do');

    ctx.completeTest(done);
  });

  it('removes single event by name', function (done) {
    ctx.e.on('do', ctx.createCallback('do'));
    ctx.e.trigger('do'); /* ===> */ ctx.append({name: 'do', args: []});
    ctx.e.trigger('do', 1); /* ===> */ ctx.append({name: 'do', args: [1]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off('do');
      ctx.e.trigger('do', 2);
      ctx.e.trigger('do', 3);
    };

    ctx.completeTest(done);
  });

  it('TBD');
});
