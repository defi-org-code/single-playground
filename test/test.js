const Single = require('../single');
const assert = require('assert');

describe('Single', function() {

    it('deposit one', function() {
      const a = new Single();   
      const s1 = a.deposit(100);
      const e1 = a.withdraw(s1);
      assert.equal(e1, 100);
    });

    it('deposit two', function() {
      const a = new Single();
      const s1 = a.deposit(100);
      const s2 = a.deposit(200);
      const e1 = a.withdraw(s1);
      assert.equal(e1, 100);
      const e2 = a.withdraw(s2);
      assert.equal(e2, 200);
    });

});