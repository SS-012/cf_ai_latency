# 🌍 Cloudflare Edge Latency Tester

A simple **Real User Monitoring (RUM)** project that measures network performance from the browser to the nearest Cloudflare edge data center. Results such as round-trip time (RTT) and jitter are stored in a Cloudflare D1 database for analysis and visualization.

## 🚀 Features

- **Edge Latency Measurement**  
  Uses the Performance API to measure RTT from the browser to Cloudflare Workers.  
- **Jitter Calculation**  
  Computes variation in RTT between consecutive pings.  
- **RUM Metadata**  
  Captures ASN, country, city, and PoP (Point of Presence) from Cloudflare’s `request.cf` object.  
- **Persistent Storage**  
  Saves results into a Cloudflare D1 database with timestamps.  
- **Simple UI**  
  Click a button in the browser to run a test and view results instantly.  

## 🛠️ Tech Stack

- **Frontend**: HTML + Vanilla JS  
- **Backend**: Cloudflare Pages Functions  
  - `/ping` → returns Cloudflare routing info  
  - `/save` → saves latency results to D1  
- **Database**: Cloudflare D1 (SQLite-based, globally distributed)

## 📂 Project Structure

```

functions/
ping/
index.js        # GET /ping → returns ASN, country, city, colo
save/
index.js        # POST /save → inserts latency results into D1
public/
index.html        # Frontend page with "Run Test" button
wrangler.jsonc      # Wrangler configuration with D1 binding

````

## 🗄️ Database Schema

```sql
CREATE TABLE IF NOT EXISTS rum_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colo TEXT,
  timestamp TEXT,
  avg_rtt REAL,
  jitter REAL,
  asn TEXT,
  country TEXT,
  city TEXT
);
````

## ⚡ Running Locally

1. **Install Wrangler**

   ```bash
   npm install -g wrangler
   ```

2. **Run local dev server**

   ```bash
   npx wrangler pages dev
   ```

3. Open `http://localhost:8788` in your browser and click **Run Test**.

## 🌐 Deploying

1. Push your code to GitHub (connected to Cloudflare Pages).
2. In the Cloudflare Dashboard:

   * Bind your D1 database (`latency_db`) to the Pages project.
   * Redeploy.
3. Access your site via your Pages domain (e.g., `https://cf-ai-latency.pages.dev`).

## 📊 Future Improvements

* Add a `/history` route to query and display saved latency data.
* Build charts/graphs for latency and jitter trends.
* Expand tests across multiple VPNs or devices to simulate global traffic.
* Use ML models to detect congestion patterns from collected data.

## 🙌 Acknowledgements

* [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
* [Cloudflare D1](https://developers.cloudflare.com/d1/)
* [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties)
