const Sushi = require('./sushi');

class Vault {

  sushi = new Sushi();
  totalShares = 0;
  totalEth = 0;
  totalUsd = 0;
  
  // returns shares
  deposit(eth) {
    console.log(`deposit ${eth} eth`);

    let shares = 0;
    if (this.totalShares == 0) {
      shares = eth;
    } else {
      shares = eth * this.totalShares / this.totalEth;
    }

    this.totalShares += shares;
    this.totalEth += eth;
    
    console.log(` received ${shares} shares`);
    return shares;
  }
  
  // returns eth
  withdraw(shares) {
    console.log(`withdraw ${shares} shares`);

    const eth = this.totalEth * shares / this.totalShares;

    this.totalShares -= shares;
    this.totalEth -= eth;

    console.log(` received ${eth} eth`);
    return eth;
  }
  
  changeEthPrice(priceUsd) {
    this.sushi.changeEthPrice(priceUsd);
  }

}

module.exports = Vault;