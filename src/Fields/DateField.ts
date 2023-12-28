import { FieldOptions } from './index';
import { IsNumberValidator } from '../Validators';
import { Field, RawFormValueStrategy } from './Field';

export type DateFieldOptions = FieldOptions<number>;

export class DateField extends Field<number> {
  constructor(options: DateFieldOptions) {
    const { label, defaultValue = Date.now(), isNullable } = options;
    super({
      label,
      type: 'date',
      defaultValue,
      valueStrategy: new RawFormValueStrategy(),
      isNullable,
    });
    this.addValidator(new IsNumberValidator());
  }
}
