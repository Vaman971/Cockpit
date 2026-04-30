// SessionTimeoutModal.js
import React from 'react';
import { Modal, Button } from 'flowbite-react';

const SessionTimeoutModal = ({ showModal, onClose }) => {
  return (
    <Modal show={showModal} onClose={onClose} popup size="md">
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
            Your session has timed out. Please sign in again.
          </h3>
          <div className="flex justify-center">
            <Button color="failure" onClick={onClose}>
              Sign-in
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SessionTimeoutModal;
