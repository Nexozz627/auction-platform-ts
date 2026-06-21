# Auction Platform API

A full-stack online auction platform built with Node.js, Express, TypeScript, and PostgreSQL (with Prisma ORM) — featuring secure authentication (including Google OAuth2), race-condition-safe bidding, and automated auction closing via a scheduled job (a cron job).

— The server is fully hosted on my own VPS with its own domain name (HTTPS protocol), no BaaS used (no Supabase or Firebase) — but the frontend is still hosted on Vercel for now, for convenience.

— You can test some features directly by opening this link in your browser:
**🔗 Live Demo:** [https://auction-platform-ts.vercel.app](#) 

---

## 📋 Overview

This project simulates a real-world auction marketplace: users can register, list items for auction, place bids, and automatically get a winner once the auction closes. It was built to demonstrate production-grade backend engineering — secure auth, race-condition-safe transactions, scheduled background jobs, and a fully documented REST API — deployed end-to-end on real infrastructure (VPS + custom domain + automatic HTTPS).

## ✨ Features

- **Authentication**
  - Email/username + password login
  - Google OAuth2 sign-in
  - JWT-based sessions with HttpOnly cookies
- **Auctions**
  - Create, browse, and bid on items
  - Atomic, race-condition-safe bid processing
  - Automatic auction closing via a scheduled cron job
  - Automatic winner detection once an auction ends

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT, HttpOnly cookies, Google OAuth2 |
| Scheduling | node-cron |
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend hosting | VPS + Caddy (reverse proxy with automatic HTTPS via Let's Encrypt) |
| Frontend hosting | Vercel |

## 🏗️ Architecture

```
┌──────────────────┐      HTTPS      ┌───────────────────┐        ┌─────────────┐
│  Frontend (HTML) │───────────────▶│   Caddy (proxy)   │  ────▶ │ Express API │
│  hosted on Vercel│                 │ api.amine-abbaci.xyz│      │   on VPS    │
└──────────────────┘                 └───────────────────┘        └──────┬──────┘
                                                                         │
                                                                         ▼
                                                                  ┌─────────────┐
                                                                  │ PostgreSQL  │
                                                                  │  (Prisma)   │
                                                                  └─────────────┘
```

Frontend and backend are deployed independently and communicate exclusively over HTTPS. The backend is exposed at `api.amine-abbaci.xyz`, with SSL handled automatically by Caddy via Let's Encrypt.

## 🚀 Getting Started

IMPORTANT ❗: Google OAuth2 won't work locally.

### Prerequisites
- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech))

### Installation

```bash
git clone https://github.com/Nexozz627/auction-platform-ts
cd auction-platform-ts
npm install
```

### Environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL= (your PostgreSQL connection string, e.g. from Neon)
NODE_ENV= "development"
JWT_SECRET= (generate it and paste it here)
JWT_EXPIRES_IN= (e.g. "7d")
```

### Database setup

```bash
npx prisma migrate dev
```

### Run the server

```bash
npm run dev
```

The API will be available at `http://localhost:5001`

Main endpoints (you can test these directly by browsing `https://api.amine-abbaci.xyz` in Postman, Requestly, or your browser — browser testing only works for GET requests):

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login with email/username + password |
| POST | `/auth/logout` | Logout |
| GET | `/items` | List all auction items |
| GET | `/items/:id` | Get a single item's details |
| POST | `/items/create` | Create a new auction item |
| POST | `/items/:id/bid` | Place a bid on an item |

## ⚙️ How It Works

### Bidding & race conditions
When a user places a bid, the update runs inside an atomic database transaction, guaranteeing that two simultaneous bids on the same item can never both succeed as the "highest bid" — consistency is enforced at the database level rather than relying on application-level locking.

### Closing auctions automatically
A cron job (`node-cron`) runs every 10 seconds and:
1. Marks expired active items as `CLOSED`
2. Looks up each closed item's highest bid to determine a winner
3. Marks the item as `COMPLETED`

The job is resilient by design: if a previous run is interrupted partway through, any item left in the `CLOSED` state is automatically picked up and finished on the next run, rather than being stuck permanently.

## 📁 Project Structure

```
auction-platform-ts/
├── src/
│   ├── config/
│   │   └── db.ts                  # Database connection setup
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── bidsController.ts
│   │   └── itemsController.ts
│   ├── jobs/
│   │   └── auctionJob.ts          # Scheduled auction-closing cron job
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── validateRequest.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── itemsRoutes.ts
│   ├── utils/
│   │   └── generateToken.ts
│   ├── validators/
│   │   └── authValidators.ts
│   └── server.ts                  # App entry point
├── prisma/                        # Prisma schema & migrations
├── index.html                     # Frontend (deployed separately on Vercel)
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── tsconfig.json
```

## 👤 Author

**Amine Abbaci**
- GitHub: [@Nexozz627](#)