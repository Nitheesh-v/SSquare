# S Square Engineering Services — Full-Stack Monorepo (`ssquareengg.com`)

Modern full-stack industrial B2B platform for **S Square Engineering Services** (Peelamedu, Coimbatore, India), featuring a feature-sliced **Next.js (App Router) + Tailwind CSS** frontend (`frontend/`) and a modular **NestJS + Mongoose** REST API backend (`backend/`).

## Repository Structure

```text
SSquare/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── (store)/
    │   │   │   ├── page.tsx
    │   │   │   ├── products/
    │   │   │   └── categories/
    │   │   ├── (auth)/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── account/
    │   │   ├── admin/
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── layout/
    │   │   └── shared/
    │   ├── features/
    │   │   ├── products/
    │   │   ├── cart/
    │   │   ├── auth/
    │   │   └── checkout/
    │   ├── services/
    │   ├── store/
    │   ├── hooks/
    │   ├── lib/
    │   ├── types/
    │   └── utils/
    ├── .env.local
    └── package.json
```

## Quick Start

### 1. Start the NestJS Backend (`http://localhost:4000`)

```bash
cd backend
npm install
npm run start:dev
```

- REST API Base: `http://localhost:4000/api/v1`
- Swagger API Docs: `http://localhost:4000/api/docs`

### 2. Start the Next.js Frontend (`http://localhost:3000`)

```bash
cd frontend
npm install
npm run dev
```

### Demo Accounts
- **OEM Buyer**: `buyer@example.com` / `Buyer@123` (`/account`)
- **Admin Console**: `sales@ssquareengg.com` / `Admin@123` (`/admin`)
