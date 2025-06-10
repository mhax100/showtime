import { Button, Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MovieForm from './MovieForm';

type MovieFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MovieFormModal({ isOpen, onClose }: MovieFormModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-background/50" aria-hidden="true" />

      {/* Centered modal panel */}
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="relative w-full max-w-md rounded-lg bg-surface">
          {/* Close button */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
          <MovieForm />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
