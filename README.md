**Tags**: #Autenticação&autorização #CSS #Docker #Html #JTW #JavaScript #Markdown #Node

#DailyLogger # DailyLogger

DailyLogger é uma aplicação simples para registrar atividades diárias, permitindo aos usuários criar contas, fazer login e gerenciar (criar, ler, atualizar e excluir) suas anotações pessoais.

## Funcionalidades

-   **Autenticação**: Cadastro e Login de usuários utilizando JWT (JSON Web Tokens).
-   **Gerenciamento de Anotações**:
    -   Criar novas anotações.
    -   Visualizar lista de anotações.
    -   Editar anotações existentes.
    -   Excluir anotações.
-   **Interface**: Interface web simples e interativa.

## Tecnologias Utilizadas

-   **Backend**: Node.js (sem frameworks externos para roteamento, utilizando apenas módulos nativos e bibliotecas auxiliares).
-   **Frontend**: HTML, CSS, JavaScript (Vanilla).
-   **Armazenamento de Dados**: Arquivos JSON (`users.json` para usuários e `notes.json` para anotações).
-   **Segurança**: `bcrypt` para hash de senhas e `jsonwebtoken` para autenticação.

## Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

## Instalação

1.  Clone o repositório ou baixe os arquivos.
2.  Navegue até o diretório do projeto:
    ```bash
    cd dailylogger
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```

## Como Rodar

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`. Abra este endereço no seu navegador para acessar a aplicação.

## Estrutura do Projeto

-   `server.js`: Ponto de entrada do servidor.
-   `routes.js`: Gerenciador de rotas da aplicação.
-   `auth.js`: Lógica de autenticação e gerenciamento de usuários.
-   `notes.js`: Lógica CRUD para as anotações.
-   `data.js`: Utilitários para leitura e escrita nos arquivos JSON.
-   `ui.js`: Lógica do Frontend.
-   `app.js`: Script principal do Frontend.
-   `index.html`: Página principal da aplicação.
-   `style.css`: Estilos da aplicação.
-   `users.json`: Banco de dados de usuários (gerado automaticamente).
-   `notes.json`: Banco de dados de anotações (gerado automaticamente).

## Uso

1.  **Cadastro**: Na tela inicial, utilize o formulário de cadastro para criar uma nova conta.
2.  **Login**: Utilize suas credenciais para entrar.
3.  **Dashboard**: Após o login, você verá suas anotações. Use o botão "+" para adicionar uma nova nota. Clique no ícone de lápis para editar ou na lixeira para excluir uma nota.
