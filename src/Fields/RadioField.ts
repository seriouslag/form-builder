import { FieldOptions } from './index';
import { Field, RawFormValueStrategy } from './Field';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RadioFieldOptions extends FieldOptions<string> {
  defaultValue: string;
  options: Record<string, string>;
}

export class RadioField extends Field<string> {

  private readonly _$options: BehaviorSubject<Record<string, string>>;

  constructor(radioOptions: RadioFieldOptions) {
    const { label, defaultValue, isNullable, options } = radioOptions;
    super({
      label,
      type: 'radio',
      defaultValue,
      valueStrategy: new RawFormValueStrategy(),
      isNullable,
    });
    this._$options = new BehaviorSubject(options);
  }

  get $options(): Observable<Record<string, string>> {
    return this._$options.asObservable();
  }

  public destroy(): void {
    super.destroy();
    this._$options.complete();
  }
}
