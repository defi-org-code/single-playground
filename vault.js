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

    // new single algo
    this.singleAlgoTotalEth += eth;
    this.singleAlgoTotalUsd += usd;
    
    console.log(` received ${shares} shares`);
    return shares;
  }
  
  // returns eth
  withdraw(shares) {
    console.log(`withdraw ${shares} shares`);

    const lpTokens = this.totalLpTokens * shares / this.totalShares;

    const [eth, usd] = this.sushi.removeLiquidity(lpTokens);

    // new single algo
    const [ethFixed, usdFixed] = this.singleAlgoILStrategy1(shares, eth, usd);
    //const [ethFixed, usdFixed] = this.singleAlgoILStrategy3(shares, eth, usd);
    this.singleAlgoTotalEth -= ethFixed;
    this.singleAlgoTotalUsd -= usdFixed;

    this.totalShares -= shares;
    this.totalLpTokens -= lpTokens;

    console.log(` received ${ethFixed} eth`);
    return ethFixed;
  }
  
  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

  // returns [ethFixed, usdFixed]
  singleAlgoILStrategy1(shares, eth, usd) {
    const ethEntry = this.singleAlgoTotalEth * shares / this.totalShares;
    const usdEntry = this.singleAlgoTotalUsd * shares / this.totalShares;
    
    const ethFixed = eth + (usd - usdEntry) / this.sushi.getEthPrice();
    const usdFixed = usdEntry;
    return [ethFixed, usdFixed];
  }

  // returns [ethFixed, usdFixed]
  singleAlgoILStrategy3(shares, eth, usd) {
    const ethEntry = this.singleAlgoTotalEth * shares / this.totalShares;
    const usdEntry = this.singleAlgoTotalUsd * shares / this.totalShares;

    const ethFixed = ethEntry * (usd + eth * this.sushi.getEthPrice()) / (usdEntry + ethEntry * this.sushi.getEthPrice());
    const usdFixed = (usd + eth * this.sushi.getEthPrice()) - (ethFixed * this.sushi.getEthPrice());
    return [ethFixed, usdFixed];
  }

}

module.exports = Vault;