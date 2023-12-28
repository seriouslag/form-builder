import { FieldOptions } from './index';
import { Field, FieldState } from './Field';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 } from 'uuid';

export interface RowActionDetail {
  cancelText?: string;
  title?: string;
  modalText?: string;
}

export interface ModifyRowDetail extends RowActionDetail {
  confirmText: string;
}

export interface AddRowDetails extends ModifyRowDetail {
  addText: string;
}
export type ViewRowDetails = RowActionDetail;
export interface DeleteRowDetails extends ModifyRowDetail {
  showConfirmationModal?: boolean;
}
export type EditRowDetails = ModifyRowDetail;

export interface MultiTableActions {
  addRow?: AddRowDetails;
  editRow?: EditRowDetails;
  viewRow?: ViewRowDetails;
  deleteRow?: DeleteRowDetails;
}

export interface MultiTableDefinition {
  id: string;
  header: string;
  fieldBuilder: () => Field<any>;
}

export interface MultiTableOptions {
  tableType: 'inline' | 'modal';
  maxRows?: number;
  // minRows: number;
  actions: MultiTableActions;
  definition: Array<MultiTableDefinition>;
}

export interface MultiTableFieldOptions<T> extends FieldOptions<T> {
  defaultValue: T;
}

export type MultiTableRow<T = any> = {
  fields: Array<{
    name: string;
    value: T;
  }>;
  id: string;
}

export class MultiTableField<T> extends Field<T> {
  private readonly options$: BehaviorSubject<MultiTableOptions>;
  private readonly _rows: MultiTableRow[] = [];
  private readonly rows$: BehaviorSubject<MultiTableRow[]> = new BehaviorSubject(this._rows);

  constructor(options: MultiTableOptions, fieldOptions: MultiTableFieldOptions<T>) {
    const { label, defaultValue, isNullable } = fieldOptions;
    super({
      label,
      type: 'multi-table',
      defaultValue,
      valueStrategy: {
        getValue: (_state: FieldState<T>) => {
          const formValue: any = [];
          this._rows.forEach((row) => {
            const rowValue = {} as any;
            Object.entries(row.fields).forEach(([name, value]) => {
              rowValue[name] = value;
            });
            formValue.push(rowValue);
          });
          return formValue;
        },
      },
      isNullable,
    });

    this.options$ = new BehaviorSubject(options);
  }

  public get options(): Observable<MultiTableOptions> {
    return this.options$.asObservable();
  }

  public get rows(): Observable<MultiTableRow[]> {
    return this.rows$.asObservable();
  }

  public addRow(fields: {
    name: string;
    value: string;
  }[]) {
    const maxRows = this.options$.getValue().maxRows;
    if (maxRows && this._rows.length >= maxRows) {
      throw new Error(`Cannot add over limit: ${maxRows}`);
    }
    this._rows.push({
      fields,
      id: v4(),
    });
    this.notifyRows();
  }

  public updateRow(index: number, fields: Array<{
    name: string,
    value: string,
  }>) {
    const row = this._rows[index];
    if (!row) {
      throw new Error('Cannot update row: Row not found!');
    }
    row.fields = fields;
    this.notifyRows();
  }

  public removeRow(index: number) {
    this._rows.splice(index, 1);
    this.notifyRows();
  }

  private notifyRows() {
    const value = {} as any;
    this._rows.forEach(({ id, fields }) => {
      value[id] = fields;
    });
    this.value = value;
    this.rows$.next([...this._rows]);
  }
}
