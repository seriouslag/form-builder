import { RadioProps, FormLabel } from '@mui/material';
import * as React from 'react';
import { SwitchField, SwitchGroupField } from '../Fields';
import { NuFormComponent, useField, useRx } from './NuForm';
import FormGroup, { FormGroupProps } from '@mui/material/FormGroup';
import { NuSwitchField } from './NuSwitchField';

export const NuSwitchGroupField: NuFormComponent<SwitchGroupField<any>> = (props) => {

  const { field, name } = props;
  const { state, handleFocus } = useField(field);

  /** Props to be passed into each MUI switch option */
  const switchFieldProps: RadioProps = {
    color: 'primary',
    disabled: state.disabled,
  };

  /** Props to be passed into the MUI form group */
  const switchGroupProps: FormGroupProps = {};

  const options = useRx(field.$options, {} as Record<string, SwitchField>);

  const fieldLabelId = `nuform-${name}-${field.uuid}`;

  return (
    <>
      <FormLabel id={fieldLabelId}>{state.label}</FormLabel>
      <FormGroup
        onFocus={() => handleFocus()}
        {...switchGroupProps}
      >
        {Object.entries(options).map(([switchName, switchField]) => (
          <NuSwitchField
            {...switchFieldProps}
            key={`${fieldLabelId}-switch_group-${name}-${switchName}`}
            field={switchField}
            name={switchName}
          />
        ))}
      </FormGroup>
    </>
  );
};
