import Ajv, { JSONSchemaType } from 'ajv';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Field, NumberField, TextField } from '../Fields';
import { AjvValidator } from '../Validators';
import { BaseForm, BaseSchema, FormOptions, ValueOf } from './Form';
import { DefaultFormValidatorStrategy } from './NuForm';

export class AjvForm<Schema extends BaseSchema> extends BaseForm<Schema> {

  public destroy(): void {
    super.destroy();
    this.subs.forEach((sub) => sub.unsubscribe());
    this.subMap.forEach((sub) => sub.unsubscribe());
  }

  private readonly subs: Subscription[] = [];
  private readonly subMap = new Map<string, Subscription>();

  constructor(ajv: Ajv, schema: JSONSchemaType<Schema>, options?: FormOptions) {
    super(new DefaultFormValidatorStrategy(), options);

    for (const schemaKey of Object.keys(schema.properties)) {
      const fieldProps = schema.properties[schemaKey];

      const hasRequired = fieldProps.required && fieldProps.required.includes(schemaKey);

      const newSchema: JSONSchemaType<Schema> = {
        ...schema, properties: {
          [schemaKey]: fieldProps
        }
      };

      if (hasRequired) {
        newSchema.required = [schemaKey];
      } else {
        newSchema.required = [];
      }

      if (fieldProps.type === 'string') {
        // Schema[keyof Schema] union with strings
        const field = new TextField({
          label: fieldProps.title,
          defaultValue: fieldProps.default,
          isNullable: fieldProps.nullable ? 'nullable' : 'required',
        }).addValidator(new AjvValidator(ajv, newSchema));
        this.addField(schemaKey, field as any);
      } else if (fieldProps.type === 'integer') {
        // Schema[keyof Schema] union with number
        const field = new NumberField({
          label: fieldProps.title,
          defaultValue: fieldProps.default,
          isNullable: fieldProps.nullable ? 'nullable' : 'required',
        }).addValidator(new AjvValidator(ajv, newSchema));
        this.addToFields(schemaKey, field as any);
      } else {
        throw new Error(`Unsupported field type: ${fieldProps.type}`);
      }

      const $fieldsSub = this.$fields.pipe(distinctUntilChanged()).subscribe((fields) => {
        Object.entries(fields).forEach(([key, field]) => {
          const hasSub = this.subMap.has(key);
          if (hasSub) {
            return;
          }
          const sub = field.$state
            .pipe(
              distinctUntilChanged((pre, cur) => pre.value === cur.value)
            )
            .subscribe(async () => {
              // await this.validate()
            });
          this.subMap.set(key, sub);
        });
      });
      this.subs.push($fieldsSub);
    }
  }

  private addToFields<T extends Extract<ValueOf<Schema>, Schema[Name]>, Name extends keyof Schema, FormValue>(name: Name, field: Field<T, FormValue>) {
    super.addField(name, field);
  }
}

