
# Deployment Guide: Hayan School System

This guide will walk you through deploying your system online so it can be accessed from anywhere.

## Prerequisites
- A GitHub account (to host your code).
- A Render account (for Backend & Database) - [Sign up here](https://render.com/).
- A Vercel account (for Frontend) - [Sign up here](https://vercel.com/).

## Part 1: Push Code to GitHub
1. Create a new repository on GitHub (e.g., `hayan-school-system`).
2. Push your local code to this repository.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

## Part 2: Deploy Backend & Database (Render)
1. **Create Database:**
   - Go to Render Dashboard > New > **PostgreSQL**.
   - Name: `hayan-db`.
   - Region: Choose one close to you (e.g., Frankfurt or Singapore).
   - Plan: **Free**.
   - Click **Create Database**.
   - **Copy the "Internal Database URL"** (you'll need it later).

2. **Deploy Backend:**
   - Go to Render Dashboard > New > **Web Service**.
   - Connect your GitHub repository.
   - Root Directory: `backend`.
   - Name: `hayan-backend`.
   - Runtime: **Node**.
   - Build Command: `npm install`.
   - Start Command: `node server.js`.
   - **Environment Variables** (Advanced):
     - Key: `DATABASE_URL` | Value: Paste the *Internal Database URL* from step 1.
     - Key: `NODE_ENV` | Value: `production`.
   - Click **Create Web Service**.
   - **Copy your Backend URL** (e.g., `https://hayan-backend.onrender.com`).

## Part 3: Deploy Frontend (Vercel)
1. Go to Vercel Dashboard > **Add New ...** > **Project**.
2. Import your GitHub repository.
3. Configure Project:
   - Framework Preset: **Vite**.
   - Root Directory: Edit and select `frontend`.
   - **Environment Variables**:
     - Key: `VITE_API_URL` | Value: Paste your *Backend URL* from Part 2 (e.g., `https://hayan-backend.onrender.com`).
4. Click **Deploy**.

## Part 4: Final Connect
1. Once Vercel finishes, you will get a **Frontend URL** (e.g., `https://hayan-school.vercel.app`).
2. Go back to your **Render Backend Dashboard** > **Environment**.
3. Add a new variable to allow the frontend to talk to the backend (CORS):
   - Key: `FRONTEND_URL` | Value: Your Vercel Frontend URL.
   *(Note: You might need to update `server.js` to use this if CORS is strict, currently it allows all).*

## Completion
You can now access your system via the Vercel URL!
