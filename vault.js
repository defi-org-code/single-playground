const Sushi = require('./sushi');

class Vault {

  sushi = new Sushi();
  totalShares = 0;
  totalLpTokens = 0;
  
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
    
    console.log(` received ${shares} shares`);
    return shares;
  }
  
  // returns eth
  withdraw(shares) {
    console.log(`withdraw ${shares} shares`);

    const lpTokens = this.totalLpTokens * shares / this.totalShares;

    const [eth, usd] = this.sushi.removeLiquidity(lpTokens);

    this.totalShares -= shares;
    this.totalLpTokens -= lpTokens;

    console.log(` received ${eth} eth`);
    return eth;
  }
  
  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

}

module.exports = Vault;