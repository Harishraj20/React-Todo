import React from "react";
import "@testing-library/react";
import {
  screen,
  fireEvent,
  render,
  waitFor,
  act,
} from "@testing-library/react";
import Todo from "../Components/Todo";

// Mocking FontAwesome to avoid errors related to missing icons during tests
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon }) => (
    <span>
      {icon.prefix} - {icon.iconName}
    </span>
  ),
}));

// Mock for localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const addTask = (taskName) => {
  fireEvent.change(screen.getByPlaceholderText("Enter Task"), {
    target: { value: taskName },
  });

  fireEvent.click(screen.getByRole("button", { name: /add/i }));
};

describe("Testing TODO Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
    render(<Todo />);
  });

  afterAll(() => {
    jest.runAllTimers();
    localStorageMock.clear();
  });

  test("should check the title", () => {
    expect(screen.getByText("TODO LIST")).toBeInTheDocument();
  });

  test("should render component correctly", () => {
    expect(screen.getByPlaceholderText("Enter Task")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  test("should add Task", async () => {
    addTask("TestTask");
    expect(screen.getByText("TestTask")).toBeInTheDocument();
    expect(screen.queryByText("Task Added Successfully")).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await waitFor(() =>
      expect(
        screen.queryByText("Task Added Successfully")
      ).not.toBeInTheDocument()
    );
    const tasksInLocalStorage = JSON.parse(
      localStorageMock.getItem("taskList")
    );

    expect(tasksInLocalStorage).toBeDefined();

    expect(tasksInLocalStorage).toContainEqual({
      id: 1,
      name: "TestTask",
      status: false,
    });
  });
  test("should not add empty Task", async () => {
    addTask("");
    expect(
      screen.queryByText("Task Name cannot be empty!")
    ).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await waitFor(() =>
      expect(
        screen.queryByText("Task Name cannot be empty!")
      ).not.toBeInTheDocument()
    );
  });

  test("should delete task when delete icon is clicked", async () => {
    addTask("TestTask");
    fireEvent.click(screen.getByLabelText(/delete task/i));
    expect(
      screen.getByText('Are you sure to delete the task "TestTask"?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    await waitFor(() => {
      expect(screen.queryByText("TestTask")).not.toBeInTheDocument();
    });
  });
  test("should cancel delete task when No button is clicked", async () => {
    addTask("TestTask");
    const deleteButton = screen.getByLabelText(/delete task/i);
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
    expect(
      screen.getByText('Are you sure to delete the task "TestTask"?')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /no/i }));
    await waitFor(() => {
      expect(screen.queryByText("TestTask")).toBeInTheDocument();
    });
  });

  test("should test task already exist feature", () => {
    addTask("Test task");
    addTask("Test task");
    expect(screen.getByText("Task Already exists!")).toBeInTheDocument();
  });

  test("should delete the specific task when delete icon is clicked", async () => {
    addTask("Task 1");
    addTask("Task 2");
    fireEvent.click(screen.getAllByLabelText(/delete task/i)[1]);
    expect(
      screen.getByText('Are you sure to delete the task "Task 2"?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    await waitFor(() => {
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  test("should edit the specific task when edit icon is clicked", async () => {
    addTask("Task 1");
    addTask("Task 2");
    fireEvent.click(screen.getAllByLabelText(/edit task/i)[1]);

    expect(screen.getByPlaceholderText("Enter Task").value).toBe("Task 2");

    fireEvent.change(screen.getByPlaceholderText("Enter Task"), {
      target: { value: "Updated Task 2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));
    expect(screen.getByText("Updated Task 2")).toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  test("should correctly parse tasks and taskId from localStorage", () => {
    const savedTasks = JSON.stringify([
      { id: 1, name: "TestTask", status: false },
      { id: 2, name: "Another Task", status: true },
    ]);
    const savedTaskId = "2";

    localStorageMock.setItem("taskList", savedTasks);
    localStorageMock.setItem("taskId", savedTaskId);

    render(<Todo />);

    const tasksInLocalStorage = JSON.parse(
      localStorageMock.getItem("taskList")
    );
    expect(tasksInLocalStorage).toEqual([
      { id: 1, name: "TestTask", status: false },
      { id: 2, name: "Another Task", status: true },
    ]);

    const taskId = Number(localStorageMock.getItem("taskId"));
    expect(taskId).toBe(2);
  });

  describe("To check Category Functitonality", () => {
    beforeEach(() => {
      addTask("Task 1");
      addTask("Task 2");
    });

    test("should check all category", () => {
      const buttons = screen.getAllByRole("button", { name: /all/i });
      fireEvent.click(buttons[0]);
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });

    test("should check assigned category", () => {
      fireEvent.click(screen.getByRole("button", { name: /Assigned/i }));
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
    test("should check Completed category", () => {
      fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
    test("should toggle category of Task 1 and check completed category", () => {
      fireEvent.click(screen.getAllByLabelText(/toggle task/i)[0]);
      fireEvent.click(screen.getByRole("button", { name: /Assigned/i }));
      expect(screen.getByText("Task 2")).toBeInTheDocument();
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Task 1")).toBeInTheDocument();
    });

    test("should check clearAll Functionality", () => {
      fireEvent.click(screen.getAllByLabelText(/toggle task/i)[0]);
      fireEvent.click(screen.getByRole("button", { name: /Assigned/i }));
      fireEvent.click(screen.getByText("Clear All"));
      expect(
        screen.getByText("Are you sure to clear assigned tasks?")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(
        screen.getByText("Assigned tasks cleared successfully!")
      ).toBeInTheDocument();
      expect(screen.queryByText("task 2")).not.toBeInTheDocument();
    });
    test("should check display error message when clear All is clicked with empty tasks", () => {
      fireEvent.click(screen.getByText("Clear All"));
      fireEvent.click(screen.getByRole("button", { name: /yes/i }));
      fireEvent.click(screen.getByText("Clear All"));
      expect(screen.getByText("No task to clear!")).toBeInTheDocument();
    });
    test("should clear All Tasks", () => {
      fireEvent.click(screen.getByText("Clear All"));
      expect(
        screen.getByText("Are you sure to clear All tasks?")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(screen.queryByText("task 2")).not.toBeInTheDocument();
    });

    test("should clear Completed Tasks", () => {
      const toggleButtons = screen.getAllByLabelText(/toggle task/i);

      toggleButtons.forEach((btn) => {
        fireEvent.click(btn);
      });
      fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
      fireEvent.click(screen.getByText("Clear All"));
      expect(
        screen.getByText("Are you sure to clear completed tasks?")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(screen.queryByText("task 2")).not.toBeInTheDocument();
    });
  });
});
