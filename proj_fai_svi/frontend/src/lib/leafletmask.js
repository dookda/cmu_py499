/*
 * Leaflet.Mask plugin (แก้เป็น ES Module)
 * Adapted for React + Leaflet
 */
import L from "leaflet";

/**
 * L.mask: ใช้สร้าง mask layer บนแผนที่
 * @param {GeoJSON} geojson - polygon/multipolygon สำหรับ clipping
 * @param {Object} options - leaflet path options
 */
L.Mask = L.GeoJSON.extend({
  options: {
    stroke: false,
    fill: true,
    fillColor: "#000",
    fillOpacity: 0.5,
  },

  initialize: function (geojson, options) {
    L.Util.setOptions(this, options);
    L.GeoJSON.prototype.initialize.call(this, geojson, this.options);
  },
});

// ✅ Helper function
L.mask = function (geojson, options) {
  return new L.Mask(geojson, options);
};

export default L.Mask;
