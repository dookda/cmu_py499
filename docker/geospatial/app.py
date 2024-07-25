from flask import Flask
import os
import torch
from tms_to_geotiff import tms_to_geotiff
from ultralytics import YOLO
import matplotlib.pyplot as plt
import cv2
import matplotlib.pyplot as plt
import rasterio
from rasterio.features import shapes
from shapely.geometry import shape, mapping
import geopandas as gpd
import pandas as pd
import numpy as np
from flask import request, jsonify

app = Flask(__name__)


# bottom left, top right,


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/roofdetect', methods=['POST'])
def roofdetect():
    bbox = request.get_json()['bbox']
    # bbox = [98.97833929776746, 18.782291559223832, 98.99318992500658, 18.794283998891945]
    image = 'satellite.tif'
    tms_to_geotiff(output=image, bbox=bbox, zoom=20,
                   source='Satellite', overwrite=True)

    model = YOLO("best_joam.pt")

    results = model.predict(image,
                            save=True, imgsz=640, conf=0.5)

    with rasterio.open(image) as src:
        transform = src.transform
        crs = src.crs
        height, width = src.height, src.width

    gdfs = []

    for i, mask in enumerate(results[0].masks.data):
        mask = mask.cpu().numpy().astype('uint8')

        class_index = int(results[0].boxes.cls[i])
        label = results[0].names[class_index]

        output_file = f"segment_{i+1}.tif"
        with rasterio.open(
            output_file,
            "w",
            driver="GTiff",
            height=height,
            width=width,
            count=1,
            dtype=mask.dtype,
            crs=crs,
            transform=transform,
        ) as dst:
            dst.write(mask, 1)

        with rasterio.open(output_file) as src:
            mask_data = src.read(1)
            mask_transform = src.transform

            shapes_gen = shapes(mask_data, transform=mask_transform)
            polygons = [shape(geom) for geom, val in shapes_gen if val == 1]

            gdf = gpd.GeoDataFrame(geometry=polygons, crs=crs)
            gdf['label'] = label
            gdfs.append(gdf)

        os.remove(output_file)

    combined_gdf = gpd.GeoDataFrame(pd.concat(gdfs, ignore_index=True))
    combined_geojson_output_file = "combined_segments.geojson"
    combined_gdf.to_file(combined_geojson_output_file, driver='GeoJSON')

    print(f"Saved combined GeoJSON to {combined_geojson_output_file}")

    return jsonify(combined_gdf.to_json())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
