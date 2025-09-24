export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  demoUrl: string;
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'geovision',
    title: 'GeoVision AI',
    description: 'Satellite & aerial imagery analysis pipeline for land cover, change detection, and object analytics.',
    tech: ['TypeScript', 'PyTorch', 'RasterIO', 'PostGIS'],
    demoUrl: 'https://geodev.fun/demo/geovision'
  },
  {
    id: 'terrain-tiles',
    title: 'Terrain Tiles Engine',
    description: 'Lightweight vector & elevation tile server optimized for global terrain visualization and analysis.',
    tech: ['Rust', 'PMTiles', 'Cloudflare'],
    demoUrl: 'https://geodev.fun/demo/terrain'
  },
  {
    id: 'flow-analytics',
    title: 'HydroFlow Analytics',
    description: 'Watershed & hydrological modeling with interactive flow accumulation and basin delineation.',
    tech: ['Python', 'xarray', 'Dask', 'MapLibre'],
    demoUrl: 'https://geodev.fun/demo/hydro'
  },
  {
    id: 'urban-heat',
    title: 'Urban Heat Explorer',
    description: 'Surface urban heat island mapping using thermal + nighttime lights fusion for city resilience planning.',
    tech: ['GEE', 'TensorFlow', 'NDVI', 'Deck.GL'],
    demoUrl: 'https://geodev.fun/demo/heat',
    repoUrl: 'https://github.com/example/urban-heat'
  },
  {
    id: 'coast-ml',
    title: 'Coastline ML Monitor',
    description: 'Automated shoreline change detection using temporal satellite stacks and ML regression surfaces.',
    tech: ['Sentinel-2', 'LightGBM', 'GDAL'],
    demoUrl: 'https://geodev.fun/demo/coast'
  },
  {
    id: 'geo-search',
    title: 'Semantic GeoSearch',
    description: 'Embedding-based semantic search across geospatial layers, metadata, and model outputs.',
    tech: ['VectorDB', 'Embeddings', 'FastAPI', 'Qdrant'],
    demoUrl: 'https://geodev.fun/demo/search'
  },
  {
    id: 'realtime-alerts',
    title: 'Realtime Geo Alerts',
    description: 'Streaming geofence + anomaly detection engine for environmental & infrastructure monitoring.',
    tech: ['Kafka', 'Flink', 'Redis', 'WebSocket'],
    demoUrl: 'https://geodev.fun/demo/alerts'
  }
];
