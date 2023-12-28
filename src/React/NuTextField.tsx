import { TextField, TextFieldProps } from '@mui/material';
import * as React from 'react';
import { Field } from '../Fields/Field';
import { NuFormComponent, useField } from './NuForm';

export const NuTextField: NuFormComponent<Field<string>> = (props) => {

  const { field } = props;
  const { state, validate, handleFocus } = useField(field);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    field.value = event.target.value;
    await validate();
  };

  const textFieldProps: TextFieldProps = {
    type: 'text',
    color: 'primary',
    label: state.label,
    value: field.value,
    helperText: state.errors.join(', '),
    disabled: state.disabled,
  };

  if (state.errors.length > 0) {
    textFieldProps.error = true;
  }

  return (
    <TextField
      {...textFieldProps}
      onFocus={() => handleFocus()}
      onChange={(e) => handleChange(e)} />
  );
};
