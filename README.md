# Minimal Full-Stack Starter (Raw Node.js + SQLite + Svelte)
A lightweight, dependency-minimal full-stack starter built with **raw Node.js**, **SQLite**, and **Svelte**.  
Ideal for small MVPs, experiments, prototyping, and learning how systems work under the hood.

**codicem hominem sapere facit — code makes a person wise.**

---

## 🚀 Tech Highlights

### 🧱 Backend — Raw Node.js (No Express)
- Built entirely on Node’s `http`, `url`, and `StringDecoder`
- Custom router and JSON parser
- Manual CORS handling
- REST API for projects & tasks
- Zero middleware, zero framework overhead

### 🗄️ Database — SQLite
- Single-file database  
- No server installation needed  
- SQL with very low overhead  
- Great for Windows, Linux, macOS  
- Perfect for small tools and dashboards

### 🎨 Frontend — Svelte
- Minimal reactivity
- Very small bundle size
- Simple component architecture
- Fast to build and iterate

---

## 📦 Features
- Raw HTTP REST API  
- Projects + Tasks CRUD  
- SQLite migrations  
- Clean Svelte interface  
- Minimal dependencies  
- Works perfectly on local Windows setup  

---

## 🏃 Getting Started

### Backend
cd server
npm install
copy .env.example .env
node index.js


### Frontend
cd frontend
npm install
npm run dev


Backend → http://localhost:3000  
Frontend → http://localhost:5173  

---

## 📂 Folder Structure
server/ → raw Node backend + SQLite
frontend/ → Svelte UI
migrations/ → SQLite schema


---

## 🤝 Contributing
Suggestions & improvements are welcome.  
Open an issue or submit a PR.

---

## 🧡 Motto
**codicem hominem sapere facit — code makes a person wise.**
