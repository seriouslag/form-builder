import React, { useEffect } from 'react';
import Button from '@mui/material/Button';

import { Anchor, ModalElement, ModalEvent, ModalService, ModalState, ModalType } from './ModalService';

export interface ButtonModalEvents {
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ButtonModalProps {
  anchor?: Anchor;
  modalService: ModalService;
  element: ModalElement;
  modalType: ModalType;
}

export const ButtonModal: React.FC<React.PropsWithChildren<ButtonModalProps & ButtonModalEvents>> = (props) => {

  const { element, anchor, modalService, children, onOpen, onClose, modalType } = props;

  const handleModalServiceStateChange = (state: ModalState) => {
    // return early if opened modal is not tied to this button
    if (element !== state.element) {
      return;
    }
    if (state.open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  useEffect(() => {
    const sub = modalService.state$.subscribe((s) => handleModalServiceStateChange(s));
    return () => {
      sub.unsubscribe();
    };
  }, [modalService, onOpen, onClose]);

  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const modalEvent: ModalEvent = { open: true, element, event, anchor, modalType };
    modalService.openModal(modalEvent);
  };

  return (
    <Button onClick={(e) => handleOnClick(e)}>
      {children}
    </Button>
  );
};
