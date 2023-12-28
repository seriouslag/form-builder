
// polyfills
import 'reflect-metadata';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { Preview } from "@storybook/react";
import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ModalContainer, ModalService } from "../src/other";
import {
  ReactFieldResolver,
  NuTextField,
  NuNumberField,
  NuRadioGroupField,
  NuSwitchGroupField,
  Field,
  NuFormComponent,
  NuCheckboxGroupField,
  NuCheckboxField,
  NuSwitchField,
  NuDateField,
  NuTextAreaField,
  NuMultiTableField,
} from "../src";

import { container } from "tsyringe";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// setting up dependency injection
const modalService = new ModalService();

/** Register components for form creation */
const fieldResolver = new ReactFieldResolver<any>();
console.info('registering form components');
fieldResolver
  .register('text', NuTextField)
  .register('text-area', NuTextAreaField)
  .register('string', NuTextField)
  .register('number', NuNumberField)
  .register('integer', NuNumberField)
  .register('radio', NuRadioGroupField)
  .register('checkbox', NuCheckboxField)
  .register('checkbox-group', NuCheckboxGroupField)
  .register('switch', NuSwitchField)
  .register('switch-group', NuSwitchGroupField)
  .register('multi-table', NuMultiTableField)
  .register('date', NuDateField);
console.info('registered form components');

container
  .register(ReactFieldResolver, {
    useValue: fieldResolver,
  })
  .register(ModalService, {
    useValue: modalService,
  });

const theme = createTheme();

/** Adds MUI theme to the story and adds localization for MUI date pickers */
const ThemeDecorator = (Story: any) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {Story()}
    </LocalizationProvider>
  </ThemeProvider>
);

/** Adds global drawer container for a story */
const DrawerContainerDecorator = (Story: any) => (
  <React.Fragment>
    {Story()}
    <ModalContainer modalService={modalService} />
  </React.Fragment>
);

/** Decorator to run code before a story loads and when a story is unloading */
const GlobalStoryEffectDecorator = (Story: any) => {
  const thingsToDoBeforeAStoryLoads = () => {
    // add code that will run before a new story loads
  };

  const thingsToDoWhenAStoryIsChanged = () => {
    // close any open modal
    modalService.closeModal();
  }

  React.useEffect(() => {
    thingsToDoBeforeAStoryLoads();
    return () => {
      thingsToDoWhenAStoryIsChanged();
    }
  }, []);
  return Story();
};

/** Add decorators to all stories */
const decorators = [
  ThemeDecorator,
  DrawerContainerDecorator,
  GlobalStoryEffectDecorator,
];


const preview: Preview = {
  decorators,
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
