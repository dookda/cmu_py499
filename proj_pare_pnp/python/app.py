from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import polyline
import numpy as np
import math
import joblib
import pandas as pd
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo





# -----------------------
# CONFIG
# -----------------------
GOOGLE_API_KEY   = "AIzaSyDz7XeV2UKhACZL1A7KHEk0uZc_HlP0j6w"
AQICN_TOKEN      = "d895365a9f624ee0efa68bc4b5805aad2dbadb6f"
ANN_MODEL_PATH   = "ann_temp_v3.joblib"

AQICN_FEED_IDS = [
    "A99496","A344371","A104236","A104221","A365722","A532975","A369997",
    "A370795","A370798","A196417","A403297","A531862","A528604","A476029",
    "@1822","@5775","@6817",
]

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Utility functions
# -----------------------
def parse_minutes(text: str) -> int:
    """แปลงข้อความเวลา (เช่น '1 hour 20 mins') เป็นนาที"""
    import re
    if not text:
        return 0
    h = re.search(r"(\d+)\s*hour", text)
    m = re.search(r"(\d+)\s*min", text)
    hours = int(h.group(1)) * 60 if h else 0
    mins = int(m.group(1)) if m else 0
    return hours + mins

def haversine(lat1, lon1, lat2, lon2) -> float:
    """คำนวณระยะทางระหว่าง 2 จุด (km)"""
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl   = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def fetch_aqicn_realtime():
    """ดึงข้อมูลอุณหภูมิ real-time จาก AQICN"""
    stations = []
    for sid in AQICN_FEED_IDS:
        url = f"https://api.waqi.info/feed/{sid}/?token={AQICN_TOKEN}"
        try:
            r = requests.get(url, timeout=6)
            j = r.json()
            if j.get("status") != "ok":
                continue
            city = j["data"].get("city", {})
            iaqi = j["data"].get("iaqi", {})
            temp = iaqi.get("t", {}).get("v", None)
            if temp is None:
                continue
            geo = city.get("geo", None)
            if not geo or len(geo) != 2:
                continue
            lat, lng = float(geo[0]), float(geo[1])
            stations.append({"lat": lat, "lng": lng, "temp": float(temp)})
        except Exception as e:
            print("AQICN fetch error:", sid, e)
            continue
    return stations

def infer_day_type_now():
    wd = datetime.now().weekday()
    return "Weekend" if wd in (5, 6) else "Workday"

def idw_value(lat, lng, stations, power=2, eps=1e-9):
    """คำนวณค่า IDW ที่จุด lat,lng"""
    ws, vs = [], []
    for s in stations:
        d = haversine(lat, lng, s["lat"], s["lng"])
        if d < 0.01:   # ถ้าใกล้มาก ใช้ค่า temp ตรงนั้นเลย
            return float(s["temp"])
        w = 1.0 / ((d ** power) + eps)
        ws.append(w)
        vs.append(s["temp"])
    return float(np.dot(ws, vs) / (np.sum(ws) if np.sum(ws) else 1))

# -----------------------
# โหลด ANN model
# -----------------------
ann_v3 = None
try:
    ann_v3 = joblib.load(ANN_MODEL_PATH)
    print(f"[OK] Loaded ANN v3 from: {ANN_MODEL_PATH}")
except Exception as e:
    print("[WARN] Cannot load ANN model:", e)

# -----------------------
# Endpoints
# -----------------------
@app.get("/")
async def home():
    return {"ok": True, "message": "Backend running with FastAPI"}

