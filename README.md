# ✈️ Personalized Travel Itinerary Planner

An AI-powered travel planning web application that generates personalized, day-by-day itineraries based on destination, budget, travel duration, group size, travel style, and interests.

**🌐 [Live Demo](https://personalized-travel-itinerary-planner-b2k6js0w2.vercel.app/)** · **⚙️ [Backend API](https://musafir-g0w3.onrender.com/)** · **📚 [API Documentation](https://musafir-g0w3.onrender.com/docs)**

Built with **React, Vite, FastAPI, Groq, and Supabase**, the application simplifies trip planning by organizing attractions, dining, accommodation, and transportation into a structured itinerary.

> **Note:** The backend runs on a free hosting tier and may take a little time to respond after inactivity. Activity costs are AI-generated estimates, not live prices.

## ✨ Features

- **AI-Powered Itinerary Generation** — Generate personalized travel plans using Groq-hosted language models.
- **Custom Trip Preferences** — Specify destination, duration, number of travelers, total budget, currency, travel style, and interests.
- **Day-Wise Planning** — Explore activities organized by day, with suggested times, descriptions, categories, and estimated costs.
- **Cost Estimation** — View estimated activity costs and the itinerary's total in the selected currency.
- **Saved Trips Dashboard** — Store and retrieve previously generated itineraries using Supabase.
- **Day Regeneration** — Generate alternative activities for a specific day without replacing the entire itinerary.
- **Trip Management** — Select and delete saved trips.
- **Responsive Interface** — A clean dashboard designed for desktop and smaller screens.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Development and Build Tool | Vite |
| Backend | Python, FastAPI |
| AI Integration | Groq API |
| Language Model | `openai/gpt-oss-20b` |
| Database | Supabase PostgreSQL |
| Data Validation | Pydantic |
| Environment Configuration | python-dotenv |
| API Documentation | FastAPI Swagger UI |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## 🏗️ System Architecture

```text
                 User
                   |
                   v
          React + Vite Frontend
              (Vercel)
                   |
               HTTP / JSON
                   |
                   v
             FastAPI Backend
                (Render)
              /          \
             v            v
         Groq API      Supabase
       Itinerary       PostgreSQL
       Generation      Trip Storage
              \          /
               v        v
           Personalized
             Itinerary
                   |
                   v
            React Dashboard
```

## 📂 Project Structure

```text
personalized-travel-itinerary-planner/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env                  # Local secrets; not committed
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

The `.venv/` and `node_modules/` directories contain local dependencies and should not be committed.

## 🚀 Run Locally

### Prerequisites

- Python 3.10 or a compatible newer version
- Node.js and npm
- A [Groq API key](https://console.groq.com/)
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/sid3305/personalized-travel-itinerary-planner.git
cd personalized-travel-itinerary-planner
```

### 2. Create and activate a Python environment

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

### 3. Configure environment variables

Create a file named `backend/.env`:

```dotenv
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
```

Replace the placeholders with your own credentials. Never commit real API keys or secret values to GitHub.

### 4. Configure the database

Open the Supabase SQL Editor and execute the contents of:

```text
database/schema.sql
```

The application expects a `trips` table with the following fields:

| Column | Purpose |
|---|---|
| `id` | Unique trip identifier |
| `destination` | Trip destination |
| `params` | JSONB containing trip preferences |
| `plan` | JSONB containing the generated itinerary |
| `created_at` | Trip creation timestamp |

Configure appropriate Row Level Security (RLS) policies and database permissions before making the application available to users.

### 5. Install frontend dependencies

From the project root:

```powershell
npm install
```

### 6. Start the application

Start both the frontend and backend using the combined development script:

```powershell
npm run dev:full
```

Open the application:

- **Frontend:** http://localhost:5173
- **Backend health check:** http://localhost:8000/
- **Interactive API documentation:** http://localhost:8000/docs

Keep the terminal running while using the application. Press `Ctrl + C` to stop the development servers.

## 🧭 How to Use

1. Enter a destination, such as Jaipur, India.
2. Choose the duration of the trip and the number of travelers.
3. Enter the total budget and select a currency.
4. Choose a travel style, such as relaxed or adventure.
5. Add interests such as food, temples, shopping, or hiking.
6. Click **Generate itinerary**.
7. Explore the day-wise activities, suggested schedule, and estimated costs.
8. Regenerate an individual day to explore alternative activities.
9. Select a saved trip to view it again, or delete it when it is no longer needed.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check backend availability |
| `POST` | `/generate` | Generate and save an itinerary |
| `GET` | `/trips` | Retrieve saved trips |
| `POST` | `/trips/{trip_id}/regenerate/{day}` | Regenerate a specific day |
| `DELETE` | `/trips/{trip_id}` | Delete a saved trip |

The interactive API documentation is available at [`/docs`](https://musafir-g0w3.onrender.com/docs).

## 🤖 AI and Cost Estimation

The backend sends trip preferences to the Groq API, which generates a structured JSON itinerary containing daily themes and activities. The generated plan is stored in Supabase and displayed through the React interface.

**Cost estimates are approximate.** Activity costs are AI-generated and may not reflect current admission fees, transportation fares, or accommodation prices. Currency selection controls the intended currency and display formatting; it does not perform live foreign exchange conversion.

## 🔐 Security Considerations

This project is an educational MVP. Before using it for real users:

- Add authentication and user-specific trip access.
- Enforce restrictive Row Level Security policies in Supabase.
- Keep API keys on the backend.
- Restrict CORS to trusted frontend origins.
- Add request validation, rate limiting, and robust error handling.
- Validate AI-generated itinerary data and budget constraints.
- Avoid exposing private trip information to unauthorized users.

## ⚠️ Current Limitations

- Recommendations and prices are AI-generated and may be inaccurate.
- Live hotel availability, booking, and transportation data are not integrated.
- Currency conversion using live exchange rates is not supported.
- User authentication and collaborative trip sharing are not implemented.
- Individual activity editing is not supported; regeneration operates at the day level.
- Free hosting tiers may introduce cold-start delays or usage limits.

## 🔮 Future Enhancements

- User authentication and private trip management
- Interactive maps and route optimization
- Live travel prices and accommodation availability
- Activity-level editing and scheduling
- Live currency conversion
- PDF itinerary export
- Collaborative trip planning

## 📄 License

This project was developed as an educational demonstration. No open-source license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under a particular license.
