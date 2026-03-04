# Notes App — Full Stack

A production-ready Notes application with Tags, built with **Django REST Framework** (backend) and **React** (frontend).

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Django 4.2, Django REST Framework   |
| Auth      | JWT via `djangorestframework-simplejwt` |
| Database  | PostgreSQL                          |
| Frontend  | React 18, React Router v6           |
| HTTP      | Axios with interceptors             |
| State     | Context API                         |

---

## Project Structure

```
FullStackProject/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example          ← copy to .env and fill values
│   ├── core/                 ← Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/             ← Registration & JWT login
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── notes/                ← Notes & Tags CRUD
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── admin.py
│       └── urls.py
└── frontend/
    ├── package.json
    ├── .env
    └── src/
        ├── App.jsx
        ├── index.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        ├── services/
        │   └── api.js
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── Navbar.jsx
            ├── NoteCard.jsx
            ├── NoteModal.jsx
            └── TagFilter.jsx
```

---

## Backend Setup

### 1. Create & activate virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
copy .env.example .env   # Windows
# or
cp .env.example .env     # macOS/Linux
```

Edit `.env` and set:
- `SECRET_KEY` — a long random string
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE notes_db;
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create a superuser (optional, for admin panel)

```bash
python manage.py createsuperuser
```

### 7. Start the development server

```bash
python manage.py runserver
```

API is now available at `http://localhost:8000/api/`

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

App is available at `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint                     | Auth | Description             |
|--------|------------------------------|------|-------------------------|
| POST   | `/api/auth/register/`        | No   | Create account          |
| POST   | `/api/auth/login/`           | No   | Get JWT tokens          |
| POST   | `/api/auth/token/refresh/`   | No   | Refresh access token    |

### Notes

| Method | Endpoint            | Description                            |
|--------|---------------------|----------------------------------------|
| GET    | `/api/notes/`       | List notes (search, filter, paginate)  |
| POST   | `/api/notes/`       | Create note                            |
| GET    | `/api/notes/{id}/`  | Retrieve note                          |
| PUT    | `/api/notes/{id}/`  | Full update                            |
| PATCH  | `/api/notes/{id}/`  | Partial update (e.g., toggle pin)      |
| DELETE | `/api/notes/{id}/`  | Delete note                            |

**Query params for GET /api/notes/:**
- `search=<text>` — search title & content
- `tag=<tag_id>` — filter by tag
- `is_pinned=true|false`
- `is_archived=true|false`
- `page=<n>` — pagination (10 per page)

### Tags

| Method | Endpoint            | Description   |
|--------|---------------------|---------------|
| GET    | `/api/tags/`        | List tags     |
| POST   | `/api/tags/`        | Create tag    |
| DELETE | `/api/tags/{id}/`   | Delete tag    |

---

## Features

- **JWT auth** with auto-refresh via Axios interceptor
- **Per-user data isolation** — users only see their own notes/tags
- **Search** by title and content
- **Filter** by tag, pinned status, archived status
- **Pagination** (10 notes per page)
- **Pin / Archive** notes with one click
- **Tag management** — create tags globally or inline within a note
- **Protected routes** — redirects to login if unauthenticated
- **Django Admin** at `/admin/` for data inspection

---

## Development Notes

- Token blacklisting is enabled; refresh tokens are rotated on use.
- The React dev server proxies `/api` requests to `http://localhost:8000` via `package.json` proxy.
- CORS is configured to allow `http://localhost:3000` by default.
