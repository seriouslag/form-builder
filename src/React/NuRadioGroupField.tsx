import { RadioProps, RadioGroup, RadioGroupProps, FormControlLabel, Radio, FormLabel } from '@mui/material';
import * as React from 'react';
import { RadioField } from '../Fields';
import { NuFormComponent, useField, useRx } from './NuForm';

export const NuRadioGroupField: NuFormComponent<RadioField> = (props) => {

  const { field, name } = props;
  const { state, validate, handleFocus } = useField(field);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    field.value = event.target.value;
  };

  /** Props to be passed into each MUI radio option */
  const radioFieldProps: RadioProps = {
    color: 'primary',
    disabled: state.disabled,
  };

  /** Props to be passed into the MUI radio group */
  const radioGroupProps: RadioGroupProps = {};

  const options = useRx(field.$options, {} as Record<string, string>);

  const fieldLabelId = `nuform-${name}-${field.uuid}`;

  return (
    <>
      <FormLabel id={fieldLabelId}>{state.label}</FormLabel>
      <RadioGroup
        {...radioGroupProps}
        aria-labelledby={fieldLabelId}
        name={name}
        value={field.value}
        onChange={(e) => handleChange(e)}
        onFocus={() => handleFocus()}
      >
        {Object.entries(options).map(([label, value]) => (
          <FormControlLabel
            key={`${fieldLabelId}-${label}`} // label is an index prop which will be unique
            control={
              <Radio
                {...radioFieldProps}
                checked={field.value === value}
                value={value}
                onFocus={() => handleFocus()}
              />
            }
            label={label}
          />
        ))}
      </RadioGroup>
    </>
  );
};
