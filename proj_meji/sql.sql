-- 1. create building line segment
CREATE TABLE cm_bb AS
WITH boundaries AS (
  SELECT id, ST_Boundary(ST_OrientedEnvelope(geom)) AS boundary
  FROM public.cm_building_4326
),
points AS (
  SELECT id, (dp).path[1] AS pt_order, (dp).geom AS pt
  FROM boundaries,
  LATERAL ST_DumpPoints(boundary) AS dp
)
SELECT p1.id, ST_MakeLine(p1.pt, p2.pt) AS segment
FROM points p1
JOIN points p2 ON p1.id = p2.id AND p1.pt_order = p2.pt_order - 1;

-- 2. add gid column with serial
ALTER TABLE cm_bb ADD COLUMN gid SERIAL;
CREATE INDEX idx_cm_bb_geom ON public.cm_bb USING GIST(geom);

-- 3. ใช้ Join attributes by nearest
WITH near AS (
	SELECT MIN(distance), gid3
	FROM public.bb_near_road
	GROUP BY id, gid3)
SELECT * FROM near n
JOIN bb b ON b.gid3 = n.gid3

