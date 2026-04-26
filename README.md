markdown
# Blog Platform

A full-stack blog platform where users can sign up, create posts, edit/delete their own posts, and save favorites.

## Live Demo

- **Frontend:** https://blog-page-eight-beige.vercel.app
- **Backend API:** https://blog-backend-0mb0.onrender.com

## Features

- User authentication (signup / login)
- Create, edit, and delete posts
- Favorite posts (saved to database, syncs across devices)
- View all posts from all users
- Profile page showing only your posts
- Responsive design (works on mobile and desktop)
- Delete account (removes all your posts and favorites)
- Read more button for long posts on mobile

## Tech Stack

### Frontend
- Vue 3 with Composition API
- Vue Router
- Vite

### Backend
- Node.js
- Express
- MongoDB Atlas
- JWT for authentication
- bcrypt for password hashing

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## How to Run Locally

### Prerequisites
- Node.js installed
- MongoDB Atlas account (free) or local MongoDB

### Backend Setup

1. Clone the repository:
   bash
   git clone https://github.com/Fammt/blog-pages.git
   cd blog-pages/backend-blog


1. Install dependencies:
   bash
   npm install
   
2. Create a .env file with your MongoDB connection string:
   
   MONGODB_URL=your_mongodb_atlas_connection_string
   
3. Start the backend server:
   bash
   node server.js
   
   Backend runs at http://localhost:3000

Frontend Setup

1. Navigate to the frontend folder:
   bash
   cd ../blog-project
   
2. Install dependencies:
   bash
   npm install
   
3. Start the development server:
   bash
   npm run dev
   
   Frontend runs at http://localhost:5173

Environment Variables (Optional)

For production, replace localhost:3000 with your Render URL in the frontend fetch calls.


## Project Structure


blog-pages/
├── backend-blog/
│   ├── server.js
│   ├── package.json
│   └── .env (not committed)
├── blog-project/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.vue
│   │   │   ├── AuthForm.vue
│   │   │   └── PostCard.vue
│   │   ├── views/
│   │   │   ├── home.vue
│   │   │   ├── posts.vue
│   │   │   ├── profile.vue
│   │   │   └── favourites.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   └── main.js
│   └── package.json
└── README.md


Deployment

Backend (Render)

1. Push code to GitHub
2. Connect repository to Render
3. Set Root Directory to backend-blog
4. Add environment variable: MONGODB_URL
5. Deploy

Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set Root Directory to blog-project
4. Deploy
