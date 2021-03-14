const Vault = require('../vault');
const assert = require('assert');

describe('Vault', function() {

    it('deposit one', function() {
      const v = new Vault();   
      const s1 = v.deposit(100);
      const e1 = v.withdraw(s1);
      assert.equal(e1, 100);
    });

    it('deposit two', function() {
      const v = new Vault();
      const s1 = v.deposit(100);
      const s2 = v.deposit(200);
      const e1 = v.withdraw(s1);
      assert.equal(e1, 100);
      const e2 = v.withdraw(s2);
      assert.equal(e2, 200);
    });

});