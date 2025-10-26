import { render, initApp, renderNotes } from "./ui.js";

const noteText = document.getElementById("noteText");

const TOKEN_KEY = "dailyLoggerToken";

function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notification = document.createElement("div");

  notification.classList.add("notification", type);
  notification.textContent = message;

  container.appendChild(notification);

  void notification.offsetWidth;

  notification.classList.add("show");

  function hideAndRemove() {
    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
    }, 500);
  }
  setTimeout(hideAndRemove, 4000);

  notification.addEventListener(
    "click",
    () => {
      notification.remove();
    },
    { once: true }
  );
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function authenticationFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    showNotification(
      "Sessão expirada ou não autenticada. Faça login novamente",
      "error"
    );
    throw new Error("Não autenticado");
  }

  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    removeToken();
    showNotification(
      "Sessão inválida ou expirada. Faça login novamente.",
      "error"
    );
  }

  return response;
}

export async function updateNotesList() {
  const notes = await fetchNotes();
  renderNotes(notes);
}

export async function handleRegister(username, password) {
  const data = { username, password };

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      showNotification(
        `Falha no login ${result.message} || "Erro desconhecido"`,
        "error"
      );
      return;
    }

    saveToken(result.token);

    showNotification("Login efetuado com sucesso", "success");
    render("notes");
  } catch (error) {
    showNotification("Erro de rede: Não foi possivel conectar ao servidor");
  }
}

export async function handleLogin(username, password) {
  const data = { username, password };

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      showNotification(
        `Falha no login ${result.message} || "Erro desconhecido"`,
        "error"
      );
      return;
    }
    saveToken(result.token);
    showNotification("login bem-sucedido!", "success");
    render("notes");
  } catch (error) {
    showNotification(
      `ERRO DE REDE: Não foi possivel conecta ao servidor`,
      "error"
    );
  }
}

export function handleLogout() {
  removeToken();
  showNotification("Sessão encerrada.", "success");
  render("login");
}

export async function sendEditToAPI(id, newContent) {
  const url = `/notes/${id}`;
  const contentToSave = newContent.trim();
  if (contentToSave.length === 0) {
    showNotification("O conteúdo da nota não pode ser vazio", "erro");
    return;
  }

  try {
    const response = await authenticationFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: contentToSave }),
    });

    if (!response.ok) {
      const erroData = await response.json();
      showNotification(
        `Falha ao editar: ${erroData.message}|| 'Erro desconhecido'`,
        "error"
      );
    }
    showNotification("Nota editada com sucesso!", "success");
    updateNotesList();
  } catch (error) {
    showNotification("erro ao editar a nota " + error.message, "error");
    console.error("Erro de rede durante PUT:", error);
  }
}

export async function fetchNotes() {
  try {
    const response = await authenticationFetch("/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (error) {
    showNotification("Deu ruim na busca de notas", "error");
    console.error(error);
    return [];
  }
}

export async function handleSubmit(data) {
  try {
    const response = await authenticationFetch("/submit", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showNotification(
        `Falha:${errorData.message || "erro authenticationTokendesconhecido"}`,
        "error"
      );
      return;
    }

    showNotification("Nota salva com sucesso!", "success");
    updateNotesList();
    if (noteText) {
      noteText.value = " ";
    }
    console.log("nota registrada");

    return await response.json();
  } catch (error) {
    showNotification(
      `ERRO DE CONEXÃO: Não foi possível alcançar o servidor.`,
      "error"
    );
    console.log(error);
  }
}

export async function deleteNote(id) {
  const url = `/notes/${id}`;
  try {
    const response = await authenticationFetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 204) {
      updateNotesList();
    } else {
      const erroData = await response.json();
      showNotification("erro ao deletar a nota " + erroData.status, "error");
    }
  } catch (error) {
    showNotification("erro ao deletar a nota " + error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
