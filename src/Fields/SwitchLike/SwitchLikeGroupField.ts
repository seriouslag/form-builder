import { CheckboxField, SwitchField, SwitchLikeField, SwitchLikeFieldOptions, SwitchLikeValue } from './SwitchLikeField';
import { FieldOptions, MultiField } from '../index';
import { RemoveUndefinedKeys } from '../../Utils/RemoveUndefinedKeys';
import { map, Subscription, mergeMap, combineLatest } from 'rxjs';

export interface SwitchLikeGroupValue {
  [name: string]: SwitchLikeValue;
}

export type SwitchLikeGroupRecord<Schema extends SwitchLikeGroupValue, FieldType extends SwitchLikeField> = Record<keyof Schema, FieldType>;

export interface SwitchLikeGroupFieldOptions<Schema extends SwitchLikeGroupValue, FieldType extends SwitchLikeField> extends FieldOptions<Schema> {
  options: Record<keyof Schema, SwitchLikeFieldOptions | FieldType>;
}

export class SwitchLikeGroupField<GroupSchema extends SwitchLikeGroupValue, FieldType extends SwitchLikeField>
  extends MultiField<SwitchLikeGroupRecord<GroupSchema, FieldType>, GroupSchema> {

  private optionsSub: Subscription;

  constructor(
    type: string,
    private readonly SwitchLikeConstructor: new (options: SwitchLikeFieldOptions) => FieldType,
    readonly switchLikeGroupOptions: SwitchLikeGroupFieldOptions<GroupSchema, FieldType>,
  ) {
    const { label, defaultValue = {} as GroupSchema, isNullable, options } = switchLikeGroupOptions;
    super({
      label,
      type,
      defaultValue,
      valueStrategy: {
        getValue: (): GroupSchema => {
          const formValue = {} as Record<string, 'checked'>;
          Object.entries(this.options).forEach(([_name, val]) => {
            const fieldName = val.value.value;
            const fieldValue = val.value.checked ? 'checked' : undefined;
            if (fieldValue) {
              formValue[fieldName] = fieldValue;
            }
          });
          // remove undefined values from group values
          const cleanedValue = RemoveUndefinedKeys(formValue);
          return cleanedValue as unknown as GroupSchema;
        }
      },
      isNullable,
    });
    const formedOptions = this.createSwitchLikeFromOptions(options);

    this.optionsSub = this.$options.pipe(
      // map to entries of fields
      map((options) => Array.from(Object.entries(options))),
      // merge to the combined latest values of every fields value
      mergeMap((entries) => {
        const groupValues = entries.map(([name, field]) => field.$formValue.pipe(map((value) => [
          name, value,
        ])));
        return combineLatest(groupValues);
      }),
      // map latest values back to an object
      map((formValues) => Object.fromEntries(formValues)),
    ).subscribe((value) => {
      // update value when options value change
      this.value = value;
    });
    for (const [name, value] of Object.entries(formedOptions)) {
      this.addOption(name, value);
    }
  }

  public destroy(): void {
    // unsubscribe from options sub
    this.optionsSub.unsubscribe();
    // run super destroy
    super.destroy();
  }

  private createSwitchLikeFromOptions(options: SwitchLikeGroupFieldOptions<GroupSchema, FieldType>['options']): Record<keyof GroupSchema, FieldType> {
    const mappedOptionEntries = Object.entries(options).map(([name, option]) => [name, this.createSwitchLikeFieldFromOptions(option)]);
    const reformedOptions: Record<keyof GroupSchema, FieldType> = Object.fromEntries(mappedOptionEntries);
    return reformedOptions;
  }

  private createSwitchLikeFieldFromOptions(options: FieldType | SwitchLikeFieldOptions): FieldType {
    if ('destroy' in options) {
      return options;
    }
    const field = new this.SwitchLikeConstructor(options);
    return field;
  }

  public override addOption(name: keyof GroupSchema, option: FieldType | SwitchLikeFieldOptions) {
    const mappedOption = this.createSwitchLikeFieldFromOptions(option);
    return super.addOption(name, mappedOption);
  }
}

export class CheckboxGroupField<GroupSchema extends SwitchLikeGroupValue> extends SwitchLikeGroupField<GroupSchema, CheckboxField> {
  constructor(checkboxGroupFieldOptions: SwitchLikeGroupFieldOptions<GroupSchema, CheckboxField>) {
    super('checkbox-group', CheckboxField, checkboxGroupFieldOptions);
  }
}

export class SwitchGroupField<GroupSchema extends SwitchLikeGroupValue> extends SwitchLikeGroupField<GroupSchema, SwitchField> {
  constructor(switchGroupFieldOptions: SwitchLikeGroupFieldOptions<GroupSchema, SwitchField>) {
    super('switch-group', SwitchField, switchGroupFieldOptions);
  }
}
