// import L from "leaflet";

// L.IdwLayer = (L.Layer ? L.Layer : L.Class).extend({
//   options: {
//     opacity: 0.4,
//     cellSize: 5, // pixel resolution
//     exp: 2, // power parameter
//     max: 38, // max value for normalization
//     gradient: {
//       0.0: "#4FB7B3",
//       0.5: "#FA812F",
//       1.0: "#DD0303",
//     },
//   },

//   initialize: function (latlngs, options) {
//     this._latlngs = latlngs;
//     L.setOptions(this, options);
//   },

//   setLatLngs: function (latlngs) {
//     this._latlngs = latlngs;
//     return this.redraw();
//   },

//   onAdd: function (map) {
//     this._map = map;
//     if (!this._canvas) this._initCanvas();
//     map.getPanes().overlayPane.appendChild(this._canvas);
//     map.on("moveend", this._reset, this);
//     if (map.options.zoomAnimation && L.Browser.any3d) {
//       map.on("zoomanim", this._animateZoom, this);
//     }
//     this._reset();
//   },

//   onRemove: function (map) {
//     map.getPanes().overlayPane.removeChild(this._canvas);
//     map.off("moveend", this._reset, this);
//     if (map.options.zoomAnimation) map.off("zoomanim", this._animateZoom, this);
//   },

//   _initCanvas: function () {
//     this._canvas = L.DomUtil.create(
//       "canvas",
//       "leaflet-idw-layer leaflet-layer"
//     );
//     const size = this._map.getSize();
//     this._canvas.width = size.x;
//     this._canvas.height = size.y;
//     const animated = this._map.options.zoomAnimation && L.Browser.any3d;
//     L.DomUtil.addClass(
//       this._canvas,
//       "leaflet-zoom-" + (animated ? "animated" : "hide")
//     );

//     this._ctx = this._canvas.getContext("2d");
//     this._setGradient(this.options.gradient);
//   },

//   _setGradient: function (grad) {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const gradient = ctx.createLinearGradient(0, 0, 0, 256);
//     for (let i in grad) gradient.addColorStop(+i, grad[i]);
//     canvas.width = 1;
//     canvas.height = 256;
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, 1, 256);
//     this._grad = ctx.getImageData(0, 0, 1, 256).data;
//   },

//   _reset: function () {
//     const topLeft = this._map.containerPointToLayerPoint([0, 0]);
//     L.DomUtil.setPosition(this._canvas, topLeft);
//     this._redraw();
//   },

//   _redraw: function () {
//     if (!this._map) return;
//     const size = this._map.getSize();
//     const ctx = this._ctx;
//     ctx.clearRect(0, 0, size.x, size.y);

//     const cellSize = this.options.cellSize;
//     const exp = this.options.exp;
//     const max = this.options.max;

//     for (let y = 0; y < size.y; y += cellSize) {
//       for (let x = 0; x < size.x; x += cellSize) {
//         let numerator = 0,
//           denominator = 0;
//         for (let i = 0; i < this._latlngs.length; i++) {
//           const p = this._map.latLngToContainerPoint(this._latlngs[i]);
//           const val = this._latlngs[i][2];
//           const dx = x - p.x;
//           const dy = y - p.y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           const w = dist === 0 ? 1 : 1 / Math.pow(dist, exp);
//           numerator += val * w;
//           denominator += w;
//         }
//         const z = numerator / denominator;

//         const color = this._getColor(z / max);
//         ctx.fillStyle = color;
//         ctx.fillRect(x, y, cellSize, cellSize);
//       }
//     }
//   },

//   _getColor: function (value) {
//     const idx = Math.floor(value * 255) * 4;
//     return `rgba(${this._grad[idx]}, ${this._grad[idx + 1]}, ${
//       this._grad[idx + 2]
//     }, ${this.options.opacity})`;
//   },
// });

// L.idwLayer = function (latlngs, options) {
//   return new L.IdwLayer(latlngs, options);
// };

// export default L.IdwLayer;

import L from "leaflet";

L.IdwLayer = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    opacity: 0.5,
    cellSize: 5, // pixel resolution
    exp: 2, // power parameter
    max: 35, // max value for normalization
    gradient: {
      0.0: "#14fff7ff",
      0.5: "#ffb300ff",
      1.0: "#ff0101",
    },
  },

  initialize: function (latlngs, options) {
    this._latlngs = latlngs || [];
    L.setOptions(this, options);

    // ✅ bind methods ล่วงหน้า (แก้ warning listener undefined)
    this._resetBound = this._reset.bind(this);
    this._animateZoomBound = this._animateZoom.bind(this);
  },

  setLatLngs: function (latlngs) {
    this._latlngs = latlngs || [];
    return this.redraw();
  },

  onAdd: function (map) {
    this._map = map;
    if (!this._canvas) this._initCanvas();

    map.getPanes().overlayPane.appendChild(this._canvas);

    // ✅ ใช้ function ที่ bind แล้ว
    map.on("moveend", this._resetBound);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoomBound);
    }

    this._reset();
  },

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    // ✅ remove listener ด้วย function ที่ bind ไว้
    map.off("moveend", this._resetBound);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.off("zoomanim", this._animateZoomBound);
    }
  },

  _initCanvas: function () {
    this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-idw-layer leaflet-layer"
    );
    const size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;

    const animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      this._canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._ctx = this._canvas.getContext("2d");
    this._setGradient(this.options.gradient);
  },

  _setGradient: function (grad) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    for (let i in grad) gradient.addColorStop(+i, grad[i]);
    canvas.width = 1;
    canvas.height = 256;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    this._grad = ctx.getImageData(0, 0, 1, 256).data;
  },

  _reset: function () {
    if (!this._map) return;
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._redraw();
  },

  _redraw: function () {
    if (!this._map || !this._latlngs || this._latlngs.length === 0) return;
    const size = this._map.getSize();
    const ctx = this._ctx;
    ctx.clearRect(0, 0, size.x, size.y);

    const cellSize = this.options.cellSize;
    const exp = this.options.exp;
    const max = this.options.max;

    for (let y = 0; y < size.y; y += cellSize) {
      for (let x = 0; x < size.x; x += cellSize) {
        let numerator = 0,
          denominator = 0;

        for (let i = 0; i < this._latlngs.length; i++) {
          const p = this._map.latLngToContainerPoint(this._latlngs[i]);
          const val = this._latlngs[i][2];
          const dx = x - p.x;
          const dy = y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const w = dist === 0 ? 1 : 1 / Math.pow(dist, exp);
          numerator += val * w;
          denominator += w;
        }

        const z = denominator === 0 ? 0 : numerator / denominator;
        const color = this._getColor(z / max);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  },

  _getColor: function (value) {
    const idx = Math.min(255, Math.floor(value * 255)) * 4;
    return `rgba(${this._grad[idx]}, ${this._grad[idx + 1]}, ${
      this._grad[idx + 2]
    }, ${this.options.opacity})`;
  },

  _animateZoom: function (e) {
    const scale = this._map.getZoomScale(e.zoom);
    const offset = this._map
      ._getCenterOffset(e.center)
      ._multiplyBy(-scale)
      .subtract(this._map._getMapPanePos());

    L.DomUtil.setTransform(this._canvas, offset, scale);
  },
});

L.idwLayer = function (latlngs, options) {
  return new L.IdwLayer(latlngs, options);
};

export default L.IdwLayer;
