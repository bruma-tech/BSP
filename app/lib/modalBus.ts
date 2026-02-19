type ModalType = "requirement" | "sponsor" | null;

type Listener = (type: ModalType) => void;

let listener: Listener | null = null;

export const modalBus = {
  open(type: ModalType) {
    if (listener) listener(type);
  },

  close() {
    if (listener) listener(null);
  },

  subscribe(fn: Listener) {
    listener = fn;
  }
};