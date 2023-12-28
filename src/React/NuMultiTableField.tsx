import {
  TableRow, TableBody, TableContainer, Table, Paper, TableFooter,
  TableHead, TableCell, Button, DialogTitle, DialogContentText,
  DialogActions, DialogContent, Chip, Stack,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { container } from 'tsyringe';
import { DeleteRowDetails, ModifyRowDetail, MultiTableField, MultiTableOptions, MultiTableRow } from '../Fields';
import { ReactFieldResolver } from '../ReactFieldResolver';
import { NuAutoForm, NuFormComponent, useField, useRx } from './NuForm';
import { ButtonModal, ModalService } from '../other';
import { NuFormLogic } from '../Forms';
import { firstValueFrom } from 'rxjs';

interface EditRowProps {
  inputForm: NuFormLogic;
  editRow: ModifyRowDetail;
  field: MultiTableField<any>;
  modalService: ModalService;
  fieldResolver: ReactFieldResolver;
  rowIndex: number;
}

const EditRowModal: React.FC<EditRowProps> = (props: EditRowProps) => {
  const { inputForm, field, modalService, fieldResolver, rowIndex, editRow } = props;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = await inputForm.validate();
    if (Object.values(v).some((a) => a === false)) {
      return;
    }
    const result = await firstValueFrom(inputForm.$value);
    const entries = Object.entries(result).map(([name, value]) => ({
      name, value,
    }));
    field.updateRow(rowIndex, entries);
    modalService.closeModal();
  };
  return (
    <>
      {editRow.title ? <DialogTitle>{editRow.title}</DialogTitle> : <></>}
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {editRow.modalText ? <DialogContentText>{editRow.modalText}</DialogContentText> : <></>}
          <NuAutoForm form={inputForm} fieldResolver={fieldResolver} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modalService.closeModal()}>{editRow.cancelText}</Button>
          <Button type="submit">{editRow.confirmText}</Button>
        </DialogActions>
      </form>
    </>
  );
};

interface DeleteButtonProps {
  modalService: ModalService;
  deleteRowDetails: DeleteRowDetails;
  rowIndex: number;
  field: MultiTableField<any>
}

const DeleteButton: React.FC<DeleteButtonProps> = (props: DeleteButtonProps) => {
  const { rowIndex, deleteRowDetails, field, modalService } = props;
  const deleteModal = (deleteRowDetails: DeleteRowDetails, rowIndex: number) => {
    return (
      <div>
        <DialogContent>
          {deleteRowDetails.modalText ? <DialogContentText>{deleteRowDetails.modalText}</DialogContentText> : <></>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modalService.closeModal()}>{deleteRowDetails.cancelText}</Button>
          <Button onClick={() => {
            field.removeRow(rowIndex);
            modalService.closeModal();
          }}>{deleteRowDetails.confirmText}</Button>
        </DialogActions>
      </div>
    );
  };

  if (!deleteRowDetails) {
    return <></>;
  }
  const showDeleteConfirmation = !!deleteRowDetails?.showConfirmationModal;
  const deleteText = 'Delete';

  if (showDeleteConfirmation) {
    return (
      <ButtonModal modalType='modal' element={deleteModal(deleteRowDetails, rowIndex)} modalService={modalService}>{deleteText}</ButtonModal>
    );
  }

  return (
    <Button onClick={() => field.removeRow(rowIndex)}>
      {deleteText}
    </Button>
  );
};

