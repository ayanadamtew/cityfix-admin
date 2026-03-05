<div align="center">
  <img src="https://raw.githubusercontent.com/ayanadamtew/cityfix-mobile/main/assets/images/app_icon.png" alt="CityFix Logo" width="120" />
  
  # CityFix Admin Dashboard
  **Enterprise-Grade Civic Issue Management Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-15.0+-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0+-blue?logo=react&logoColor=white)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

  <p align="center">
    A state-of-the-art administrative command center designed to optimize municipal operations, enhance civic engagement, and accelerate issue resolution through real-time geospatial analytics.
  </p>
</div>

<br />

## 🌟 Overview

The **CityFix Admin Dashboard** is a high-performance, real-time web application serving as the central nervous system for municipal authorities. Built with a modern Next.js architecture, it provides city officials with a "single pane of glass" to monitor, dispatch, and resolve citizen-reported infrastructure issues.

Featuring an **Obsidian & Emerald Smart City** aesthetic, the dashboard merges cutting-edge glassmorphic design and high-contrast UI with powerful administrative capabilities.

---

## 🚀 Key Features

### 📡 Real-Time Incident Command
- **WebSocket Integration**: Instantaneous updates of new reports via Socket.io without manual page refreshes.
- **Kanban-Style Workflow**: Effortlessly transition reported issues through custom statuses (Pending $\rightarrow$ In Progress $\rightarrow$ Resolved).
- **Incident Prioritization**: Automated severity tagging based on user-submitted data.

### 🗺️ Geospatial Intelligence
- **Interactive Mapping**: Built on Leaflet and OpenStreetMap, providing a bird's-eye view of all civic issues via clustered map visualization.
- **Heatmaps & Clustering**: Identify recurring problem areas and infrastructure hotspots.
- **Location Context**: Granular geolocation data attached to every report.

### 📊 Advanced Analytics & Reporting
- **Performance Metrics**: Monitor mean-time-to-resolution (MTTR) and departmental efficiency via Recharts.
- **Trend Analysis**: Visualize issue categories (e.g., Pothole vs. Lighting) over dynamic time periods.
- **Report Generation**: Export data layers for internal municipal reporting and compliance.

### 🔐 Enterprise Architecture
- **Role-Based Access Control (RBAC)**: Secure routing mechanisms ensuring that only authenticated municipal administrators have system access.
- **Server-Side Rendering (SSR)**: Leveraging Next.js App Router for optimal load times and iron-clad SEO/security.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4, Lucide Icons, clsx, tailwind-merge |
| **Mapping** | React-Leaflet, Leaflet |
| **Real-Time** | Socket.io-Client |
| **Data Fetching** | Axios |
| **Data Visualization**| Recharts |
| **Language** | TypeScript |
| **Database/ORM** | Mongoose (MongoDB) |
| **Auth/Storage** | Firebase v12 |

---

## 🏗️ Local Development Setup

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn
- Access to the CityFix Backend repository and MongoDB instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayanadamtew/cityfix-admin.git
   ```

2. **Navigate to the directory:**
   ```bash
   cd cityfix-admin
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Environment Configuration:**
   Create a `.env.local` file in the root directory and add the required environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*

---

## 📂 Project Architecture

```text
src/
├── app/                  # Next.js App Router definitions (Pages & Layouts)
│   ├── (auth)/           # Authentication flows (Login/Register)
│   ├── (dashboard)/      # Protected administrative interfaces
│   └── globals.css       # Core design tokens and Tailwind configuration
├── components/           # Reusable UI elements
│   ├── ui/               # Granular components (Cards, Buttons, Inputs)
│   └── layout/           # Structural components (Sidebar, Header)
├── lib/                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase client initialization
│   ├── auth.ts           # Authentication helpers
│   └── utils.ts          # Generic helpers (e.g., clsx styling)
├── services/             # API interaction layer (Axios wrappers)
├── store/                # State management and context providers
└── types/                # Strict TypeScript interface definitions
```

---

## 🎨 Design System

The CityFix Admin Dashboard operates on a unique design philosophy: **"Obsidian & Emerald"**.
- **Backgrounds**: Deep, unsaturated dark grays (`#0a0a0a` to `#121212`) to reduce eye strain during prolonged monitoring sessions.
- **Accents**: Neon and emerald greens to highlight actionable items and positive status indicators.
- **Containers**: Extensive use of glassmorphism (frosted glass, sub-pixel borders, and soft shadows) to establish a modern, hierarchical depth of field.

---

## 🤝 Contributing

This repository is maintained by the CityFix core team. For major changes, please open an issue first to discuss what you would like to change. Ensure all styling aligns with the existing Obsidian & Emerald design system.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">
  <i>Empowering smarter, safer, and more connected cities.</i>
</p>
