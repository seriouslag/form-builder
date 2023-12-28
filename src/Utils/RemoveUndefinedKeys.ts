import { type RemoveUndefinedFromObject } from './TsHelpers';

/**
 * A helper function that takes an object or record and returns a new object with `undefined` values removed
 * recursively. Null values are preserved. Arrays are not affected.
 * 
 * @param input - The input object or record.
 * @param deep - Whether to remove `undefined` values recursively. Defaults to `true`.
 * @returns A new object with `undefined` properties removed recursively. Null values are preserved. Arrays are not affected.
 */
export function RemoveUndefinedKeys<T extends object>(input: T, deep = true): T {
  const result: Partial<RemoveUndefinedFromObject<T>> = {};

  for (const unTypedKey in input) {
    if (!Object.hasOwn(input, unTypedKey)) {
      continue;
    }
    const key = unTypedKey as keyof T;
    const value = input[key];
    if (value !== undefined) {
      const unUndefinedValue = value as RemoveUndefinedFromObject<T>[keyof RemoveUndefinedFromObject<T>];
      const noUndefinedKey = key as keyof RemoveUndefinedFromObject<T>;
      if (deep && typeof unUndefinedValue === 'object' && !Array.isArray(unUndefinedValue)) {
        result[noUndefinedKey] = RemoveUndefinedKeys(
          unUndefinedValue as Record<string, unknown>,
        ) as RemoveUndefinedFromObject<T>[keyof RemoveUndefinedFromObject<T>];
      } else {
        result[noUndefinedKey] = unUndefinedValue;
      }
    }
  }

  return result as T;
}