export const NuMultiTableField: NuFormComponent<MultiTableField<any>> = (props) => {

  const { field } = props;
  const { state } = useField(field);

  const fieldResolver = container.resolve(ReactFieldResolver);
  const modalService = container.resolve(ModalService);

  const [options, setOptions] = useState(undefined as MultiTableOptions | undefined);
  const [inputForm] = useState(new NuFormLogic());

  const rows = useRx(field.rows, [] as MultiTableRow[]);

  useEffect(() => {
    const optionsSub = field.options
      .subscribe((opts) => {
        // remove all fields before setting fields
        inputForm.removeFields();
        opts.definition.forEach((def) => inputForm.addField(def.id, def.fieldBuilder()));
        setOptions(opts);
      });

    return () => {
      optionsSub.unsubscribe();
      inputForm.destroy();
    };
  }, []);

  if (!options) {
    return <>Missing Options</>;
  }

  const lengthCheck = options.maxRows ? rows.length < options.maxRows : true;
  const canAddRow = !!options.actions.addRow && lengthCheck;
  const canEdit = !!options.actions.editRow;
  // TODO: What is viewRow used for?
  // const viewRow = !!options.actions.viewRow;

  const addRowForm = () => {
    if (!options || !inputForm) {
      return <></>;
    }

    const closeModal = () => {
      modalService.closeModal();
      inputForm.reset();
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const v = await inputForm.validate();
      if (Object.values(v).some((a) => a === false)) {
        return;
      }
      const result = await firstValueFrom(inputForm.$value);
      const entries = Object.entries(result).map(([name, value]) => ({
        name, value,
      }));
      field.addRow(entries);
      closeModal();
    };

    const addRow = options.actions.addRow!;
    return (
      <>
        {addRow.title ? <DialogTitle>{addRow.title}</DialogTitle> : <></>}
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {addRow.modalText ? <DialogContentText>{addRow.modalText}</DialogContentText> : <></>}
            <NuAutoForm form={inputForm} fieldResolver={fieldResolver} />
          </DialogContent>
          <DialogActions>
            {addRow.cancelText ? (<Button onClick={() => closeModal()}>{addRow.cancelText}</Button>) : <></>}
            {addRow.confirmText ? (<Button type="submit">{addRow.addText}</Button>) : <></>}
          </DialogActions>
        </form>
      </>
    );
  };

  const tableType = options.tableType;

  const inlineFormEl = () => {
    if (!inputForm) {
      return <></>;
    }
    const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      const v = await inputForm.validate();
      if (Object.values(v).some((a) => a === false)) {
        return;
      }
      const result = await firstValueFrom(inputForm.$value);
      inputForm.reset();
      if (!result) {
        return;
      }

      // TODO: fix typings of result
      const entries = Object.entries(result).map(([name, value]) => ({
        name, value,
      }));
      field.addRow(entries);
    };

    const chipEl = <Paper
      sx={{
        justifyContent: 'left',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0,
      }}
      component="ul"
    >
      <Stack
        spacing={1}
        direction="row"
      >
        {options.maxRows ? <div>{rows.length} / {options.maxRows}</div> : <></>}
        {rows.map(({ fields, id }, index) => {
          const chipText = fields.map((field) => String(field.value)).join(',');
          const deleteRow = options.actions.deleteRow;
          const onDelete = deleteRow ? () => field.removeRow(index) : undefined;
          return (
            <li key={id}>
              <Chip
                label={chipText}
                onDelete={onDelete}
              />
            </li>
          );
        })}
      </Stack>
    </Paper>;

    return (
      <>
        <div>{state.label}</div>
        <Stack
          spacing={3}
        >
          <Stack direction="row">
            <NuAutoForm fieldResolver={fieldResolver} form={inputForm} />
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e)}
              disabled={!canAddRow}
            >Add</Button>
          </Stack>
          {chipEl}
        </Stack>
      </>
    );
  };

  const setInputFormToRowFormValues = (rowIndex: number) => {
    options.definition.forEach((def) => {
      const currentRow = rows[rowIndex];
      const rowField = inputForm.get(def.id);
      if (!rowField) {
        throw new Error('field not found!');
      }
      const field = currentRow.fields.filter((field) => field.name === def.id)[0];
      rowField.value = field.value;
    });
  };

  if (tableType === 'modal') {
    return (
      <div>
        <div>{state.label}</div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label={state.label}>
            <TableHead>
              <TableRow>
                {options.definition.map(({ header, id }, index) => (
                  <TableCell key={id}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ fields, id }, rowIndex) => (
                <TableRow key={id}>
                  {Object.entries(fields).map(([fieldIndex, value]) => (
                    <TableCell key={`${id}-${fieldIndex}-${value.name}`}>{String(value.value)}</TableCell>
                  ))}
                  <TableCell align='right'>
                    {options.actions.deleteRow ? (
                      <DeleteButton
                        field={field}
                        modalService={modalService}
                        deleteRowDetails={options.actions.deleteRow}
                        rowIndex={rowIndex}
                      />) : <></>}
                    {options.actions.editRow ? (
                      <ButtonModal
                        onOpen={() => setInputFormToRowFormValues(rowIndex)}
                        element={<EditRowModal
                          inputForm={inputForm}
                          field={field}
                          modalService={modalService}
                          editRow={options.actions.editRow}
                          fieldResolver={fieldResolver}
                          rowIndex={rowIndex}
                        />}
                        modalService={modalService}
                        modalType={'modal'}
                      >Edit</ButtonModal>
                    ) : <></>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {
              canAddRow ? (
                <TableFooter>
                  <TableRow>
                    {options.definition.map(({id}, index) => (<TableCell key={id}></TableCell>))}
                    <TableCell align="right">
                      {
                        canAddRow ? <ButtonModal
                          element={addRowForm()}
                          modalService={modalService}
                          modalType={'modal'}
                          onOpen={() => inputForm.reset()}
                        >Add</ButtonModal> : <></>
                      }
                    </TableCell>
                  </TableRow>
                </TableFooter>
              ) : <></>
            }
          </Table>
        </TableContainer>
      </div >
    );
  } else if (tableType === 'inline') {
    return (
      <>{inlineFormEl()}</>
    );
  }

  return <></>;
};
