import React, { Component } from "react";
import "../Styles/todo.css";
import Modal from "./Modal";
import TaskList from "./TaskList";
import Input from "./Input";
import todoImage from "../Assets/todo.jpg";

export default class Todo extends Component {
  state = {
    userInput: "",
    taskList: [],
    filterTask: [],
    editingIndex: null,
    taskId: null,
    activeStatus: "All",
    errormessage: "",
    isModalOpen: false,
    modalFor: null,
    textColor: "",
  };

  componentDidUpdate(prevState) {
    if (
      this.state.errormessage &&
      prevState.errormessage !== this.state.errormessage
    ) {
      setTimeout(() => {
        this.setState({ errormessage: "", color: "" });
      }, 5000);
    }
  }

  componentDidMount() {
    const savedTasks = localStorage.getItem("taskList");
    const savedTaskId = localStorage.getItem("taskId");

    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    this.setState({
      taskList: tasks,
      filterTask: tasks,
      taskId: savedTaskId ? Number(savedTaskId) : 1,
    });
  }

  handleOnChange = (event) => {
    this.setState({
      userInput: event.target.value,
    });
  };

  saveTask = () => {
    const { userInput, editingIndex } = this.state;

    if (userInput.trim() === "") {
      this.displayMessage("Task Name cannot be empty!", "red");
      this.setState({ userInput: "" });
      return;
    }

    if (this.checkTaskExists() && !editingIndex) {
      this.displayMessage("Task Already exists!", "red");
      return;
    }

    const storedTaskList = JSON.parse(localStorage.getItem("taskList")) || [];
    let taskId = Number(localStorage.getItem("taskId")) || 1;

    // If editingIndex is null, add a new task
    if (editingIndex === null) {
      const newTask = {
        id: taskId,
        name: userInput.trim(),
        status: false,
      };

      const newTaskList = [...storedTaskList, newTask];

      this.setState(
        {
          taskList: newTaskList,
          filterTask: newTaskList,
          userInput: "",
          errormessage: "",
        },
        () => {
          localStorage.setItem("taskList", JSON.stringify(newTaskList));
          localStorage.setItem("taskId", taskId + 1);
          this.displayMessage("Task Added Successfully", "green");
        }
      );
    } else {
      // Update the existing task
      const updatedTaskList = storedTaskList.map((task) => {
        if (task.id === editingIndex) {
          return { ...task, name: userInput.trim() };
        }
        return task;
      });

      this.setState(
        {
          taskList: updatedTaskList,
          filterTask: updatedTaskList,
          userInput: "",
          editingIndex: null,
          errormessage: "",
        },
        () => {
          localStorage.setItem("taskList", JSON.stringify(updatedTaskList));
          this.updateFilteredTask();
          this.displayMessage("Task Updated Successfully", "green");
        }
      );
    }
  };

  checkTaskExists = () => {
    const { taskList, userInput } = this.state;
    return taskList.some((task) => task.name === userInput);
  };

  toggleChange = (id) => {
    const updatedTaskList = this.state.taskList.map((task) => {
      if (task.id === id) {
        return { ...task, status: !task.status };
      }
      return task;
    });

    this.setState(
      { taskList: updatedTaskList, filterTask: updatedTaskList },
      () => {
        localStorage.setItem("taskList", JSON.stringify(updatedTaskList));
        this.updateFilteredTask();
      }
    );
  };

  handleEdit = (id) => {
    const { taskList } = this.state;
    const taskToEdit = taskList.find((task) => task.id === id);
    this.setState({
      userInput: taskToEdit.name,
      editingIndex: id,
    });
  };

  handleDeleteModal = (id) => {
    this.setState({ isModalOpen: true, taskId: id });
  };

  handleDelete = () => {
    const { taskList, taskId } = this.state;
    const filteredTask = taskList.filter((task) => task.id !== taskId);

    this.setState(
      {
        taskList: filteredTask,
        filterTask: filteredTask,
        isModalOpen: false,
        taskId: null,
        modalFor: "delete",
      },
      () => {
        localStorage.setItem("taskList", JSON.stringify(filteredTask));
        this.updateFilteredTask();
      }
    );
  };

  displayMessage = (message, color) => {
    this.setState({
      errormessage: message,
      textColor: color,
    });
  };

