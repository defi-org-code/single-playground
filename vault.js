const Sushi = require("./sushi");

class Vault {
  sushi = new Sushi();
  totalShares = 0;
  totalLpTokens = 0;
  usdInVault = 0;
  strategy = 1;

  constructor(strategy = 1) {
    this.strategy = strategy;
  }

  singleAlgoTotalEth = 0;
  singleAlgoTotalUsd = 0;

  // returns shares
  deposit(eth) {
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
    this.singleAlgoTotalEth += eth;
    this.singleAlgoTotalUsd += usd;
    // new single algo - end

    console.log(` received ${shares} shares`);
    return shares;
  }

  // returns eth
  withdraw(shares) {
    console.log(`withdraw ${shares} shares`);

    const lpTokens = (this.totalLpTokens * shares) / this.totalShares;

    const [eth, usd] = this.sushi.removeLiquidity(lpTokens);

    // new single algo - start
    const ethEntry = (this.singleAlgoTotalEth * shares) / this.totalShares;
    const usdEntry = (this.singleAlgoTotalUsd * shares) / this.totalShares;
    const [ethFixed, usdFixed] = this._applyStrategy(this.strategy, eth, usd, ethEntry, usdEntry);
    this.singleAlgoTotalEth -= ethEntry;
    this.singleAlgoTotalUsd -= usdEntry;
    // new single algo - end

    this.totalShares -= shares;
    this.totalLpTokens -= lpTokens;

    this.usdInVault += usdFixed;
    console.log(` received ${ethFixed} eth`);
    return ethFixed;
  }

  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

  _applyStrategy(strategy, eth, usd, ethEntry, usdEntry) {
    switch (strategy) {
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
