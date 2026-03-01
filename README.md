# CleanPulse Madurai – AI Powered Civic Waste Intelligence System

Welcome to the CleanPulse Madurai project! This is a smart digital waste management platform that integrates AI-based garbage hotspot prediction, citizen reporting with gamification, and intelligent route optimization for sanitation teams.

## 🛠 Prerequisites & Tools

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download here](https://www.python.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Visual Studio Code** (Recommended IDE) - [Download here](https://code.visualstudio.com/)

---

## 🚀 Getting Started (Post-Cloning)

Follow these steps to set up and run the project on your local machine after cloning.

### 1. Database Setup
1.  Open your PostgreSQL management tool (e.g., pgAdmin or `psql`).
2.  Create a new database named `cleanpulse`.
3.  Ensure your PostgreSQL service is running on `localhost:5432`.

### 2. Environment Configuration
You need to create personal configuration files for each service. Templates are provided as `.env.example` files.

#### **Backend**
1.  Navigate to the `backend` directory.
2.  Copy `.env.example` and rename it to `.env`.
3.  Open `.env` and update `DB_PASSWORD` with your local PostgreSQL password.

#### **Frontend**
1.  Navigate to the `frontend` directory.
2.  Copy `.env.example` and rename it to `.env`.

---

### 3. Service Installation & Startup
You will need **four separate terminal windows** (one for each service).

#### **A. ML Service (Hotspot Prediction)**
```bash
cd ml_service
# Create a virtual environment (optional but recommended)
python -m venv venv
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Start the service
python app.py
```
*Accessible at: `http://localhost:8000`*

#### **B. Route Service (Optimization)**
```bash
cd route_service
# Install dependencies
pip install -r requirements.txt
# Start the service
uvicorn main:app --port 5002 --reload
```
*Accessible at: `http://localhost:5002`*

#### **C. Backend API**
```bash
cd backend
# Install dependencies
npm install
# Start the service
npm start
```
*Accessible at: `http://localhost:5000`*

#### **D. Frontend Dashboard**
```bash
cd frontend
# Install dependencies
npm install
# Start the service
npm run dev
```
*Accessible at: `http://localhost:5173`*

---

## ✅ Verification
1.  Open `http://localhost:5173` in your browser.
2.  Register a new account as a **Citizen**.
3.  Log in and explore the dashboard!

## 📂 Project Structure
- `/frontend`: React + Vite dashboard with interactive maps.
- `/backend`: Node.js + Express API with PostgreSQL.
- `/ml_service`: Python FastAPI for garbage hotspot prediction.
- `/route_service`: Python FastAPI for sanitation route optimization.
