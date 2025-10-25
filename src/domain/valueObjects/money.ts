/**
 * Money Value Object
 * Represents a monetary value with immutable properties
 */
export class Money {
  private readonly _value: number;

  constructor(value: number) {
    // Ensure value has at most 2 decimal places
    this._value = Math.round(value * 100) / 100;
  }

  get value(): number {
    return this._value;
  }

  add(money: Money): Money {
    return new Money(this._value + money.value);
  }

  subtract(money: Money): Money {
    return new Money(this._value - money.value);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor);
  }

  equals(money: Money): boolean {
    return this._value === money.value;
  }

  greaterThan(money: Money): boolean {
    return this._value > money.value;
  }

  lessThan(money: Money): boolean {
    return this._value < money.value;
  }

  toString(): string {
    return `$${this._value.toFixed(2)}`;
  }
}