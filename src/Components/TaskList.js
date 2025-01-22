import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TaskList = ({
  tasks,
  handleEdit,
  handleDeleteModal,
  toggleChange,
  activeStatus,
}) => {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <div className="task-name">
          <p className="task-name-element"
            style={{
              color: task.status ? "grey" : "",
            }}
          >
            {task.name}
          </p>

          </div>
         
          <div className="todo-button">
            <button
              className="button-action"
              onClick={() => handleEdit(task.id)}
              disabled={activeStatus === "completed" || task.status}
            >
              <FontAwesomeIcon
                icon="fa-solid fa-pen-to-square"
                size="lg"
                style={{ color: !task.status? "#e94e77" : "#e5e5e6" }}

              />{" "}
            </button>
            <button
              className="button-action"
              onClick={() => handleDeleteModal(task.id)}
            >
              <FontAwesomeIcon
                icon="fa-solid fa-trash"
                size="lg"
                style={{ color: !task.status? "#e94e77" : "#e5e5e6" }}
              />{" "}
            </button>
            <button
              className="button-action"
              onClick={() => toggleChange(task.id)}
            >
              <FontAwesomeIcon
                icon="fa-solid fa-circle-check"
                size="lg"
                style={{ color: !task.status? "#e94e77" : "#e5e5e6" }}

              />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
