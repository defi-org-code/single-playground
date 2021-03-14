const Sushi = require('./sushi');

class Vault {

  sushi = new Sushi();
  totalShares = 0;
  totalLpTokens = 0;

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
      shares = lpTokens * this.totalShares / this.totalLpTokens;
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

    const lpTokens = this.totalLpTokens * shares / this.totalShares;

    const [eth, usd] = this.sushi.removeLiquidity(lpTokens);

    // new single algo - start
    const ethEntry = this.singleAlgoTotalEth * shares / this.totalShares;
    const usdEntry = this.singleAlgoTotalUsd * shares / this.totalShares;
    const [ethFixed, usdFixed] = this.singleAlgoILStrategy1(eth, usd, ethEntry, usdEntry);
    this.singleAlgoTotalEth -= ethEntry;
    this.singleAlgoTotalUsd -= usdEntry;
    // new single algo - end

    this.totalShares -= shares;
    this.totalLpTokens -= lpTokens;

    console.log(` received ${ethFixed} eth`);
    return ethFixed;
  }
  
  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

  // returns [ethFixed, usdFixed]
  singleAlgoILStrategy1(eth, usd, ethEntry, usdEntry) {
    if (usd > usdEntry) {
      const usdDelta = usd - usdEntry;
      eth += this.sushi.swapUsdToEth(usdDelta);
      usd -= usdDelta;  
    } else {
      const ethDelta = Math.min(eth, eth * (usdEntry - usd) / usd);
      eth -= ethDelta;
      usd += this.sushi.swapEthToUsd(ethDelta);
    }
    
    return [eth, usd];
  }

  // returns [ethFixed, usdFixed]
  singleAlgoILStrategy2(eth, usd, ethEntry, usdEntry) {
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
  singleAlgoILStrategy3(eth, usd, ethEntry, usdEntry) {
    const ethFixed = ethEntry * (usd + eth * this.sushi.getEthPrice()) / (usdEntry + ethEntry * this.sushi.getEthPrice());
    const usdFixed = (usd + eth * this.sushi.getEthPrice()) - (ethFixed * this.sushi.getEthPrice());
    return [ethFixed, usdFixed];
  }

}

module.exports = Vault;