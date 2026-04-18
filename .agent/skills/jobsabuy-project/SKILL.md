---
name: JobSabuy Project Stack & Architecture
description: เว็บไซต์หางาน JobSabuy — Tech Stack, Architecture Guidelines, และ Development Standards สำหรับโปรเจค Job Board Platform
---

# 🚀 JobSabuy — Job Board Platform

เว็บไซต์หางานสัญชาติไทย สร้างด้วย Modern Stack เน้น **SEO**, **ความเร็วในการค้นหา**, และ **Scalability**

---

## 📐 Architecture Overview

```mermaid
graph TB
    subgraph Client["🌐 Frontend (Next.js)"]
        SSR["SSR Pages (SEO)"]
        CSR["Client Components"]
        TW["Tailwind CSS"]
        UI["Shadcn/UI"]
    end

    subgraph API["🐲 Backend (NestJS)"]
        Auth["Auth Module"]
        Jobs["Jobs Module"]
        Users["Users Module"]
        Resume["Resume Module"]
        Company["Company Module"]
        Search["Search Module"]
    end

    subgraph Data["🗄️ Data Layer"]
        PG["PostgreSQL"]
        RD["Redis Cache"]
        ES["Elasticsearch / Meilisearch"]
        S3["AWS S3 / GCS"]
    end

    Client -->|REST / GraphQL| API
    API --> PG
    API --> RD
    API --> ES
    API --> S3
```

---

## 🎯 Tech Stack Summary

| Layer                  | Technology                          | Version (Target) | Purpose                                |
| ---------------------- | ----------------------------------- | ---------------- | -------------------------------------- |
| **Frontend Framework** | Next.js (React)                     | 14+ (App Router) | SSR/SSG for SEO, React ecosystem       |
| **Styling**            | Tailwind CSS                        | 3.x / 4.x        | Utility-first CSS, fast prototyping    |
| **UI Components**      | Shadcn/UI                           | Latest           | Radix-based accessible components      |
| **Language**           | TypeScript                          | 5.x              | Shared types across Frontend & Backend |
| **Backend Framework**  | NestJS                              | 10+              | Modular, scalable, TypeScript-native   |
| **Primary Database**   | PostgreSQL                          | 16+              | Relational data, JSON support          |
| **Cache**              | Redis                               | 7+               | Session, search cache, rate limiting   |
| **Search Engine**      | Elasticsearch / Meilisearch         | 8.x / 1.x        | Full-text search, Thai tokenization    |
| **File Storage**       | AWS S3 / Google Cloud Storage       | —                | Resume PDFs, profile images, logos     |
| **ORM**                | Prisma                              | 5+               | Type-safe DB access, migrations        |
| **Auth**               | NextAuth.js + JWT                   | —                | OAuth, credentials, session management |
| **API Style**          | REST (primary) + GraphQL (optional) | —                | Standard API communication             |

---

## 📁 Monorepo Structure (Recommended)

```
JobSabuy/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/                # App Router (pages, layouts)
│   │   ├── components/         # React Components
│   │   │   ├── ui/             # Shadcn/UI components
│   │   │   ├── job/            # Job-related components
│   │   │   ├── company/        # Company-related components
│   │   │   └── common/         # Shared components (Header, Footer)
│   │   ├── lib/                # Utilities, API clients
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── styles/             # Global CSS, Tailwind config
│   │   └── public/             # Static assets
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── users/          # User management
│       │   ├── jobs/           # Job listings CRUD
│       │   ├── companies/      # Company profiles
│       │   ├── resumes/        # Resume management
│       │   ├── search/         # Search integration
│       │   ├── upload/         # File upload (S3)
│       │   ├── common/         # Guards, interceptors, pipes
│       │   └── prisma/         # Prisma service & module
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── migrations/     # Migration files
│
├── packages/
│   ├── shared-types/           # Shared TypeScript types/interfaces
│   ├── validators/             # Shared validation schemas (Zod)
│   └── config/                 # Shared configs (ESLint, Prettier, TSConfig)
│
├── docker/
│   ├── docker-compose.yml      # Local dev (PostgreSQL, Redis, Elasticsearch)
│   └── Dockerfile.*            # Production Dockerfiles
│
├── docs/                       # Documentation
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── .env.example                # Environment variables template
```

---

