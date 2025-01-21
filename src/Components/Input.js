import React from "react";

const Input = ({ userInput, editingIndex, handleOnChange, saveTask }) => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    saveTask();
  };

  return (
    <div className="input-Container">
      <form onSubmit={handleFormSubmit}>
        <input
          id="userInput"
          type="text"
          value={userInput}
          placeholder="Enter Task"
          onChange={handleOnChange}
          autoFocus
        />
        <button type="submit" className="action-button">
          {editingIndex === null ? "Add" : "Update"}
        </button>
      </form>
    </div>
  );
};

export default Input;
