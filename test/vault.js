const { expect } = require("chai");
const Vault = require("../vault");

describe("Vault", () => {
  it("deposit one", () => {
    const v = new Vault();
    const s1 = v.deposit(100);
    const e1 = v.withdraw(s1);
    expect(e1).to.eq(100);
  });

  it("deposit two", () => {
    const v = new Vault();
    const s1 = v.deposit(100);
    const s2 = v.deposit(200);
    const e1 = v.withdraw(s1);
    expect(e1).to.eq(100);
    const e2 = v.withdraw(s2);
    expect(e2).to.eq(200);
  });
});
