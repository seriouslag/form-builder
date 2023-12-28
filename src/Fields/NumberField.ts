import { FieldOptions } from './index';
import { IsNumberValidator } from '../Validators';
import { Field, RawFormValueStrategy } from './Field';

export type NumberFieldOptions = FieldOptions<number>;

export class NumberField extends Field<number> {
  constructor(options: NumberFieldOptions) {
    const { label, defaultValue = 0, isNullable } = options;
    super({
      label,
      type: 'number',
      defaultValue,
      valueStrategy: new RawFormValueStrategy(),
      isNullable,
    });
    this.addValidator(new IsNumberValidator());
  }
}
