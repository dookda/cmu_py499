import pyodbc
import csv
import psycopg2
import pandas as pd
import os
import sys
import shutil

'''drop table roadnet_survey,roadnet_survey_point,roadnet_survey_image'''


rounte = str(input('หมายเลขสายทาง='))
control = str(input('หมายเลขตอนควบคุม='))
section = str(input('section='))
lane = int(input('เลนจราจร ถ้าขา L คือ 1 ขา R คือ -1 ='))


if lane > 0:
    lane_na = 'L'
else:
    lane_na = 'R'


#### create mkdir ####
path_dir = 'test\%s_%s-%s-%s' % (
    rounte, control, section, lane_na)
if not os.path.exists(path_dir):
    os.makedirs(path_dir)
else:
    shutil.rmtree(path_dir)
    os.makedirs(path_dir)
print("create successfully")

#### connect pgAdmin4 ####
conPG = psycopg2.connect(
    host="localhost",
    database="ms22-local",
    user="postgres",
    password="123456",
    port="5432"
)
print("connect pgAdmin4 successfully")

#### create survey_roadnet ####


step1 = '''
create table roadnet_survey as 
SELECT survey_id, subsection_id, section_id, link_id, survey_code, run_code, 
	       lane_group, lane_no, lane_reverse, km_start, km_end, length, 
	       distance_odo, distance_gps, year, survey_type, date, the_geom, 
	       remark, run_new, "interval"
	  FROM survey
	  where lane_group = '%s' and lane_no = 2 and section_id = '%s'
	  order by km_start
''' % (lane, section)
cur_step1 = conPG.cursor()
cur_step1.execute(step1)
conPG.commit()
print("create survey_roadnet  successfully : อย่าลืมไปลบ '_roadnet ใน notapad++'")

#### create survey_point_roadnet ####

step2 = '''
create table roadnet_survey_point as   
select survey_point_id, survey_id, position.km, iri_right, iri_left, 
	((iri_right+iri_left)/2)::numeric(8,2) as iri, iri_lane, rutt_right, rutt_left, 
	((rutt_right+rutt_left)/2)::numeric(8,2) as rutting, texture, etd_texture, 
	the_geom, remark
	from 
	(
		select b.*
		from survey a
		left join 
		(
			SELECT survey_point_id, survey_id, km, 
			--iri_right, iri_left, iri, iri_lane, rutt_right, rutt_left, rutting, texture, etd_texture, 
			the_geom, remark
			FROM survey_point
		) b on a.survey_id = b.survey_id
		where lane_group = '%s' and lane_no = 2 and section_id = '%s' -------------------------------------------------- select lane_group and lane_no
		order by km
	) position
	left join
	(
	  select  km, max(iri_right) as iri_right, max(iri_left) as iri_left, max(iri_lane) as iri_lane,
	  max(rutt_right) as rutt_right, max(rutt_left) as rutt_left, 
	  max(texture) as texture, max(etd_texture) as etd_texture
	  from survey_point
	  group by km
	  order by km
	 ) value_data on position.km = value_data.km
''' % (lane, section)
cur_step2 = conPG.cursor()
cur_step2.execute(step2)
conPG.commit()
print("create survey_point_roadnet  successfully : อย่าลืมไปลบ '_roadnet ใน notapad++'")

#### create survey_image_roadnet ####
step3 = '''
create table roadnet_survey_image as 
 select b.*
	 from survey a
	 left join 
	 (
		select *
		from survey_image
	) b on a.survey_id = b.survey_id
	  where lane_group = '%s' and lane_no = 2 and section_id = '%s'
	  order by km
''' % (lane, section)
cur_step3 = conPG.cursor()
cur_step3.execute(step3)
conPG.commit()
print("create survey_image_roadnet  successfully : อย่าลืมไปลบ '_roadnet ใน notapad++'")


## Updata update survey_id and survey_point_id  ####################################################################################################################################
s_id = str(input('select max(survey_id) from survey ='))
step4 = '''
 update roadnet_survey a set survey_id = b.survey_id_new
	  from 
	  ( 
		  select survey_id as survey_id_old, 
		  row_number() OVER (order by  survey_id)+%s as survey_id_new 	--- + value Max survey_id DB roadnet
		  --survey_id-(select min(survey_id) from survey)+1  as survey_id_new 	--- + value Max survey_id DB roadnet
		  from 
			(
			select survey_id
			from roadnet_survey		 -----------------------------------------------change table
			group by survey_id
			) foo

	  ) b
	  where a.survey_id = survey_id_old
''' % (s_id)
cur_step4 = conPG.cursor()
cur_step4.execute(step4)
conPG.commit()
print(" update survey_id  successfully")

