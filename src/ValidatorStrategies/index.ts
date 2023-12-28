import { Field } from '../Fields';

export interface FormValidatorStrategy<FieldValueType, KeyName extends string | number | symbol> {
  validate(fields: Map<KeyName, Field<FieldValueType>>): Promise<Record<KeyName, boolean>>;
}
