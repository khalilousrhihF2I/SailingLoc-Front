
import { useModalContext } from '../components/ui/ModalProvider';

export function useModal() {
  const ctx = useModalContext();
  return ctx;
}
