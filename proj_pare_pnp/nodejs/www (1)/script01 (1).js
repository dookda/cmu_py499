// 🔑 API Key ของคุณ
const API_KEY = "56u0NzJGcQbBnhc7BeYm";

// กำหนด basemap styles
const basemaps = {
    "Google-like Streets": `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
    "Dark Mode": `https://api.maptiler.com/maps/darkmatter/style.json?key=${API_KEY}`,
    "Outdoor": `https://api.maptiler.com/maps/outdoor/style.json?key=${API_KEY}`
};

// สร้างแผนที่ MapLibre
const map = new maplibregl.Map({
    container: "map",
    style: basemaps["Google-like Streets"], // ค่าเริ่มต้น
    center: [98.9853, 18.7883], // เชียงใหม่
    zoom: 12,
    pitch: 45,
    bearing: -17
});

// เพิ่ม Navigation Control
map.addControl(new maplibregl.NavigationControl(), "top-left");

// ✅ Custom basemap switcher (popup style)
class BasemapPopupControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl maplibregl-ctrl-basemap-popup";

        // popup menu
        const menu = document.createElement("div");
        menu.className = "basemap-menu";
        Object.keys(basemaps).forEach(name => {
            const item = document.createElement("div");
            item.textContent = name;
            item.onclick = () => {
                map.setStyle(basemaps[name]);
                map.flyTo({ center: [98.9853, 18.7883], zoom: 12 });
                menu.classList.remove("show");
            };
            menu.appendChild(item);
        });
        this._container.appendChild(menu);

        // ปุ่มหลัก
        const btn = document.createElement("button");
        btn.innerHTML = `<i class="fa-solid fa-layer-group"></i>`;
        btn.onclick = () => {
            menu.classList.toggle("show");
        };
        this._container.appendChild(btn);

        return this._container;
    }
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
map.addControl(new BasemapPopupControl(), "top-right");

// dictionary แปล label → ไทย
const labelMap = {
    "TRN": "ด้านคมนาคม",
    "TEC": "ด้านการท่องเที่ยวและเศรษฐกิจ",
    "ENV": "ด้านสิ่งแวดล้อม",
    "EDC": "ด้านการศึกษาและวัฒนธรรม",
    "PSG": "ด้านความปลอดภัยและการปกครอง",
    "HLT": "ด้านสาธารณสุข",
    "RES": "ด้านที่พักอาศัยและอื่นๆ"
};

// mapping label → สีเข้ม
const CATEGORY_COLORS = {
    "TRN": "#6c7d85",  // คมนาคม
    "TEC": "#FFA726",  // ท่องเที่ยว
    "ENV": "#87da8d",  // สิ่งแวดล้อม
    "EDC": "#85c0ef",  // การศึกษา
    "PSG": "#d17472",  // ความปลอดภัย
    "HLT": "#bf2457",  // สาธารณสุข
    "RES": "#a38478"   // ที่อยู่อาศัย
};

// mapping label → สีอ่อน
const CATEGORY_LIGHT = {
    "TRN": "#cfd8dc",
    "TEC": "#ffe0b2",
    "ENV": "#c8e6c9",
    "EDC": "#bbdefb",
    "PSG": "#ffcdd2",
    "HLT": "#f8bbd0",
    "RES": "#d7ccc8"
};

// ✅ ฟังก์ชันสร้าง Marker วงกลม (กลางอ่อน ขอบเข้ม)
function createCircleMarker(darkColor, lightColor) {
    const el = document.createElement("div");
    el.style.width = "22px";
    el.style.height = "22px";
    el.style.borderRadius = "50%";
    el.style.background = lightColor;              // สีตรงกลาง
    el.style.border = `4px solid ${darkColor}`;    // ขอบเข้ม
    el.style.cursor = "pointer";
    return el;
}

// โหลดข้อมูล detections
fetch("/svi_api/detections")
    .then(res => res.json())
    .then(data => {
        if (data.features && data.features.length > 0) {
            const bounds = new maplibregl.LngLatBounds();

            data.features.forEach(f => {
                const label = f.properties.label || "-";
                const labelThai = labelMap[label] || label;
                const conf = f.properties.conf ? (f.properties.conf * 100).toFixed(2) + "%" : "-";
                const [lng, lat] = f.geometry.coordinates;

                const darkColor = CATEGORY_COLORS[label] || "#888";
                const lightColor = CATEGORY_LIGHT[label] || "#ccc";

                // ✅ Marker วงกลม (กลางอ่อน ขอบเข้ม)
                const marker = new maplibregl.Marker({ element: createCircleMarker(darkColor, lightColor) })
                    .setLngLat([lng, lat])
                    .addTo(map);

                // ✅ Popup
                const popupContent = `
                  <div class="custom-popup">
                    <b>ประเภท:</b> ${labelThai} (${label})<br>
                    <b>ความเชื่อมั่น:</b> ${conf}<br>
                    <b>Lat:</b> ${lat.toFixed(6)}<br>
                    <b>Lng:</b> ${lng.toFixed(6)}
                  </div>
                `;
                marker.setPopup(new maplibregl.Popup().setHTML(popupContent));

                // ✅ Tooltip hover
                const tooltip = new maplibregl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: 20,
                    className: "tooltip-popup"
                }).setText(labelThai);

                marker.getElement().addEventListener("mouseenter", () => {
                    tooltip.setLngLat([lng, lat]).addTo(map);
                });
                marker.getElement().addEventListener("mouseleave", () => {
                    tooltip.remove();
                });

                // ✅ Street View
                marker.getElement().addEventListener("click", () => {
                    const gApiKey = "AIzaSyDz7XeV2UKhACZL1A7KHEk0uZc_HlP0j6w";
                    const iframe = `
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style="border:0; border-radius:8px;"
                          loading="lazy" 
                          allowfullscreen
                          src="https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&key=${gApiKey}">
                        </iframe>
                    `;
                    document.getElementById("preview").innerHTML = iframe;
                });

                bounds.extend([lng, lat]);
            });

            // ✅ Zoom to bounds
            map.fitBounds(bounds, { padding: 20 });
        }
    })
    .catch(err => console.error("Error loading detections:", err));
