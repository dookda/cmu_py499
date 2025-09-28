import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./page2.css";

const startIcon = L.divIcon({
  className: "custom-fa-icon",
  html: '<i class="fa-solid fa-location-dot" style="font-size:28px; color:#9e1916;"></i>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const endIcon = L.divIcon({
  className: "custom-fa-icon",
  html: '<i class="fa-solid fa-location-dot" style="font-size:28px; color:#9e1916;"></i>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const Page2 = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [idwTemp, setIdwTemp] = useState(null);
  const [predictedTemp, setPredictedTemp] = useState(null);

  const fetchPredictedTemp = async (traffic_time, idw_temp) => {
    try {
      const today = new Date();
      const day_type =
        today.getDay() === 0 || today.getDay() === 6 ? "Weekend" : "Workday";

      const res = await fetch(
        `http://127.0.0.1:6515/pnp_api/predict_v3?day_type=${day_type}&traffic_time=${traffic_time}&idw_temp=${idw_temp}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPredictedTemp(
        `🌡️ Predicted Temperature: ${data.predicted_temp} ${data.unit}`
      );
    } catch (err) {
      setPredictedTemp("Error: " + err.message);
    }
  };

  const handleFetchTraffic = async () => {
    if (!start || !end) {
      alert("Please select Start and End Point.");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:6515/pnp_api/traffic/getroute?lat=${start.lat}&lng=${start.lng}&end_lat=${end.lat}&end_lng=${end.lng}`
      );
      const trafficData = await res.json();
      if (trafficData.error) {
        setTrafficData({ error: trafficData.error });
        return;
      }

      const parseMinutes = (str) => {
        if (!str) return 0;
        const m = str.match(/(\d+)\s*min/);
        return m ? parseInt(m[1]) : 0;
      };
      const normal = parseMinutes(trafficData.normal_duration);
      const traffic = parseMinutes(trafficData.traffic_duration);
      const diff = traffic - normal;

      setTrafficData({ ...trafficData, diff });

      const idwRes = await fetch(
        "http://127.0.0.1:6515/pnp_api/idw_route_mean",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ route_coords: trafficData.route_coords }),
        }
      );
      const idwData = await idwRes.json();
      if (idwData.error) {
        setIdwTemp(null);
        throw new Error(idwData.error);
      }

      setIdwTemp(idwData.idw_temp);

      await fetchPredictedTemp(diff, idwData.idw_temp);
    } catch (err) {
      setTrafficData({ error: err.message });
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (!start) {
          setStart({ lat, lng });
        } else if (!end) {
          setEnd({ lat, lng });
        }
      },
    });
    return null;
  };

  return (
    <div className="page2-container">
      {/* ซ้าย: Map */}
      <div className="map-section">
        <MapContainer
          center={[18.781080789967085, 98.99286533650832]}
          zoom={13}
          className="map-container"
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          />
          <MapClickHandler />

          {start && (
            <Marker position={[start.lat, start.lng]} icon={startIcon} />
          )}
          {end && <Marker position={[end.lat, end.lng]} icon={endIcon} />}

          {trafficData && trafficData.route_coords && (
            <Polyline
              positions={trafficData.route_coords}
              color={trafficData.diff_color} // ✅ ใช้ค่าที่ backend ส่งมาเลย
              weight={6}
            />
          )}
        </MapContainer>
      </div>

      {/* ขวา: Info Panel */}
      <div className="info-section">
        <h2>Start lat,lng and End lat,lng </h2>
        <button className="btn-fetch" onClick={handleFetchTraffic}>
          Calculate route
        </button>

        {trafficData && !trafficData.error && (
          <div className="info-card">
            <p>Distance: {trafficData.distance}</p>
            <p>Normal time: {trafficData.normal_duration}</p>
            <p>Current time: {trafficData.traffic_duration}</p>
            <p>
              Time difference: {trafficData.diff} min (
              {trafficData.diff > 0 ? "🚗 traffic jam" : " Normal"})
            </p>
          </div>
        )}

        {idwTemp && (
          <div className="info-card">
            <p> IDW Temperature along route: {idwTemp} °C</p>
          </div>
        )}

        {predictedTemp && (
          <div className="info-card highlight">{predictedTemp}</div>
        )}

        {trafficData && trafficData.error && (
          <div className="info-card error"> Error: {trafficData.error}</div>
        )}
      </div>
    </div>
  );
};

export default Page2;
