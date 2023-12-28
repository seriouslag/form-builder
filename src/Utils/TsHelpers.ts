/**
 * A utility type that filters out keys of array types.
 */
export type NonArrayKeys<T> = {
  [K in keyof T]: T[K] extends any[] ? never : K;
}[keyof T];

/**
 * A utility type that recursively removes `undefined` from properties of objects and records.
 * 
 * Null values are preserved.
 */
export type RemoveUndefinedFromObject<T extends object> = T extends object
  ? {
    [K in NonArrayKeys<T>]: Exclude<T[K], undefined> extends infer U
    ? U extends object
    ? RemoveUndefinedFromObject<U>
    : U
    : never;
  }
  : T;

