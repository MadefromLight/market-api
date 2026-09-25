# Market API

Production-style e-commerce REST API built with TypeScript, Node.js, Express, PostgreSQL and Prisma.

## Demonstrates
- JWT authentication and role-based authorization
- Zod request validation
- Products, categories, inventory, carts and orders
- Prisma transactions and relational modeling
- Centralized error handling
- Vitest/Supertest testing
- Docker and GitHub Actions CI

## Quick start
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API: http://localhost:3000

Core routes: `/health`, `/api/auth`, `/api/products`, `/api/categories`, `/api/cart`, `/api/orders`.

## Tests
```bash
npm test
npm run build
```
