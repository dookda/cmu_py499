-- create extension postgis;
select * from public.cm_building_4326
select * from public.cm_osm_4326

create table cm_buildding_bb as SELECT id,fid,fullname,
       ST_Envelope(geom) AS geom
FROM public.cm_building_4326;

drop table cm_buildding_orbb;
create table cm_buildding_orbb as SELECT id,fid,fullname,
       ST_Boundary(ST_OrientedEnvelope(geom)) AS geom
FROM public.cm_building_4326;

SELECT *,
       ST_Boundary(geom) AS boundary
FROM public.cm_building_4326;

-- ok
create table aaa as 
WITH boundary_points AS (
  SELECT id, (dp).path[1] AS pt_order, (dp).geom AS pt
  FROM public.cm_building_bb,
  LATERAL ST_DumpPoints(ST_Boundary(geom)) AS dp
), line_segments AS (
  SELECT bp1.id, ST_MakeLine(bp1.pt, bp2.pt) AS segment
  FROM boundary_points bp1
  JOIN boundary_points bp2 ON bp1.id = bp2.id AND bp1.pt_order + 1 = bp2.pt_order
), distances AS (
  SELECT l.id, l.segment, ST_Distance(l.segment, r.geom) AS distance_to_road
  FROM line_segments l
  CROSS JOIN public.cm_osm_4326 r
)
SELECT DISTINCT ON (id) id, segment AS closest_segment
FROM distances
ORDER BY id, distance_to_road ASC;

-- create layer with split line
Create table bb as
WITH boundary_points AS (
  SELECT id, (dp).path[1] AS pt_order, (dp).geom AS pt
  FROM public.cm_building_bb,
  LATERAL ST_DumpPoints(ST_Boundary(geom)) AS dp
)
, line_segments AS (
  SELECT bp1.id, ST_MakeLine(bp1.pt, bp2.pt) AS segment
  FROM boundary_points bp1
  JOIN boundary_points bp2 ON bp1.id = bp2.id AND bp1.pt_order + 1 = bp2.pt_order
)
SELECT * FROM line_segments;

////
-- CREATE INDEX idx_bb_geom ON public.bb USING GIST (segment);
CREATE INDEX idx_cm_osm_4326_geom ON public.cm_osm_4326 USING GIST(geom);

with distances AS (
  SELECT l.id, l.segment, ST_Distance(l.segment, r.geom) AS distance_to_road
  FROM public.bb l
  CROSS JOIN public.cm_osm_4326 r
)
SELECT DISTINCT ON (id) id, segment AS closest_segment
FROM distances
ORDER BY id, distance_to_road ASC;

-- 
WITH relevant_buildings AS (
  SELECT b.id, b.geom
  FROM public.cm_building_bb b
  WHERE EXISTS (
    SELECT 1
    FROM public.cm_osm_4326 r
    WHERE ST_DWithin(b.geom, r.geom, 50)
  )
),
boundary_points AS (
  SELECT id, (dp).path[1] AS pt_order, (dp).geom AS pt
  FROM relevant_buildings b,
  LATERAL ST_DumpPoints(ST_Boundary(b.geom)) AS dp
)
, line_segments AS (
  SELECT bp1.id, ST_MakeLine(bp1.pt, bp2.pt) AS segment
  FROM boundary_points bp1
  JOIN boundary_points bp2 ON bp1.id = bp2.id AND bp1.pt_order + 1 = bp2.pt_order
)
, distances AS (
  SELECT l.id, l.segment, ST_Distance(l.segment, r.geom) AS distance_to_road
  FROM line_segments l
  CROSS JOIN public.roads r
)
SELECT DISTINCT ON (id) id, segment AS closest_segment
FROM distances
ORDER BY id, distance_to_road ASC;


