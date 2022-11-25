# Nuxt 3 Playground

Trying to integrate Remix like loaders/actions.

## Setup

Install the dependencies:

```bash
pnpm install
```

Setup prisma

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the development server on http://localhost:3000

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
DATABASE_URL="file:/Users/somewhere/nuxt-playground/prisma/dev.db" pnpm preview
```
