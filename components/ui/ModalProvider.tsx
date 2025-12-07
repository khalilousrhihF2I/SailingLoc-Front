import React, { createContext, useContext, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './Button';

type ModalPayload = {
  title?: string;
  message?: string;
  content?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  single?: boolean; // only confirm button
};

type ModalContextType = {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (payload: ModalPayload) => void;
  hide: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModalContext must be used inside ModalProvider');
  return ctx;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [onConfirm, setOnConfirm] = useState<(() => void | Promise<void>) | undefined>(undefined);
  const [confirmLabel, setConfirmLabel] = useState('OK');
  const [cancelLabel, setCancelLabel] = useState('Annuler');
  const [single, setSingle] = useState(false);

  const hide = () => setOpen(false);

  const showAlert = (msg: string, t?: string) => {
    setTitle(t);
    setMessage(msg);
    setContent(undefined);
    setOnConfirm(undefined);
    setSingle(true);
    setOpen(true);
  };

  const showConfirm = (p: ModalPayload) => {
    setTitle(p.title);
    setMessage(p.message);
    setContent(p.content);
    setOnConfirm(() => p.onConfirm);
    setConfirmLabel(p.confirmLabel || 'OK');
    setCancelLabel(p.cancelLabel || 'Annuler');
    setSingle(Boolean(p.single));
    setOpen(true);
  };
  const [content, setContent] = useState<React.ReactNode | undefined>(undefined);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, hide }}>
      {children}

      <Dialog open={open} onOpenChange={(val) => { if (!val) setOpen(false); }}>
        <DialogContent className="bg-white text-black  overflow-auto" style={{ maxWidth: '30vw' }}>
          <DialogHeader>
            {title && <DialogTitle className="text-gray-900">{title}</DialogTitle>}
            {message && <DialogDescription className="text-gray-700 wrap-break-word">{message}</DialogDescription>}
                      {content ? (
                        <div className="text-gray-700 wrap-break-word">{content}</div>
                      ) : (
                        message && <DialogDescription className="text-gray-700 wrap-break-word">{message}</DialogDescription>
                      )}
          </DialogHeader>
          <DialogFooter>
            {!single && (
              <Button variant="outline" onClick={() => setOpen(false)}>{cancelLabel}</Button>
            )}
            <Button
              onClick={async () => {
                try {
                  if (onConfirm) await onConfirm();
                } catch (e) {
                  // swallow
                } finally {
                  setOpen(false);
                }
              }}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
};

export default ModalProvider;
