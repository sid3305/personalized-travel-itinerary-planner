# Personalized Travel Itinerary Planner

An AI-powered travel planning web application that generates personalized, day-by-day itineraries based on destination, budget, travel duration, group size, travel style, and interests.

Built with **React, FastAPI, Groq, and Supabase**, the application simplifies trip planning by organizing attractions, dining, accommodation, and transportation into a structured itinerary.

## Features

- **AI-Powered Itinerary Generation:** Generate personalized travel plans using Groq-hosted LLMs.
- **Custom Trip Preferences:** Specify destination, duration, number of travelers, total budget, currency, travel style, and interests.
- **Day-Wise Planning:** View activities organized by day, with suggested times, descriptions, categories, and estimated costs.
- **Cost Estimation:** Calculate the estimated total from individual activity costs and display amounts in the selected currency.
- **Saved Trips Dashboard:** Store and retrieve previously generated itineraries using Supabase.
- **Day Regeneration:** Generate alternative activities for a specific day without replacing the entire itinerary.
- **Trip Management:** Select and delete saved trips.
- **Responsive Interface:** Use a clean dashboard designed for desktop and smaller screens.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Development Server | Vite |
| Backend | Python, FastAPI |
| AI Integration | Groq API |
| Language Model | `openai/gpt-oss-20b` |
| Database | Supabase PostgreSQL |
| API Validation | Pydantic |
| Environment Configuration | python-dotenv |
| API Documentation | FastAPI Swagger UI |

## System Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP / JSON
  v
FastAPI Backend
  |
  +------> Groq API
  |        Generates structured itineraries
  |
  +------> Supabase PostgreSQL
           Saves and retrieves trips
  |
  v
Personalized Itinerary
  |
  v
React Dashboard
```

## Project Structure

```text
Travel-itenary/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── database/
│   └── schema.sql
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

The `.venv/` and `node_modules/` directories contain local dependencies and are not included in the project structure above.

## Prerequisites

Install the following before running the application:

- Python 3.10 or a compatible newer Python version
- Node.js and npm
- A Groq API key
- A Supabase project with the required database table

## Setup and Installation

### 1. Clone or open the project

Open the project root directory in VS Code.

### 2. Configure the Python environment

Create a virtual environment if you have not already created one:

```powershell
py -3.10 -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

### 3. Configure environment variables

Create `backend/.env` with the following variables:

```dotenv
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_backend_key
```

Replace the placeholders with your actual credentials. Never commit `.env` or expose API keys in screenshots, recordings, or public repositories.

### 4. Configure Supabase

Open the Supabase SQL Editor and execute the SQL in:

```text
database/schema.sql
```

The application expects a `trips` table with the following fields:

- `id`: Unique trip identifier
- `destination`: Trip destination
- `params`: JSONB containing trip preferences
- `plan`: JSONB containing the generated itinerary
- `created_at`: Trip creation timestamp

Configure appropriate Row Level Security policies before exposing the application publicly.

### 5. Install frontend dependencies

From the project root, run:

```powershell
npm install
```

### 6. Start the complete application

The project includes a combined development script that starts both the frontend and backend:

```powershell
npm run dev:full
```

Open the frontend:

**http://localhost:5173**

FastAPI API documentation:

**http://localhost:8000/docs**

Keep the terminal running while using the application. Press `Ctrl + C` to stop the development servers.

## How to Use

1. Enter a destination, such as Jaipur, India.
2. Choose the number of days and travelers.
3. Enter the total trip budget and select a currency.
4. Select a travel style, such as relaxed, adventure, cultural, romantic, or foodie.
5. Enter interests such as food, temples, shopping, or hiking.
6. Click **Generate itinerary**.
7. Explore the day-wise schedule, activities, descriptions, and estimated costs.
8. Use **Regenerate** to request alternative activities for a particular day.
9. Select a saved trip to view it again, or delete a trip when it is no longer needed.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the backend is running |
| POST | `/generate` | Generate and save a new itinerary |
| GET | `/trips` | Retrieve saved trips |
| POST | `/trips/{trip_id}/regenerate/{day}` | Regenerate a specific day |
| DELETE | `/trips/{trip_id}` | Delete a saved trip |

Interactive API documentation is available at `/docs` while FastAPI is running.

## AI and Cost Estimation

The backend sends the user's trip preferences to the Groq API. The language model returns a structured JSON itinerary containing daily themes and activities.

The application stores the generated plan in Supabase and displays the itinerary through the React interface.

Activity costs are AI-generated estimates, not verified live prices. Currency selection controls the intended currency and display formatting; it does not perform foreign exchange conversion. Actual costs may differ from the estimates.

## Security Considerations

This application is a demonstration MVP.

Before production deployment:

- Enable authentication and enforce user-specific database access.
- Configure restrictive Row Level Security policies.
- Keep API keys exclusively on the backend.
- Restrict CORS to trusted frontend origins.
- Add robust error handling, request limits, and API rate limiting.
- Validate generated itinerary data and budget constraints.
- Avoid exposing sensitive trip information to unauthorized users.

Do not use unrestricted database policies for a public deployment.

## Current Limitations

- Activity recommendations and prices are AI-generated and may be inaccurate.
- Live booking, hotel availability, and real-time transportation data are not integrated.
- The selected currency is not automatically converted using live exchange rates.
- User authentication and collaborative trip sharing are not implemented.
- Individual activity editing is not currently supported; regeneration operates at the day level.

## Future Enhancements

- User authentication and private trip management
- Collaborative itinerary planning
- Interactive maps and route optimization
- Live travel prices and accommodation availability
- Activity-level editing and scheduling
- Currency conversion using exchange-rate data
- Export itineraries to PDF

## License

This project was developed as an educational demonstration. Add an appropriate open-source license before distributing the source code publicly.
