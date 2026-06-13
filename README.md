# Zenith

Төсөл болон таскаа удирдах full-stack SaaS dashboard. Нэвтрэлт, багийн таск, аналитик, төлбөр, мэдэгдэл, удирдлагын самбартай.

## Технологи

- Next.js (App Router) + TypeScript
- Prisma ORM + libSQL / Turso (cloud SQLite) — production-д cloud, local-д better-sqlite3
- NextAuth.js — нэвтрэлт (credentials)
- Tailwind CSS + Radix UI
- Recharts — аналитик график
- Framer Motion — анимаци
- Nodemailer — и-мэйл

## Боломжууд

- Бүртгэл, нэвтрэлт (NextAuth)
- Төсөл, таск удирдлага
- Dashboard, аналитик график
- Төлбөр / billing
- Мэдэгдэл (notification)
- Дата экспорт хийх
- Admin самбар — хэрэглэгч, статистик
- Blog, docs хэсэг

## Бүтэц

```
src/app/
  (auth)/         login, register
  (dashboard)/    dashboard, analytics, tasks, settings
  admin/          удирдлагын самбар
  api/            auth, projects, tasks, billing, notifications, export, stats, admin
  blog/           блог
  docs/           баримт бичиг
prisma/           schema, migrations
scripts/          set-admin, turso-migrate, full-schema
```

## Эхлүүлэх

```bash
npm install
cp .env.example .env        # доорх хувьсагчдыг бөглөнө
npx prisma generate
npx prisma migrate dev      # эсвэл local SQLite ашиглах
npm run dev                 # http://localhost:3000
```

## Орчны хувьсагч (`.env`)

```env
# Local: better-sqlite3 файл, эсвэл Turso cloud
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL=          # production (заавал биш)
TURSO_AUTH_TOKEN=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# И-мэйл (заавал биш)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## Admin болгох

```bash
node scripts/set-admin.mjs your@email.com
```

## Deploy

Vercel дээр deploy хийхэд production-д Turso (libSQL) ашиглана. `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`-ийг Vercel Environment Variables-д нэмнэ.
