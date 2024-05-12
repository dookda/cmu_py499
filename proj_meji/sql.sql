-- 1. create building line segment
CREATE TABLE cm_bb AS
WITH boundary_points AS (
  SELECT id, (dp).path[1] AS pt_order, (dp).geom AS pt
  FROM public.cm_building_orbb,
  LATERAL ST_DumpPoints(ST_Boundary(geom)) AS dp
)
, line_segments AS (
  SELECT bp1.id, ST_MakeLine(bp1.pt, bp2.pt) AS geom
  FROM boundary_points bp1
  JOIN boundary_points bp2 ON bp1.id = bp2.id AND bp1.pt_order + 1 = bp2.pt_order
)
SELECT * FROM line_segments;

-- 2. add gid column with serial
ALTER TABLE cm_bb ADD COLUMN gid SERIAL;
CREATE INDEX idx_cm_bb_geom ON public.cm_bb USING GIST(geom);

-- 3. ใช้ 
WITH near AS (
	SELECT MIN(distance), gid3
	FROM public.bb_near_road
	GROUP BY id, gid3)
SELECT * FROM near n
JOIN bb b ON b.gid3 = n.gid3