## Updata update survey_id and survey_point_id  ####################################################################################################################################
step5 = '''
  update roadnet_survey_point a set survey_id = b.survey_id_new
	  from 
	  ( 
		  select survey_id as survey_id_old, 
		  row_number() OVER (order by  survey_id)+%s as survey_id_new 	--- + value Max survey_id DB roadnet
		  --survey_id-(select min(survey_id) from survey)+1  as survey_id_new 	--- + value Max survey_id DB roadnet
		  from 
			(
			select survey_id
			from roadnet_survey_point		 -----------------------------------------------change table
			group by survey_id
			) foo

	  ) b
	  where a.survey_id = survey_id_old
''' % (s_id)
cur_step5 = conPG.cursor()
cur_step5.execute(step5)
conPG.commit()

s_point_id = str(input('select max(survey_point_id) from survey_point ='))
step6 = '''
 update roadnet_survey_point a set survey_point_id = b.survey_point_id_new
	  from 
	  ( 
		  select survey_id, survey_point_id as survey_point_id_old,
		  row_number() OVER (order by  survey_id, survey_point_id)+%s as survey_point_id_new 	--- + value Max survey_id DB roadnet
		  --survey_id-(select min(survey_id) from survey)+1  as survey_id_new 	--- + value Max survey_id DB roadnet
		  from roadnet_survey_point  -----------------------------------------------change table
	  ) b
	  where a.survey_point_id = survey_point_id_old and a.survey_id = b.survey_id
''' % (s_point_id)
cur_step6 = conPG.cursor()
cur_step6.execute(step6)
conPG.commit()
print(" update surve_point_id  successfully")

## Updata update survey_id and survey_point_id  ####################################################################################################################################
step7 = '''
 update roadnet_survey_image a set survey_id = b.survey_id_new
	  from 
	  ( 
		  select survey_id as survey_id_old, 
		  row_number() OVER (order by  survey_id)+%s as survey_id_new 	--- + value Max survey_id DB roadnet
		  --survey_id-(select min(survey_id) from survey)+1  as survey_id_new 	--- + value Max survey_id DB roadnet
		  from 
			(
			select survey_id
			from roadnet_survey_image		 -----------------------------------------------change table
			group by survey_id
			) foo

	  ) b
	  where a.survey_id = survey_id_old
''' % (s_id)
cur_step7 = conPG.cursor()
cur_step7.execute(step7)
conPG.commit()
print(" update survey_id image  successfully")


## Dump SQL  ####################################################################################################################################
dump1 = '''COPY (
SELECT dump('public', 'roadnet_survey','true')
) TO '%s\\survey.sql'; ''' % (path_dir)
cur_dump1 = conPG.cursor()
cur_dump1.execute(dump1)
conPG.commit()

dump2 = '''COPY (
SELECT dump('public', 'roadnet_survey_point','true')
) TO '%s\\survey_point.sql'; ''' % (path_dir)
cur_dump2 = conPG.cursor()
cur_dump2.execute(dump2)
conPG.commit()

dump3 = '''COPY (
SELECT dump('public', 'roadnet_survey_image','true')
) TO '%s\\survey_image.sql'; ''' % (path_dir)
cur_dump3 = conPG.cursor()
cur_dump3.execute(dump3)
conPG.commit()
print(' Dump SQL successfully')

##  .bat file  ####################################################################################################################################
dump4 = r'''COPY (
SELECT 'mkdir' as test,'E:\'||left(replace(directory,'/','\'),-36)||'\image' as folder
FROM roadnet_survey_image
group by test,folder
) TO '%s\mkdir.bat'; ''' % (path_dir)
cur_dump4 = conPG.cursor()
cur_dump4.execute(dump4)
conPG.commit()

dump5 = r'''COPY (
SELECT 'copy' as test,'E:\'||left(filename,8)||'\'||split_part(filename,'-ROW',1)||'\ROW-0\'||filename,
'E:\'||left(replace(directory,'/','\'),-36)||'\image\'||filename
FROM roadnet_survey_image
) TO '%s\copy.bat' ;''' % (path_dir)
cur_dump5 = conPG.cursor()
cur_dump5.execute(dump5)
conPG.commit()
print('step : Dump .bat file successfully')
print('________________________________________________________________')
