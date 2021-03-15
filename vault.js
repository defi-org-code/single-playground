const Sushi = require("./sushi");
const _ = require("lodash");

class Vault {
  sushi = new Sushi();
  totalShares = 0;
  totalLpTokens = 0;
  totalInvestedUSD = 0;
  strategy = 1;
  userInfos = {};

  constructor(strategy = 1) {
    this.strategy = strategy;
  }

  // returns shares
  deposit(msgSender, eth) {
    console.log(`deposit ${eth} eth`);

    const [usd, lpTokens] = this.sushi.addLiquidityEth(eth);

    let shares = 0;
    if (this.totalShares == 0) {
      shares = lpTokens;
    } else {
      shares = (lpTokens * this.totalShares) / this.totalLpTokens;
    }

    this.totalShares += shares;
    this.totalLpTokens += lpTokens;

    // new single algo - start
    this.totalInvestedUSD += usd; // TODO this is here only for book keeping
    if (!this.userInfos[msgSender]) this.userInfos[msgSender] = { eth, usd, shares };
    else {
      this.userInfos[msgSender].eth += eth;
      this.userInfos[msgSender].usd += usd;
      this.userInfos[msgSender].shares += shares;
    }
    // new single algo - end

    console.log(` received ${shares} shares`);
    return shares;
  }

  // returns eth
  withdraw(msgSender, shares) {
    console.log(`withdraw ${shares} shares`);

    shares = Math.min(this.userInfos[msgSender].shares, shares); // truncate shares to <= allocated

    const lpTokens = (this.totalLpTokens * shares) / this.totalShares;

    const [eth, usd] = this.sushi.removeLiquidity(lpTokens);

    // new single algo - start
    const ethEntry = this.userInfos[msgSender].eth;
    const usdEntry = this.userInfos[msgSender].usd;
    const [ethFixed, usdFixed] = this._applyRebalanceStrategy(eth, usd, ethEntry, usdEntry);
    this.userInfos[msgSender].eth -= ethEntry;
    this.userInfos[msgSender].usd -= usdEntry;
    this.userInfos[msgSender].shares -= shares;

    this.totalInvestedUSD -= usdFixed; // TODO this is here only for book keeping
    // new single algo - end

    this.totalShares -= shares;
    this.totalLpTokens -= lpTokens;

    console.log(` received ${ethFixed} eth`);
    return ethFixed;
  }

  withdrawAll(msgSender) {
    return this.withdraw(msgSender, this.userInfos[msgSender].shares);
  }

  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

  _applyRebalanceStrategy(eth, usd, ethEntry, usdEntry) {
    switch (this.strategy) {
      default:
      case 1:
        return this._singleAlgoILStrategy1(eth, usd, ethEntry, usdEntry);
      case 2:
        return this._singleAlgoILStrategy2(eth, usd, ethEntry, usdEntry);
      case 3:
        return this._singleAlgoILStrategy3(eth, usd, ethEntry, usdEntry);
    }
  }

  // returns [ethFixed, usdFixed]
  _singleAlgoILStrategy1(eth, usd, ethEntry, usdEntry) {
    if (usd > usdEntry) {
      const usdDelta = usd - usdEntry;
      eth += this.sushi.swapUsdToEth(usdDelta);
      usd -= usdDelta;
    } else {
      const ethDelta = Math.min(eth, (eth * (usdEntry - usd)) / usd);
      eth -= ethDelta;
      usd += this.sushi.swapEthToUsd(ethDelta);
    }

    return [eth, usd];
  }

  // returns [ethFixed, usdFixed]
  _singleAlgoILStrategy2(eth, usd, ethEntry, usdEntry) {
    console.log("here2");
    if (usd > usdEntry) {
      eth += this.sushi.swapUsdToEth(usd - usdEntry);
      usd = usdEntry;
    } else {
      eth = ethEntry;
      usd += this.sushi.swapEthToUsd(eth - ethEntry); // TODO: remove swap
    }

    return [eth, usd];
  }

  // returns [ethFixed, usdFixed]
  _singleAlgoILStrategy3(eth, usd, ethEntry, usdEntry) {
    const ethFixed = (ethEntry * (usd + eth * this.sushi.getEthPrice())) / (usdEntry + ethEntry * this.sushi.getEthPrice());
    const usdFixed = usd + eth * this.sushi.getEthPrice() - ethFixed * this.sushi.getEthPrice();
    return [ethFixed, usdFixed];
  }
}

module.exports = Vault;
