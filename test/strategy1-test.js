const { expect } = require("chai");
const Vault = require("../vault");

describe("rebalancing strategy1", () => {
  it("lpTokens are interest bearing", () => {
    const v = new Vault(1);
    v.changeEthPrice(1000);

    v.deposit("user1", 100);
    v.deposit("user2", 100);

    v.simulateInterestAccumulation(1.0);

    expect(v.withdrawAll("user1")).to.closeTo(300, 0.1);
    expect(v.withdrawAll("user2")).to.closeTo(300, 0.1);
    expect(v.usdBalance).to.eq(0);
  });

  it("price increase", () => {
    const v = new Vault(1);
    v.changeEthPrice(1000);
    v.deposit("user1", 100);
    v.deposit("user2", 100);
    v.simulateInterestAccumulation(1.0);
    v.changeEthPrice(2000);

    expect(v.withdrawAll("user1")).to.closeTo(232, 1);
    expect(v.withdrawAll("user2")).to.closeTo(232, 1);
    expect(v.usdBalance).to.eq(0);
  });

  it("price drop", () => {
    const v = new Vault(1);
    v.changeEthPrice(2000);
    v.deposit("user1", 100);
    v.deposit("user2", 100);
    v.simulateInterestAccumulation(0.5811388301);
    v.changeEthPrice(200);

    const eth1 = v.withdrawAll("user1");
    const eth2 = v.withdrawAll("user2");
    expect(eth1).to.closeTo(0, 1);
    expect(eth2).to.closeTo(0, 1);
    expect(v.usdBalance).to.eq(0);
  });

  it("price shifts over time", () => {
    const v = new Vault(1);
    v.changeEthPrice(2000);

    v.deposit("user1", 100);

    v.changeEthPrice(3000);
    v.deposit("user1", 100);

    v.changeEthPrice(1000);
    v.deposit("user1", 100);

    v.changeEthPrice(2000);
    v.deposit("user1", 100);

    const eth = v.withdrawAll("user1");
    expect(v.usdBalance).to.eq(0);

    expect(v.userInfos["user1"].eth).to.eq(0);
    expect(v.userInfos["user1"].usd).to.eq(0);
    expect(v.userInfos["user1"].shares).to.eq(0);
    expect(eth).to.closeTo(386.37, 1);
  });
});
