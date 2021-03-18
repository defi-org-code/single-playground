# Playground for Single Side Algorithms

## Overview

Often, to design sound economics and experiment with economic attack vectors, a rapid prototype simulation is faster to work with. This simulation shows a single-side vault connected to SushiSwap DEX.

The simulation is implemented in JavaScript instead of Solidity and uses simple mocks for Sushi that allow testing scenarios that are relatviely hard to achieve on the real Sushi contract. One example is changing the price of ETH - which allows us to check how the vault behaves in the case an attacker manipulates ETH price, which is theoretically possible using flash loans.

Branches of note:

* [master](https://github.com/defi-org-code/single-playground/tree/master) - The simple straightforward double sided implementation (control).

* [crazy-idea1](https://github.com/defi-org-code/single-playground/tree/crazy-idea1) - Single-sided vault based on ERC20-compatible vault shares, where all ETH depositors share IL together. This approach is open to exploitation, which is shown in tests.

* [no-shares](https://github.com/defi-org-code/single-playground/tree/no-shares) - A better single-sided vault implementation that isolates IL between ETH depositors. Does not support shares though.

## Run

```
npm install
npm test
```
