import formatMoney from "../lib/formatMoney";

describe("formatMoney", () => {
  it("should work with cents", () => {
    expect(formatMoney(1)).toEqual("$0.01");
    expect(formatMoney(5)).toEqual("$0.05");
    expect(formatMoney(40)).toEqual("$0.40");
    expect(formatMoney(99)).toEqual("$0.99");
  });

  it("should work with whole dollars", () => {
    expect(formatMoney(100)).toEqual("$1");
    expect(formatMoney(1000)).toEqual("$10");
    expect(formatMoney(10000)).toEqual("$100");
    expect(formatMoney(99000)).toEqual("$990");
  });

  it("should work with fractional values", () => {
    expect(formatMoney(101)).toEqual("$1.01");
    expect(formatMoney(10001)).toEqual("$100.01");
    expect(formatMoney(10098)).toEqual("$100.98");
  });

  it("should add commas to separate numbers larger than 1000", () => {
    expect(formatMoney(100000)).toEqual("$1,000");
    expect(formatMoney(900000)).toEqual("$9,000");
    expect(formatMoney(10000000)).toEqual("$100,000");
    expect(formatMoney(10000999)).toEqual("$100,009.99");
    expect(formatMoney(1242352345435)).toEqual("$12,423,523,454.35");
  });
});
