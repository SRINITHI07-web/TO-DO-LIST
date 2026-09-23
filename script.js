const taskInput = document.getElementById("new-task");
const todoForm = document.getElementById("todo-form");
const taskList = document.getElementById("task-list");
const notification = document.getElementById("notification");
const filterButtons = document.querySelectorAll("[data-filter]");

const STORAGE_KEY = "tasks";

function loadTasks() {
  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    return [];
  }
}

let tasks = loadTasks();
let currentFilter = "all";
let notificationTimer;

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("visible");
  window.clearTimeout(notificationTimer);
  notificationTimer = window.setTimeout(() => {
    notification.classList.remove("visible");
  }, 2500);
}

function addTask(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  tasks.unshift({
    id: Date.now(),
    text: trimmedText,
    completed: false,
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
  showNotification("Task added successfully.");
}

function renderTasks() {
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "No tasks here yet.";
    taskList.appendChild(emptyState);
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const taskMain = document.createElement("div");
    taskMain.className = "task-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "task-checkbox";
    checkbox.dataset.id = task.id;

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = task.id;
    deleteBtn.textContent = "Delete";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.dataset.id = task.id;
    editBtn.textContent = "Edit";

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    taskMain.appendChild(checkbox);
    taskMain.appendChild(text);
    li.appendChild(taskMain);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function updateTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const updatedText = window.prompt("Edit task", task.text);
  if (updatedText === null) return;

  const trimmedText = updatedText.trim();
  if (!trimmedText) return;

  task.text = trimmedText;
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderTasks();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

taskList.addEventListener("change", (event) => {
  if (event.target.matches(".task-checkbox")) {
    const taskId = Number(event.target.dataset.id);
    const task = tasks.find((item) => item.id === taskId);

    if (task) {
      task.completed = event.target.checked;
      saveTasks();
      renderTasks();
    }
  }
});

taskList.addEventListener("click", (event) => {
  if (event.target.matches(".edit-btn")) {
    updateTask(Number(event.target.dataset.id));
    return;
  }

  if (event.target.matches(".delete-btn")) {
    const taskId = Number(event.target.dataset.id);
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

renderTasks();

