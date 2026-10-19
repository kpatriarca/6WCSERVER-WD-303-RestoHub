# RestoHub

RestoHub is a restaurant directory and database management web application built with the MEVN stack for the Web Server and Client Services project.

## Technology Stack

- **MongoDB Atlas** - restaurant data storage
- **Express.js** - backend API
- **Vue 3** - frontend user interface
- **Node.js** - server runtime
- **Vue Router** - client-side navigation
- **Vite** - frontend development and production build

## Features

- Browse and search restaurant records
- Filter restaurants using available metadata
- View individual restaurant details
- Add new restaurant records
- Edit existing restaurant records
- Delete restaurant records with an in-app confirmation
- View restaurant statistics and quality rankings
- Responsive interface with RestoHub branding

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB Atlas account and database connection

## Configuration

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
DB_NAME=dbRestaurants
PORT=3000
```

Replace the connection-string placeholder with your MongoDB Atlas URI. Keep `.env` private and never commit credentials to Git.

Ensure your MongoDB Atlas network access and database user permissions allow the application to connect.

## Installation

Install the backend dependencies from the project root:

```bash
npm install
```

Install the Vue frontend dependencies:

```bash
cd client
npm install
```

## Development

Start the backend from the project root:

```bash
npm run dev
```

In a separate terminal, start the Vue development server:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite. The Vite configuration proxies `/api` requests to the Express backend.

## Production Build

Build the Vue frontend:

```bash
npm --prefix client run build
```

Start the Express server:

```bash
npm start
```

The server serves the built Vue application from `client/dist` and provides the API under `/api`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/stats` | Retrieve restaurant statistics |
| GET | `/api/restaurants` | List and search restaurants |
| GET | `/api/restaurants/meta` | Retrieve filter metadata |
| GET | `/api/restaurants/best-quality` | Retrieve quality rankings |
| GET | `/api/restaurants/:id` | Retrieve one restaurant |
| POST | `/api/restaurants` | Create a restaurant |
| PUT | `/api/restaurants/:id` | Update a restaurant |
| DELETE | `/api/restaurants/:id` | Delete a restaurant |

## Project Structure

- `server.js` - Express application entry point
- `server/config/` - MongoDB connection configuration
- `server/controllers/` - API controller logic
- `server/routes/` - API route definitions
- `server/utils/` - validation utilities
- `client/src/` - Vue application, views, router, and API service
- `client/public/assets/` - frontend public assets
- `scripts/` - database seed script

## Database

The application uses the `dbRestaurants` database and the `restaurants` collection. Restaurant documents include address information and inspection grades.

The optional seed script can be run with:

```bash
npm run seed
```

Review the seed script and database contents before running it against any database containing important data.

## License

This project was developed for academic purposes.

