import { SwitchProps, Switch, FormControlLabel } from '@mui/material';
import * as React from 'react';
import { SwitchLikeField } from '../Fields';
import { NuFormComponent, useField } from './NuForm';

export const NuSwitchField: NuFormComponent<SwitchLikeField> = ({ field, name }) => {
  const { state, validate, handleFocus } = useField(field);


  const handleChange = async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    field.value = {
      ...field.value,
      checked,
    };
    await validate();
  };

  const switchFieldProps: SwitchProps = {
    name,
    color: 'primary',
    disabled: state.disabled,
    ...field.value
  };

  return (
    <FormControlLabel
      onFocus={() => handleFocus()}
      control={
        <Switch
          {...switchFieldProps}
          onFocus={() => handleFocus()}
          onChange={(e, checked) => handleChange(e, checked)}
        />
      }
      label={state.label}
    />
  );
};
