import { BehaviorSubject, Observable } from 'rxjs';
import Ajv, { JSONSchemaType } from 'ajv';
import { v4 } from 'uuid';
import { SwitchLikeGroupValue } from '../Fields';

export type AsyncValidator<T = unknown> = (data: T) => Promise<boolean>;
export type SyncValidator<T = unknown> = (data: T) => boolean;

export type ValidatorErrorMessage<T> = string | ((data: T | undefined) => string);

export class Validator<T = unknown> {
  private readonly _uuid = v4();
  private readonly $validatorSubject: BehaviorSubject<SyncValidator<T> | AsyncValidator<T>>;
  protected errorMessage: string | ((data: T | undefined) => string) = 'Invalid input data';
  private isValidating = false;
  private currentAction: Promise<boolean> | null = null;
  private preValue: T | undefined = undefined;

  constructor(validatorFunction: SyncValidator<T> | AsyncValidator<T>, errorMessage?: ValidatorErrorMessage<T>) {
    this.$validatorSubject = new BehaviorSubject(validatorFunction);
    this.errorMessage = errorMessage || this.errorMessage;
  }

  public async validate(data: T): Promise<{
    isValid: boolean;
    errorMessage: string;
  }> {
    const validator = this.$validatorSubject.getValue();
    if (this.isValidating && this.currentAction && this.preValue === data) {
      return {
        isValid: await this.currentAction,
        errorMessage: this.getErrorMessage(this.preValue),
      };
    }
    this.preValue = data;
    this.isValidating = true;
    try {
      const currentAction = await validator(data);
      return {
        isValid: currentAction,
        errorMessage: this.getErrorMessage(data),
      };
    } finally {
      this.isValidating = false;
      this.currentAction = null;
    }
  }

  get $validator(): Observable<SyncValidator<T> | AsyncValidator<T>> {
    return this.$validatorSubject.asObservable();
  }

  get uuid() {
    return this._uuid;
  }

  private getErrorMessage(data: T | undefined): string {
    if (typeof this.errorMessage === 'function') {
      return this.errorMessage(data);
    }
    return this.errorMessage;
  }
}

export class RequiredValidator<T> extends Validator<T> {
  constructor(errorMessage?: ValidatorErrorMessage<T>) {
    const requiredFunction = (data: T) => {
      if (data as unknown === '') {
        return false;
      }
      if (data === null || data === undefined) {
        return false;
      }
      return true;
    };
    super(requiredFunction, errorMessage ?? 'This field is required');
  }
}

export class IsStringValidator extends Validator<string> {
  constructor(errorMessage?: ValidatorErrorMessage<string>) {
    const isStringFunction = (data: string) => typeof data === 'string';
    const errorFunction = (data?: string) => `${data} is not a valid string`;
    super(isStringFunction, errorMessage ?? errorFunction);
  }
}

export class IsNumberValidator extends Validator<number> {
  constructor(errorMessage?: ValidatorErrorMessage<number>) {
    const isNumberFunction = (data: number) => !Number.isNaN(data);
    const errorFunction = (data?: number) => `${data} is not a valid number`;
    super(isNumberFunction, errorMessage ?? errorFunction);
  }
}

export class MinValidator extends Validator<number> {
  constructor(minimum: number, errorMessage?: ValidatorErrorMessage<number>) {
    const minimumFunction = (data: number) => data >= minimum;
    const errorFunction = (data?: number) => `${data} is less than minimum: ${minimum}`;
    super(minimumFunction, errorMessage ?? errorFunction);
  }
}

export class MaxValidator extends Validator<number> {
  constructor(maximum: number, errorMessage?: ValidatorErrorMessage<number>) {
    const maximumFunction = (data: number) => data <= maximum;
    const errorFunction = (data?: number) => `${data} is greater than maximum: ${maximum}`;
    super(maximumFunction, errorMessage ?? errorFunction);
  }
}

export class MinStringValidator extends Validator<string> {
  constructor(minimum: number, errorMessage?: ValidatorErrorMessage<string>) {
    const minimumFunction = (data: string) => data.length >= minimum;
    const errorFunction = (data?: string) => `${data} is less than minimum: ${minimum}`;
    super(minimumFunction, errorMessage ?? errorFunction);
  }
}

export class MaxStringValidator extends Validator<string> {
  constructor(maximum: number, errorMessage?: ValidatorErrorMessage<string>) {
    const maximumFunction = (data: string) => data.length <= maximum;
    const errorFunction = (data?: string) => `${data} is greater than maximum: ${maximum}`;
    super(maximumFunction, errorMessage ?? errorFunction);
  }
}

export class RangeValidator extends Validator<number> {
  constructor(minimum: number, maximum: number, errorMessage?: ValidatorErrorMessage<number>) {
    const rangeFunction = (data: number) => data >= minimum && data <= maximum;
    const errorFunction = (data?: number) => `${data} is not in range: ${minimum} - ${maximum}`;
    super(rangeFunction, errorMessage ?? errorFunction);
  }
}

export class AjvValidator<T, K> extends Validator<K> {

  constructor(ajv: Ajv, schema: JSONSchemaType<T>, errorMessage?: ValidatorErrorMessage<K>) {
    const errorFunction = (data?: K) => `${String(data)} is not valid`;

    const ajvFunction = async (data: K) => {
      const validator = ajv.compile(schema);
      try {
        const key = Object.keys(schema.properties)[0];
        const formattedData = {
          [key]: data,
        };
        return await validator(formattedData);
      } catch (err) {
        if (!(err instanceof Ajv.ValidationError)) {
          throw err;
        }
        this.errorMessage = err.errors[0].message ?? errorFunction;
        // data is invalid
        return false;
      }
    };
    super(ajvFunction, errorMessage ?? errorFunction);
  }
}

export class MinObjectPropertyLengthValidator<GroupSchema extends SwitchLikeGroupValue> extends Validator<GroupSchema> {
  constructor(minimum: number, errorMessage?: ValidatorErrorMessage<GroupSchema>) {
    const minimumLengthFunction = (field: GroupSchema) => Object.keys(field).length > minimum;
    const errorFunction = (field?: GroupSchema) => `${field ? Object.keys(field).length : field} is less than the minimum: ${minimum}`;
    super(minimumLengthFunction, errorMessage ?? errorFunction);
  }
}

export class MaxObjectPropertyLengthValidator<GroupSchema extends SwitchLikeGroupValue> extends Validator<GroupSchema> {
  constructor(maximum: number, errorMessage?: ValidatorErrorMessage<GroupSchema>) {
    const maximumLengthFunction = (field: GroupSchema) => Object.keys(field).length < maximum;
    const errorFunction = (field?: GroupSchema) => `${field ? Object.keys(field).length : field} is greater than the maximum: ${maximum}`;
    super(maximumLengthFunction, errorMessage ?? errorFunction);
  }
}
