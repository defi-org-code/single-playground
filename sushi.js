class Sushi {
  ethPriceUsd = 2000;
  totalEth = 0;
  totalUsd = 0;
  totalLpTokens = 0;

  // returns [usd, lpTokens]
  addLiquidityEth(eth) {
    const usd = eth * this.ethPriceUsd;

    let lpTokens = 0;
    if (this.totalLpTokens == 0) {
      lpTokens = eth;
    } else {
      lpTokens = (eth * this.totalLpTokens) / this.totalEth;
    }

    this.totalEth += eth;
    this.totalUsd += usd;
    this.totalLpTokens += lpTokens;

    return [usd, lpTokens];
  }

  // returns [eth, usd]
  removeLiquidity(lpTokens) {
    const eth = (lpTokens / this.totalLpTokens) * this.totalEth;
    const usd = (lpTokens / this.totalLpTokens) * this.totalUsd;

    this.totalEth -= eth;
    this.totalUsd -= usd;
    this.totalLpTokens -= lpTokens;

    return [eth, usd];
  }

  changeEthPrice(priceUsd) {
    this.ethPriceUsd = priceUsd;
    this.totalEth = Math.sqrt((this.totalEth * this.totalUsd) / this.ethPriceUsd);
    this.totalUsd = this.totalEth * this.ethPriceUsd;
  }

  getEthPrice() {
    return this.ethPriceUsd;
  }

  // returns usd
  swapEthToUsd(eth) {
    return eth * this.ethPriceUsd;
  }

  // returns eth
  swapUsdToEth(usd) {
    return usd / this.ethPriceUsd;
  }
}

module.exports = Sushi;
