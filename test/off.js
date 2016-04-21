var createEventifiedObject = require('./util/eventified').createEventifiedObject;
var Context = require('./util/context');


describe('Off', function () {
  this.timeout(1000);
  var ctx;

  beforeEach(function () {
    ctx = new Context(createEventifiedObject);
  });

  it('works ok if no event', function () {
    ctx.e.off();
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

  it('removes all events by name', function (done) {
    ctx.e.on('test', ctx.createCallback('first')); /* ===> */ ctx.append({name: 'first', args: []});
    ctx.e.on('test', ctx.createCallback('second'), {}); /* ===> */ ctx.append({name: 'second', args: []});
    ctx.e.on('test', ctx.createCallback('third')); /* ===> */ ctx.append({name: 'third', args: []});
    ctx.e.trigger('test');

    ctx.beforeToCompleteTest = function () {
      ctx.e.off('test');
      ctx.e.trigger('test', 2);
    };

    ctx.completeTest(done);
  });

  it('removes single event by callback', function (done) {
    var cb = ctx.createCallback('fn');
    ctx.e.on('fn', cb);
    ctx.e.trigger('fn', 'help'); /* ===> */ ctx.append({name: 'fn', args: ['help']});
    ctx.e.trigger('fn'); /* ===> */ ctx.append({name: 'fn', args: []});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, cb);
      ctx.e.trigger('fn', 2);
      ctx.e.trigger('fn', 3);
    };

    ctx.completeTest(done);
  });

  it('removes all events by callback', function (done) {
    var cb = ctx.createCallback('fn');
    ctx.e.on('1', cb);
    ctx.e.on('1', cb, {});
    ctx.e.on('2', cb, {});
    ctx.e.on('3', cb, {});

    ctx.e.trigger('2', 1, 2); /* ===> */ ctx.append({name: 'fn', args: [1, 2]});
    ctx.e.trigger('3', 0); /* ===> */ ctx.append({name: 'fn', args: [0]});
    ctx.e.trigger('1'); /* ===> */ ctx.append({name: 'fn', args: []});
                        /* ===> */ ctx.append({name: 'fn', args: []});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, cb);
      ctx.e.trigger('1');
      ctx.e.trigger('2');
      ctx.e.trigger('3');
    };

    ctx.completeTest(done);
  });

  it('removes single event by context', function (done) {
    var context = {};
    ctx.e.on('for:object', ctx.createCallback('for:object'), context);

    ctx.e.trigger('for:object'); /* ===> */ ctx.append({name: 'for:object', args: []});
    ctx.e.trigger('for:object', []); /* ===> */ ctx.append({name: 'for:object', args: [[]]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, null, context);
      ctx.e.trigger('for:object');
    };

    ctx.completeTest(done);
  });

  it('removes all events by context', function (done) {
    var context = 'my events';
    ctx.e.on('my1', ctx.createCallback('my1'), context);
    ctx.e.on('my2', ctx.createCallback('my2'), context);
    ctx.e.on('my3', ctx.createCallback('my3'), context);

    ctx.e.trigger('my1', '3'); /* ===> */ ctx.append({name: 'my1', args: ['3']});
    ctx.e.trigger('my2', '2'); /* ===> */ ctx.append({name: 'my2', args: ['2']});
    ctx.e.trigger('my3', '1'); /* ===> */ ctx.append({name: 'my3', args: ['1']});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, null, context);
      ctx.e.trigger('my3');
      ctx.e.trigger('my2');
      ctx.e.trigger('my1');
    };

    ctx.completeTest(done);
  });

  it('removes all events by name and callback', function (done) {
    var context1 = 'to remove';
    var context2 = {};

    var cb1 = ctx.createCallback('to keep');
    var cb2 = ctx.createCallback('to remove');

    ctx.e.on('1', cb1, context1);
    ctx.e.on('2', cb1, context1);
    ctx.e.on('1', cb2, context1);
    ctx.e.on('2', cb2, context1);

    ctx.e.on('1', ctx.createCallback('one'));
    ctx.e.on('2', ctx.createCallback('two'));

    ctx.e.on('1', cb1, context2);
    ctx.e.on('2', cb1, context2);
    ctx.e.on('1', cb2, context2);
    ctx.e.on('2', cb2, context2);

    ctx.e.trigger('1', {}); /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
                            /* ===> */ ctx.append({name: 'one', args: [{}]});
                            /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
    ctx.e.trigger('2', 0); /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});
                           /* ===> */ ctx.append({name: 'two', args: [0]});
                           /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off('1', cb2);
      ctx.e.off('2', cb1);

      ctx.e.trigger('1'); /* ===> */ ctx.append({name: 'to keep', args: []});
                          /* ===> */ ctx.append({name: 'one', args: []});
                          /* ===> */ ctx.append({name: 'to keep', args: []});
      ctx.e.trigger('2', '!'); /* ===> */ ctx.append({name: 'to remove', args: ['!']});
                               /* ===> */ ctx.append({name: 'two', args: ['!']});
                               /* ===> */ ctx.append({name: 'to remove', args: ['!']});
    };

    ctx.completeTest(done);
  });

  it('removes all events by name and context', function (done) {
    var context1 = 'to remove';
    var context2 = {};

    var cb1 = ctx.createCallback('to keep');
    var cb2 = ctx.createCallback('to remove');

    ctx.e.on('1', cb1, context1);
    ctx.e.on('2', cb1, context1);
    ctx.e.on('1', cb2, context1);
    ctx.e.on('2', cb2, context1);

    ctx.e.on('1', ctx.createCallback('one'));
    ctx.e.on('2', ctx.createCallback('two'));

    ctx.e.on('1', cb1, context2);
    ctx.e.on('2', cb1, context2);
    ctx.e.on('1', cb2, context2);
    ctx.e.on('2', cb2, context2);

    ctx.e.trigger('1', {}); /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
                            /* ===> */ ctx.append({name: 'one', args: [{}]});
                            /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
    ctx.e.trigger('2', 0); /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});
                           /* ===> */ ctx.append({name: 'two', args: [0]});
                           /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off('1', null, context1);
      ctx.e.off('2', null, context2);

      ctx.e.trigger('1'); /* ===> */ ctx.append({name: 'one', args: []});
                          /* ===> */ ctx.append({name: 'to keep', args: []});
                          /* ===> */ ctx.append({name: 'to remove', args: []});
      ctx.e.trigger('2', '!'); /* ===> */ ctx.append({name: 'to keep', args: ['!']});
                               /* ===> */ ctx.append({name: 'to remove', args: ['!']});
                               /* ===> */ ctx.append({name: 'two', args: ['!']});
    };

    ctx.completeTest(done);
  });

  it('removes all events by callback and context', function (done) {
    var context1 = 'to remove';
    var context2 = {};

    var cb1 = ctx.createCallback('to keep');
    var cb2 = ctx.createCallback('to remove');

    ctx.e.on('1', cb1, context1);
    ctx.e.on('2', cb1, context1);
    ctx.e.on('1', cb2, context1);
    ctx.e.on('2', cb2, context1);


    ctx.e.on('1', ctx.createCallback('one'));
    ctx.e.on('2', ctx.createCallback('two'));

    ctx.e.on('1', cb1, context2);
    ctx.e.on('2', cb1, context2);
    ctx.e.on('1', cb2, context2);
    ctx.e.on('2', cb2, context2);
    ctx.e.trigger('1', {}); /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
                            /* ===> */ ctx.append({name: 'one', args: [{}]});
                            /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
    ctx.e.trigger('2', 0); /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});
                           /* ===> */ ctx.append({name: 'two', args: [0]});
                           /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, cb2, context1);
      ctx.e.off(null, cb1, context2);

      ctx.e.trigger('1'); /* ===> */ ctx.append({name: 'to keep', args: []});
                          /* ===> */ ctx.append({name: 'one', args: []});
                          /* ===> */ ctx.append({name: 'to remove', args: []});
      ctx.e.trigger('2', '!'); /* ===> */ ctx.append({name: 'to keep', args: ['!']});
                               /* ===> */ ctx.append({name: 'two', args: ['!']});
                               /* ===> */ ctx.append({name: 'to remove', args: ['!']});
    };

    ctx.completeTest(done);
  });
  it('removes specified events and keeps others', function (done) {
    var context1 = 'to remove';
    var context2 = {};

    var cb1 = ctx.createCallback('to keep');
    var cb2 = ctx.createCallback('to remove');

    ctx.e.on('1', cb1, context1);
    ctx.e.on('2', cb1, context1);
    ctx.e.on('1', cb2, context1);
    ctx.e.on('2', cb2, context1);


    ctx.e.on('1', ctx.createCallback('one'));
    ctx.e.on('2', ctx.createCallback('two'));

    ctx.e.on('1', cb1, context2);
    ctx.e.on('2', cb1, context2);
    ctx.e.on('1', cb2, context2);
    ctx.e.on('2', cb2, context2);
    ctx.e.trigger('1', {}); /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
                            /* ===> */ ctx.append({name: 'one', args: [{}]});
                            /* ===> */ ctx.append({name: 'to keep', args: [{}]});
                            /* ===> */ ctx.append({name: 'to remove', args: [{}]});
    ctx.e.trigger('2', 0); /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});
                           /* ===> */ ctx.append({name: 'two', args: [0]});
                           /* ===> */ ctx.append({name: 'to keep', args: [0]});
                           /* ===> */ ctx.append({name: 'to remove', args: [0]});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off('1', cb2, context1);
      ctx.e.off('2', cb1, context2);

      ctx.e.trigger('1'); /* ===> */ ctx.append({name: 'to keep', args: []});
                          /* ===> */ ctx.append({name: 'one', args: []});
                          /* ===> */ ctx.append({name: 'to keep', args: []});
                          /* ===> */ ctx.append({name: 'to remove', args: []});
      ctx.e.trigger('2', '!'); /* ===> */ ctx.append({name: 'to keep', args: ['!']});
                               /* ===> */ ctx.append({name: 'to remove', args: ['!']});
                               /* ===> */ ctx.append({name: 'two', args: ['!']});
                               /* ===> */ ctx.append({name: 'to remove', args: ['!']});
    };

    ctx.completeTest(done);
  });

  it('removes "once" events by callback', function (done) {
    var cb = ctx.createCallback('fn');
    ctx.e.once('1', cb);
    ctx.e.once('1', cb, {});
    ctx.e.once('2', cb, {});
    ctx.e.once('3', cb, {});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, cb);
      ctx.e.trigger('1');
      ctx.e.trigger('2');
      ctx.e.trigger('3');
    };

    ctx.completeTest(done);
  });

  it('removes "once" events by context', function (done) {
    var context = 'my events';
    ctx.e.once('my1', ctx.createCallback('my1'), context);
    ctx.e.once('my2', ctx.createCallback('my2'), context);
    ctx.e.once('my3', ctx.createCallback('my3'), context);

    ctx.beforeToCompleteTest = function () {
      ctx.e.off(null, null, context);
      ctx.e.trigger('my3');
      ctx.e.trigger('my2');
      ctx.e.trigger('my1');
    };

    ctx.completeTest(done);
  });

  it('removes all events', function (done) {
    var context = 'my events';
    ctx.e.on('my1', ctx.createCallback('my1'), context);
    ctx.e.on('my2', ctx.createCallback('my2'), context);
    ctx.e.on('my3', ctx.createCallback('my3'), context);

    ctx.e.trigger('my1', '3'); /* ===> */ ctx.append({name: 'my1', args: ['3']});
    ctx.e.trigger('my2', '2'); /* ===> */ ctx.append({name: 'my2', args: ['2']});
    ctx.e.trigger('my3', '1'); /* ===> */ ctx.append({name: 'my3', args: ['1']});

    ctx.beforeToCompleteTest = function () {
      ctx.e.off();
      ctx.e.trigger('my3');
      ctx.e.trigger('my2');
      ctx.e.trigger('my1');
    };

    ctx.completeTest(done);
  });
});
