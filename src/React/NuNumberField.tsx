import { TextField, TextFieldProps } from '@mui/material';
import * as React from 'react';
import { Field } from '../Fields/Field';
import { NuFormComponent, useField } from './NuForm';

export const NuNumberField: NuFormComponent<Field<number>> = ({ field }) => {
  const { state, handleFocus, validate } = useField(field);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    field.value = Number(event.target.value);
    await validate();
  };

  const textFieldProps: TextFieldProps = {
    type: 'number',
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
      onChange={(e) => handleChange(e)}
      onFocus={() => handleFocus()}
    />
  );
};
