// 🔑 API Key
const API_KEY = "56u0NzJGcQbBnhc7BeYm";

// 🎨 Category colors สำหรับ "ภาพรวม"
const CATEGORY_COLORS = {
    TRN: "#6c7d85",
    TEC: "#FFA726",
    ENV: "#87da8d",
    EDC: "#85c0ef",
    PSG: "#d17472",
    HLT: "#bf2457",
    RES: "#a38478",
};
const CATEGORY_LIGHT = {
    TRN: "#cfd8dc",
    TEC: "#ffe0b2",
    ENV: "#c8e6c9",
    EDC: "#bbdefb",
    PSG: "#ffcdd2",
    HLT: "#f8bbd0",
    RES: "#d7ccc8",
};

// 🏷️ แปลงตัวย่อ → ความหมาย
const SERVICE_LABELS = {
    TRN: "ด้านคมนาคม",
    TEC: "ด้านการท่องเที่ยวและเศรษฐกิจ",
    ENV: "ด้านสิ่งแวดล้อม",
    EDC: "ด้านการศึกษาและวัฒนธรรม",
    PSG: "ด้านความปลอดภัยและการปกครอง",
    HLT: "ด้านสาธารณสุข",
    RES: "ด้านที่พักอาศัยและอื่นๆ",
};

// ✅ สร้างแผนที่
const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
    center: [98.9853, 18.7883],
    zoom: 12,
    pitch: 45,
    bearing: -17,
});
map.addControl(new maplibregl.NavigationControl(), "top-left");

// ✅ ฟังก์ชันโหลดเลเยอร์
function loadHexLayer(url, layerId, isOverview = false) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (map.getSource(layerId)) {
                map.removeLayer(layerId);
                map.removeSource(layerId);
            }
            map.addSource(layerId, { type: "geojson", data });

            map.addLayer({
                id: layerId,
                type: "fill",
                source: layerId,
                layout: {
                    visibility: (layerId === "CONF" ? "visible" : "none")
                },
                paint: isOverview
                    ? {
                        // ✅ ภาพรวมเหมือนเดิม
                        "fill-color": [
                            "match", ["get", "majority_c"],
                            "TRN", CATEGORY_LIGHT.TRN,
                            "TEC", CATEGORY_LIGHT.TEC,
                            "ENV", CATEGORY_LIGHT.ENV,
                            "EDC", CATEGORY_LIGHT.EDC,
                            "PSG", CATEGORY_LIGHT.PSG,
                            "HLT", CATEGORY_LIGHT.HLT,
                            "RES", CATEGORY_LIGHT.RES,
                            "transparent"   // ถ้าไม่เจอค่า → โปร่งใส
                        ],
                        "fill-opacity": 0.35,
                        "fill-outline-color": "#555",
                    }
                    : {
                        // ✅ เลเยอร์ย่อย: ใช้ MEAN แต่โปร่งใสถ้าไม่มีค่า
                        "fill-color": [
                            "case",
                            ["!", ["has", "MEAN"]], "transparent",   // ถ้าไม่มี field → โปร่งใส
                            ["==", ["get", "MEAN"], 0], "transparent", // ถ้า MEAN = 0 → โปร่งใส
                            [
                                "interpolate", ["linear"], ["get", "MEAN"],
                                0, "#ffffcc",
                                65, "#ffeda0",
                                110, "#feb24c",
                                170, "#fd8d3c",
                                265, "#f03b20",
                                423, "#bd0026"
                            ]
                        ],
                        "fill-opacity": 0.65,
                        "fill-outline-color": "#993404"
                    }
            });


            // ✅ Popup เฉพาะ "ภาพรวม"
            if (isOverview) {
                map.on("click", layerId, (e) => {
                    const p = e.features[0].properties;

                    if (!p || p.majority_c === "-" || p.n_points === 0) {
                        new maplibregl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(`<b>ไม่มีข้อมูล</b>`)
                            .addTo(map);
                        return;
                    }

                    const label = SERVICE_LABELS[p.majority_c] || "-";
                    const points = p.n_points
                        ? `${p.n_points} จุด`
                        : "-";

                    new maplibregl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`
                            <b>ประเภทบริการ:</b> ${label}<br>
                            <b>จำนวนจุดบริการ:</b> ${points}
                        `)
                        .addTo(map);
                });
            }
        })
        .catch(err => console.error("Error loading:", url, err));
}

// ✅ Config ของแต่ละเลเยอร์
const LAYER_CONFIG = {
    CONF: { url: "/svi_api/hexagons/conf", isOverview: true },
    TRN: { url: "/svi_api/hexagons/trn", isOverview: false },
    TEC: { url: "/svi_api/hexagons/tec", isOverview: false },
    ENV: { url: "/svi_api/hexagons/env", isOverview: false },
    EDC: { url: "/svi_api/hexagons/edc", isOverview: false },
    PSG: { url: "/svi_api/hexagons/psg", isOverview: false },
    HLT: { url: "/svi_api/hexagons/hlt", isOverview: false },
    RES: { url: "/svi_api/hexagons/res", isOverview: false },
};

// ✅ โหลดทุกเลเยอร์ แต่ซ่อนหมด ยกเว้น CONF
map.on("load", () => {
    Object.entries(LAYER_CONFIG).forEach(([id, cfg]) => {
        loadHexLayer(cfg.url, id, cfg.isOverview);
    });
});

// ✅ function เปิดเลเยอร์เดียว
function setActiveLayer(activeId) {
    Object.keys(LAYER_CONFIG).forEach(id => {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", id === activeId ? "visible" : "none");
        }
    });
}

// ✅ radio control → switch layer
document.querySelectorAll("input[name='layer']").forEach(radio => {
    radio.addEventListener("change", e => {
        setActiveLayer(e.target.value);
    });
});

// ✅ Basemap Control + reload layers
class BasemapControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "maplibregl-ctrl maplibregl-ctrl-basemap";

        const btn = document.createElement("button");
        btn.innerHTML = `<i class="fa-solid fa-layer-group"></i>`;
        this._container.appendChild(btn);

        const menu = document.createElement("div");
        menu.className = "basemap-menu";

        const basemaps = {
            "Google-like Streets": `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
            "Dark Mode": `https://api.maptiler.com/maps/darkmatter/style.json?key=${API_KEY}`,
            "Outdoor": `https://api.maptiler.com/maps/outdoor/style.json?key=${API_KEY}`
        };

        Object.keys(basemaps).forEach(name => {
            const item = document.createElement("div");
            item.textContent = name;
            item.onclick = () => {
                map.setStyle(basemaps[name]);

                // 🔄 โหลดเลเยอร์ใหม่หลังเปลี่ยน basemap
                map.once("style.load", () => {
                    Object.entries(LAYER_CONFIG).forEach(([id, cfg]) => {
                        loadHexLayer(cfg.url, id, cfg.isOverview);
                    });
                    setTimeout(() => {
                        const checked = document.querySelector("input[name='layer']:checked");
                        if (checked) setActiveLayer(checked.value);
                    }, 500);
                });

                menu.style.display = "none";
            };
            menu.appendChild(item);
        });

        this._container.appendChild(menu);

        btn.onclick = () => {
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        };

        return this._container;
    }

    onRemove() {
        this._container.remove();
        this._map = undefined;
    }
}

// 📌 เพิ่ม Basemap Control เข้าไปในแผนที่
map.addControl(new BasemapControl(), "top-right");
