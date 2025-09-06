import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;