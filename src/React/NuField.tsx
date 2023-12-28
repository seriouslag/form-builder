import * as React from 'react';
import { Field } from '../Fields/Field';
import { NuFormFieldProps, NuFormComponent } from './NuForm';

export const NuField: React.FC<NuFormFieldProps<any>> = <Type,>({ field, fieldResolver, name }: NuFormFieldProps<Type>) => {

  const [ResolvedComponent, setComponent] = React.useState<{
    Component: NuFormComponent<Field<Type>> | null;
  }>({
    Component: fieldResolver.resolve(field.type),
  });

  React.useEffect(() => {
    setComponent({
      Component: fieldResolver.resolve(field.type),
    });
  }, [field.type]);

  if (!ResolvedComponent.Component) {
    console.warn(`Could not resolve component: ${field.type}`, ResolvedComponent.Component);
    return null;
  }

  return (
    <>
      <ResolvedComponent.Component field={field} name={name} />
    </>
  );
};
