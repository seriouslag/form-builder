import * as React from 'react';
import { TextField } from '@mui/material';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { Field } from '../Fields/Field';
import { NuFormComponent, useField } from './NuForm';

export const NuDateField: NuFormComponent<Field<number>> = (props) => {

  const { field } = props;
  const { state, handleFocus, validate } = useField(field);

  const handleChange = async (event: number | null) => {
    field.value = Number(event);
    await validate();
  };

  const dateFieldProps: Partial<DatePickerProps<number>> = {
    format: 'MM/dd/yyyy',
    desktopModeMediaQuery: '@media (pointer: fine)',
    label: state.label,
    disabled: state.disabled,
  };

  return (
    <DatePicker
      {...dateFieldProps}
      value={field.value}
      onChange={(e) => handleChange(e)}
      onOpen={() => handleFocus()}
    />
  );
};
