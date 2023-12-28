import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import Ajv, { JSONSchemaType } from 'ajv';
import { container } from 'tsyringe';
import { ReactFieldResolver } from '../ReactFieldResolver';
import { AjvForm } from '../Forms/Ajv';
import { NuAutoForm, NuFormProps } from '../React/NuForm';
import { firstValueFrom } from 'rxjs';
import { Button } from '@mui/material';

export default {
  title: 'Core/Form/AjvForm',
  component: NuAutoForm,
} as Meta<typeof NuAutoForm>;

const ajv = new Ajv();

// look in preview.tsx for the fieldResolver and fields registration
const fieldResolver = container.resolve(ReactFieldResolver);

interface MyData {
  firstName: string;
  lastName?: string;
  workExperience: number;
}

const schema: JSONSchemaType<MyData> = {
  $async: true,
  title: 'Guest',
  type: 'object',
  properties: {
    firstName: { type: 'string', title: 'First Name', default: 'John' },
    lastName: { type: 'string', title: 'Last Name', default: 'Doe', nullable: true },
    workExperience: {
      title: 'Work Experience',
      description: 'Work experience in years',
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
  },
  required: ['firstName', 'workExperience'],
};

const form = new AjvForm(ajv, schema);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const v = await form.validate();
  if (!Object.values(v).some((a) => a === false)) {
    console.log("submit - validation result:", v, e);
    const result = await firstValueFrom(form.$value);
    console.log("form values:", result);
  } else {
    console.warn("form submit error", v);
  }
};

const Template: StoryFn<typeof NuAutoForm> = (args: NuFormProps<any>) => (
  <form onSubmit={handleSubmit}>
    <NuAutoForm {...args} form={form} fieldResolver={fieldResolver} />
    <Button type="submit">Submit</Button>
  </form>
);

export const Primary = Template.bind({});

Primary.args = {};
