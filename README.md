# Travel Planning Terminal

A collaborative travel planning application built with Next.js and Supabase.

## Features

- **Collaborative Itinerary Planning:** Drag-and-drop interface to organize activities.
- **Real-time Updates:** Changes are synced instantly across all users viewing the trip.
- **Role-Based Access:** Invite friends as editors or viewers.
- **Mission Control UI:** A unique, sci-fi inspired interface for managing your expeditions.

## Deployment Guide

### 1. Prerequisites

- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) account.

### 2. Database Setup (Supabase)

1.  Create a new project on Supabase.
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the contents of `full_schema.sql` from this repository.
4.  Paste it into the SQL Editor and click **Run**. This will create all necessary tables and security policies.

### 3. GitHub Setup

1.  Create a new repository on GitHub.
2.  Push the code from this project to your new repository.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main
    ```

### 4. Vercel Deployment

1.  Log in to Vercel and click **"Add New..."** -> **"Project"**.
2.  Import your GitHub repository.
3.  In the **"Environment Variables"** section, add the following keys from your Supabase project settings (Project Settings -> API):
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your `anon` public key
4.  Click **"Deploy"**.

### 5. Post-Deployment

Your app should now be live! You can share the URL with friends and start planning your trips.
