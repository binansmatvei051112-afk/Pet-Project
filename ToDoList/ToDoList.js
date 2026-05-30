
const getId = (id) => document.getElementById(id);

const addBtn         = getId("push_btn");
const taskInput      = getId("Tasck_input");
const clearAllBtn    = getId("Delete_btn");
const errorMsg       = getId("error_msg");

const doColumn       = getId("Do_column");
const processColumn  = getId("Process_column");
const finishedColumn = getId("Finished_column");

const allColumns = [doColumn, processColumn, finishedColumn];

let draggedCard = null;
let allTasks    = [];

function updateCounters() {
    getId("do_count").textContent       = doColumn.querySelectorAll(".card").length;
    getId("process_count").textContent  = processColumn.querySelectorAll(".card").length;
    getId("finished_count").textContent = finishedColumn.querySelectorAll(".card").length;
}

function showError(message) {
    errorMsg.textContent = message;
    setTimeout(() => { errorMsg.textContent = ""; }, 3000);
}

function clearError() {
    errorMsg.textContent = "";
}

function saveToStorage() {
    localStorage.setItem("MyTasks", JSON.stringify(allTasks));
}

function createCardElement(text, id) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("draggable", "true");
    card.dataset.id = id;

    const textSpan = document.createElement("span");
    textSpan.classList.add("card-text");
    textSpan.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "❌";
    deleteBtn.setAttribute("aria-label", "Удалить задачу");

    card.appendChild(textSpan);
    card.appendChild(deleteBtn);

    card.addEventListener("dragstart", () => {
        draggedCard = card;
        setTimeout(() => card.classList.add("dragging"), 0);
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        draggedCard = null;
    });

    deleteBtn.addEventListener("click", () => {
        card.remove();

        allTasks = allTasks.filter(task => task.id !== id);

        saveToStorage();
        updateCounters();
    });

    return card;
}

function addNewTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        showError("Напишите что хотите добавить ✏️");
        return;
    }

    clearError();

    const taskId = Date.now();
    const card   = createCardElement(text, taskId);

    doColumn.appendChild(card);

    allTasks.push({
        id:     taskId,
        text:   text,
        status: "Do_column"
    });

    saveToStorage();
    taskInput.value = "";
    updateCounters();
}

addBtn.addEventListener("click", addNewTask);

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addNewTask();
});

clearAllBtn.addEventListener("click", () => {
    allTasks = [];
    localStorage.removeItem("MyTasks");

    document.querySelectorAll(".card").forEach(card => card.remove());

    updateCounters();
});

taskInput.addEventListener("input", clearError);

allColumns.forEach(column => {
    column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
    });

    column.addEventListener("drop", () => {
        column.classList.remove("drag-over");

        if (!draggedCard) return;
        column.appendChild(draggedCard);

        const cardId = Number(draggedCard.dataset.id);

        const task = allTasks.find(t => t.id === cardId);
        if (task) {
            task.status = column.id;
        }

        saveToStorage();
        updateCounters();
    });
});

function loadFromStorage() {
    const saved = JSON.parse(localStorage.getItem("MyTasks"));

    if (!saved || saved.length === 0) return;

    allTasks = saved;

    const columnMap = {
        "Do_column":       doColumn,
        "Process_column":  processColumn,
        "Finished_column": finishedColumn,
    };

    allTasks.forEach(task => {
        const card   = createCardElement(task.text, task.id);
        const column = columnMap[task.status] || doColumn;
        column.appendChild(card);
    });

    updateCounters();
}

loadFromStorage();