## 🗄️ Database Schema (Core Entities)

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string password_hash
        enum role "JOBSEEKER | EMPLOYER | ADMIN"
        string first_name
        string last_name
        string phone
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    COMPANY {
        uuid id PK
        uuid owner_id FK
        string name
        string slug UK
        string logo_url
        text description
        string website
        string industry
        string size
        json social_links
        boolean is_verified
        timestamp created_at
    }

    JOB {
        uuid id PK
        uuid company_id FK
        string title
        string slug UK
        text description
        text requirements
        text benefits
        decimal salary_min
        decimal salary_max
        boolean salary_visible
        enum job_type "FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP | FREELANCE"
        enum work_model "ONSITE | REMOTE | HYBRID"
        string location_province
        string location_district
        json required_skills
        enum status "DRAFT | ACTIVE | CLOSED | EXPIRED"
        timestamp published_at
        timestamp expires_at
        timestamp created_at
    }

    RESUME {
        uuid id PK
        uuid user_id FK
        string title
        string file_url
        text summary
        json experience
        json education
        json skills
        json certifications
        boolean is_primary
        timestamp created_at
    }

    APPLICATION {
        uuid id PK
        uuid job_id FK
        uuid user_id FK
        uuid resume_id FK
        text cover_letter
        enum status "PENDING | REVIEWED | SHORTLISTED | INTERVIEW | OFFERED | REJECTED | WITHDRAWN"
        timestamp applied_at
        timestamp updated_at
    }

    SAVED_JOB {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        timestamp saved_at
    }

    USER ||--o{ COMPANY : owns
    USER ||--o{ RESUME : has
    USER ||--o{ APPLICATION : applies
    USER ||--o{ SAVED_JOB : saves
    COMPANY ||--o{ JOB : posts
    JOB ||--o{ APPLICATION : receives
    JOB ||--o{ SAVED_JOB : "saved by"
    RESUME ||--o{ APPLICATION : "used in"
```

---

## 🔑 Key Modules & Features

### 👤 Authentication & Authorization

- **Strategy**: NextAuth.js (Frontend) + JWT (Backend API)
- **OAuth Providers**: Google, Facebook, LINE (สำคัญสำหรับตลาดไทย)
- **Roles**: `JOBSEEKER`, `EMPLOYER`, `ADMIN`
- **Guards**: NestJS Guards + Decorators for role-based access

### 🔍 Search (หัวใจสำคัญ)

- **Engine**: Elasticsearch หรือ Meilisearch
- **Features**:
  - Full-text search (รองรับภาษาไทย + English)
  - Fuzzy matching (พิมพ์ผิดก็หาเจอ)
  - Faceted filters: จังหวัด, ประเภทงาน, เงินเดือน, ทักษะ, รูปแบบการทำงาน
  - Auto-suggestions / Autocomplete
  - Search analytics (เก็บข้อมูลคำค้นยอดนิยม)
- **⛔ ห้ามใช้**: SQL `LIKE %...%` เด็ดขาด

### 📊 Job Listing

- **SEO**: ใช้ SSR + Structured Data (JSON-LD `JobPosting` schema)
- **URL Pattern**: `/jobs/[slug]` — human-readable URL
- **Sitemap**: Auto-generate sitemap.xml สำหรับ Google Indexing
- **Open Graph**: Meta tags สำหรับ Social Sharing

### 📄 Resume Management

- **Upload**: PDF/DOCX → เก็บใน S3
- **Parsing**: ดึงข้อมูลจาก Resume อัตโนมัติ (optional, อนาคต)
- **Multiple Resumes**: ผู้ใช้มี Resume ได้หลายฉบับ

### 🏢 Company Profiles

- **Public Page**: `/companies/[slug]`
- **Dashboard**: จัดการประกาศงาน, ดู Applications
- **Verification**: ระบบยืนยันบริษัท

---

## 🛡️ Development Standards

### TypeScript Rules

```typescript
// ✅ ALWAYS use strict TypeScript
// tsconfig.json → "strict": true

// ✅ Share types via @jobsabuy/shared-types
import type { Job, User, Application } from "@jobsabuy/shared-types";

// ✅ Use Zod for runtime validation
import { z } from "zod";
const CreateJobSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  jobType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ]),
});
```

### API Design

```
# RESTful API Conventions
GET    /api/v1/jobs              # List jobs (with pagination, filters)
GET    /api/v1/jobs/:slug        # Get job detail
POST   /api/v1/jobs              # Create job (Employer only)
PATCH  /api/v1/jobs/:id          # Update job (Owner only)
DELETE /api/v1/jobs/:id          # Soft delete job

GET    /api/v1/search/jobs?q=    # Search jobs (Elasticsearch)

POST   /api/v1/applications      # Apply to job
GET    /api/v1/applications/me   # My applications (Jobseeker)
GET    /api/v1/jobs/:id/applications  # Job applications (Employer)
```

### NestJS Module Pattern

```typescript
// ✅ แต่ละ Module ต้องมีโครงสร้างแบบนี้
// jobs/
// ├── jobs.module.ts
// ├── jobs.controller.ts
// ├── jobs.service.ts
// ├── dto/
// │   ├── create-job.dto.ts
// │   └── update-job.dto.ts
// ├── entities/
// │   └── job.entity.ts
// └── jobs.repository.ts (optional, if using Repository Pattern)
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jobsabuy

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# S3 / Cloud Storage
S3_BUCKET=jobsabuy-uploads
S3_REGION=ap-southeast-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=xxx
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
LINE_CHANNEL_ID=xxx
LINE_CHANNEL_SECRET=xxx
```

---

## 🐳 Local Development Setup

```bash
# 1. Start infrastructure
docker compose up -d  # PostgreSQL, Redis, Elasticsearch

# 2. Install dependencies
npm install  # or pnpm install

# 3. Setup database
npx prisma migrate dev
npx prisma db seed

# 4. Start development servers
npm run dev  # Turborepo runs both web + api concurrently
```

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: jobsabuy
      POSTGRES_USER: jobsabuy
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  elasticsearch:
    image: elasticsearch:8.12.0
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false

  # Alternative: Meilisearch (ง่ายกว่า, เหมาะสำหรับ MVP)
  # meilisearch:
  #   image: getmeili/meilisearch:v1.6
  #   ports: ["7700:7700"]
  #   environment:
  #     MEILI_MASTER_KEY: masterKey123
```

---

## 📋 Implementation Phases

### Phase 1: MVP (4-6 สัปดาห์)

- [ ] Setup Monorepo (Turborepo)
- [ ] Auth (Register / Login / OAuth)
- [ ] Job CRUD (Employer)
- [ ] Job Listing & Detail (Public, SSR)
- [ ] Basic Search (Meilisearch — ง่ายกว่า Elasticsearch สำหรับ MVP)
- [ ] Job Application (Jobseeker)
- [ ] Company Profile

### Phase 2: Enhancement (4-6 สัปดาห์)

- [ ] Advanced Search Filters
- [ ] Resume Upload & Management
- [ ] Email Notifications
- [ ] Employer Dashboard
- [ ] Jobseeker Dashboard
- [ ] Saved Jobs / Bookmarks

### Phase 3: Scale (4-8 สัปดาห์)

- [ ] Migrate to Elasticsearch (ถ้าเริ่มจาก Meilisearch)
- [ ] Resume Parsing (AI)
- [ ] Job Recommendations (AI)
- [ ] Analytics Dashboard
- [ ] Payment / Premium Listings
- [ ] Mobile Optimization (PWA)

---

## ⚡ Performance Targets

| Metric               | Target                                 |
| -------------------- | -------------------------------------- |
| **Search Response**  | < 200ms                                |
| **Page Load (SSR)**  | < 1.5s (First Contentful Paint)        |
| **Lighthouse Score** | > 90 (Performance, SEO, Accessibility) |
| **API Response**     | < 300ms (95th percentile)              |
| **Concurrent Users** | 10,000+                                |

---

## 🔧 Alternative Stack Decisions

| Decision Point         | Option A (Recommended MVP) | Option B (Scale)                           |
| ---------------------- | -------------------------- | ------------------------------------------ |
| **Frontend Framework** | Next.js (React)            | Nuxt.js (Vue) — ถ้าทีมถนัด Vue             |
| **Search Engine**      | Meilisearch (ง่าย, เร็ว)   | Elasticsearch (ทรงพลังกว่า)                |
| **Backend**            | NestJS (TypeScript)        | Go (Golang) — สำหรับ high-traffic services |
| **UI Library**         | Shadcn/UI (Radix-based)    | Mantine (Feature-rich)                     |
| **Monorepo Tool**      | Turborepo                  | Nx                                         |
| **Package Manager**    | pnpm                       | npm / yarn                                 |
