import {
  deleteNote,
  getToken,
  handleLogin,
  handleLogout,
  handleRegister,
  handleSubmit,
  sendEditToAPI,
  updateNotesList,
} from "./app.js";

const root = document.getElementById("app-root");

const LoginPage = `
 <div id="auth-form-container">
        <h2>Entrar no DailyLogger</h2>
        <div id="login-view">
            <form id="loginForm">
                <input type="text" id="loginUsername" placeholder="Usuário" required>
                <input type="password" id="loginPassword" placeholder="Senha" required>
                <button type="submit">Entra</button>
                <p>Não tem conta?
                    <a href="#" id="showRegisterLink"> Registre-se aqui</a>
                </p>
            </form>
        </div>
    </div>
`;

const RegisterPage = `
 <div id="register-view" >
        <h2>
            Criar Nova Conta
        </h2>
        <form id="registerFrom">
            <input type="text" id="registerUsername" placeholder="Nome de Usuário" required>
            <input type="password" id="registerPassword" placeholder="Senha" required>

            <button type="submit">Registrar</button>
        </form>
        <p>já tem conta?
            <a href="#" id="showLoginLink"> Fazer Login</a>
        </p>
    </div>
    `;

const NotesPage = `
  <header id="main-header">
        <h1>DailyLogger</h1>
        <div id="auth-status">
        <button id="logoutBtn">Sair</button></div>
    </header>
    <div id="app-container">
        <h1>Novo Resgistro Diário</h1>
        <form id="noteForm">
            <textarea id="noteText" placeholder="O que aconteceu hoje?" rows="4" required></textarea>
            <br>
            <button type="submit">Registra Nota</button>
        </form>
        <h2>Registros Anteriores</h2>
        <ul id="logList">
        </ul>
    </div>
 `;

function attachAuthListeners() {
  document
    .getElementById("showRegisterLink")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      render("register");
    });
  document.getElementById("showLoginLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    render("login");
  });

  document
    .getElementById("loginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      await handleLogin(username, password);
    });

  document
    .getElementById("registerFrom")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("registerUsername").value;
      const password = document.getElementById("registerPassword").value;
      await handleRegister(username, password);
    });
}

function attachNotesListeners() {
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  document.getElementById("noteForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const noteContent = noteText.value.trim();
    if (!noteContent) {
      showNotification("O conteúdo da nota não pode estar vazio.", "error");
      return;
    }
    const dataToSend = {
      content: noteContent,
    };
    handleSubmit(dataToSend);
  });
  updateNotesList();
}

function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.target.dataset.noteId;

      if (noteId) {
        deleteNote(noteId);
      }
    });
  });
}

function attachEditListeners() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.target.dataset.noteId;
      if (noteId) {
        enableEditMode(noteId, event.target);
      }
    });
  });
}

function enableEditMode(noteId, editButton) {
  const listItem = editButton.parentElement;
  const contentSpan = listItem.querySelector(".note-content");

  const currentText = contentSpan.textContent.replace(/\[.*\]\s*/, "").trim();

  const textarea = document.createElement("textarea");
  textarea.value = currentText;
  textarea.classList.add("edit-textarea");

  const saveButton = document.createElement("button");
  saveButton.textContent = "Salvar";
  saveButton.classList.add("save-edit-btn");

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("cancel-edit-btn");
  cancelButton.dataset.noteId = noteId;

  contentSpan.style.display = "none";
  editButton.style.display = "none";

  listItem.insertBefore(textarea, contentSpan);
  listItem.insertBefore(saveButton, editButton);
  listItem.insertBefore(cancelButton, editButton);

  saveButton.addEventListener("click", () => {
    const newContent = textarea.value;
    sendEditToAPI(noteId, newContent);
  });

  cancelButton.addEventListener("click", () => {
    textarea.remove();
    saveButton.remove();
    cancelButton.remove();
    contentSpan.style.display = "";
    editButton.style.display = "";
  });
}

export function renderNotes(notes) {
  const logList = document.getElementById("logList");
  if (!logList) return;
  logList.innerHTML = " ";

  notes.forEach((note) => {
    const listItem = document.createElement("li");
    listItem.dataset.noteId = note.id;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-btn");
    deleteButton.dataset.noteId = note.id;

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.classList.add("edit-btn");
    editButton.dataset.noteId = note.id;

    const noteContentSpan = document.createElement("span");
    const date = new Date(note.timesTamp).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    noteContentSpan.classList.add("note-content");
    noteContentSpan.innerHTML = `[${date}]: ${note.content}`;

    listItem.appendChild(noteContentSpan);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    logList.appendChild(listItem);
  });

  attachDeleteListeners();
  attachEditListeners();
}

export function render(view) {
  root.innerHTML = ``;
  if (view === "login") {
    root.innerHTML = LoginPage;
    attachAuthListeners();
  } else if (view === "register") {
    root.innerHTML = RegisterPage;
    attachAuthListeners();
  } else if (view === "notes") {
    root.innerHTML = NotesPage;
    attachNotesListeners();
    updateNotesList();
  }
}

export function initApp() {
  if (getToken()) {
    render("notes");
  } else {
    render("login");
  }
}
