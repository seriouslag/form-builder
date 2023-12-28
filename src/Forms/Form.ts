import {
  BehaviorSubject, map, Observable, mergeMap, combineLatest, of, shareReplay,
} from 'rxjs';
import { MapToRecord, RemoveUndefinedKeys } from '../Utils';
import { Field } from '../Fields/Field';
import { FormValidatorStrategy } from '../ValidatorStrategies';
import { v4 } from 'uuid';

export type FormSchema<T = any> = Record<string, T>;

export type BaseSchema = FormSchema;
export type ValueOf<T> = T[keyof T];
export type SchemaField<Schema extends BaseSchema, FormValue = any, Type
  extends Pick<ValueOf<Schema>, Name> = ValueOf<Schema>, Name extends keyof Schema = keyof Schema> = Field<Type, FormValue>;

export interface FormOptions {
  strictMode?: boolean;
  name?: string
}

export class BaseForm<Schema extends BaseSchema> {
  private readonly _fields = new Map<keyof Schema, SchemaField<Schema>>();
  private readonly _$fields: BehaviorSubject<
    Map<keyof Schema, SchemaField<Schema>>
  > = new BehaviorSubject(this._fields);

  private readonly _name: string;
  public readonly uuid = v4();
  private readonly strictMode: boolean;

  public $value: Observable<Record<Partial<keyof Schema>, ValueOf<Schema>>> =
    this._$fields.pipe(
      // map to entries of fields
      map((fields) => Array.from(fields.entries())),
      // merge to the combined latest values of every fields value
      mergeMap((fieldEntries) => {
        const formValues = fieldEntries.map(([name, field]) =>
          field.$formValue.pipe(
            map((value): [keyof Schema, ValueOf<Schema>] => [name, value])
          )
        );
        return combineLatest(formValues);
      }),
      // map latest values back to an object
      mergeMap((formValues) => {
        const entries = Object.fromEntries(formValues) as Record<
          keyof Schema,
          ValueOf<Schema>
        >;
        return of(entries);
      }),
      // remove undefined values from form
      map((formValues) => RemoveUndefinedKeys(formValues)),
      shareReplay(1)
    );

  public $state = this._$fields.pipe(
    // map to entries of fields
    map((fields) => Array.from(fields.entries())),
    // merge to the combined latest values of every fields value
    mergeMap((fieldEntries) => {
      const formValues = fieldEntries.map(([name, field]) =>
        field.$state.pipe(map((state) => [name, state]))
      );
      return combineLatest(formValues);
    }),
    // map latest values back to an object
    mergeMap((formValues) => of(Object.fromEntries(formValues)))
  );

  constructor(
    private readonly formValidatorStrategy: FormValidatorStrategy<
      ValueOf<Schema>,
      keyof Schema
    >,
    readonly options?: FormOptions
  ) {
    this._name = options?.name ?? v4();
    this.strictMode = Boolean(options?.strictMode);
  }

  public destroy() {
    this._fields.forEach((field) => field.destroy());
    this._$fields.complete();
  }

  /**
   * Validates all the fields of the form
   */
  public async validate(): Promise<Record<keyof Schema, boolean>> {
    const fields = this._fields;
    return await this.formValidatorStrategy.validate(fields);
  }

  /**
   * Registers a field to the form linked by the name
   * @param name Name of the field
   * @param field Field to be registered under provided name
   * @returns {this}
   */
  public addField<
    T extends Extract<ValueOf<Schema>, Schema[Name]>,
    Name extends keyof Schema,
    FormValue
  >(
    name: Name,
    field: Field<T, FormValue>
  ): BaseForm<
    Schema & {
      [key in Name]: T;
    }
  > {
    const hasKey = this._fields.has(name);
    if (this.strictMode && hasKey) {
      throw new Error(
        `Field with name ( ${String(name)} ) already present on form ( ${
          this.name
        } )`
      );
    }

    this._fields.set(name, field);
    this._$fields.next(this._fields);
    return this as unknown as BaseForm<
      Schema & {
        [key in Name]: T;
      }
    >;
  }

  /**
   * Removes a field to the form by the name
   * @param name Name of the field
   * @returns {this}
   */
  public removeField<Name extends keyof Schema>(name: Name): this {
    this._fields.delete(name);
    this._$fields.next(this._fields);
    return this;
  }

  /**
   * Removes all fields from form
   * @returns {this}
   */
  public removeFields(): this {
    this._fields.forEach((_, key) => this._fields.delete(key));
    this._$fields.next(this._fields);
    return this;
  }

  /** reactive list of fields registered to the form */
  get $fields(): Observable<Record<string, SchemaField<Schema>>> {
    return this._$fields.asObservable().pipe(map(MapToRecord));
  }

  /** list of fields registered to the form, non-reactive */
  get fields(): Record<keyof Schema, SchemaField<Schema>> {
    const acc = {} as Record<keyof Schema, SchemaField<Schema>>;
    Array.from(this._$fields.getValue().entries()).forEach(([name, value]) => {
      acc[name] = value;
    });
    return acc;
  }

  /** Name of the form */
  get name() {
    return this._name;
  }

  /**
   * Returns a registered field from the supplied fieldName
   * @param fieldName name of field
   */
  public get(fieldName: keyof Schema): SchemaField<Schema> | undefined {
    const field = this._fields.get(fieldName);
    if (!field && this.strictMode) {
      console.error(`Field, ${String(fieldName)}, not found`);
    }
    return field;
  }

  public reset() {
    this._fields.forEach((field) => field.reset());
  }
}
