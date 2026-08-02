# Tech Review — XAMPP Setup Guide

## What You Need

| Item | Download |
|---|---|
| XAMPP | https://www.apachefriends.org/download.html |
| Browser | Chrome, Firefox, or Edge (latest) |

---

## Step 1 — Install & Start XAMPP

1. Install XAMPP if you haven't already.
2. Open **XAMPP Control Panel**.
3. Click **Start** next to **Apache** → wait for it to turn green.
4. Click **Start** next to **MySQL** → wait for it to turn green.

---

## Step 2 — Copy the Project into htdocs

Copy the entire **project folder** into XAMPP's web root:

```
C:\xampp\htdocs\techreview\
```

Your folder structure should look like:

```
C:\xampp\htdocs\techreview\
├── index.html
├── style.css
├── api\
│   ├── config.php
│   ├── auth.php
│   └── phones.php
├── db\
│   └── techreview.sql
├── js\
│   ├── backend.js
│   └── app.js
└── picture\
    └── (phone images)
```

---

## Step 3 — Create the Database

1. Open your browser and go to:
   ```
   http://localhost/phpmyadmin
   ```
2. Click **Import** in the top menu.
3. Click **Choose File** → select `db\techreview.sql` from your project.
4. Click **Go** (Import).
5. You should see: **Database setup complete! Tables created & seeded.**

This creates:
- **`users`** table (with pre-loaded Admin + User accounts)
- **`phones`** table (with 5 pre-loaded smartphones)
- **`phone_specs`** table (all specification details)

---

## Step 4 — Open the Website

Open your browser and go to:
```
http://localhost/techreview/index.html
```

The website will automatically detect it's running on XAMPP and use the **PHP/MySQL backend** instead of LocalStorage.

---

## Step 5 — How to Login as Admin

1. Click **"Sign In / Register"** in the top right navbar.
2. Enter the following credentials:

   | Field | Value |
   |---|---|
   | **Username** | `admin` |
   | **Password** | `admin123` |

3. Click **Sign In**.
4. You will see:
   - A gold **ADMIN** badge next to your name in the navbar.
   - A gold **"+ Add Mobile Phone"** button in the navbar.

---

## Demo Accounts (Pre-loaded)

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Add phones, edit specs, upload images, attach YouTube videos, delete phones |
| **User** | `user` | `user123` | Browse catalog, search, filter by brand, view full GSMArena spec tables, watch YouTube review videos |

---

## How to Add a New Smartphone (Admin)

1. Log in as Admin.
2. Click **"+ Add Mobile Phone"** (gold button in navbar).
3. Fill in all specification fields (Network, Display, CPU, Camera, Battery, etc.).
4. Paste a **YouTube video URL** (e.g. `https://www.youtube.com/watch?v=M-MkWpXb72g`).
5. Upload or paste an image URL for the phone.
6. Click **"Save Specs"**.
7. The phone appears immediately in the catalog.

---

## Theme Switcher

The **☀️ / 🌓 / 🌙** toggle in the navbar switches between:
- **☀️ Light** — Clean white/slate light mode
- **🌓 System** — Follows your OS dark/light preference
- **🌙 Dark** — Deep midnight dark mode (default)

Your preference is saved automatically.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Page not loading | Make sure Apache is Started (green) in XAMPP |
| Database error | Make sure MySQL is Started and you imported the SQL file |
| Can't login via PHP | Open the URL with `http://localhost/...` not `file:///...` |
| Images not showing | Check image URL is valid; use Unsplash or upload a local image |
| Video not playing | Paste the full YouTube URL, not just the video title |
