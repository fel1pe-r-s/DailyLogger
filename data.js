import fs from "node:fs";
const NOTES_FILE = "notes.json";
const USERS_FILE = "users.json";

export let notes = [];

(function loadNotesFromFile() {
  try {
    const data = fs.readFileSync(NOTES_FILE, "utf8");
    notes = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      notes = [];
      console.error("array vazio");
    } else {
      console.error("Erro ao carrregar notes.json", error.message);
    }
  }
})();

export function saveNotesToFile() {
  const data = JSON.stringify(notes, null, 2);

  fs.writeFile(NOTES_FILE, data, (err) => {
    if (err) {
      console.error("Erro ao salvar notas no disco:", err);
    }
  });
}

export let users = [];

(function loadUsersFromFile() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      users = [];
      console.error("array de users vazio");
    } else {
      console.error("erro ao carregar usuarios de users.json");
    }
  }
})();

export function saveUsersToFile() {
  const data = JSON.stringify(users, null, 2);
  fs.writeFile(USERS_FILE, data, (err) => {
    if (err) {
      console.error("Erro ao salvar users no disco:", err);
    }
  });
}
