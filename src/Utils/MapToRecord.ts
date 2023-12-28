export function MapToRecord<K extends string | number | symbol, J>(
  map: Map<K, J>
): Record<K, J> {
  const record = {} as Record<K, J>;
  for (const [key, value] of map) {
    record[key] = value;
  }
  return record;
}
