
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
from supabase import create_client

load_dotenv()

ai = Groq(api_key=os.environ["GROQ_API_KEY"])
db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

app = FastAPI()
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        frontend_url,
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Trip(BaseModel):
    destination: str = Field(min_length=1, max_length=150)
    days: int = Field(default=3, ge=1, le=14)
    budget: float = Field(default=15000, gt=0)
    currency: str = Field(default="INR", pattern="^(INR|USD|EUR|GBP)$")
    travelers: int = Field(default=1, ge=1, le=50)
    style: str = "relaxed"
    interests: str = ""

SCHEMA = """
{
  "days": [
    {
      "day": 1,
      "theme": "Cultural exploration",
      "items": [
        {
          "time": "09:00",
          "type": "attraction",
          "title": "Amber Fort",
          "note": "Explore the historic fort",
          "cost": 300
        }
      ]
    }
  ]
}
"""




def ask(prompt: str) -> dict:
    last_error = None

    for attempt in range(2):
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a travel itinerary generator. "
                        "Return exactly one valid JSON object. "
                        "Do not use markdown or code fences. "
                        "Do not return JSON encoded as a string."
                    ),
                },
                {"role": "user", "content": prompt},
            ]

            options = {
                "model": "openai/gpt-oss-20b",
                "messages": messages,
                "max_tokens": 6000,
            }

            # Use JSON mode on the first attempt only.
            if attempt == 0:
                options["response_format"] = {"type": "json_object"}

            response = ai.chat.completions.create(**options)
            content = response.choices[0].message.content

            if not content or not content.strip():
                raise ValueError("Groq returned an empty response.")

            result = json.loads(content)

            if not isinstance(result, dict):
                raise ValueError("Groq did not return a JSON object.")

            return result

        except Exception as e:
            last_error = e

    raise HTTPException(
        status_code=502,
        detail=f"Groq generation failed after retry: {last_error}",
    )


def brief(t: Trip) -> str:
    return (
        f"{t.days}-day trip to {t.destination}, "
        f"{t.travelers} traveler(s), total budget "
        f"{t.currency} {t.budget}, "
        f"style {t.style}, interests {t.interests}. "
        f"All costs must be estimated in {t.currency}, "
        "for the entire group and entire trip. "
        "Try to keep the itinerary within the total budget."
    )

def save_error(e):
    raise HTTPException(status_code=502, detail=str(e))

@app.get("/")
def home():
    return {"message": "Travel Planner API is running"}

@app.post("/generate")
def generate(t: Trip):
    
    prompt = (
    f"Create a {t.days}-day travel itinerary. "
    f"Trip details: {brief(t)}. "
    f"Generate exactly {t.days} day objects, numbered 1 to {t.days}. "
    "Return one valid JSON object with a single top-level key named days. "
    "The days value MUST be an array of JSON objects. "
    "Every day object must contain day (integer), theme (string), "
    "and items (array). "
    "Every item must contain time (string), type (string), "
    "title (string), note (string), and cost (number). "
    "Use attraction, food, stay, or transport for type. "
    "Use non-negative numeric costs in the requested currency. "
    "Keep activities geographically close and consider the total budget. "
    "IMPORTANT: Never encode a day object as a string. "
    "Never put escaped JSON inside the days array. "
    "Do not include markdown, comments, or text outside the JSON. "
    f"Follow this example structure: {SCHEMA}"
    )

    plan = ask(prompt)
    if not isinstance(plan.get("days"), list) or len(plan["days"]) != t.days:
        raise HTTPException(502, "AI returned an invalid itinerary")
    try:
        result = db.table("trips").insert({
            "destination": t.destination,
            "params": t.model_dump(),
            "plan": plan,
        }).execute()
        return result.data[0]
    except Exception as e:
        save_error(e)

@app.get("/trips")
def trips():
    try:
        return db.table("trips").select("*").order(
            "id", desc=True
        ).execute().data
    except Exception as e:
        save_error(e)

@app.post("/trips/{trip_id}/regenerate/{day}")
def regen(trip_id: int, day: int):
    try:
        result = db.table("trips").select("*").eq(
            "id", trip_id
        ).execute()
        if not result.data:
            raise HTTPException(404, "Trip not found")

        row = result.data[0]
        plan = row["plan"]
        days = plan.get("days", {})
        if not isinstance(days, list) or not 1 <= day <= len(days):
            raise HTTPException(404, "Day not found")

        old_day = days[day - 1]
        new = ask(
            f"Trip: {json.dumps(row['params'])}. "
            f"Rewrite only day {day}, with different activities "
            f"from {json.dumps(old_day)}. Return only JSON with "
            f"day, theme and items. Every item must have time, type, "
            f"title, note and non-negative numeric cost."
        )
        if not isinstance(new.get("items"), list):
            raise HTTPException(502, "Invalid regenerated day")
        new["day"] = day
        days[day - 1] = new

        updated = db.table("trips").update({
            "plan": plan
        }).eq("id", trip_id).execute()
        return updated.data[0]
    except HTTPException:
        raise
    except Exception as e:
        save_error(e)

@app.delete("/trips/{trip_id}")
def delete(trip_id: int):
    try:
        db.table("trips").delete().eq("id", trip_id).execute()
        return {"ok": True}
    except Exception as e:
        save_error(e)
