import requests
import json
import os
import numpy as np
import scipy
import scipy.misc
from io import BytesIO
from PIL import Image
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

    def fromPano(self, pano):
        self.id = pano.id
        self.panoid = pano.panoid
        self.lon = pano.lon
        self.lat = pano.lat
        self.date = pano.date
        self.svf = pano.svf
        self.tvf = pano.tvf
        self.bvf = pano.bvf
        self.initialized = pano.initialized

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

    def write(self, filename):
        file = open(filename, "w")
        file.write(str(self.id) + "," + self.panoid + "," + self.date + "," + str(self.lat) +
                   "," + str(self.lon) + "," + str(self.svf) + "," + str(self.tvf) + "," + str(self.bvf))
        file.close()

    def read(self, filename):
        file = open(filename, "r")
        splits = file.readline().split(",")
        self.id = splits[0]
        self.panoid = splits[1]
        self.date = splits[2]
        self.lat = float(splits[3])
        self.lon = float(splits[4])
        self.svf = float(splits[5])
        self.tvf = float(splits[6])
        self.bvf = float(splits[7])
        file.close()
        self.initialized = True

    def fromline(self, line):
        splits = line.split(",")
        if len(splits) < 7:
            return False
        if splits[1] == "" or splits[3] == "" or splits[4] == "":
            return False
        self.id = splits[0]
        self.panoid = splits[1]
        self.date = splits[2]
        self.lat = float(splits[3])
        self.lon = float(splits[4])
        self.svf = float(splits[5])
        self.tvf = float(splits[6])
        self.bvf = float(splits[7])
        self.initialized = True
        return True

    def toString(self):
        return str(self.id) + "," + self.panoid + "," + self.date + "," + str(self.lat) + "," + str(self.lon) + "," + str(self.svf) + "," + str(self.tvf) + "," + str(self.bvf)


class GSVCapture():
    def __init__(self):
        # Initialize necessary attributes
        self.input_shape = (3, 512, 512)  # Example shape, adjust as needed
        self.segnet = self.load_model()  # Load your YOLO model
        self.label_colours = self.load_label_colours()  # Load label colours

    def load_model(self):
        # Load your YOLOv8 model using the ultralytics package
        model_path = 'best_sky_r0826.pt'  # Replace with your model path
        model = YOLO(model_path)  # Using ultralytics YOLO
        return model

    def load_label_colours(self):
        # Placeholder for loading label colours
        label_colours = np.random.randint(
            0, 255, (256, 1, 3), dtype=np.uint8)  # Example, adjust as needed
        return label_colours

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

    def equirectangular2fisheye(self, infile, outfile, isClassified):
        img = Image.open(infile)
        width, height = img.size
        img = img.crop((0, 0, width, height/2))
        width, height = img.size
        nparr = np.asarray(img.copy())
        red, green, blue = img.split()
        red = np.asarray(red)
        # red.flags.writeable = True
        green = np.asarray(green)
        # green.flags.writeable = True
        blue = np.asarray(blue)
        # blue.flags.writeable = True
        # green[np.where(green == 128)] = 0
        # blue[np.where(blue == 128)] = 0
        fisheye = np.ndarray(shape=(512, 512, 3), dtype=np.uint8)
        fisheye.fill(0)  # Transpose back needed
        fisheyesize = 512
        x = np.arange(0, 512, dtype=float)
        x = x / 511.0
        x = (x - 0.5) * 2
        x = np.tile(x, (512, 1))
        y = x.transpose()
        dist2ori = np.sqrt((y * y) + (x * x))

        zenithD = dist2ori * 90.0
        zenithD[np.where(zenithD <= 0.000000001)] = 0.000000001
        zenithR = zenithD * 3.1415926 / 180.0
        # weight for equal-areal projection
        wproj = np.sin(zenithR) / (zenithD / 90.0)
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
        maxx = np.max(srcx)
        maxy = np.max(srcy)
        indices = (srcx + srcy*width).tolist()

        red = np.take(red, np.array(indices))
        green = np.take(green, np.array(indices))
        blue = np.take(blue, np.array(indices))
        red[outside] = 0
        green[outside] = 0
        blue[outside] = 0
        svf = -1
        tvf = -1
        bvf = -1
        backgroundMask = 0  # RGB[0,  0,  0]
        skyMask = 65536*128+256*128+128  # RGB[128,128,128]
        treeMask = 65536*128+256*128+192  # RGB[128,128,192]
        buildingMask = 65536*0+256*0+128  # RGB[0,  0,  128]
        if isClassified:
            allPixels = 65536 * red + 256 * green + blue
            skyIndices = np.where(allPixels == skyMask)
            treeIndices = np.where(allPixels == treeMask)
            buildIndices = np.where(allPixels == buildingMask)

            backgroundIndices = np.where(allPixels != 0)
            svf = np.sum(wproj[skyIndices]) / np.sum(wproj[backgroundIndices])
            tvf = np.sum(wproj[treeIndices]) / np.sum(wproj[backgroundIndices])
            bvf = np.sum(wproj[buildIndices]) / \
                np.sum(wproj[backgroundIndices])

            red[skyIndices] = 128
            green[skyIndices] = 128
            blue[skyIndices] = 128

            red[treeIndices] = 128
            green[treeIndices] = 128
            blue[treeIndices] = 192

            red[buildIndices] = 0
            green[buildIndices] = 0
            blue[buildIndices] = 128
        red[outside] = 255
        green[outside] = 255
        blue[outside] = 255
        fisheye = np.dstack((red, green, blue))
        Image.fromarray(fisheye).save(outfile)
        return [svf, tvf, bvf]

    def classify(self, infile, outfile):
        input_image = Image.open(infile)
        input_image = input_image.resize(
            (self.input_shape[1], self.input_shape[2]))  # Resize image
        input_image = np.array(input_image)

        # Convert the image to a format suitable for the YOLO model
        input_image = torch.from_numpy(input_image).permute(
            2, 0, 1).unsqueeze(0).float() / 255.0

        results = self.segnet(input_image)  # Run inference with YOLOv8
        # Get the class index for each pixel
        segmentation_ind = results[0].argmax(0).cpu().numpy()

        # Create a 3-channel image
        segmentation_ind_3ch = np.stack([segmentation_ind]*3, axis=-1)

        # Initialize an empty RGB image
        segmentation_rgb = np.zeros(segmentation_ind_3ch.shape, dtype=np.uint8)

        # Apply color map (label colors)
        for i in range(256):  # Assuming 256 possible labels
            mask = segmentation_ind == i
            segmentation_rgb[mask] = self.label_colours[i]

        Image.fromarray(segmentation_rgb).save(outfile)

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
        # self.classify(outdir + "mosaic.png", outdir + "mosaic_classified.png")
        self.equirectangular2fisheye(
            outdir + "mosaic.png", outdir + "fisheye.png", False)
        return self.equirectangular2fisheye(outdir + "mosaic_classified.png", outdir + "fisheye_classified.png", True)

    def getByLatLong(self, outdir, lat, lon):
        pano = Panorama()
        pano.fromLocation(lat, lon)
        if not pano.initialized:
            # print("Not available")
            return ""
        outdir = self.checkDir(outdir)
        outdir = outdir + pano.panoid + '/'
        result = self.getByID(outdir, pano.panoid)
        if len(result) == 3:
            pano.svf = result[0]
            pano.tvf = result[1]
            pano.bvf = result[2]
            panoinfo_file = outdir + "panoinfo.txt"
            pano.write(panoinfo_file)

        return pano.toString()

    def hello(self):
        return "Hello"
