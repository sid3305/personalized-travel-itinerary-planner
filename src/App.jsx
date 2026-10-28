
import { useState, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const currencies = {
  INR: { symbol: "₹", name: "Indian Rupee" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
};

const money = (amount, currency = "INR") =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const call = async (path, method = "GET", body) => {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }

  return response.json();
};

export default function App() {
  const [f, setF] = useState({
    destination: "",
    days: 3,
    travelers: 1,
    budget: 15000,
    currency: "INR",
    style: "relaxed",
    interests: "",
  });

  const [trips, setTrips] = useState([]);
  const [cur, setCur] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setF((old) => ({
      ...old,
      [key]: ["days", "travelers", "budget"].includes(key)
        ? e.target.value === "" ? "" : Number(e.target.value)
        : e.target.value,
    }));

  const load = async () => {
    try {
      setTrips(await call("/trips"));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const gen = async () => {
    setBusy("Generating itinerary...");
    setError("");

    try {
      const trip = await call("/generate", "POST", f);
      setCur(trip);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const regen = async (day) => {
    setBusy(`Regenerating day ${day}...`);
    setError("");

    try {
      setCur(await call(`/trips/${cur.id}/regenerate/${day}`, "POST"));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const del = async () => {
    if (!cur || !window.confirm("Delete this trip?")) return;

    setBusy("Deleting...");
    setError("");

    try {
      await call(`/trips/${cur.id}`, "DELETE");
      setCur(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const total =
    cur?.plan?.days
      ?.flatMap((day) => day.items || [])
      .reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;

  const tripCurrency = cur?.params?.currency || "INR";

  return (
    <div className="app">
      <aside>
        <h1>Plan a trip</h1>

        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          placeholder="e.g. Jaipur, India"
          value={f.destination}
          onChange={update("destination")}
        />

        <div className="row">
          <div>
            <label htmlFor="days">Duration (days)</label>
            <input
              id="days"
              type="number"
              min="1"
              max="14"
              value={f.days}
              onChange={update("days")}
            />
          </div>
          <div>
            <label htmlFor="travelers">Travelers</label>
            <input
              id="travelers"
              type="number"
              min="1"
              max="50"
              value={f.travelers}
              onChange={update("travelers")}
            />
          </div>
        </div>

        <label htmlFor="budget">Total budget</label>
        <div className="row budget-row">
          <input
            id="budget"
            type="number"
            min="1"
            placeholder="Enter amount"
            value={f.budget}
            onChange={update("budget")}
          />
          <select
            aria-label="Budget currency"
            value={f.currency}
            onChange={update("currency")}
          >
            {Object.entries(currencies).map(([code, value]) => (
              <option key={code} value={code}>
                {code} ({value.symbol})
              </option>
            ))}
          </select>
        </div>
        <small>Total for all travelers and all days.</small>

        <label htmlFor="style">Travel style</label>
        <select id="style" value={f.style} onChange={update("style")}>
          {["relaxed", "adventure", "cultural", "romantic", "foodie"].map(
            (style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            )
          )}
        </select>

        <label htmlFor="interests">Interests</label>
        <input
          id="interests"
          placeholder="Food, temples, hiking..."
          value={f.interests}
          onChange={update("interests")}
        />

        <button
          disabled={
            !f.destination.trim() ||
            !Number.isFinite(f.days) ||
            f.days < 1 ||
            f.days > 14 ||
            !Number.isFinite(f.travelers) ||
            f.travelers < 1 ||
            !Number.isFinite(f.budget) ||
            f.budget <= 0 ||
            !!busy
          }
          onClick={gen}
        >
          {busy || "Generate itinerary"}
        </button>

        {error && <p className="error">{error}</p>}

        <h2>Saved trips</h2>
        {trips.map((trip) => (
          <button
            className="saved"
            key={trip.id}
            onClick={() => setCur(trip)}
          >
            {trip.destination} · {trip.params.days} days
          </button>
        ))}
      </aside>

      <main>
        {!cur ? (
          <p>Enter your preferences to build a personalized itinerary.</p>
        ) : (
          <>
            <h1>{cur.destination}</h1>
            <p className="total">
              Estimated total: {money(total, tripCurrency)}
            </p>
            <button
              className="ghost"
              disabled={!!busy}
              onClick={del}
            >
              Delete trip
            </button>

            {cur.plan.days.map((day) => (
              <section key={day.day}>
                <h2>
                  Day {day.day}: {day.theme}
                  <button
                    className="ghost"
                    disabled={!!busy}
                    onClick={() => regen(day.day)}
                  >
                    Regenerate
                  </button>
                </h2>

                {day.items.map((item, index) => (
                  <div className="item" key={index}>
                    <span className="t">{item.time}</span>
                    <div>
                      <b>{item.title}</b> <i>({item.type})</i>
                      <p>{item.note}</p>
                    </div>
                    <span>{money(item.cost, tripCurrency)}</span>
                  </div>
                ))}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
