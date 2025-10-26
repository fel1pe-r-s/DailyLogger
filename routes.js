import fs from "node:fs";
import { authenticationToken, handleRegister, handleLogin } from "./auth.js";
import {
  handleGetNotes,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
} from "./notes.js";

function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro interno do servidor");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

export function routes(req, res) {
  const urlParts = req.url.split("/");
  // arquivos estáticos
  if (req.url === "/" && req.method === "GET") {
    serveStaticFile(res, "./index.html", "text/html");
    return;
  }

  if (req.url === "/app.js" && req.method === "GET") {
    serveStaticFile(res, "./app.js", "text/javascript");
    return;
  }

  if (req.url === "/ui.js" && req.method === "GET") {
    serveStaticFile(res, "./ui.js", "text/javascript");
    return;
  }

  if (req.url === "/style.css" && req.method === "GET") {
    serveStaticFile(res, "./style.css", "text/css");
    return;
  }

  //rotas
  if (req.url === "/register" && req.method === "POST") {
    handleRegister(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/login") {
    handleLogin(req, res);
    return;
  }

  // Rotas protegidas
  if (req.url === "/notes" && req.method === "GET") {
    authenticationToken(res, req, () => {
      handleGetNotes(req, res);
    });
  } else if (req.url === "/submit" && req.method === "POST") {
    authenticationToken(res, req, () => {
      handleCreateNote(req, res);
    });
  } else if (req.method === "PUT" && req.url.startsWith("/notes/")) {
    authenticationToken(res, req, () => {
      handleUpdateNote(req, res, urlParts);
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/notes/")) {
    authenticationToken(res, req, () => {
      handleDeleteNote(req, res, urlParts);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - pagina não encontrada");
  }
}
