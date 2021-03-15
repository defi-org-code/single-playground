const Sushi = require("../sushi");
const assert = require("assert");

describe("Sushi", function () {
  it("deposit one", function () {
    const s = new Sushi();
    const [usd1, lp1] = s.addLiquidityEth(100);
    assert.equal(usd1, 200000);
    const [eth11, usd11] = s.removeLiquidity(lp1);
    assert.equal(eth11, 100);
    assert.equal(usd11, 200000);
  });

  it("deposit one and change price", function () {
    const s = new Sushi();
    const [usd1, lp1] = s.addLiquidityEth(100);
    assert.equal(usd1, 200000);
    s.changeEthPrice(500);
    const [eth11, usd11] = s.removeLiquidity(lp1);
    assert.equal(eth11, 200);
    assert.equal(usd11, 100000);
  });

  it("deposit two", function () {
    const s = new Sushi();
    const [usd1, lp1] = s.addLiquidityEth(100);
    assert.equal(usd1, 200000);
    const [usd2, lp2] = s.addLiquidityEth(200);
    assert.equal(usd2, 400000);
    const [eth11, usd11] = s.removeLiquidity(lp1);
    assert.equal(eth11, 100);
    assert.equal(usd11, 200000);
    const [eth22, usd22] = s.removeLiquidity(lp2);
    assert.equal(eth22, 200);
    assert.equal(usd22, 400000);
  });
});
