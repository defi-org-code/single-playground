const { expect } = require("chai");
const Vault = require("../vault");

describe("Vault", () => {
  it("deposit one", () => {
    const v = new Vault();
    const s1 = v.deposit("user1", 100);
    const e1 = v.withdraw("user1", s1);
    expect(e1).to.eq(100);
  });

  it("deposit two", () => {
    const v = new Vault();
    const s1 = v.deposit("user1", 100);
    const s2 = v.deposit("user2", 200);
    const e1 = v.withdraw("user1", s1);
    expect(e1).to.eq(100);
    const e2 = v.withdraw("user2", s2);
    expect(e2).to.eq(200);
  });

  it("usd in vault", () => {
    const v = new Vault();
    v.changeEthPrice(2000);

    const shares = v.deposit("user1", 100);
    expect(v.usdBalance).to.eq(-200_000);

    const eth = v.withdraw("user1", shares);
    expect(eth).to.eq(100);
    expect(v.usdBalance).to.eq(0);
  });

  it("guard against entry-exit exploit", () => {
    const v = new Vault();
    v.changeEthPrice(2000);
    v.deposit("user1", 100);

    v.changeEthPrice(3000);

    expect(v.usdBalance).to.eq(-200_000);

    const eth = v.withdraw("user2", v.deposit("user2", 100));
    expect(eth).to.eq(100);
    expect(v.usdBalance).to.eq(-200_000);

    const eth2 = v.withdraw("user2", v.deposit("user2", 100));
    expect(eth2).to.eq(100);
    expect(v.usdBalance).to.eq(-200_000);
  });

  it("never withdraw more shares than allocated", () => {
    const v = new Vault();
    const shares = v.deposit("user1", 100);
    const eth = v.withdraw("user1", shares + 10);
    expect(eth).to.eq(100);
    expect(v.usdBalance).to.eq(0);
  });

  it("whale -> price increase -> fish -> whale exit -> fish exit", () => {
    const v = new Vault();
    v.changeEthPrice(2000);
    v.deposit("whale", 100_000);
    expect(v.usdBalance).to.eq(-200_000_000);

    v.changeEthPrice(3000);
    expect(v.usdBalance).to.eq(-200_000_000);

    v.deposit("fishy", 1);
    expect(v.usdBalance).to.eq(-200_003_000);

    const eth = v.withdrawAll("whale");
    expect(eth).to.lte(100_000);
    expect(v.usdBalance).to.eq(-3000);

    const eth2 = v.withdrawAll("fishy");
    expect(eth2).to.closeTo(1, 0.001);
    expect(v.usdBalance).to.eq(0);
  });

  it("same user enter multiple times", () => {
    const v = new Vault();
    v.changeEthPrice(2000);
    v.deposit("user1", 100);
    v.changeEthPrice(3000);
    v.deposit("user1", 100);

    const eth = v.withdrawAll("user1");
    expect(eth).to.closeTo(196.63, 0.01);
  });

  it("same user exit multiple times, no eth residues", () => {
    const v = new Vault();
    v.changeEthPrice(2000);
    v.deposit("user1", 100);
    v.changeEthPrice(3000);
    v.deposit("user1", 100);

    const eth = v.withdraw("user1", v.userInfos["user1"].shares / 2);
    expect(eth).closeTo(196.63 / 2, 1);

    const eth2 = v.withdrawAll("user1");
    expect(eth + eth2).to.closeTo(196.63, 0.01);
    expect(v.userInfos["user1"].eth).to.eq(0);
    expect(v.userInfos["user1"].usd).to.eq(0);
  });

  it("multiple users", () => {
    const v = new Vault();
    v.changeEthPrice(2000);

    v.deposit("user1", 100);
    v.changeEthPrice(3000);
    v.deposit("user1", 100);
    v.changeEthPrice(1000);
    v.deposit("user2", 100);
    v.changeEthPrice(3000);
    v.deposit("user2", 100);

    const eth1 = v.withdrawAll("user1");
    expect(eth1).to.closeTo(196, 1);
    const eth2 = v.withdrawAll("user2");
    expect(eth2).to.closeTo(182, 1);

    expect(v.usdBalance).to.closeTo(0, 1);
  });
});
