import { Field } from './Fields';
import { NuFormComponent } from './React/NuForm';

// TODO: Change to be reactive
export class ReactFieldResolver<T = any> {
  private readonly componentsMap = new Map<string, NuFormComponent<Field<T>>>();

  register<F extends Field<T>>(type: string, component: NuFormComponent<F>): this {
    if (this.componentsMap.has(type)) {
      console.warn(`Component ${type} already exists; overwriting`);
    }
    this.componentsMap.set(type, component as NuFormComponent<Field<T>>);
    return this;
  }

  resolve(type: string): NuFormComponent<Field<T>> {
    const component = this.componentsMap.get(type);
    if (!component) {
      throw new Error(`Component ${type} not found`);
    }
    return component;
  }
}
