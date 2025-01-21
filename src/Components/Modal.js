import React from 'react';
import '../Styles/Modal.css';

const Modal = ({ closeModal, confirm, modalText }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <div className='close-modal'>
          <button className='close-bt' onClick={closeModal}>&times;</button>
        </div>
        <p className='modal-message'>{modalText}</p>
        <div className='button-hold'>
        <button className='modal-button' id='yes-button' onClick={confirm}>Yes</button>
        <button className='modal-button' id='no-button'  onClick={closeModal}>No</button>


        </div>
      </div>
    </div>
  );
};

export default Modal;
