import { BehaviorSubject, Observable, Subscription, map, shareReplay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { RequiredValidator, Validator } from '../Validators';
import { MapToRecord } from '../Utils/MapToRecord';
import { v4 } from 'uuid';
import { dequal } from 'dequal';
import { ValueOf } from '../Forms';
import { SwitchLikeValue } from './SwitchLike';

export interface FieldState<T> {
  value: T;
  label: string;
  isValid: boolean;
  errors: string[];
  isValidating: boolean;
  type: string;
  disabled: boolean;
}

export interface FormValueStrategy<FormValue, StateType = FormValue> {
  getValue: (state: FieldState<StateType>) => FormValue;
}

export class RawFormValueStrategy<Value> implements FormValueStrategy<Value, Value> {
  getValue: (state: FieldState<Value>) => Value = (state: FieldState<Value>) => state.value;
}

export class SwitchLikeValueStrategy<T extends SwitchLikeValue> implements FormValueStrategy<string | undefined, T> {
  getValue: (state: FieldState<T>) => string | undefined = (state: FieldState<T>) => {
    if (state.value.checked) {
      // default value is on as described by spec of checkboxes
      return state.value.value ?? 'on';
    }
    return undefined;
  };
}

export interface FieldOptions<StateType, FormValue> {
  readonly label: string;
  readonly type: string;
  readonly defaultValue: StateType;
  readonly valueStrategy: FormValueStrategy<FormValue, StateType>;
  readonly isNullable?: 'nullable' | 'required';
}

/**
 * Logic and state of a form field object
 */
export class Field<StateType = unknown, FormValue = StateType> {
  private readonly $validators: BehaviorSubject<Validator<StateType>[]> = new BehaviorSubject([] as Validator<StateType>[]);
  private _state: FieldState<StateType>;
  private readonly $stateSubject: BehaviorSubject<FieldState<StateType>>;

  private readonly validatorsSubscriptionMap: Map<string, Subscription> = new Map();

  private readonly _uuid: string = v4();
  private readonly validatorSubscription: Subscription;

  private readonly _$formValue: BehaviorSubject<FormValue | undefined> = new BehaviorSubject(undefined as FormValue | undefined);

  public readonly $formValue: Observable<FormValue>;

  constructor(private readonly fieldOptions: FieldOptions<StateType, FormValue>) {
    const { type, label, defaultValue, isNullable, valueStrategy } = fieldOptions;
    this._state = {
      type,
      label,
      value: defaultValue,
      isValid: true,
      errors: [],
      isValidating: false,
      disabled: false,
    };
    this.$stateSubject = new BehaviorSubject({ ...this._state });
    if (isNullable === 'required') {
      this.addValidator(new RequiredValidator<StateType>());
    }

    this.$formValue = this.$stateSubject.pipe(
      // map state to props we care to check
      map((state) => {
        return {
          value: state.value,
          disabled: state.disabled,
        };
      }),
      // perform deep check to see if form value changed
      distinctUntilChanged((pre, cur) => dequal(pre, cur)),
      // map value to Form Value
      map(() => valueStrategy.getValue(this._state)),
      // cache response
      shareReplay(1),
    );
    this.validatorSubscription = this.$validators.subscribe(async () => this.notifyState({ isValid: false }));
  }

  private notifyState(state: Partial<FieldState<StateType>>): void {
    // old state
    const oldState = this.$stateSubject.getValue();

    // build new state
    const newState = { ...this._state, ...state };

    // determine if state has changed
    const isEqual = dequal(oldState, newState);
    // return early if state has not changed
    if (isEqual) {
      return;
    }
    // update new state
    this._state = newState;
    // notify subscribers of state change
    this.$stateSubject.next({ ...this._state });
  }

  /**
   * Command to run to before losing reference
   */
  public destroy(): void {
    this.validatorSubscription.unsubscribe();
    this.$stateSubject.complete();
    this.$validators.complete();
    this.validatorsSubscriptionMap.forEach(subscription => subscription.unsubscribe());
  }

  // TODO: How to easily enable/disable/remove validators
  /**
   * Add a validator to the field
   * @param validator Validator to be added
   * @returns {this}
   */
  public addValidator(validator: Validator<StateType>): this {
    const validators = this.$validators.getValue();
    // don't add validator if it already exists
    if (validators.includes(validator)) {
      return this;
    }

    // add validator to list
    validators.push(validator);
    this.$validators.next(validators);

    // subscribe to validator's validator function
    const sub = validator.$validator
      .subscribe(async () => this.notifyState({ isValid: false }));

    this.validatorsSubscriptionMap.set(validator.uuid, sub);

    return this;
  }

  /**
   * Remove a validator from a field
   * @param validator Validator to remove
   * @returns {this}
   */
  public removeValidator(validator: Validator<StateType>): this {
    const validators = this.$validators.getValue();
    const index = validators.indexOf(validator);
    if (index === -1) {
      return this;
    }
    this.validatorsSubscriptionMap.get(validator.uuid)?.unsubscribe();
    this.validatorsSubscriptionMap.delete(validator.uuid);
    validators.splice(index, 1);
    this.$validators.next(validators);

    return this;
  }

  /**
   * @internal
   * @returns {Promise<boolean>} Promise of the results of all the validations
   */
  private async runValidators(): Promise<boolean> {
    const validators = this.$validators.getValue();
    const runningValidations = validators.map(async (validator) => {
      const result = await validator.validate(this.value);
      return result;
    });
    const results = Promise.all(runningValidations);
    const allResolved = await results;

    const allValid = allResolved.every((result) => result.isValid);
    const errors = allResolved.filter((result) => !result.isValid).map((result) => result.errorMessage);
    this.notifyState({ isValid: allValid, errors });
    return allValid;
  }

  /**
   * Runs the registered validators to determine if the current field value is valid
   */
  public async validate(): Promise<boolean> {
    // skip validation if value is undefined and field is nullable
    if (this.fieldOptions.isNullable === 'nullable' && this.value === undefined) {
      this.notifyState({ isValid: true, errors: [], });
      return true;
    }

    try {
      return await this.runValidators();
    } catch (err) {
      this._state.errors = ['Error'];
      this.notifyState({ errors: ['Error'], isValid: false });
      return false;
    }
  }

  set value(value: StateType) {
    this.notifyState({ value });
  }

  get value(): StateType {
    return this._state.value;
  }

  get formValue(): FormValue | undefined {
    return this._$formValue.getValue();
  }

  get label(): string {
    return this.$stateSubject.getValue().label;
  }

  get $state(): Observable<FieldState<StateType>> {
    return this.$stateSubject.asObservable().pipe(
      distinctUntilChanged((pre, cur) => dequal(pre, cur)),
    );
  }

  get uuid(): string {
    return this._uuid;
  }

  get type() {
    return this.$stateSubject.getValue().type;
  }

  public setDisabled(disabled: boolean) {
    this.notifyState({
      disabled,
    });
  }

  public resetValue() {
    this.value = this.fieldOptions.defaultValue;
  }

  /**
   * Reset field to defaults
   */
  public reset() {
    const errors: Array<string> = [];
    this.notifyState({
      value: this.fieldOptions.defaultValue,
      errors,
      isValid: true,
    });
  }
}

export class MultiField<T extends Record<keyof K, Field<any>>, K> extends Field<K> {
  private readonly _optionsMap: Map<keyof T, ValueOf<T>> = new Map();
  private readonly _$options: BehaviorSubject<Map<keyof T, ValueOf<T>>> = new BehaviorSubject(this._optionsMap);

  public destroy(): void {
    super.destroy();
    this._$options.complete();
  }

  get optionsLength(): number {
    return this._optionsMap.size;
  }

  /**
   * Non-reactive record of added options
   */
  get options() {
    return MapToRecord(this._$options.getValue());
  }

  get $options(): Observable<Record<keyof T, ValueOf<T>>> {
    return this._$options.pipe(map((a) => MapToRecord(a)));
  }

  public addOption(name: keyof T, option: ValueOf<T>) {
    this._optionsMap.set(name, option);
    this._notify();
    return this;
  }

  public removeOption(name: keyof T) {
    this._optionsMap.delete(name);
    this._notify();
    return this;
  }

  /**
   * @internal
   */
  private _notify() {
    this._$options.next(this._optionsMap);
  }
}
