
# Enterprise Protocol System

Sistema Enterprise de Protocolo e Tramitação Eletrônica de Documentos, construído com Next.js 14, MongoDB, Tailwind CSS e TypeScript.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB Atlas + Mongoose
- **Autenticação**: NextAuth.js (JWT + RBAC)
- **UI**: Tailwind CSS + Lucide Icons + Recharts
- **Forms**: React Hook Form + Zod

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB URI (Atlas ou Local)
- Redis (Opcional, para filas de email)

## 🛠️ Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone <repo-url>
   cd protocolo-lisboa
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Duplique o arquivo `.env.example` para `.env.local` e preencha as variáveis.
   ```bash
   cp .env.example .env.local
   ```

4. **Popule o banco de dados (Seed):**
   Execute o script de seed para criar os setores iniciais e o usuário administrador padrão.
   ```bash
   npm install -D ts-node
   npx ts-node scripts/seed.ts
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação:**
   Abra [http://localhost:3000](http://localhost:3000)

## 🔑 Acesso Inicial (Admin)

- **Email**: `admin@empresa.com`
- **Senha**: `admin123`

## 🏗️ Estrutura do Projeto

- `/app`: Páginas e APIs (Next.js App Router)
- `/components`: Componentes React reutilizáveis
- `/models`: Schemas do Mongoose (User, Protocol, Workflow...)
- `/lib`: Configurações de serviços (DB, Auth)
- `/types`: Definições de tipos TypeScript extensivos
- `/scripts`: Scripts de manutenção e seed

## 🛡️ Segurança

- RBAC (Role Based Access Control) implementado via Middleware e verificação de sessão.
- Proteção contra injeção NoSQL via Mongoose.
- Senhas hashadas com Bcrypt.

## 📦 Deploy

Este projeto está pronto para deploy na **Vercel**.

1. Crie um novo projeto na Vercel e conecte o repositório.
2. Adicione as variáveis de ambiente do `.env.local` nas configurações do projeto na Vercel.
3. Deploy!

---
Desenvolvido por Vinicius Silva de Andrade (Lisboa Informática).
