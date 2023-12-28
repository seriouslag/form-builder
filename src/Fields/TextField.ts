import { FieldOptions } from './index';
import { IsStringValidator } from '../Validators';
import { Field, RawFormValueStrategy } from './Field';

export type TextFieldOptions = FieldOptions<string>;

export class TextField extends Field<string> {
  constructor(options: TextFieldOptions) {
    const { label, defaultValue = '', isNullable } = options;
    super({
      label,
      type: 'text',
      defaultValue,
      valueStrategy: new RawFormValueStrategy(),
      isNullable,
    });
    this.addValidator(new IsStringValidator());
  }
}

export class TextAreaField extends Field<string> {
  constructor(options: TextFieldOptions) {
    const { label, defaultValue = '', isNullable } = options;
    super({
      label,
      type: 'text-area',
      defaultValue,
      valueStrategy: new RawFormValueStrategy(),
      isNullable,
    });
    this.addValidator(new IsStringValidator());
  }
}
