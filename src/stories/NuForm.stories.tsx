import { Button } from '@mui/material';
import { StoryFn, Meta } from '@storybook/react';
import * as React from 'react';
import { firstValueFrom } from 'rxjs';
import { container } from 'tsyringe';
import { ReactFieldResolver } from '../ReactFieldResolver';
import { SwitchLikeValue, CheckboxField, RadioField, CheckboxGroupField, SwitchField, SwitchGroupField } from '../Fields';
import { MultiTableField } from '../Fields/MultiTableField';
import { NumberField } from '../Fields/NumberField';
import { TextField } from '../Fields/TextField';
import { NuFormLogic } from '../Forms/NuForm';
import { NuAutoForm } from '../React/NuForm';
import { MinValidator, MaxValidator, RangeValidator, RequiredValidator } from '../Validators';

export default {
  title: 'Core/Form/NuForm',
  component: NuAutoForm,
} as Meta<typeof NuAutoForm>;

// look in preview.tsx for the fieldResolver and fields registration
const fieldResolver = container.resolve(ReactFieldResolver);

type Tag = string;

type MultiTable<T> = Array<T>;

type MyForm = {
  range: number;
  min: number;
  max: number;
  required: string;
  notRequired: string;
  disabledText: string;
  radio: string;
  check: SwitchLikeValue;
  check2: {
    checkgroup1: SwitchLikeValue;
    checkgroup2: SwitchLikeValue;
    checkgroup3: SwitchLikeValue;
  };
  switch1: SwitchLikeValue;
  switch2: {
    switchgroup1: SwitchLikeValue;
    switchgroup2: SwitchLikeValue;
    switchgroup3: SwitchLikeValue;
  };
  inlineMultiTable: MultiTable<Tag>;
  modalMultiTable: MultiTable<Tag>;
}

const form = new NuFormLogic<MyForm>({
  name: 'form',
  strictMode: true,
});

form.addField('required', new TextField({
  label: 'Required',
  defaultValue: 'Required',
  isNullable: 'required',
}));

form.addField('notRequired', new TextField({
  label: 'Not Required',
  defaultValue: '',
  isNullable: 'nullable',
}));

form.addField('range', new NumberField({
  label: 'Range',
}).addValidator(new RangeValidator(0, 5)));

form.addField('max', new NumberField({
  label: 'Maximum',
  defaultValue: 0,
}).addValidator(new MaxValidator(5)));

form.addField('min', new NumberField({
  label: 'Minimum',
  defaultValue: 0,
}).addValidator(new MinValidator(10)));


const inlineMultiTable = new MultiTableField({
  tableType: 'inline',
  maxRows: 5,
  definition: [
    {
      id: 'firstName',
      header: 'First name',
      fieldBuilder: () => {
        const field = new TextField({
          label: 'First name',
          defaultValue: '',
        });
        field.addValidator(new RequiredValidator());
        return field;
      }
    }
  ],
  actions: {
    addRow: {
      title: 'Modal title - add row',
      addText: 'Add',
      modalText: 'This is the modal text',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    },
    editRow: {
      title: 'Modal title - edit row',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      modalText: 'This is the modal text',
    },
    deleteRow: {
      title: 'Modal title - delete row',
      showConfirmationModal: true,
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      modalText: 'This is the modal text',
    },
    viewRow: {
      title: 'Modal title - view row',
      cancelText: 'Close',
      modalText: 'This is the modal text',
    },
  }
}, {
  label: 'inline - Multi Table',
  defaultValue: [] as Tag[],
});
form.addField('inlineMultiTable', inlineMultiTable);

const modalMultiTable = new MultiTableField({
  tableType: 'modal',
  maxRows: 5,
  definition: [
    {
      id: 'firstName',
      header: 'First name',
      fieldBuilder: () => {
        const field = new TextField({
          label: 'First name',
          defaultValue: '',
        });
        field.addValidator(new RequiredValidator());
        return field;
      },
    },
    {
      id: 'lastName',
      header: 'Last name',
      fieldBuilder: () => {
        const field = new TextField({
          label: 'Last name',
          defaultValue: '',
        });
        field.addValidator(new RequiredValidator());
        return field;
      },
    },
  ],
  actions: {
    addRow: {
      title: 'Add',
      addText: 'Add',
      modalText: 'Add new name',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    },
    editRow: {
      title: 'Edit',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      modalText: 'Edit name',
    },
    deleteRow: {
      title: 'Delete',
      showConfirmationModal: true,
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      modalText: 'Are you sure you want to delete?',
    },
    viewRow: {
      title: 'Modal title - view row',
      cancelText: 'Close',
      modalText: 'This is the modal text',
    },
  }
}, {
  label: 'Modal - Multi Table',
  defaultValue: [] as Tag[],
});
form.addField('modalMultiTable', modalMultiTable);

const radioField = new RadioField({
  label: 'Radio Name',
  defaultValue: 'option1',
  options: {
    option1: 'option1',
    option2: 'option2',
  },
});

form.addField('radio', radioField);

const check = new CheckboxField({
  label: 'check',
  defaultValue: {
    value: 'check',
    checked: false
  }
});

form.addField('check', check);

const check2 = new CheckboxGroupField<MyForm['check2']>({
  label: 'Checkbox group',
  options: {
    checkgroup1: { label: 'checkgroup-1', defaultValue: { checked: true, value: 'checkgroup1' } },
    checkgroup2: { label: 'checkgroup-2', defaultValue: { checked: false, value: 'checkgroup2' } },
    checkgroup3: new CheckboxField({
      label: 'checkGroup-3',
      defaultValue: { checked: false, value: 'checkgroup3' },
    }),
  },
});

form.addField('check2', check2);

form.addField('switch1', new SwitchField({
  label: 'Switch 1',
  defaultValue: {
    value: 'switch1',
    checked: false,
  }
}));

form.addField('switch2', new SwitchGroupField<MyForm['switch2']>({
  label: 'switch 2',
  options: {
    switchgroup1: { label: 'switch-1', defaultValue: { checked: false, value: 'switch-1' } },
    switchgroup2: { label: 'switch-2', defaultValue: { checked: true, value: 'switch-2' } },
    switchgroup3: new SwitchField({
      label: 'switch-3',
      defaultValue: { checked: false, value: 'switch-3' },
    }),
  }
}));

form.addField('disabledText', new TextField({
  label: 'Disabled',
  defaultValue: 'Disabled',
  isNullable: 'required',
}));

const disabled = form.get('disabledText');
disabled?.setDisabled(true);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const v = await form.validate();
  if (!Object.values(v).some((a) => a === false)) {
    console.log('submit - validation result:', v, e);
    const result = await firstValueFrom(form.$value);
    console.log('form values:', result);
  } else {
    console.warn('form submit error', v);
  }
};

const Template: StoryFn<typeof NuAutoForm> = (args) => (
  <form onSubmit={handleSubmit}>
    <NuAutoForm {...args} form={form} fieldResolver={fieldResolver} />
    <Button type="submit">
      Submit
    </Button>
  </form>
);

export const Primary = Template.bind({});

Primary.args = {};
