import { CoercionHelper } from './coercion';


describe('coerceArray', () => {

  it('should wrap a string in an array', () => {
    let stringVal = 'just a string';
    expect(CoercionHelper.coerceArray(stringVal)).toEqual([stringVal]);
  });

  it('should wrap a number in an array', () => {
    let numberVal = 42;
    expect(CoercionHelper.coerceArray(numberVal)).toEqual([numberVal]);
  });

  it('should wrap an object in an array', () => {
    let objectVal = {
      something: 'clever'
    };
    expect(CoercionHelper.coerceArray(objectVal)).toEqual([objectVal]);
  });

  it('should wrap a null vall in an array', () => {
    let nullVal = null;
    expect(CoercionHelper.coerceArray(nullVal)).toEqual([nullVal]);
  });

  it('should wrap an undefined value in an array', () => {
    let undefinedVal = undefined;
    expect(CoercionHelper.coerceArray(undefinedVal)).toEqual([undefinedVal]);
  });

  it('should not wrap an array in an array', () => {
    let arrayVal = [1, 2, 3];
    expect(CoercionHelper.coerceArray(arrayVal)).toBe(arrayVal);
  });

});


describe('coerceBoolean', () => {

  it('should coerce undefined to false', () => {
    expect(CoercionHelper.coerceBoolean(undefined)).toBe(false);
  });

  it('should coerce null to false', () => {
    expect(CoercionHelper.coerceBoolean(null)).toBe(false);
  });

  it('should coerce the empty string to true', () => {
    expect(CoercionHelper.coerceBoolean('')).toBe(true);
  });

  it('should coerce zero to true', () => {
    expect(CoercionHelper.coerceBoolean(0)).toBe(true);
  });

  it('should coerce the string "false" to false', () => {
    expect(CoercionHelper.coerceBoolean('false')).toBe(false);
  });

  it('should coerce the boolean false to false', () => {
    expect(CoercionHelper.coerceBoolean(false)).toBe(false);
  });

  it('should coerce the boolean true to true', () => {
    expect(CoercionHelper.coerceBoolean(true)).toBe(true);
  });

  it('should coerce the string "true" to true', () => {
    expect(CoercionHelper.coerceBoolean('true')).toBe(true);
  });

  it('should coerce an arbitrary string to true', () => {
    expect(CoercionHelper.coerceBoolean('pink')).toBe(true);
  });

  it('should coerce an object to true', () => {
    expect(CoercionHelper.coerceBoolean({})).toBe(true);
  });

  it('should coerce an array to true', () => {
    expect(CoercionHelper.coerceBoolean([])).toBe(true);
  });

});


describe('CoercionHelper.coerceNumber', () => {

  it('should coerce undefined to 0 or default', () => {
    expect(CoercionHelper.coerceNumber(undefined)).toBe(0);
    expect(CoercionHelper.coerceNumber(undefined, 111)).toBe(111);
  });

  it('should coerce null to 0 or default', () => {
    expect(CoercionHelper.coerceNumber(null)).toBe(0);
    expect(CoercionHelper.coerceNumber(null, 111)).toBe(111);
  });

  it('should coerce true to 0 or default', () => {
    expect(CoercionHelper.coerceNumber(true)).toBe(0);
    expect(CoercionHelper.coerceNumber(true, 111)).toBe(111);
  });

  it('should coerce false to 0 or default', () => {
    expect(CoercionHelper.coerceNumber(false)).toBe(0);
    expect(CoercionHelper.coerceNumber(false, 111)).toBe(111);

  });

  it('should coerce the empty string to 0 or default', () => {
    expect(CoercionHelper.coerceNumber('')).toBe(0);
    expect(CoercionHelper.coerceNumber('', 111)).toBe(111);

  });

  it('should coerce the string "1" to 1', () => {
    expect(CoercionHelper.coerceNumber('1')).toBe(1);
    expect(CoercionHelper.coerceNumber('1', 111)).toBe(1);
  });

  it('should coerce the string "123.456" to 123.456', () => {
    expect(CoercionHelper.coerceNumber('123.456')).toBe(123.456);
    expect(CoercionHelper.coerceNumber('123.456', 111)).toBe(123.456);
  });

  it('should coerce the string "-123.456" to -123.456', () => {
    expect(CoercionHelper.coerceNumber('-123.456')).toBe(-123.456);
    expect(CoercionHelper.coerceNumber('-123.456', 111)).toBe(-123.456);
  });

  it('should coerce an arbitrary string to 0 or default', () => {
    expect(CoercionHelper.coerceNumber('pink')).toBe(0);
    expect(CoercionHelper.coerceNumber('pink', 111)).toBe(111);
  });

  it('should coerce an arbitrary string prefixed with a number to 0 or default', () => {
    expect(CoercionHelper.coerceNumber('123pink')).toBe(0);
    expect(CoercionHelper.coerceNumber('123pink', 111)).toBe(111);
  });

  it('should coerce the number 1 to 1', () => {
    expect(CoercionHelper.coerceNumber(1)).toBe(1);
    expect(CoercionHelper.coerceNumber(1, 111)).toBe(1);
  });

  it('should coerce the number 123.456 to 123.456', () => {
    expect(CoercionHelper.coerceNumber(123.456)).toBe(123.456);
    expect(CoercionHelper.coerceNumber(123.456, 111)).toBe(123.456);
  });

  it('should coerce the number -123.456 to -123.456', () => {
    expect(CoercionHelper.coerceNumber(-123.456)).toBe(-123.456);
    expect(CoercionHelper.coerceNumber(-123.456, 111)).toBe(-123.456);
  });

  it('should coerce an object to 0 or default', () => {
    expect(CoercionHelper.coerceNumber({})).toBe(0);
    expect(CoercionHelper.coerceNumber({}, 111)).toBe(111);
  });

  it('should coerce an array to 0 or default', () => {
    expect(CoercionHelper.coerceNumber([])).toBe(0);
    expect(CoercionHelper.coerceNumber([], 111)).toBe(111);
  });

});
