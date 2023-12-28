import { Field } from '../Fields/Field';
import { FormValidatorStrategy } from '../ValidatorStrategies';
import { BaseForm, FormOptions, FormSchema } from './Form';

export class NuFormLogic<T extends FormSchema = any> extends BaseForm<T> {
  constructor(options?: FormOptions) {
    super(new DefaultFormValidatorStrategy(), options);
  }
}

export class DefaultFormValidatorStrategy<FieldValueType, K extends string | number | symbol> implements FormValidatorStrategy<FieldValueType, K> {
  public async validate(fields: Map<K, Field<FieldValueType>>) {
    const tasks = Array.from(fields.entries()).map(async ([name, field]) => {
      const validationResult = await field.validate();
      return {
        name,
        validationResult,
      };
    });
    const results = await Promise.all(tasks);
    const response = results.reduce((acc, result) => {
      const { name, validationResult } = result;
      acc[name] = validationResult;
      return acc;
    }, {} as Record<K, boolean>);
    return response;
  }
}
