import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users, saveUsersToFile } from "./data.js";

const JWT_SECRET = "secret";
const saltRounds = 10;

function authToken(userId, username) {
  const payload = { userId, username };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  return token;
}

export function authenticationToken(res, req, callback) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Acesso negado: Token não fornecido" }));
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Tokin Inválido ou expirado" }));
      return;
    }
    req.user = user;
    callback();
  });
}

export async function handleRegister(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {
      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Nome de usuário e senha são obrigatórios.",
          })
        );
        return;
      }

      if (users.some((user) => user.username === username)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Nome de usuário já existe." }));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = {
        id: Date.now(),
        username,
        password: hashedPassword,
      };

      users.push(newUser);
      saveUsersToFile();

      const token = authToken(newUser.id, newUser.username);

      res.writeHead(201, { "Content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: newUser.id,
          token,
          message: "Usuário regristrado com sucesso",
        })
      );
    } catch (error) {
      console.error("erro no registro: ", error);
      res.writeHead(500, { "Content-type": "application/json" });
      res.end(JSON.stringify({ message: "Erro interno do servidor" }));
    }
  });
}

export async function handleLogin(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));
  req.on("end", async () => {
    try {
      const { username, password } = JSON.parse(body);
      const user = users.find((user) => user.username === username);

      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Credenciais inválidas" }));
        return;
      }

      const passwordMath = await bcrypt.compare(password, user.password);

      if (!passwordMath) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Credenciais invalidas" }));
        return;
      }

      // token

      const token = authToken(user.id, user);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Login bem-sucedido!", token }));
    } catch (error) {
      console.error("Erro no login ", error);
      res.writeHead(500, { "Content-type": "application/json" });
      res.end(JSON.stringify({ message: "Erro interno do servidor" }));
    }
  });
}
