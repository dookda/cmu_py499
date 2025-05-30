import requests
import json
import os
import numpy as np
import scipy
import scipy.misc
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
import cv2
import key
import torch
from ultralytics import YOLO

GSV_API_URL = "https://maps.googleapis.com/maps/api/streetview"


class Panorama():

    def __init__(self):
        self.id = "0"
        self.panoid = ""
        self.lon = ""
        self.lat = ""
        self.date = ""
        self.svf = -1.0
        self.tvf = -1.0
        self.bvf = -1.0
        self.initialized = False

    def fromJSON(self, str):
        try:
            root = json.loads(str)
            if root['status'] != "OK":
                return False
            location = root['location']
            self.date = root['date']
            self.panoid = root['pano_id']
            self.lat = location['lat']
            self.lon = location['lng']
            self.initialized = True
            return True
        except ValueError:
            return False
        return False

    def fromLocation(self, lat, lon):
        url = GSV_API_URL + "/metadata?location=" + \
            str(lat) + "," + str(lon) + "&key=" + key.apikey

        try:
            response = requests.get(url)
            if response.status_code == requests.codes.ok:
                return self.fromJSON(response.content)
        except ValueError:
            return False
        return False

    def toString(self):
        return str(self.id) + "," + self.panoid + "," + self.date + "," + str(self.lat) + "," + str(self.lon) + "," + str(self.svf) + "," + str(self.tvf) + "," + str(self.bvf)


class GSVCapture():
    def __init__(self):
        # Initialize necessary attributes
        self.input_shape = (3, 512, 512)

    def checkDir(self, dir):
        if not (dir.endswith('/') or dir.endswith('\\')):
            dir = dir + '/'
        return dir

    def getImage(self, panoId, x, y, zoom, outdir):
        url = "https://" + "geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=" + \
            panoId + "&output=tile&x=" + \
            str(x) + "&y=" + str(y) + "&zoom=" + str(zoom) + "&nbt&fover=2"
        outfile = outdir + "/" + str(x) + "_" + str(y) + ".jpg"
        try:
            response = requests.get(url)
            if response.status_code == requests.codes.ok:
                file = BytesIO(response.content)
                return file
        except ValueError:
            return None
        return None

    def equirectangular2fisheye(self, infile, outfile):
        img = Image.open(infile)
        width, height = img.size
        img = img.crop((0, 0, width, height // 2))
        width, height = img.size
        red, green, blue = img.split()
        red = np.asarray(red)
        green = np.asarray(green)
        blue = np.asarray(blue)
        fisheye = np.ndarray(shape=(512, 512, 3), dtype=np.uint8)
        fisheye.fill(0)
        x = np.arange(0, 512, dtype=float)
        x = x / 511.0
        x = (x - 0.5) * 2
        x = np.tile(x, (512, 1))
        y = x.transpose()
        dist2ori = np.sqrt((y * y) + (x * x))

        zenithD = dist2ori * 90.0
        zenithD[np.where(zenithD <= 0.000000001)] = 0.000000001
        zenithR = zenithD * 3.1415926 / 180.0
        x2 = np.ndarray(shape=(512, 512), dtype=float)
        x2.fill(0.0)
        y2 = np.ndarray(shape=(512, 512), dtype=float)
        y2.fill(1.0)
        cosa = (x*x2 + y*y2) / np.sqrt((x*x + y*y) * (x2*x2 + y2*y2))
        lon = np.arccos(cosa) * 180.0 / 3.1415926
        indices = np.where(x > 0)
        lon[indices] = 360.0 - lon[indices]
        lon = 360.0 - lon
        lon = 1.0 - (lon / 360.0)
        outside = np.where(dist2ori > 1)
        lat = dist2ori
        srcx = (lon*(width-1)).astype(int)
        srcy = (lat*(height-1)).astype(int)
        srcy[np.where(srcy > 255)] = 0
        indices = (srcx + srcy*width).tolist()

        red = np.take(red, np.array(indices))
        green = np.take(green, np.array(indices))
        blue = np.take(blue, np.array(indices))
        red[outside] = 0
        green[outside] = 0
        blue[outside] = 0
        fisheye = np.dstack((red, green, blue))
        Image.fromarray(fisheye).save(outfile)
        return [-1, -1, -1]

    def classify(self, infile, outfile):
        bestModelPath = 'best_earn.pt'
        bestModel = YOLO(bestModelPath)

        results = bestModel.predict(source=infile, imgsz=640)
        print(results)
        annotatedImage = results[0].plot()
        segmentation_masks = results[0].masks.data
        segmentation_masks = segmentation_masks.cpu().numpy()
        num_classes = segmentation_masks.shape[0]

        fig, axes = plt.subplots(1, num_classes + 1, figsize=(15, 6))
        axes[0].imshow(cv2.cvtColor(annotatedImage, cv2.COLOR_BGR2RGB))
        axes[0].axis('off')
        axes[0].set_title('Annotated Image')
        for i in range(num_classes):
            binary_mask = (segmentation_masks[i] > 0).astype(
                np.uint8) * 255
            binary_mask_rgb = cv2.cvtColor(binary_mask, cv2.COLOR_GRAY2RGB)
            axes[i + 1].imshow(binary_mask_rgb, cmap='gray')
            axes[i + 1].axis('off')
            axes[i + 1].set_title(f'Class {i} Mask')
            binary_mask_pil = Image.fromarray(binary_mask)
            binary_mask_pil.save(f'{outfile}_class_{i}.png')

        plt.tight_layout()
        plt.show()

    def getByID(self, outdir, panoid):
        if panoid == '':
            return [-1, -1, -1]
        outdir = self.checkDir(outdir)
        if not os.path.exists(outdir):
            os.makedirs(outdir)
        tilesize = 512
        numtilesx = 4
        numtilesy = 2
        mosaicxsize = tilesize*numtilesx
        mosaicysize = tilesize*numtilesy
        mosaic = Image.new("RGB", (mosaicxsize, mosaicysize), "black")
        blkpixels = 0
        for x in range(0, numtilesx):
            for y in range(0, numtilesy):
                imageTile = self.getImage(panoid, x, y, 2, outdir)
                if imageTile == None:
                    return ""
                img = Image.open(imageTile)
                if y == 1:
                    pix_val = list(img.getdata())
                    blk1 = pix_val[tilesize*tilesize-1]
                    blk2 = pix_val[tilesize*(tilesize-1)]
                    blkpixels = blkpixels + sum(blk1) + sum(blk2)
                mosaic.paste(img, (x*tilesize, y*tilesize, x *
                             tilesize+tilesize, y*tilesize+tilesize))
        xstart = (512 - 128) / 2
        xsize = mosaicxsize - xstart * 2
        ysize = mosaicysize - (512 - 320)
        if blkpixels == 0:
            mosaic = mosaic.crop((xstart, 0, xstart+xsize, ysize))
        mosaic = mosaic.resize((1024, 512))
        mosaic.save(outdir + "mosaic.png")
        self.equirectangular2fisheye(
            outdir + "mosaic.png", outdir + "fisheye.png")

        self.classify(outdir + "fisheye.png", outdir +
                      "fisheye_classified.png")
        # return self.equirectangular2fisheye(outdir + "mosaic_classified.png", outdir + "fisheye_classified.png", True)

    def getByLatLong(self, outdir, lat, lon):
        pano = Panorama()
        pano.fromLocation(lat, lon)
        if not pano.initialized:
            # print("Not available")
            return ""
        outdir = self.checkDir(outdir)
        outdir = outdir + pano.panoid + '/'
        self.getByID(outdir, pano.panoid)

        return pano.toString()
