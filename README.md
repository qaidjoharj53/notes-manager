# 📒 Personal Notes & Bookmark Manager

## ✨ Overview

**Personal Notes & Bookmark Manager** is a full‑stack web application designed to help users organize their thoughts, ideas, and web resources in one intuitive platform.
It offers **secure authentication**, **full CRUD functionality** for notes and bookmarks, and a **modern, responsive UI** built with cutting‑edge technologies.

---

## 🚀 Features

✅ **User Authentication** – Secure registration and login with JWT-based sessions.<br/>
✅ **Notes Management** – Create, view, update, delete, tag, and favorite notes with a dedicated detail page.<br/>
✅ **Bookmarks Management** – Create, view, update, delete, tag, and favorite bookmarks with optional auto-fetch of titles.<br/>
✅ **Search & Filtering** – Search by title, content/description, URL, and filter by tags.<br/>
✅ **Favorites Page** – Unified view of all favorite notes and bookmarks at `/favorites`.<br/>
✅ **Enhanced UI** – Responsive design, smooth animations, neutral color palette, and back navigation buttons for improved flow.<br/>

---

## 🛠 Tech Stack

**Frontend:**

* Next.js (App Router)
* React
* Tailwind CSS

**Backend:**

* Node.js
* Express (via Next.js API routes)
* MongoDB with Mongoose

**Authentication:**

* JWT (JSON Web Tokens)
* Bcrypt.js

---

## 💱 API Endpoints

Below is a brief reference for the main API routes. All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### 🔑 Authentication

#### `POST /api/auth/register`

* **Description:** Register a new user.
* **Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

* **Success Response:** `201 Created`

```json
{ "message": "User registered successfully" }
```

* **Error Responses:**
  `400 Bad Request` (missing fields), `409 Conflict` (email already exists, username is taken), `500 Internal Server Error`.

#### `POST /api/auth/login`

* **Description:** Log in an existing user.
* **Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

* **Success Response:** `200 OK`

```json
{ "token": "<JWT>", "user": { "id": "...", "email": "..." } }
```

* **Error Responses:**
  `401 Unauthorized` (invalid credentials), `500 Internal Server Error`.

#### `GET /api/auth/me`

* **Description:** Get the current authenticated user's data.
* **Success Response:** `200 OK`

```json
{ "id": "...", "email": "...", "username": "..." }
```

* **Error Responses:**
  `401 Unauthorized` (missing/invalid token).

---

### 📝 Notes

#### `GET /api/notes`

* **Description:** Get all notes for the authenticated user.
* **Success Response:** `200 OK` (array of notes).

#### `POST /api/notes`

* **Description:** Create a new note.
* **Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "tags": ["string", "string"]
}
```

* **Success Response:** `201 Created` (created note object).

#### `GET /api/notes/[id]`

* **Description:** Get a single note by its ID.
* **Success Response:** `200 OK` (note object).
* **Error Responses:** `404 Not Found`, `401 Unauthorized`.

#### `PUT /api/notes/[id]`

* **Description:** Update an existing note.
* **Request Body:** (fields to update)

```json
{
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "favorite": true
}
```

* **Success Response:** `200 OK` (updated note).

#### `DELETE /api/notes/[id]`

* **Description:** Delete a note.
* **Success Response:** `204 No Content`.

---

### 🔖 Bookmarks

#### `GET /api/bookmarks`

* **Description:** Get all bookmarks for the authenticated user.
* **Success Response:** `200 OK` (array of bookmarks).

#### `POST /api/bookmarks`

* **Description:** Create a new bookmark.
* **Request Body:**

```json
{
  "title": "string",
  "url": "https://example.com",
  "description": "string",
  "tags": ["string"]
}
```

* **Success Response:** `201 Created` (created bookmark object).

#### `GET /api/bookmarks/[id]`

* **Description:** Get a single bookmark by its ID.
* **Success Response:** `200 OK` (bookmark object).
* **Error Responses:** `404 Not Found`, `401 Unauthorized`.

#### `PUT /api/bookmarks/[id]`

* **Description:** Update an existing bookmark.
* **Request Body:** (fields to update)

```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "favorite": true
}
```

* **Success Response:** `200 OK` (updated bookmark).

#### `DELETE /api/bookmarks/[id]`

* **Description:** Delete a bookmark.
* **Success Response:** `204 No Content`.

---

### 🌐 Utility

#### `POST /api/fetch-title`

* **Description:** Fetches a website's title from a given URL.
* **Request Body:**

```json
{ "url": "https://example.com" }
```

* **Success Response:** `200 OK`

```json
{ "title": "Example Domain" }
```

* **Error Responses:** `400 Bad Request`, `500 Internal Server Error`.

---

## ⚡ Getting Started

### ✅ Prerequisites

* Node.js (v18+)
* npm or yarn
* MongoDB (local or cloud)

---

### 👅 Cloning the Repository

```bash
git clone https://github.com/qaidjoharj53/notes-manager.git
cd notes-manager
```

### 📦 Install Dependencies

```bash
npm install
# or
yarn install
```

### ⚙️ Environment Variables

Create a `.env` file:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-strong-random-secret
```

> 🔑 **Important:** Use a strong, random `JWT_SECRET` for security.

### ▶️ Running the Application

```bash
npm run dev
# or
yarn dev
```

The app will run on [http://localhost:3000](http://localhost:3000).

---

## 📌 Usage

* Register or log in to create a personal account.
* Manage notes and bookmarks through an intuitive dashboard.
* Mark favorites and access them in `/favorites`.
* Search and filter content for quick access.

---

## 📂 Project Structure

```
notes-manager/
├─ app/
│  ├─ api/                # API routes (auth, notes, bookmarks, fetch-title)
│  ├─ auth/               # Authentication pages
│  ├─ notes/              # Notes pages (list, detail, edit)
│  ├─ bookmarks/          # Bookmarks pages (list, detail, edit)
│  ├─ favorites/          # Favorites page
│  ├─ page.jsx            # Dashboard page
│  ├─ globals.css         # Global Tailwind styles
├─ components/ui/         # Reusable UI components
├─ lib/mongodb.js         # MongoDB connection utility
├─ models/                # Mongoose schemas (User, Note, Bookmark)
├─ tailwind.config.js     # Tailwind configuration
```

---

## 🔮 Future Enhancements

* 🌙 Dark Mode toggle
* ⌨️ Keyboard Shortcuts
* 📂 Drag-and-Drop organization
* 🔍 Advanced Search with fuzzy matching
* 📄 Export/Import functionality

---

## 🤝 Contributing

We welcome contributions!

1. **Fork** this repository.
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:

   ```bash
   git commit -m "Add feature"
   ```
4. Push and open a Pull Request.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

**💡 Built with passion using modern web technologies. Happy coding!** ✨

---
