import { FieldOptions } from '../index';
import { Field, SwitchLikeValueStrategy } from '../Field';

export interface SwitchLikeValue {
  /** Value that will show on submitted forms if checked is true */
  value: string;
  /**  */
  checked: boolean;
}

export interface SwitchLikeFieldOptions<T extends SwitchLikeValue = SwitchLikeValue> extends FieldOptions<T> {
  /** Used to determine if checkbox is checked by default */
  defaultValue: T;
}

export abstract class SwitchLikeField<T extends SwitchLikeValue = SwitchLikeValue> extends Field<T, string | undefined> {
  constructor(type: string, switchLikeFieldOptions: SwitchLikeFieldOptions<T>) {
    const { label, defaultValue, isNullable = 'nullable' } = switchLikeFieldOptions;
    super({
      label,
      type,
      defaultValue,
      valueStrategy: new SwitchLikeValueStrategy<T>(),
      isNullable
    });
  }
}

export class CheckboxField extends SwitchLikeField {

  constructor(checkboxOptions: SwitchLikeFieldOptions) {
    super('checkbox', checkboxOptions);
  }
}

export class SwitchField extends SwitchLikeField {

  constructor(switchOptions: SwitchLikeFieldOptions) {
    super('switch', switchOptions);
  }
}
