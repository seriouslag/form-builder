import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import * as React from 'react';
import { Subscription } from 'rxjs';
import { ModalService, ModalState } from './ModalService';

export interface ModalContainerProps {
  modalService: ModalService;
}

export interface ModalContainerEvents {
  open?: (modalState: Readonly<ModalState>) => void;
  close?: (modalState: Readonly<ModalState>) => void;
}

export class ModalContainer extends React.Component<ModalContainerProps & ModalContainerEvents, ModalState> {

  private modalSub: Subscription | undefined;

  constructor(props: ModalContainerProps & ModalContainerEvents) {
    super(props);
    this.state = {
      open: false,
      anchor: 'right',
      element: null,
    } as ModalState;
  }

  private closeModal() {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')) {
        return;
      }
      this.props.modalService.closeModal();
    };
  }

  componentDidMount() {
    this.modalSub = this.props.modalService.state$.subscribe((modalState: ModalState) => {
      this.setState({ ...this.state, ...modalState });
      this.props.open?.(this.state);
      this.props.close?.(this.state);
    });
  }

  componentWillUnmount() {
    this.modalSub?.unsubscribe();
  }

  private renderModal(): JSX.Element {
    const { open, element } = this.state;
    return <Dialog onClose={this.closeModal()} open={open}>
      {typeof element === 'function' ? element() : element}
    </Dialog>;
  }

  private renderDrawer(): JSX.Element {
    const { anchor, open, element } = this.state;
    return (<Drawer
      anchor={anchor}
      open={open}
      onClose={this.closeModal()}
    >
      <Box
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
        role="presentation"
        onClick={this.closeModal()}
        onKeyDown={this.closeModal()}
      >
        {typeof element === 'function' ? element() : element}
      </Box>
    </Drawer>);
  }

  render() {
    const { modalType } = this.state;
    if (modalType === 'drawer') {
      return this.renderDrawer();
    }
    return this.renderModal();
  }
}
