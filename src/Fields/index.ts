export * from './Field';
export * from './NumberField';
export * from './TextField';
export * from './RadioField';
export * from './SwitchLike';
export * from './DateField';
export * from './MultiTableField';

export interface FieldOptions<T> {
  label: string;
  defaultValue?: T;
  isNullable?: 'nullable' | 'required';
}
