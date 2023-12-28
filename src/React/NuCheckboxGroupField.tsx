import { RadioProps, FormLabel } from '@mui/material';
import * as React from 'react';
import { CheckboxField, CheckboxGroupField } from '../Fields';
import { NuFormComponent, useField, useRx } from './NuForm';
import FormGroup, { FormGroupProps } from '@mui/material/FormGroup';
import { NuCheckboxField } from './NuCheckboxField';

export const NuCheckboxGroupField: NuFormComponent<CheckboxGroupField<any>> = (props) => {

  const { field, name } = props;
  const { state } = useField(field);

  /** Props to be passed into each MUI checkbox option */
  const checkboxFieldProps: RadioProps = {
    color: 'primary',
  };

  /** Props to be passed into the MUI form group */
  const checkboxGroupProps: FormGroupProps = {};

  const options = useRx(field.$options, {} as Record<string, CheckboxField>);

  const fieldLabelId = `nuform-${name}-${field.uuid}`;

  return (
    <>
      <FormLabel id={fieldLabelId}>{state.label}</FormLabel>
      <FormGroup
        {...checkboxGroupProps}
      >
        {Object.entries(options).map(([checkboxName, checkboxField]) => (
          <NuCheckboxField
            {...checkboxFieldProps}
            key={`${fieldLabelId}-checkbox_group-${name}-${checkboxName}`}
            field={checkboxField}
            name={checkboxName}
          />
        ))}
      </FormGroup>
    </>
  );
};
