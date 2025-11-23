import { notes, saveNotesToFile } from "./data.js";

export function handleGetNotes(req, res) {
  const userId = req.user.userId;
  const userNotes = notes.filter((note) => note.userId === userId);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(userNotes));
}

export function handleCreateNote(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const { content, category, tags } = JSON.parse(body);
      const userId = req.user.userId;
      let tagsArray = [];

      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string" && tags.trim() !== "") {
        tagsArray = tags.split(",").map((tag) => tag.trim());
      }
      const newNote = {
        id: Date.now(),
        content,
        category: category || "Geral",
        tags: tagsArray,
        timesTamp: new Date().toISOString(),
        userId,
      };

      if (!newNote.content || newNote.content.trim().length === 0) {
        res.writeHead(400, {
          "Content-type": "application/json",
        });
        res.end(
          JSON.stringify({
            status: "error",
            note: "Conteúdo da nota não pode esta vazio",
          })
        );
        return;
      }
      notes.unshift(newNote);
      saveNotesToFile();
      res.writeHead(201, {
        "Content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "success",
          note: newNote,
        })
      );
    } catch (error) {
      console.error(error);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Dados Json inválidos",
        })
      );
    }
  });
}

export function handleUpdateNote(req, res, urlParts) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const idToUpdate = parseInt(urlParts[2], 10);
      const userId = req.user.userId;

      if (!data.content || data.content.trim().length === 0) {
        res.writeHead(400, { "Content-type": "application/json" });
        res.end(
          JSON.stringify({
            status: "error",
            message: "O Contreúdo não pode esta vazio",
          })
        );
        return;
      }

      const noteIndex = notes.findIndex(
        (note) => Number(note.id) === idToUpdate && note.userId === userId
      );

      if (noteIndex !== -1) {
        notes[noteIndex].content = data.content.trim();
        notes[noteIndex].timesTamp = Date.now();
        saveNotesToFile();
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify(notes[noteIndex]));
      } else {
        res.writeHead(404, { "Content-type": "application/json" });
        res.end(
          JSON.stringify({
            status: "error",
            message: "Nota não foi encontada",
          })
        );
      }
    } catch (error) {
      console.error("Erro ao processar JSON no PUT:", error.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "error",
          message: "JSON da requisição PUT inválido.",
        })
      );
    }
  });
}

export function handleDeleteNote(req, res, urlParts) {
  const idToDelete = parseInt(urlParts[2], 10);
  const userId = req.user.userId;

  const noteIndex = notes.findIndex(
    (note) => Number(note.id) === idToDelete && note.userId === userId
  );

  if (noteIndex === -1) {
    res.writeHead(404, {
      "Content-Type": "text/plain",
    });

    res.end(JSON.stringify({ message: "Erro ao localizar a nota" }));
    return;
  }

  notes.splice(noteIndex, 1);

  saveNotesToFile();
  res.writeHead(204, {
    "Content-Type": "text/plain",
  });

  res.end(JSON.stringify(notes[noteIndex]));
}
