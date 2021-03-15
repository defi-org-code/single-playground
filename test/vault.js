const { expect } = require("chai");
const Vault = require("../vault");

describe("Vault", () => {
  it("deposit one", () => {
    const v = new Vault();
    const s1 = v.deposit(100);
    const e1 = v.withdraw(s1);
    expect(e1).to.eq(100);
  });

  it("deposit two", () => {
    const v = new Vault();
    const s1 = v.deposit(100);
    const s2 = v.deposit(200);
    const e1 = v.withdraw(s1);
    expect(e1).to.eq(100);
    const e2 = v.withdraw(s2);
    expect(e2).to.eq(200);
  });

  it("usd in vault", () => {
    const v = new Vault();
    v.changeEthPrice(2000);

    const shares = v.deposit(100);
    expect(v.usdRequiredToMatch).to.eq(0);

    const eth = v.withdraw(shares);
    expect(eth).to.eq(100);
    expect(v.usdRequiredToMatch).to.eq(200_000);
  });

  // it("strategy1 moving average allows exploit", () => {
  //   const v = new Vault(1);
  //   v.changeEthPrice(2000);
  //   const shares1 = v.deposit(100);
  //
  //   v.changeEthPrice(3000);
  //
  //   const shares2 = v.deposit(100);
  //   expect(shares1).to.eq(shares2);
  //   const eth = v.withdraw(shares2);
  //   expect(eth).to.closeTo(108, 1); // problem!
  //   expect(v.usdRequiredToMatch).to.closeTo(275_000, 1000);
  //
  //   const eth2 = v.withdraw(v.deposit(100));
  //   expect(eth2).to.closeTo(103, 1); // problem!
  //   expect(v.usdRequiredToMatch).to.closeTo(564_000, 1000); // problem!!!
  //
  //   const eth3 = v.withdraw(v.deposit(100));
  //   expect(eth3).to.closeTo(101, 1); // problem!
  //   expect(v.usdRequiredToMatch).to.closeTo(859_000, 1000); // problem!!! I stole 34k from USD side!
  // });

  it("shares by ether", () => {
    const v = new Vault(1);
    v.changeEthPrice(2000);
    v.deposit(100);

    v.changeEthPrice(3000);

    const eth = v.withdraw(v.deposit(100));
    expect(eth).to.closeTo(108, 1); // problem!
    expect(v.usdRequiredToMatch).to.closeTo(275_000, 1000);

    const eth2 = v.withdraw(v.deposit(100));
    expect(eth2).to.closeTo(103, 1); // problem!
    expect(v.usdRequiredToMatch).to.closeTo(564_000, 1000); // problem!!!

    const eth3 = v.withdraw(v.deposit(100));
    expect(eth3).to.closeTo(101, 1); // problem!
    expect(v.usdRequiredToMatch).to.closeTo(859_000, 1000); // problem!!! I stole 34k from USD side!
  });
});

// ideas
// farms like autofarm - without shares
// Harvest has NoMintRewardPool - a share-less pool
// more complex: save deposit allowance map per sender, shares are transferable but not redeemable over allocation
