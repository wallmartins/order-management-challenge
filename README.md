# Order Management System

Sistema de gerenciamento de pedidos laboratoriais desenvolvido com Node.js, Express, TypeScript e MongoDB com autenticação JWT, controle de estado e gerenciamento de serviços.

## 📋 Índice

- [Tecnologias](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando](#executando-o-projeto)
- [Documentação API](#documentação-api-swagger)
- [Endpoints](#endpoints-da-api)
- [Testes](#testes)
- [Regras de Negócio](#regras-de-negócio)
- [Cobertura de Testes](#cobertura-de-testes)

## 🚀 Tecnologias Utilizadas

### Core
- **Node.js** (v18+) - Runtime JavaScript
- **Express** - Framework web minimalista
- **TypeScript** - Superset tipado do JavaScript

### Banco de Dados
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM (Object Data Modeling) para MongoDB

### Segurança & Validação
- **JWT (jsonwebtoken)** - Autenticação baseada em tokens
- **Bcrypt** - Hash de senhas com salt
- **Zod** - Validação de schemas em runtime

### Testes
- **Vitest** - Framework de testes unitários
- **@vitest/coverage-v8** - Relatórios de cobertura de código

### Documentação
- **Swagger (OpenAPI 3.0)** - Documentação interativa da API
- **swagger-jsdoc** - Geração de specs a partir de JSDoc
- **swagger-ui-express** - Interface visual do Swagger

### Desenvolvimento
- **tsx** - Execução de TypeScript no desenvolvimento
- **dotenv** - Gerenciamento de variáveis de ambiente
- **ESLint** - Linter para código
- **Prettier** - Formatação de código

## 🏗️ Arquitetura do Projeto

O projeto segue os princípios de **Clean Architecture** com clara separação de responsabilidades:

```
src/
├── config/             # Configurações da aplicação
│   ├── database.ts     # Conexão com MongoDB
│   ├── environment.ts  # Variáveis de ambiente
│   └── swagger.ts      # Configuração do Swagger
├── models/             # Modelos Mongoose (Entities)
│   ├── User.ts
│   └── Order.ts
├── controllers/        # Controllers (Interface de entrada)
│   ├── auth.controller.ts
│   └── order.controller.ts
├── services/           # Camada de lógica de negócio
│   ├── auth.service.ts
│   └── order.service.ts
├── middlewares/        # Middlewares do Express
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── routes/             # Definição de rotas
│   ├── auth.routes.ts
│   ├── order.routes.ts
│   ├── order.routes.swagger.ts
│   └── index.ts
├── validators/         # Schemas de validação Zod
│   ├── auth.validator.ts
│   └── order.validator.ts
├── types/              # Definições de tipos TypeScript
│   ├── user.types.ts
│   ├── order.types.ts
│   └── express.types.ts
├── utils/              # Funções utilitárias
│   ├── hash.util.ts
│   ├── jwt.util.ts
│   └── response.util.ts
├── app.ts              # Configuração do Express
└── server.ts           # Entry point da aplicação

tests/
├── unit/               # Testes unitários (100% coverage)
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── validators/
└── setup.ts            # Setup global dos testes
```

## 📋 Pré-requisitos

- **Node.js** v18 ou superior
- **MongoDB** v5 ou superior
- **npm** ou **yarn**

## 📥 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd order-management-challenge
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/order-management
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

4. Certifique-se de que o MongoDB está rodando:
```bash
# Usando Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou inicie o MongoDB localmente:
mongod
```

## 🎯 Executando o Projeto

### Modo Desenvolvimento (com hot reload)
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

### Modo Produção
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 📚 Documentação API (Swagger)

Acesse a documentação interativa da API:

```
http://localhost:3000/api-docs
```

A documentação Swagger fornece:
- ✅ Descrição completa de todos os endpoints
- ✅ Schemas de request e response
- ✅ Exemplos de uso
- ✅ Interface para testar os endpoints diretamente
- ✅ Autenticação JWT integrada

## 🌐 Endpoints da API

### 🔐 Autenticação

Todas as rotas de pedidos requerem autenticação JWT no header:
```http
Authorization: Bearer <seu-token-jwt>
```

#### `POST /api/auth/register`
Registrar novo usuário

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2025-12-28T...",
      "updatedAt": "2025-12-28T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### `POST /api/auth/login`
Realizar login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 📦 Pedidos (Orders)

#### `POST /api/orders`
Criar novo pedido

**Request:**
```json
{
  "lab": "Lab XYZ",
  "patient": "João Silva",
  "customer": "Cliente ABC",
  "services": [
    {
      "name": "Exame de sangue",
      "value": 100.50,
      "status": "PENDING"
    },
    {
      "name": "Raio-X",
      "value": 200.00
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "lab": "Lab XYZ",
    "patient": "João Silva",
    "customer": "Cliente ABC",
    "state": "CREATED",
    "status": "ACTIVE",
    "services": [...],
    "createdAt": "2025-12-28T...",
    "updatedAt": "2025-12-28T..."
  },
  "message": "Order created successfully"
}
```

#### `GET /api/orders`
Listar pedidos com paginação e filtros

**Query Parameters:**
- `page` (opcional, padrão: 1) - Número da página
- `limit` (opcional, padrão: 10) - Itens por página
- `state` (opcional) - Filtrar por estado: `CREATED`, `ANALYSIS`, `COMPLETED`

**Exemplo:**
```http
GET /api/orders?page=2&limit=5&state=ANALYSIS
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 50,
    "page": 2,
    "limit": 5,
    "totalPages": 10
  }
}
```

#### `PATCH /api/orders/:id/advance`
Avançar estado do pedido

**Fluxo de estados:**
```
CREATED → ANALYSIS → COMPLETED
```

**Regras:**
- ✅ Para avançar de `ANALYSIS` para `COMPLETED`, **todos os serviços devem estar com status `DONE`**
- ❌ Não é possível pular estados
- ❌ Não é possível retroceder

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "state": "ANALYSIS",
    ...
  },
  "message": "Order state advanced successfully"
}
```

**Erro (400) - Serviços pendentes:**
```json
{
  "error": "Cannot advance to COMPLETED. Pending services: Exame de sangue, Raio-X"
}
```

#### `PATCH /api/orders/:orderId/services/:serviceIndex`
Atualizar status de um serviço

**Path Parameters:**
- `orderId` - ID do pedido
- `serviceIndex` - Índice do serviço no array (começa em 0)

**Request:**
```json
{
  "status": "DONE"
}
```

**Valores válidos:** `PENDING` | `DONE`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "services": [
      {
        "name": "Exame de sangue",
        "value": 100.50,
        "status": "DONE"  // ← Atualizado
      },
      {
        "name": "Raio-X",
        "value": 200.00,
        "status": "PENDING"
      }
    ],
    ...
  },
  "message": "Service status updated successfully"
}
```

#### `DELETE /api/orders/:id`
Deletar pedido (soft delete)

Altera o status do pedido de `ACTIVE` para `DELETED`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "DELETED",  // ← Status alterado
    ...
  },
  "message": "Order deleted successfully"
}
```

**Erro (400) - Já deletado:**
```json
{
  "error": "Order is already deleted"
}
```

### ⚕️ Health Check

#### `GET /health`
Verificar status da aplicação

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T19:00:00.000Z"
}
```

## 🧪 Testes

O projeto possui **100% de cobertura de testes** em todas as métricas.

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar com interface visual
npm run test:ui

# Executar com relatório de cobertura
npm run test:coverage

# Executar apenas testes unitários
npm run test:unit
```

### Cobertura de Testes

```
Test Files: 16 passed (16)
Tests: 163 passed (163)

Coverage:
All files          | 100% | 100% | 100% | 100% |
-------------------|------|------|------|------|
Statements         | 100% |
Branches           | 100% |
Functions          | 100% |
Lines              | 100% |
```

**Arquivos testados:**
- ✅ Config (database, environment)
- ✅ Controllers (auth, order)
- ✅ Middlewares (auth, validation, error)
- ✅ Models (User, Order)
- ✅ Services (auth, order)
- ✅ Utils (hash, jwt, response)
- ✅ Validators (auth, order)

## 📐 Modelos de Dados

### User
```typescript
{
  _id: ObjectId
  email: string (unique, required)
  password: string (hashed, required)
  createdAt: Date
  updatedAt: Date
}
```

### Order
```typescript
{
  _id: ObjectId
  lab: string (required)
  patient: string (required)
  customer: string (required)
  state: "CREATED" | "ANALYSIS" | "COMPLETED" (default: "CREATED")
  status: "ACTIVE" | "DELETED" (default: "ACTIVE")
  services: [
    {
      name: string (required)
      value: number (required, > 0)
      status: "PENDING" | "DONE" (default: "PENDING")
    }
  ] (min: 1 service)
  createdAt: Date
  updatedAt: Date
}
```

## 📜 Regras de Negócio

### 1. Autenticação
- ✅ Todas as rotas de pedidos requerem token JWT válido
- ✅ Senhas são hasheadas com bcrypt (10 rounds) antes de armazenar
- ✅ Tokens JWT expiram em 7 dias (configurável via `JWT_EXPIRES_IN`)
- ✅ Email deve ser único no sistema

### 2. Validação de Pedidos
- ✅ Pedido deve ter pelo menos 1 serviço
- ✅ Valor total dos serviços deve ser > 0
- ✅ Todos os campos obrigatórios devem ser preenchidos
- ✅ Valores numéricos devem ser positivos

### 3. Transição de Estados
- ✅ Fluxo linear: `CREATED → ANALYSIS → COMPLETED`
- ✅ Não é permitido pular etapas
- ✅ Não é permitido retroceder estados
- ✅ Pedidos em `COMPLETED` não podem mais avançar
- ✅ **Para avançar para `COMPLETED`:** todos os serviços devem estar `DONE`

### 4. Gerenciamento de Serviços
- ✅ Cada serviço tem status independente: `PENDING` ou `DONE`
- ✅ Serviços são indexados a partir de 0
- ✅ Status dos serviços pode ser atualizado a qualquer momento
- ✅ Validação de status antes de avançar para `COMPLETED`

### 5. Soft Delete
- ✅ Pedidos não são removidos do banco de dados
- ✅ Status `DELETED` marca o pedido como removido
- ✅ Pedidos já deletados não podem ser deletados novamente
- ✅ Pedidos deletados permanecem visíveis no banco

## 🔒 Segurança

- ✅ **Autenticação JWT** em todas as rotas protegidas
- ✅ **Bcrypt** para hash de senhas com salt
- ✅ **Validação de entrada** com Zod em todas as rotas
- ✅ **Tipagem forte** com TypeScript (sem `any`)
- ✅ **CORS** habilitado
- ✅ **Sanitização** de dados de entrada
- ✅ **Tratamento de erros** centralizado

## 📊 Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Erro
```json
{
  "error": "Error message",
  "details": "Optional error details or validation errors array"
}
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento (hot reload)
npm run build        # Build de produção (compila TypeScript)
npm start            # Inicia em modo produção
npm test             # Executa todos os testes
npm run test:ui      # Executa testes com interface visual
npm run test:coverage # Executa testes com relatório de cobertura
npm run test:unit    # Executa apenas testes unitários
npm run lint         # Executa o linter (ESLint)
npm run format       # Formata o código (Prettier)
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `NODE_ENV` | Ambiente de execução | `development` | Não |
| `PORT` | Porta do servidor | `3000` | Não |
| `MONGO_URI` | URI de conexão MongoDB | `mongodb://localhost:27017/order-management` | Não |
| `JWT_SECRET` | Chave secreta para JWT | `your-secret-key-change-in-production` | Sim (produção) |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` | Não |

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças seguindo conventional commits
4. Certifique-se de que os testes passam (`npm test`)
5. Verifique a cobertura (`npm run test:coverage`)
6. Push para a branch (`git push origin feature/AmazingFeature`)
7. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

---

Desenvolvido com ❤️ usando Node.js, TypeScript e MongoDB
