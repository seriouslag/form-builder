import * as React from 'react';
import { Subscription, Observable } from 'rxjs';
import { ReactFieldResolver } from '../ReactFieldResolver';
import { Field, FieldState } from '../Fields/Field';
import { BaseForm, BaseSchema, ValueOf } from '../Forms/Form';
import { NuField } from './NuField';
import { Stack } from '@mui/system';

export interface ValueField<T extends Field<K> = any, K = any> {
  name: string;
  field: T;
}

export type NuFormComponent<T extends Field<K> = any, K = any> = React.FC<ValueField<T, K>>;

export interface NuFormProps<T extends BaseSchema> {
  form: BaseForm<T>;
  fieldResolver: ReactFieldResolver;
  debug?: boolean;
}

export interface FormState<Type> {
  fields: {
    field: Field<Type>,
    name: string;
  }[];
}

export interface NuFormFieldProps<Type> {
  fieldResolver: ReactFieldResolver;
  field: Field<Type>;
  name: string;
}


/**
 * Subscribes to a observable, and reactively updates returned value; unsubscribes on component unmount
 * @param observable 
 * @param defaultValue 
 * @returns 
 */
export const useRx = <T,>(observable: Observable<T>, defaultValue: T) => {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    const sub = observable
      .subscribe((v) => setValue(v));
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return value;
};

export const useField = <Type, FormValue,>(field: Field<Type, FormValue>) => {
  const state = useRx(field.$state, {
    type: '',
    value: undefined,
    label: '',
    isValid: true,
    errors: [],
    isValidating: false,
    disabled: true,
  } as FieldState<Type | undefined>);
  const [dirty, setDirty] = React.useState(false);

  const handleFocus = () => {
    setDirty(true);
  };

  const validate = async () => {
    if (dirty) {
      return await field.validate();
    }
    return true;
  };

  return {
    state: { ...state },
    handleFocus,
    validate,
  };
};

export const NuAutoForm = <T extends BaseSchema>(props: NuFormProps<T>) => {

  const [getFields, setFields] = React.useState({
    fields: [],
  } as FormState<T[keyof T]>);

  const [values, setValues] = React.useState([] as [string, FieldState<ValueOf<T>>][]);

  const { form, fieldResolver, debug } = props;

  const subs: Subscription[] = [];

  React.useEffect(() => {
    // Unsubscribe from previous subscriptions if form changes
    if (subs.length) {
      subs.forEach((sub) => sub.unsubscribe());
    }
    subs.push(
      form.$state.subscribe((value: Record<string, FieldState<ValueOf<T>>>) => {
        setValues(Object.entries(value));
      })
    );
    subs.push(
      form.$fields.subscribe((fields) => {
        const fieldEntries = Object.entries(fields);
        setFields({
          fields: fieldEntries.map(([name, field]) => ({
            name,
            field,
          })),
        });
      })
    );

    return () => {
      subs.forEach((sub) => sub.unsubscribe());
    };
  }, [form]);

  const debugDiv = debug ?
    <div className="debug-section">
      <div>**** Debug {form.name} ****</div>
      {values.map(([name, value]) => {
        return <div key={`${form.name}-${name}`}><span>{name}: </span> <span>{JSON.stringify(value)}</span></div>;
      })}
      <div>**** End Debug {form.name} ****</div>
    </div> : <></>;

  return (
    <>
      <Stack
        spacing={2}
      >
        {
          getFields.fields.map(({ field, name }) => {
            return (
              <NuField key={`${form.name}-${field.uuid}`} field={field} name={name} fieldResolver={fieldResolver} />
            );
          })
        }
      </Stack>
      {debugDiv}
    </>
  );
};
