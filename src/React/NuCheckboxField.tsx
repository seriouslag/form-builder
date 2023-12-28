import { CheckboxProps, Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import { SwitchLikeField } from '../Fields';
import { NuFormComponent, useField } from './NuForm';

export const NuCheckboxField: NuFormComponent<SwitchLikeField> = ({ field, name }) => {
  const { state, validate, handleFocus } = useField(field);

  const handleChange = async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    field.value = {
      ...field.value,
      checked,
    };
    await validate();
  };

  const checkboxFieldProps: CheckboxProps = {
    name,
    color: 'primary',
    ...field.value,
  };

  return (
    <FormControlLabel
      onFocus={() => handleFocus()}
      control={
        <Checkbox
          {...checkboxFieldProps}
          onFocus={() => handleFocus()}
          onChange={(e, checked) => handleChange(e, checked)}
        />
      }
      label={state.label}
      disabled={state.disabled}
    />
  );
};
