# 📡 HERSAFE — Documentação da API de Usuários

> **Base URL:** `http://<IP_DO_SERVIDOR>:3000/api/usuarios`  
> **Formato:** JSON  
> **Autenticação:** Bearer Token (JWT)

---

## 🔐 Autenticação

Todas as rotas marcadas com 🔒 exigem o token JWT no header da requisição:

```
Authorization: Bearer <token>
```

O token é retornado automaticamente no login e no registro. O front deve armazená-lo (ex: `AsyncStorage` no React Native) e enviá-lo em todas as chamadas protegidas.

---

## 📦 Modelo do Usuário

```json
{
  "id": "string (ObjectId)",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "contatoDeEmergencia": {
    "nome": "string",
    "telefone": "string"
  },
  "meusLocais": [
    {
      "_id": "string (ObjectId)",
      "nome": "string",
      "endereco": "string",
      "latitude": "number (opcional)",
      "longitude": "number (opcional)"
    }
  ],
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

> ⚠️ O campo `senha` **nunca** é retornado pela API.

---

## 🟢 Rotas Públicas

### `POST /registro`
Cria uma nova conta e retorna o token de acesso.

**Body:**
```json
{
  "nome": "Ana Silva",
  "email": "ana@email.com",
  "senha": "minhasenha123",
  "telefone": "(11) 91234-5678",
  "contatoDeEmergencia": {
    "nome": "João Silva",
    "telefone": "(11) 98765-4321"
  },
  "meusLocais": []
}
```

**Resposta `201 Created`:**
```json
{
  "mensagem": "Usuário criado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "...dados do usuário..." }
}
```

---

### `POST /login`
Autentica o usuário e retorna o token de acesso.

**Body:**
```json
{
  "email": "ana@email.com",
  "senha": "minhasenha123"
}
```

**Resposta `200 OK`:**
```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "...dados do usuário..." }
}
```

---

## 🔒 Rotas Protegidas

> Todas exigem o header: `Authorization: Bearer <token>`

---

### `GET /perfil` 🔒
Retorna os dados do usuário atualmente autenticado (extraído do token).

**Resposta `200 OK`:**
```json
{
  "usuario": { "...dados do usuário logado..." }
}
```

---

### `GET /` 🔒
Lista todos os usuários cadastrados.

**Resposta `200 OK`:**
```json
{
  "total": 5,
  "usuarios": [ "...array de usuários..." ]
}
```

---

### `GET /:id` 🔒
Busca um usuário específico pelo ID.

**Resposta `200 OK`:**
```json
{
  "usuario": { "...dados do usuário..." }
}
```

---

### `PUT /:id` 🔒
Atualiza os dados do usuário. **Só o próprio usuário pode editar o seu perfil.**

> O `:id` deve ser o ID do usuário logado.

**Body (todos os campos são opcionais):**
```json
{
  "nome": "Ana Souza",
  "email": "ana.souza@email.com",
  "telefone": "(11) 99999-0000",
  "contatoDeEmergencia": {
    "nome": "Pedro Souza",
    "telefone": "(11) 97777-1111"
  },
  "meusLocais": [
    {
      "nome": "Casa",
      "endereco": "Rua das Flores, 123",
      "latitude": -23.55052,
      "longitude": -46.633308
    }
  ]
}
```

> ⚠️ Para atualizar a senha, use um endpoint dedicado (não incluso nesta versão).

**Resposta `200 OK`:**
```json
{
  "mensagem": "Usuário atualizado.",
  "usuario": { "...dados atualizados..." }
}
```

---

### `DELETE /:id` 🔒
Deleta a conta do usuário. **Só o próprio usuário pode deletar a sua conta.**

**Resposta `200 OK`:**
```json
{
  "mensagem": "Usuário deletado com sucesso."
}
```

---

## ❌ Códigos de Erro

| Código | Significado |
|--------|-------------|
| `400`  | Dados inválidos ou e-mail já cadastrado |
| `401`  | Token ausente, inválido ou expirado |
| `403`  | Sem permissão (tentativa de editar outro usuário) |
| `404`  | Usuário não encontrado |
| `500`  | Erro interno do servidor |

**Formato padrão de erro:**
```json
{
  "mensagem": "Descrição do erro."
}
```

---

## 💡 Fluxo sugerido para o Front-end

```
1. Usuário abre o app
        │
        ▼
2. Tem token salvo?
   ├── SIM → GET /perfil (valida se ainda está ativo)
   │         ├── 200 OK  → vai para Home
   │         └── 401     → redireciona para Login
   └── NÃO → tela de Login / Registro
        │
        ▼
3. POST /login  ou  POST /registro
        │
        ▼
4. Salvar token retornado (AsyncStorage)
        │
        ▼
5. Usar token em todas as chamadas protegidas
```

---

## 🧪 Exemplo com `fetch` (React Native)

```js
// ── Login ──────────────────────────────────────
const response = await fetch('http://<IP>:3000/api/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha }),
});
const data = await response.json();
await AsyncStorage.setItem('token', data.token);

// ── Rota protegida: buscar perfil ──────────────
const token = await AsyncStorage.getItem('token');

const perfil = await fetch('http://<IP>:3000/api/usuarios/perfil', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
const { usuario } = await perfil.json();
```

---

*Dúvidas? Fale com o time de back-end. 🚀*
