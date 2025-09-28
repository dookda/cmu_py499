import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./page3.css";

/* global L */

import "../lib/leafletidw";
import "../lib/leafletmask";

const IDWLayer = ({ stations, boundary }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !stations?.length || !boundary) return;

    if (!L || !L.idwLayer) {
      console.error("Leaflet.idw plugin not loaded");
      return;
    }

    const geom =
      boundary.type === "FeatureCollection"
        ? boundary.features[0].geometry
        : boundary.type === "Feature"
          ? boundary.geometry
          : boundary;

    const points = stations.map((s) => [s.lat, s.lng, s.temp]);

    const idw = L.idwLayer(points, {
      opacity: 0.5,
      cellSize: 5,
      exp: 2,
      max: 35,
      gradient: {
        0.0: "#14fff7ff",
        0.5: "#ffb300ff",
        1.0: "#ff0101",
      },
      clipGeometry: geom,
    }).addTo(map);

    // (optional) ดิมนอกเขต – ถ้าไม่อยากดิมให้คอมเมนต์ทิ้ง
    // const mask = L.mask(geom, { fillOpacity: 0.0 }).addTo(map);

    const boundaryLine = L.geoJSON(boundary, {
      style: { color: "#dd030300", weight: 2, fillOpacity: 0 },
    }).addTo(map);

    return () => {
      if (map.hasLayer(idw)) map.removeLayer(idw);
      // if (mask && map.hasLayer(mask)) map.removeLayer(mask);
      if (map.hasLayer(boundaryLine)) map.removeLayer(boundaryLine);
    };
  }, [map, stations, boundary]);

  return null;
};

const Page3 = () => {
  const [stations, setStations] = useState([]);
  const [fetchTime, setFetchTime] = useState("");
  const [boundary, setBoundary] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const BASE_URL =
          window.location.hostname === "localhost"
            ? "http://localhost:6515"
            : "http://pnp_python:6515";

        const res = await fetch(`${BASE_URL}/pnp_api/aqicn_points`);
        const data = await res.json();
        if (!data.error) {
          setStations(data.stations || []);
          setFetchTime(data.fetch_time || "");
        }
      } catch (e) {
        console.error("Error fetching stations:", e);
      }
    };
    fetchStations();
    const t = setInterval(fetchStations, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // fetch("./AP_MCM.geojson")
    //   .then((r) => r.json())
    //   .then((g) => {
    //     console.log("Loaded boundary:", g);
    //     // setBoundary(g)
    //   })
    //   .catch((e) => console.error("Error loading boundary:", e));
  }, []);

  return (
    <div className="page3-container">
      <div className="info-panel">
        <h2>AQICN Stations</h2>
        <p className="fetch-time">Server Fetch: {fetchTime}</p>
        <table className="station-table">
          <thead>
            <tr>
              <th>Lat</th>
              <th>Lng</th>
              <th>Temp (°C)</th>
              <th>Station Time</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((s, idx) => (
              <tr key={idx}>
                <td>{s.lat.toFixed(4)}</td>
                <td>{s.lng.toFixed(4)}</td>
                <td>{s.temp.toFixed(1)}</td>
                <td>{s.station_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="map-section">
        <MapContainer
          center={[18.789795133754847, 98.98575723333781]}
          zoom={14}
          className="map-container"
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          />
          {boundary && <IDWLayer stations={stations} boundary={boundary} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default Page3;