  assignedTask = () => {
    this.setState({ activeStatus: "assigned" }, this.updateFilteredTask);
  };

  completedTask = () => {
    this.setState({ activeStatus: "completed" }, this.updateFilteredTask);
  };

  allTask = () => {
    this.setState({ activeStatus: "All" }, this.updateFilteredTask);
  };

  updateFilteredTask = () => {
    const { taskList, activeStatus } = this.state;

    let filteredTask;
    if (activeStatus === "assigned") {
      filteredTask = taskList.filter((task) => !task.status);
    } else if (activeStatus === "completed") {
      filteredTask = taskList.filter((task) => task.status);
    } else {
      filteredTask = taskList;
    }
    this.setState({ filterTask: filteredTask });
  };
  clearTaskModal = () => {
    const { filterTask } = this.state;
    if (filterTask.length === 0) {
      this.displayMessage("No task to clear!", "red");
      return;
    }

    this.setState({
      isModalOpen: true,
      modalFor: "clear",
    });
  };

  clearTasks = () => {
    const { activeStatus, taskList } = this.state;
    let taskId = this.state.taskId;

    let updatedTaskList;

    if (activeStatus === "All") {
      updatedTaskList = [];
      taskId = 0;
    } else if (activeStatus === "assigned") {
      updatedTaskList = taskList.filter((task) => task.status);

      this.displayMessage("Assigned tasks cleared successfully!", "green");
    } else {
      updatedTaskList = taskList.filter((task) => !task.status);
      this.displayMessage("Completed tasks cleared successfully!", "green");
    }

    this.setState(
      {
        taskList: updatedTaskList,
        filterTask: updatedTaskList,
        isModalOpen: false,
        modalFor: null,
      },
      () => {
        localStorage.setItem("taskList", JSON.stringify(updatedTaskList));
        localStorage.setItem("taskId", taskId);
        this.updateFilteredTask();
      }
    );
  };
  render() {
    const {
      filterTask,
      userInput,
      editingIndex,
      taskList,
      taskId,
      activeStatus,
    } = this.state;

    return (
      <>
        <h2>TODO LIST</h2>
        <Input
          userInput={userInput}
          editingIndex={editingIndex}
          handleOnChange={this.handleOnChange}
          saveTask={this.saveTask}
        />
        <div className="error-msg">
          <p style={{ color: this.state.textColor }} className="error-tag">
            {this.state.errormessage}
          </p>
        </div>
        <div className="button-holder">
          <button
            onClick={this.allTask}
            className={`category-Button ${
              this.state.activeStatus === "All" ? "active" : ""
            }`}
          >
            All ({taskList.length})
          </button>
          <button
            onClick={this.assignedTask}
            className={`category-Button ${
              this.state.activeStatus === "assigned" ? "active" : ""
            }`}
          >
            Assigned ({taskList.filter((task) => !task.status).length})
          </button>
          <button
            onClick={this.completedTask}
            className={`category-Button ${
              this.state.activeStatus === "completed" ? "active" : ""
            }`}
          >
            Completed ({taskList.filter((task) => task.status).length})
          </button>
          <button
            className="category-Button"
            id="category-Button-clear"
            onClick={this.clearTaskModal}
          >
            Clear All
          </button>
        </div>
        {filterTask.length > 0 ? (
          <div className="task-container">
            <TaskList
              tasks={filterTask}
              handleEdit={this.handleEdit}
              handleDeleteModal={this.handleDeleteModal}
              toggleChange={this.toggleChange}
              activeStatus={this.state.activeStatus}
            />
          </div>
        ) : (
          <div className="content-holder">
            <img src={todoImage} alt="No tasks available" />
          </div>
        )}

        {this.state.isModalOpen && (
          <Modal
            confirm={
              this.state.modalFor === "clear"
                ? this.clearTasks
                : this.handleDelete
            }
            modalText={
              this.state.modalFor === "clear"
                ? `Are you sure to clear ${activeStatus} tasks?`
                : `Are you sure to delete the task "${
                    taskList.find((task) => task.id === taskId).name
                  }"?`
            }
            closeModal={() =>
              this.setState({
                isModalOpen: false,
                taskId: null,
                modalFor: null,
              })
            }
          />
        )}
      </>
    );
  }
}
