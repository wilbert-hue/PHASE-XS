# PHASE-XS — Clinical Trials Intelligence Platform
### Project Overview & Feature Documentation

---

> **How to use this document:** Each section marked `[ IMAGE ]` is a placeholder — paste or insert a screenshot from the live application at that point. The document is written in Markdown and can be imported into Google Docs, Notion, or Microsoft Word for image insertion and final formatting.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Platform Architecture](#2-platform-architecture)
3. [Data Sources & Geographic Coverage](#3-data-sources--geographic-coverage)
4. [Landing Page](#4-landing-page)
5. [Authentication](#5-authentication)
6. [Dashboard — Overview](#6-dashboard--overview)
7. [KPI Cards](#7-kpi-cards)
8. [Filters & Search](#8-filters--search)
9. [Charts & Analytics](#9-charts--analytics)
10. [Trials Table](#10-trials-table)
11. [Trial Detail Sheet](#11-trial-detail-sheet)
12. [Comparison Panel](#12-comparison-panel)
13. [Insights Panel](#13-insights-panel)
14. [Region Tabs](#14-region-tabs)
15. [Data Model Reference](#15-data-model-reference)
16. [Technology Stack](#16-technology-stack)
17. [Color & Design System](#17-color--design-system)

---

## 1. Project Summary

**PHASE-XS** is a secure clinical trials intelligence platform built for pharmaceutical researchers, biotech teams, and medical professionals. It aggregates trial data from three major global registries — the United States (ClinicalTrials.gov), India (CTRI), and the United Kingdom (ISRCTN) — and presents it through an interactive, filterable dashboard with KPI analytics, charts, and detailed trial profiles.

**Key Capabilities:**

| Capability | Description |
|---|---|
| Multi-region trial data | US, India, and UK registries in a single interface |
| Advanced filtering | Filter by phase, technology, indication, trial design, administration route, and more |
| KPI analytics | Real-time enrollment, duration, adherence, and drug price metrics |
| Visualisation charts | 8+ chart types including phase distribution, timeline, indications, and dosage focus |
| Trial detail view | Full trial profile with exportable PDF reports |
| Comparative analysis | Side-by-side comparison of sponsors, molecules, or indications |
| Secure access | Auth0-powered authentication with SSO support |

---

## 2. Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PHASE-XS                           │
│                                                         │
│   Landing Page  ─────►  Auth0 Login  ──────►  Dashboard │
│                                                         │
│   Dashboard Layer:                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │ Filters  │  │ KPI Cards│  │ Charts (8+ types)    │ │
│   └──────────┘  └──────────┘  └──────────────────────┘ │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │  Trials  │  │ Trial    │  │ Comparison &         │ │
│   │  Table   │  │ Detail   │  │ Insights Panels      │ │
│   └──────────┘  └──────────┘  └──────────────────────┘ │
│                                                         │
│   Data Layer:                                           │
│   ┌─────────┐  ┌──────────┐  ┌────────────────────┐   │
│   │  US NCT │  │  CTRI IN │  │  UK ISRCTN         │   │
│   │ Database│  │ Database │  │  Database          │   │
│   └─────────┘  └──────────┘  └────────────────────┘   │
│                  PostgreSQL                             │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack Summary:**
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js Server Components + API Routes, PostgreSQL
- **Auth:** Auth0
- **Visualisation:** Recharts
- **Animation:** Framer Motion, GSAP
- **PDF Export:** jsPDF
- **UI Primitives:** Radix UI (shadcn/ui)

---

## 3. Data Sources & Geographic Coverage

PHASE-XS pulls from three authoritative, publicly available clinical trial registries and stores them in a unified PostgreSQL database. Each region has its own data pipeline, import scripts, and region-specific UI profile.

| Region | Registry | Trial ID Format | Primary Focus | Data Fields |
|---|---|---|---|---|
| 🇺🇸 United States | ClinicalTrials.gov | `NCT0000000` | Biologics (mAb, ADC, CAR-T, etc.) | Phase, enrollment, adherence, drug price, dosage, trial design |
| 🇮🇳 India | CTRI Registry | `CTRI/20XX/...` | Indian market clinical trials | Public title, scientific title, recruitment status, sample size |
| 🇬🇧 United Kingdom | ISRCTN Registry | `ISRCTN0000000` | Cancer trials | Randomisation, blinding, gender criteria, study status |

**Data Ingestion Pipeline:**

```
Excel / CSV Files
       │
       ▼
Import Scripts (TypeScript)
  ├── append-uk-to-postgres.ts        (UK cancer trials)
  ├── append-ctri-to-postgres.ts      (India CTRI trials)
  └── sync-trials-from-xlsx.mjs       (US NCT trials)
       │
       ▼
PostgreSQL Database
  ├── US trials table
  ├── India CTRI table
  ├── UK ISRCTN table
  └── Trial detail tables (extended info)
       │
       ▼
Next.js API Routes → Dashboard
```

---

## 4. Landing Page

The landing page is a marketing and onboarding surface designed to communicate the platform's value before login. It is composed of several distinct sections.

### 4.1 Hero Section

The hero section anchors the landing page with an animated headline, key metrics, and calls to action.

- **Animated split-flap display** shows live trial count updating with a ticker animation
- **Primary headline:** "Secure trials intelligence"
- **Molecule count badge** and dataset version indicator (v.01)
- **CTAs:** Sign In, Create Account, and anchor link to key metrics

> **[ IMAGE — Hero section screenshot: full-width desktop view showing the animated trial count, gradient background, and CTA buttons ]**

---

### 4.2 Signals / At-a-Glance Metrics

Below the hero, a horizontally scrollable metrics strip displays four high-level statistics derived from the underlying dataset:

| Metric | Value | Description |
|---|---|---|
| Phase 3 | 707K+ Enrolled | Total participants in late-stage trials |
| Oncology | Top Indication | >40% of studies are oncology-focused |
| mAb | Leading Technology | Monoclonal antibodies are the most common modality |
| Adherence | 92.3% | Average patient compliance across all trials |

> **[ IMAGE — Signals section screenshot: four metric cards in horizontal scroll layout ]**

---

### 4.3 Dataset Scope Diagram

A hub-and-spoke visual shows the breadth of the dataset on two axes:

- **Trial Landscape hub:** Coverage (trials, molecules, indications) + Phase range (Early Phase 1 → Phase 4)
- **Modality & Region hub:** Technologies (mAbs, CAR-T, ADCs, Fusion Proteins) + Regions (US, India, UK, Global)

> **[ IMAGE — Dataset scope diagram: animated spoke diagram showing the two hubs ]**

---

### 4.4 Additional Landing Sections

| Section | Purpose |
|---|---|
| Work Section | Explains dataset coverage and sourcing |
| Principles Section | Platform values and methodology |
| Credibility Section | Data source reliability and quality |
| Clientele Section | Target user segments (researchers, pharma, biotech) |
| Why CMI Section | Platform differentiation and unique value |
| Key Stats Section | High-level dataset statistics |
| Colophon | Credits and platform notes |
| Footer | Navigation links |

> **[ IMAGE — Full landing page scroll: composite or long-scroll screenshot showing all sections ]**

---

## 5. Authentication

PHASE-XS uses **Auth0** for user authentication. Unauthenticated users attempting to access the dashboard are redirected to the login page.

**Auth Flow:**

```
User visits /dashboard
        │
        ▼
Middleware checks Auth0 session
        │
   ┌────┴────┐
   │         │
Authenticated  Not authenticated
   │               │
   ▼               ▼
Dashboard     /auth/login  ──► Auth0 Universal Login
                                    │
                              ┌─────┴──────┐
                              │            │
                         Email/Password  Social SSO
                              │            │
                              └─────┬──────┘
                                    │
                              Session created
                                    │
                                    ▼
                               Dashboard
```

**Supported Login Methods:**
- Email + password
- Social sign-in (Google, etc.) via Auth0 connections
- Enterprise SSO

> **[ IMAGE — Auth0 login page screenshot ]**

---

## 6. Dashboard — Overview

The dashboard is the core feature of PHASE-XS. It is a fully interactive, server-rendered analytics interface that supports filtering, searching, comparing, and exploring clinical trial data across three regions.

**Dashboard Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE-XS Header + User Menu                                 │
├───────────────┬──────────────────────────────────────────────┤
│               │  Region Tabs: [ US ] [ India ] [ UK ]        │
│  Filters      ├──────────────────────────────────────────────┤
│  Panel        │  KPI Cards (6 metrics)                       │
│               ├──────────────────────────────────────────────┤
│  - Search     │  Charts Row 1 (Phase + Technology + Design)  │
│  - Phase      ├──────────────────────────────────────────────┤
│  - Technology │  Charts Row 2 (Timeline + Indications + Dose)│
│  - Indication ├──────────────────────────────────────────────┤
│  - Design     │  Trials Table (paginated, sortable)          │
│  - Route      ├──────────────────────────────────────────────┤
│  - Status     │  Comparison Panel (if 2+ search terms)       │
│               ├──────────────────────────────────────────────┤
│               │  Insights Panel                              │
└───────────────┴──────────────────────────────────────────────┘
```

> **[ IMAGE — Full dashboard screenshot: desktop view showing all panels with real data ]**

> **[ IMAGE — Mobile/responsive dashboard view if applicable ]**

---

## 7. KPI Cards

KPI cards appear at the top of the dashboard and update dynamically as filters are applied. The metrics displayed vary by the active region tab.

### United States (NCT)

| KPI Card | Metric | Description |
|---|---|---|
| Total Trials | Count | Total matching trials |
| Total Enrollment | Sum | Aggregate participant count |
| Avg Duration | Years | Mean trial duration |
| Molecules | Count | Unique interventions |
| Avg Adherence | % | Mean patient compliance |
| Avg Drug Price | USD | Mean drug price from public sources |

### India (CTRI)

| KPI Card | Metric | Description |
|---|---|---|
| Total Trials | Count | Total matching CTRI trials |
| Target Sample Size | Sum | Aggregate planned enrollment |
| Avg Duration | Years | Mean trial duration |
| Interventions | Count | Unique interventions |
| Conditions | Count | Unique disease conditions |

### United Kingdom (ISRCTN)

| KPI Card | Metric | Description |
|---|---|---|
| Total Trials | Count | Total matching ISRCTN trials |
| Target Sample Size | Sum | Aggregate planned enrollment |
| Avg Duration | Years | Mean trial duration |
| Drugs / Biologics | Count | Unique drugs and biologics |
| Cancer Conditions | Count | Unique cancer conditions |

> **[ IMAGE — KPI cards screenshot: US region showing all six metric cards ]**

> **[ IMAGE — KPI cards screenshot: India or UK region showing region-specific metrics ]**

---

## 8. Filters & Search

### 8.1 Search Bar

The search bar supports full-text search with autocomplete. It intelligently matches across multiple fields:

| Search Target | Examples |
|---|---|
| Trial ID | `NCT04523441`, `CTRI/2021/001/...`, `ISRCTN12345678` |
| Molecule / Intervention | `Pembrolizumab`, `Nivolumab`, `Durvalumab` |
| Indication / Condition | `Non-Small Cell Lung Cancer`, `Breast Cancer` |
| Sponsor | `Roche`, `Pfizer`, `AstraZeneca` |
| Trial Design | `Randomized Controlled Trial` |

**Comparison Search:** Enter two or more terms separated by commas (e.g., `Roche, Pfizer`) to trigger a side-by-side comparison view in the Comparison Panel.

> **[ IMAGE — Search bar with autocomplete dropdown showing molecule suggestions ]**

---

### 8.2 Filter Dropdowns

Multi-select filter dropdowns appear in the left panel. Each filter facet shows the count of matching trials.

| Filter | Available Options (examples) |
|---|---|
| Phase | Early Phase 1, Phase 1, Phase 1/2, Phase 2, Phase 2/3, Phase 3, Phase 4 |
| Technology | Monoclonal Antibody, ADC, CAR-T, Bispecific, Fusion Protein, Small Molecule |
| Indication | Oncology, Haematology, Immunology, Neurology, Cardiovascular, Rare Diseases |
| Trial Design | Randomized Controlled Trial, Single Arm, Crossover, Observational |
| Route of Admin | Intravenous, Subcutaneous, Oral, Intramuscular |
| Administration Type | Single Dose, Multiple Dose, Continuous |
| Recruitment Status | *(CTRI / UK only)* Recruiting, Completed, Suspended, Withdrawn |

> **[ IMAGE — Filters panel screenshot: left sidebar showing expanded multi-select dropdowns ]**

> **[ IMAGE — Active filter chips screenshot: filters applied with visible tags and trial count update ]**

---

## 9. Charts & Analytics

The dashboard renders up to eight chart types depending on the active region. All charts update in real time as filters change.

### 9.1 Phase Distribution (Pie Chart)

Shows the proportion of trials in each clinical phase (Early Phase 1 through Phase 4). Useful for understanding the development-stage maturity of a dataset or filtered cohort.

> **[ IMAGE — Phase pie chart screenshot ]**

---

### 9.2 Technology / Modality (Horizontal Bar Chart)

Ranks the top drug technologies by number of trials. Key categories:

- Monoclonal Antibody (mAb)
- Antibody-Drug Conjugate (ADC)
- CAR-T Cell Therapy
- Bispecific Antibody
- Fusion Protein
- Small Molecule
- Peptide

> **[ IMAGE — Technology bar chart screenshot ]**

---

### 9.3 Trial Design / Study Type (Bar or Pie Chart)

Breaks down trials by study design type: Randomized Controlled Trial, Single Arm, Observational, Crossover, etc.

> **[ IMAGE — Trial design chart screenshot ]**

---

### 9.4 Study Status Distribution

Shows the overall status of trials (Active, Completed, Recruiting, Terminated, Suspended, etc.). Particularly informative when combined with a molecule or sponsor search.

> **[ IMAGE — Study status chart screenshot ]**

---

### 9.5 Trial Timeline (Area Chart)

An area chart showing the number of trial start dates per year, revealing trends in research activity over time. Useful for identifying peak activity years and recent pipeline growth.

> **[ IMAGE — Timeline area chart screenshot ]**

---

### 9.6 Top Indications (Horizontal Bar Chart)

Displays the top 15 disease indications / health conditions by trial count. Typical top conditions include:

- Non-Small Cell Lung Cancer
- Diffuse Large B-Cell Lymphoma
- Breast Cancer
- Multiple Myeloma
- Colorectal Cancer

> **[ IMAGE — Top indications chart screenshot ]**

---

### 9.7 Route of Administration (Pie Chart)

Shows the breakdown of administration routes: Intravenous, Subcutaneous, Oral, Intramuscular, etc.

> **[ IMAGE — Route of administration pie chart screenshot ]**

---

### 9.8 Dosage Focus / Dose Chart

Visualises the distribution of dosage strengths or dose levels across the filtered trial set. Highlights concentration of dose ranges.

> **[ IMAGE — Dosage focus chart screenshot ]**

---

### 9.9 Recruitment Status (CTRI / UK only)

For India and UK regions, a recruitment status chart shows trials segmented by their current recruitment state (Recruiting, Completed, Closed, etc.).

> **[ IMAGE — Recruitment status chart (India or UK view) screenshot ]**

---

## 10. Trials Table

Below the charts, a paginated and sortable data table lists all trials matching the current filters and search.

**Table Columns (US NCT):**

| Column | Description |
|---|---|
| NCT ID | ClinicalTrials.gov identifier (links to detail) |
| Molecule | Drug / intervention name |
| Phase | Trial phase |
| Enrollment | Number of participants |
| Dosage | Dosage strength |
| Indication | Disease / condition |
| Technology | Drug modality |

**Table Columns (India CTRI):**

| Column | Description |
|---|---|
| CTRI ID | Registry identifier |
| Intervention | Drug / intervention name |
| Phase | Trial phase |
| Sample Size | Target enrollment |
| Condition | Disease / condition |
| Recruitment Status | Current trial status |

**Table Columns (UK ISRCTN):**

| Column | Description |
|---|---|
| ISRCTN | Registry identifier |
| Intervention | Drug / biologic name |
| Phase | Trial phase |
| Sample Size | Target enrollment |
| Condition | Cancer condition |
| Study Status | Current study state |

**Table Features:**
- 10 rows per page (pagination controls at bottom)
- Click any row to open the Trial Detail Sheet
- Sort by clicking column headers

> **[ IMAGE — Trials table screenshot: showing several rows with pagination controls ]**

---

## 11. Trial Detail Sheet

Clicking any trial row opens a slide-over panel with the complete trial profile.

**Sections within the Detail Sheet:**

| Section | Contents |
|---|---|
| Header | Trial ID, molecule name, sponsor, phase badge |
| Overview | Enrollment, duration, start date, completion date, arms |
| Design | Trial design, randomisation, blinding, route of administration |
| Intervention | Molecule, dosage strength, administration type, biologic type |
| Disease | Indication, condition group |
| Status | Study status, recruitment status (CTRI/UK), approval year |
| Drug Info | Drug price, adherence rate (US only) |
| External Links | Link to original registry record |

**PDF Export:**
The detail sheet includes a "Download PDF" button that generates a formatted trial report using jsPDF.

> **[ IMAGE — Trial detail sheet screenshot: slide-over panel open with full trial info ]**

> **[ IMAGE — Sample exported PDF report ]**

---

## 12. Comparison Panel

When a user searches for two or more terms separated by commas (e.g., `Roche, Pfizer` or `Pembrolizumab, Nivolumab`), the Comparison Panel activates below the table.

**Comparison Metrics (side-by-side per term):**

| Metric | Description |
|---|---|
| Trials Count | Number of trials for each term |
| Total Enrollment | Aggregate participant count |
| Avg Duration | Mean trial length in years |
| Avg Arms | Mean number of trial groups |
| Avg Adherence | Mean patient compliance (US only) |

The comparison makes it easy to benchmark sponsors, molecules, or indications against each other at a glance.

> **[ IMAGE — Comparison panel screenshot: two-column comparison with sponsor or molecule names ]**

---

## 13. Insights Panel

The Insights Panel provides contextual analysis and summary statements about the filtered trial set. It surfaces key observations derived from the current data view — such as dominant phases, leading technologies, notable enrollment patterns, or geographic concentration.

Content in the Insights Panel is region-aware and adapts based on which regional tab is active.

> **[ IMAGE — Insights panel screenshot ]**

---

## 14. Region Tabs

Three region tabs appear at the top of the dashboard content area. Switching tabs reloads data from the corresponding registry database and adjusts the KPI cards, charts, filter options, and table columns accordingly.

| Tab | Registry | Flag |
|---|---|---|
| US | ClinicalTrials.gov (NCT) | 🇺🇸 |
| India | CTRI | 🇮🇳 |
| UK | ISRCTN | 🇬🇧 |

**Region profile differences:**

| Feature | US | India | UK |
|---|---|---|---|
| Trial ID field | NCT ID | CTRI ID | ISRCTN |
| Adherence KPI | Yes | No | No |
| Drug Price KPI | Yes | No | No |
| Recruitment Status filter | No | Yes | Yes |
| Dose chart | Yes | No | Yes |
| Route of Admin chart | Yes | No | Yes |

> **[ IMAGE — Region tabs screenshot: showing the three tabs with the active US tab ]**

> **[ IMAGE — India dashboard view: showing CTRI-specific columns and KPI cards ]**

> **[ IMAGE — UK dashboard view: showing ISRCTN-specific columns and KPI cards ]**

---

## 15. Data Model Reference

### Core Trial Fields

```
Trial
├── id              string      Registry-specific identifier (NCT/CTRI/ISRCTN)
├── phase           string      Early Phase 1 | Phase 1 | Phase 2 | Phase 3 | Phase 4
├── enrollment      number      Planned or actual participant count
├── startDate       string      Trial start date
├── completionDate  string      Primary completion date
├── durationYears   number      Calculated trial duration in years
├── arms            number      Number of parallel groups / arms
├── molecule        string      Drug / intervention name
├── indication      string      Target disease / condition
├── technology      string      Drug modality (mAb, ADC, CAR-T, etc.)
├── trialDesign     string      Study design type (RCT, Single Arm, etc.)
├── routeOfAdmin    string      Administration route
├── dosageStrength  string      Dose level and unit
├── sponsor         string      Lead sponsor organisation
├── adherenceRate   number|null Patient compliance % (US only)
├── drugPrice       string      Public drug pricing data (US only)
├── approvalYear    string      Regulatory approval year (if applicable)
└── biologicType    string      Biologic classification
```

### Dashboard Filters Interface

```
Filters
├── search              string      Free-text / ID / comma-separated comparison
├── phases              string[]    Selected phases
├── technologies        string[]    Selected drug technologies
├── indications         string[]    Selected indications
├── trialDesigns        string[]    Selected trial designs
├── routeOfAdmin        string[]    Selected routes
├── adminType           string[]    Selected administration types
└── recruitmentStatuses string[]    Selected statuses (CTRI/UK)
```

### Dashboard Query Response

```
QueryResult
├── totalTrialCount   number        Full dataset size (unfiltered)
├── filteredCount     number        Trials matching current filters
├── kpi               KPISnapshot   Aggregate metrics (enrollment, duration, etc.)
├── charts            ChartPayload  Data for all 8+ chart types
├── tableRows         Trial[]       Paginated trial list (10 per page)
└── comparison        CompData|null Side-by-side metrics (multi-term search only)
```

---

## 16. Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | Radix UI (shadcn/ui) | Accessible primitives |
| Animation | Framer Motion, GSAP | Page and scroll animations |
| Charts | Recharts | SVG-based data visualisation |
| Database | PostgreSQL (pg) | Primary data store |
| Auth | Auth0 | Authentication & session management |
| PDF | jsPDF | Client-side PDF export |
| Forms | React Hook Form + Zod | Form handling and validation |
| Email | Nodemailer | Transactional email |
| CAPTCHA | Cloudflare Turnstile | Contact form protection |
| Deployment | Vercel (assumed) | Hosting and edge functions |

---

## 17. Color & Design System

### Primary Color Palette

| Name | Hex | Usage |
|---|---|---|
| c1 | `#1B4965` | Deep teal — primary brand, headers |
| c2 | `#1E6080` | Teal — secondary elements |
| c3 | `#2A8F9C` | Medium teal — interactive elements |
| c4 | `#3AAFA9` | Bright teal — hover states, accents |
| c5 | `#4FBDBA` | Light teal — highlights, badges |

### Chart / Accent Colors

| Color | Hex | Used For |
|---|---|---|
| Blue | `#2563EB` | Trials count, phase metrics |
| Purple | `#6D28D9` | Enrollment figures |
| Amber | `#B45309` | Duration, trial design |
| Teal | `#0E7490` | Molecules, route of admin |
| Rose | `#BE123C` | Indications |
| Emerald | `#047857` | Administration type |
| Cyan | `#0D9488` | Adherence rate |

### Typography

| Role | Font | Notes |
|---|---|---|
| Display headings | Bebas Neue | Large hero text and section titles |
| Data labels | System monospace (`font-mono`) | KPI values, trial IDs, metrics |
| Body text | System sans-serif | General UI and descriptions |

### Design Principles

- **Dark-on-light** data surfaces; **light-on-dark** marketing sections
- Monospace numerics for all data values to maintain alignment
- Consistent teal brand gradient across landing page and dashboard header
- Motion used sparingly for scroll reveals (Framer Motion) and hero animations (GSAP split-flap)

> **[ IMAGE — Design system / color palette reference: brand colors and font examples ]**

---

*Document version: 1.0 — PHASE-XS, June 2026*

*To add images: open this file in Google Docs (File → Open → upload), Notion (paste markdown), or Microsoft Word (paste content), then insert screenshots at each `[ IMAGE ]` placeholder.*