@app.get("/pnp_api/traffic/getroute")
async def traffic_getroute(lat: float, lng: float, end_lat: float, end_lng: float):
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{lat},{lng}",
        "destination": f"{end_lat},{end_lng}",
        "mode": "driving",
        "departure_time": "now",
        "key": GOOGLE_API_KEY
    }
    resp = requests.get(url, params=params, timeout=10)
    data = resp.json()

    if data.get("status") != "OK":
        return JSONResponse(content={"error": data.get("status", "UNKNOWN_ERROR")}, status_code=502)

    route = data["routes"][0]
    leg   = route["legs"][0]
    coords = polyline.decode(route["overview_polyline"]["points"])
    normal_minutes = parse_minutes(leg["duration"]["text"])
    traffic_minutes = parse_minutes(leg.get("duration_in_traffic", {}).get("text", leg["duration"]["text"]))
    time_diff = traffic_minutes - normal_minutes

    return {
        "route_coords": coords,
        "distance": leg["distance"]["text"],
        "normal_duration": leg["duration"]["text"],
        "traffic_duration": leg.get("duration_in_traffic", {}).get("text", leg["duration"]["text"]),
        "time_diff": time_diff,
        "diff_color": "red" if time_diff > 0 else "green" if time_diff < 0 else "yellow",
        "fetch_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/pnp_api/idw_route_mean")
async def idw_route_mean(payload: dict = Body(...)):
    """คำนวณค่า IDW เฉลี่ยตามเส้นทาง"""
    coords = payload.get("route_coords")
    if not coords or not isinstance(coords, list):
        return JSONResponse(content={"error": "route_coords is required"}, status_code=400)

    stations = fetch_aqicn_realtime()
    if len(stations) < 2:
        return JSONResponse(content={"error": "Not enough AQICN stations"}, status_code=503)

    step = max(1, len(coords) // 50)  # ลดจำนวน sample point
    samples = coords[::step] if step > 1 else coords

    vals = []
    for lat, lng in samples:
        vals.append(idw_value(lat, lng, stations, power=2))

    if not vals:
        return JSONResponse(content={"error": "IDW calculation failed"}, status_code=500)

    mean_idw = float(np.mean(vals))
    return {"idw_temp": round(mean_idw, 2), "n_samples": len(samples)}

@app.get("/pnp_api/predict_v3")
async def predict_v3(
    day_type: Optional[str] = None,
    traffic_time: Optional[float] = 0,
    idw_temp: Optional[str] = None
):
    if ann_v3 is None:
        return JSONResponse(content={"error": "ANN model not loaded"}, status_code=500)

    day_type = day_type or infer_day_type_now()

    # ป้องกัน undefined/null
    if idw_temp in (None, "", "undefined", "null"):
        return JSONResponse(content={"error": "idw_temp missing"}, status_code=400)

    try:
        idw_val = float(idw_temp)
    except:
        return JSONResponse(content={"error": "idw_temp invalid"}, status_code=400)

    X = pd.DataFrame([{
        "Day_Type": day_type,
        "traffic_time": float(traffic_time or 0),
        "idw_temp": idw_val
    }])
    pred = float(ann_v3.predict(X)[0])

    return {
        "day_type": day_type,
        "traffic_time": float(traffic_time or 0),
        "idw_temp": idw_val,
        "predicted_temp": round(pred, 2),
        "unit": "°C"
    }
@app.get("/pnp_api/aqicn_points")
async def aqicn_points():
    stations = []
    for sid in AQICN_FEED_IDS:
        url = f"https://api.waqi.info/feed/{sid}/?token={AQICN_TOKEN}"
        try:
            r = requests.get(url, timeout=6)
            j = r.json()
            if j.get("status") != "ok":
                continue

            city = j["data"].get("city", {})
            iaqi = j["data"].get("iaqi", {})
            temp = iaqi.get("t", {}).get("v", None)
            time_info = j["data"].get("time", {}).get("s", None)  # ✅ เวลา observation ของสถานี

            if temp is None or not city.get("geo"):
                continue

            lat, lng = float(city["geo"][0]), float(city["geo"][1])
            stations.append({
                "lat": lat,
                "lng": lng,
                "temp": float(temp),
                "station_time": time_info   # ✅ เก็บเวลา observation
            })
        except Exception as e:
            print("AQICN fetch error:", sid, e)
            continue

    if not stations:
        return JSONResponse(content={"error": "No data"}, status_code=500)

    # ✅ เวลาไทยตอน server fetch
    fetch_time = datetime.now(ZoneInfo("Asia/Bangkok")).strftime("%Y-%m-%d %H:%M:%S")

    return {
        "stations": stations,   # ✅ เก็บเป็น object [{lat, lng, temp, station_time}, ...]
        "count": len(stations),
        "fetch_time": fetch_time
    }