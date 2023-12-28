import { BehaviorSubject, Observable } from 'rxjs';

export type Anchor = 'top' | 'left' | 'bottom' | 'right';

export type ModalElement = (() => (JSX.Element | string)) | JSX.Element | string | null;

export interface ModalState {
  anchor: Anchor;
  open: boolean;
  element: ModalElement;
  modalType: ModalType;
}

export type ModalType = 'drawer' | 'modal';

export interface BaseModalEvent {
  open: boolean;
  event?: unknown;
}

export interface DrawerModalEvent extends BaseModalEvent {
  modalType: 'drawer';
  anchor?: Anchor;
  element?: ModalElement;
  open: true;
}

export interface DialogModalEvent extends BaseModalEvent {
  modalType: 'modal';
  element?: ModalElement;
  open: true;
}

export interface CloseModalEvent extends BaseModalEvent {
  open: false;
}

export type ModalEvent = DrawerModalEvent | DialogModalEvent | CloseModalEvent;

const defaultDrawerAnchor: Anchor = 'right';
const defaultModalType: ModalType = 'modal';

export class ModalService {

  readonly #drawerState = new BehaviorSubject<ModalState>({ open: false, anchor: defaultDrawerAnchor, element: null, modalType: defaultModalType });

  get state$(): Observable<ModalState> {
    return this.#drawerState.asObservable();
  }

  openModal(state: ModalEvent): void {
    setTimeout(() => this.#drawerState.next({ ...this.#drawerState.value, ...state }), 0);
  }

  closeModal(): void {
    setTimeout(() => this.#drawerState.next({ ...this.#drawerState.value, open: false }), 0);
  }
}
