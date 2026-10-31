# Flats-n-Beyond — Luxury Real Estate Advisory Web Application

> **Tagline:** *"Where dreams find an address"*  
> **Niche:** Prime NCR Real Estate (Gurgaon, Golf Course Road, Dwarka Expressway, Noida)  
> **Core Services:** Fresh Bookings, Sale & Purchase, Bespoke Turnkey Interiors

---

## 🌟 Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Backend:** Express.js, Mongoose ODM, CORS, Dotenv
- **Database:** MongoDB Atlas (Cloud Cluster) with resilient automatic file-system fallback (`server_data/enquiries_fallback.json`)
- **Theme & Styling:** Custom ultra-light luxury gradient (`linear-gradient(135deg, #fff5f7 0%, #fffbf0 50%, #fdf6ec 100%)`), deep slate typography (`#1e293b`), and warm amber accents (`#d97706`).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB Atlas (.env)
Copy `.env.example` to `.env` (or edit the existing `.env`):
```bash
cp .env.example .env
```

Open `.env` in the project root and plug in your MongoDB Atlas connection URI:
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/flats_n_beyond?retryWrites=true&w=majority

# Backend Server Port
PORT=5000
```

> **Note:** If `MONGODB_URI` is left blank, the app runs in **Resilient Local Fallback Mode**, saving enquiries to `server_data/enquiries_fallback.json` so development and testing are completely uninterrupted.

### 3. Run Development Servers
To run both the Express backend API and the Vite frontend concurrently:
```bash
npm run dev:all
```
- **Web App (Vite Dev Server):** [http://localhost:5173](http://localhost:5173)
- **Backend API (Express + MongoDB):** [http://localhost:5000](http://localhost:5000)

---

## 🔐 Administrative Console & Passcodes

Access the protected management console via the top navigation bar or the footer link.

- **Passcode:** `admin123` (or `fnb2026`)
- **Quick Demo Unlock:** One-click demo button provided on the login card.

### Key Admin Features:
1. **Live Inventory Management:** Real-time property catalog browser with delete confirmation and one-click catalog reset.
2. **Add New Property Listing:** Full listing publisher with multi-photo gallery support, RERA registration, configurations, and curated luxury photo presets.
3. **Customer Enquiries & Leads Dashboard:**
   - Real-time MongoDB Atlas connection status banner.
   - In-app MongoDB Atlas connection string tester.
   - Metrics strip (Total leads, New inquiries, In Contact, Closed/Tours).
   - Filter by status (`New`, `Contacted`, `Tour Scheduled`, `Closed`) and search by customer name/phone/property.
   - 1-Click WhatsApp Client launcher (`https://wa.me/...`).
   - 1-Click phone dialer (`tel:...`) and direct email (`mailto:...`).
   - Dynamic status updater and lead deletion.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | MongoDB Atlas connection status and storage mode |
| `GET` | `/api/enquiries` | Fetch customer enquiries (sorted newest first) |
| `POST` | `/api/enquiries` | Submit customer enquiry / tour request |
| `PATCH` | `/api/enquiries/:id` | Update lead status (`New`, `Contacted`, `Tour Scheduled`, `Closed`) |
| `DELETE` | `/api/enquiries/:id` | Delete customer enquiry |
| `POST` | `/api/test-connection` | Test a MongoDB Atlas connection string URI |

---

## 🏗️ Production Build

To bundle the application for production deployment:
```bash
npm run build
```
Production assets are generated in the `dist/` directory.
