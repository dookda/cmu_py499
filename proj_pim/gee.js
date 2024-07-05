ui.root.clear();

var sta = ee.FeatureCollection('users/wipawinee/sta_bdis');
var stageo = sta.geometry();
Map.centerObject(stageo);

var aoi = geometry;

var start = ee.Date('2023-09-01');
var end = ee.Date('2023-12-30');

var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(aoi)
    .filterDate(start, end)
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 5)
    .median();

var S2 = sentinel2.select('B2', 'B3', 'B4', 'B8');

function getSentinel1(year) {
    var startDate = ee.Date.fromYMD(year, 9, 1);
    var endDate = startDate.advance(1, 'month');
    var image = ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(aoi)
        .filterDate(startDate, endDate)
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
        .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
        .map(function (image) {
            var VV = image.select('VV');
            var VH = image.select('VH');
            var VVsm = VV.focal_median(30, 'square', 'meters').rename('VVsm');
            var VHsm = VH.focal_median(30, 'square', 'meters').rename('VHsm');
            return image.addBands(VVsm).addBands(VHsm);
        });

    var meanImage = image.mean();
    return meanImage;
}

function calRiceArea(stackS) {
    var S1raw = stackS.select('VV', 'VH');
    var S1smooth = stackS.select('VVsm', 'VHsm');

    var max_smooth = ee.Image.constant(0).max(S1smooth);
    var min_smooth = ee.Image.constant(0).min(S1smooth);

    var vvvh = max_smooth.subtract(min_smooth);
    var multibands = vvvh.addBands(S2);

    var segment = ee.Algorithms.Image.Segmentation.SNIC({
        image: multibands,
        compactness: 0.5,
        connectivity: 8,
        neighborhoodSize: 10,
        size: 5,
        seeds: null
    });

    var imageObject = segment.select(['clusters', 'VVsm_mean', 'VHsm_mean', 'B.*']);
    var bandsName = imageObject.bandNames();

    var Trainsamples = agri.merge(treecover).merge(builtup).merge(water).merge(other);
    var Testsamples = Tagri.merge(Ttreecover).merge(Tbuiltup).merge(Twater).merge(Tother);

    var trained = imageObject.sampleRegions({
        collection: Trainsamples,
        scale: 10,
        properties: ['class']
    });

    var tested = imageObject.sampleRegions({
        collection: Testsamples,
        scale: 10,
        properties: ['class']
    });

    var SVMclassifier = ee.Classifier.libsvm().train({
        features: trained,
        classProperty: 'class',
        inputProperties: bandsName
    });

    var RFclassifier = ee.Classifier.smileRandomForest(100).train({
        features: trained,
        classProperty: 'class',
        inputProperties: bandsName
    });

    var GBTclassifier = ee.Classifier.smileGradientTreeBoost(100).train({
        features: trained,
        classProperty: 'class',
        inputProperties: bandsName
    });

    var accuracy = tested;

    var SVMtrainaccuracy = SVMclassifier.confusionMatrix();
    var SVMclassified_accuracy = accuracy.classify(SVMclassifier);
    var SVMtestaccuracy = SVMclassified_accuracy.errorMatrix('class', 'classification');

    var RFtrainaccuracy = RFclassifier.confusionMatrix();
    var RFclassified_accuracy = accuracy.classify(RFclassifier);
    var RFtestaccuracy = RFclassified_accuracy.errorMatrix('class', 'classification');

    var GBTtrainaccuracy = GBTclassifier.confusionMatrix();
    var GBTclassified_accuracy = accuracy.classify(GBTclassifier);
    var GBTtestaccuracy = GBTclassified_accuracy.errorMatrix('class', 'classification');

    var SVMclassified = imageObject.classify(SVMclassifier);
    var RFclassified = imageObject.classify(RFclassifier);
    var GBTclassified = imageObject.classify(GBTclassifier);

    var classVis = {
        min: 1,
        max: 5,
        palette: ['yellow', 'green', 'red', 'blue', 'gray']
    };

    var ricefieldRF = RFclassified.updateMask(RFclassified.lt(2));
    var ricefieldGBT = GBTclassified.updateMask(GBTclassified.lt(2));

    var riceRF = RFclassified.select('classification').eq(1);
    var area_riceRF = riceRF.multiply(ee.Image.pixelArea()).divide(1000 * 1000).multiply(625);
    var statRF = area_riceRF.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: riceRF.geometry(),
        scale: 10,
        maxPixels: 1e9
    });

    var riceGBT = GBTclassified.select('classification').eq(1);
    var area_riceGBT = riceGBT.multiply(ee.Image.pixelArea()).divide(1000 * 1000).multiply(625);
    var statGBT = area_riceGBT.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: riceRF.geometry(),
        scale: 10,
        maxPixels: 1e9
    });

    return S1raw.addBands(vvvh).addBands(segment).addBands(RFclassified).addBands(GBTclassified);
}

function calVarExpression(mb) {
    var VVSegment = mb.select('VV', 'clusters');
    var VHSegment = mb.select('VH', 'clusters');
    var VVsmSegment = mb.select('VVsm', 'clusters');

    var VVmin = VVSegment.reduceConnectedComponents({
        reducer: ee.Reducer.min(),
        labelBand: 'clusters'
    })
    var VHmin = VHSegment.reduceConnectedComponents({
        reducer: ee.Reducer.min(),
        labelBand: 'clusters'
    })

    var VVsmstdDev = VVsmSegment.reduceConnectedComponents({
        reducer: ee.Reducer.stdDev(),
        labelBand: 'clusters'
    })

    var combine = VVmin.addBands(VHmin).addBands(VVsmstdDev);

    return combine
}

function calculateBiomass(imgStat) {
    var biomass = imgStat.expression("0.744 * VV0921_MIN - 1.546 * VH0921_MIN - 7.599 * VVSM0921_STD + 32.050", {
        'VV0921_MIN': imgStat.select('VV'),
        'VH0921_MIN': imgStat.select('VH'),
        'VVSM0921_STD': imgStat.select('VVsm'),
    });

    var Biomass = biomass.multiply(16); // biomass Rai
    var CO2 = 0.25; // CO2 Rai

    var Carbon = Biomass.multiply(CO2);

    return {
        'Biomass': Biomass,
        'Carbon': Carbon
    };
}

function reduceRegionMean(image, poly, band) {
    var selBand = image.select(band)
    var MeanByPoly = selBand.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: poly,
        scale: 10,
        maxPixels: 1e9
    });
    var MeanStat = MeanByPoly.get(band);
    return MeanStat.getInfo()
}

function reduceRegionMax(image, poly, band) {
    var selBand = image.select(band)
    var MaxByPoly = selBand.reduceRegion({
        reducer: ee.Reducer.max(),
        geometry: poly,
        scale: 10,
        maxPixels: 1e9
    });
    var MaxStat = MaxByPoly.get(band);
    return MaxStat.getInfo()
}

function reduceRegionMin(image, poly, band) {
    var selBand = image.select(band)
    var MinByPoly = selBand.reduceRegion({
        reducer: ee.Reducer.min(),
        geometry: poly,
        scale: 10,
        maxPixels: 1e9
    });
    var MinStat = MinByPoly.get(band);
    return MinStat.getInfo()
}

function reduceRegionSum(image, poly, band) {
    var selBand = image.select(band)
    var SumByPoly = selBand.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: poly,
        scale: 10,
        maxPixels: 1e9
    });
    var SumStat = SumByPoly.get(band);
    return SumStat.getInfo()
}

function minMax(img, geom) {
    var stats = img.reduceRegion({
        reducer: ee.Reducer.minMax(),
        geometry: geom,
        scale: 10,
        maxPixels: 1e9
    });

    var bandNames = img.bandNames();

    var mins = bandNames.map(function (b) {
        return stats.get(ee.String(b).cat('_min'));
    });
    var maxs = bandNames.map(function (b) {
        return stats.get(ee.String(b).cat('_max'));
    });

    var min = mins.reduce(ee.Reducer.min());
    var max = maxs.reduce(ee.Reducer.max());

    min = ee.Number(min);
    max = ee.Number(max);

    return {
        min: min,
        max: max
    };
}

function calculateArea(eeIMG, Geom) {
    var Area = eeIMG.multiply(ee.Image.pixelArea()).divide(1000 * 1000).multiply(625);
    var AreaStat = Area.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: Geom,
        scale: 10,
        maxPixels: 1e9
    });
    var areaValue = AreaStat.get('classification');
    return areaValue.getInfo();
}

var polyname = '';

var ricearea = ee.FeatureCollection('users/wipawinee/ricefieldRF2023');
var riceRF = ricearea.geometry();

function selectYear() {
    var y = yearSelect.getValue();
    var sentinel1 = getSentinel1(y);
    var stackS = calRiceArea(sentinel1)
    var multibands1 = calRiceArea(stackS)
    var imgStatistics = calVarExpression(multibands1);
    var bc = calculateBiomass(imgStatistics);

    map1.clear();
    map2.clear();

    var polySel = plotSelect.getValue();
    var PolygonGeom = '';

    if (polySel == "All") {
        PolygonGeom = riceRF;
        map1.centerObject(riceRF);
        map2.centerObject(riceRF);

    } else {
        var selectedPolygon = sta_plots.filter(ee.Filter.eq('Name', polySel));
        PolygonGeom = selectedPolygon.geometry();
        map1.centerObject(PolygonGeom);
        map2.centerObject(PolygonGeom);
        map1.addLayer(PolygonGeom, {
            color: 'red'
        }, polySel + '-' + y, 1);
        map2.addLayer(PolygonGeom, {
            color: 'red'
        }, polySel + '-' + y, 1);
    }

    var PolyArea = calculateArea(multibands1, PolygonGeom)

    var vvStatByPolygon_max = reduceRegionMax(imgStatistics, PolygonGeom, "VV");
    var vvStatByPolygon_mean = reduceRegionMean(imgStatistics, PolygonGeom, "VV");
    var vvStatByPolygon_min = reduceRegionMin(imgStatistics, PolygonGeom, "VV");
    var vhStatByPolygon_max = reduceRegionMax(imgStatistics, PolygonGeom, "VH");
    var vhStatByPolygon_mean = reduceRegionMean(imgStatistics, PolygonGeom, "VH");
    var vhStatByPolygon_min = reduceRegionMin(imgStatistics, PolygonGeom, "VH");
    var vvsmStatByPolygon_max = reduceRegionMax(imgStatistics, PolygonGeom, "VVsm");
    var vvsmStatByPolygon_mean = reduceRegionMean(imgStatistics, PolygonGeom, "VVsm");
    var vvsmStatByPolygon_min = reduceRegionMin(imgStatistics, PolygonGeom, "VVsm");
    var bmStatByPolygon = reduceRegionSum(bc.Biomass, PolygonGeom, "constant");
    var coStatByPolygon = reduceRegionSum(bc.Carbon, PolygonGeom, "constant");

    detailArea.setValue('Area: ' + (typeof PolyArea !== 'No value' ? PolyArea.toFixed(3) + ' Rai' : 'PolyArea: No value'));
    detailVV_max.setValue('VV(max): ' + (typeof vvStatByPolygon_max !== 'No value' ? vvStatByPolygon_max.toFixed(3) + ' dB' : 'VV_max: No value'));
    detailVV_mean.setValue('VV(mean): ' + (typeof vvStatByPolygon_mean !== 'No value' ? vvStatByPolygon_mean.toFixed(3) + ' dB' : 'VV_mean: No value'));
    detailVV_min.setValue('VV(min): ' + (typeof vvStatByPolygon_min !== 'No value' ? vvStatByPolygon_min.toFixed(3) + ' dB' : 'VV_min: No value'));
    detailVH_max.setValue('VH(max): ' + (typeof vhStatByPolygon_max !== 'No value' ? vhStatByPolygon_max.toFixed(3) + ' dB' : 'VH_max: No value'));
    detailVH_mean.setValue('VH(mean): ' + (typeof vhStatByPolygon_mean !== 'No value' ? vhStatByPolygon_mean.toFixed(3) + ' dB' : 'VH_mean: No value'));
    detailVH_min.setValue('VH(min): ' + (typeof vhStatByPolygon_min !== 'No value' ? vhStatByPolygon_min.toFixed(3) + ' dB' : 'VH_min: No value'));
    detailVVsm_max.setValue('VVsm(max): ' + (typeof vvsmStatByPolygon_max !== 'No value' ? vvsmStatByPolygon_max.toFixed(3) + ' dB' : 'VVsm_max: No value'));
    detailVVsm_mean.setValue('VVsm(mean): ' + (typeof vvsmStatByPolygon_mean !== 'No value' ? vvsmStatByPolygon_mean.toFixed(3) + ' dB' : 'VVsm_mean: No value'));
    detailVVsm_min.setValue('VVsm(min): ' + (typeof vvsmStatByPolygon_min !== 'No value' ? vvsmStatByPolygon_min.toFixed(3) + ' dB' : 'VVsm_min: No value'));
    detailBM.setValue('Biomass: ' + (typeof (bmStatByPolygon / 1000) !== 'No value' ? (bmStatByPolygon / 1000).toFixed(3) + ' Ton' : 'Biomass: No value'));
    detailCO.setValue('Carbon: ' + (typeof (coStatByPolygon / 1000) !== 'No value' ? (coStatByPolygon / 1000).toFixed(3) + ' TonC' : 'Carbon: No value'));

    var minMaxBiomass = minMax(bc.Biomass, PolygonGeom);
    var minMaxCO = minMax(bc.Carbon, PolygonGeom);

    var visBi = {
        min: 0,
        max: Math.round(minMaxBiomass.max.getInfo()),
        palette: ['F97300', 'FBA834', 'FCFFE0', 'C5EBAA', '114232', '191A19']
    };

    var visCo = {
        min: 0,
        max: Math.round(minMaxCO.max.getInfo()),
        palette: ['4F200D', 'C07F00', 'F7C566', 'F0EDCF', 'B4D4FF', '86B6F6', '176B87', '102C57']
    };

    var legendPanel1 = ui.Panel({
        style: {
            position: 'bottom-left',
            padding: '10px',
            width: '200px'
        }
    });
    var legendPanel2 = ui.Panel({
        style: {
            position: 'bottom-right',
            padding: '10px',
            width: '200px'
        }
    });

    var biomassLegendBox = createLegendBox("Biomass (kg/Rai)", visBi);

    var carbonLegendBox = createLegendBox1("Carbon (kgC/Rai)", visCo);

    legendPanel1.add(biomassLegendBox);
    legendPanel2.add(carbonLegendBox);

    map1.add(legendPanel1);
    map2.add(legendPanel2);
    map1.addLayer(bc.Biomass.clip(riceRF), visBi, 'Biomass-' + y, 1);
    map2.addLayer(bc.Carbon.clip(riceRF), visCo, 'Carbon-' + y, 1);

}

var nSteps = 10

function createLegendBox(name, visParams) {
    var legendBox = ui.Panel({
        layout: ui.Panel.Layout.flow('vertical'),
        style: {
            border: '0.1px solid black',
            padding: '0.1px'
        }
    });

    var legendTitle = ui.Label({
        value: name,
        style: {
            fontWeight: 'bold'
        }
    });
    legendBox.add(legendTitle);

    var colorBar = ui.Thumbnail({
        image: ee.Image.pixelLonLat().select(0).int(),
        params: {
            bbox: [0, 0, nSteps, 0.1],
            dimensions: '100x100',
            min: 0,
            max: nSteps,
            format: 'png',
            palette: visParams.palette,
        },
        style: {
            stretch: 'horizontal',
            margin: '0px 8px',
            maxHeight: '24px'
        }
    });
    legendBox.add(colorBar);

    var minVal = visParams.min;
    var maxVal = visParams.max;

    var labels = ui.Panel({
        widgets: [
            ui.Label(minVal.toString(), {
                margin: '4px 8px',
                textAlign: 'center'
            }),
            ui.Label(maxVal.toString(), {
                margin: '4px 120px',
                textAlign: 'center'
            }),
        ],
        layout: ui.Panel.Layout.flow('horizontal')
    });

    legendBox.add(labels);
    return legendBox;
}

function createLegendBox1(name, visParams) {
    var legendBox = ui.Panel({
        layout: ui.Panel.Layout.flow('vertical'),
        style: {
            border: '0.1px solid black',
            padding: '0.1px'
        }
    });

    var legendTitle = ui.Label({
        value: name,
        style: {
            fontWeight: 'bold'
        }
    });
    legendBox.add(legendTitle);

    var colorBar = ui.Thumbnail({
        image: ee.Image.pixelLonLat().select(0).int(),
        params: {
            bbox: [0, 0, nSteps, 0.1],
            dimensions: '100x100',
            format: 'png',
            min: 0,
            max: nSteps,
            palette: visParams.palette,
        },
        style: {
            stretch: 'horizontal',
            margin: '0px 8px',
            maxHeight: '24px'
        }
    });
    legendBox.add(colorBar);

    var minVal = visParams.min;
    var maxVal = visParams.max;

    var labels = ui.Panel({
        widgets: [
            ui.Label(minVal.toString(), {
                margin: '4px 8px',
                textAlign: 'center'
            }),
            ui.Label(maxVal.toString(), {
                margin: '4px 120px',
                textAlign: 'center'
            }),
        ],
        layout: ui.Panel.Layout.flow('horizontal')
    });

    legendBox.add(labels);
    return legendBox;
}

// Add UI elements
var title = ui.Label('Biomass and Carbon Monitoring System', { fontSize: '18px', fontWeight: 'bold' });
var describe = ui.Label('Results from analysis of Sentinel-1 image showing biomass and carbon stock in the Chae Chang and Buak Kang Subdistricts, San Kamphaeng District, Chiang Mai, Thailand.', { fontSize: '14px' });
var selectYearTitle = ui.Label('Select Year', { fontSize: '16px', fontWeight: 'bold' });
var selectPlotsTitle = ui.Label('Select Plot', { fontSize: '16px', fontWeight: 'bold' });
var resultTitle = ui.Label('Analysis results', { fontSize: '16px', fontWeight: 'bold' });

var detailArea = ui.Label('', { fontSize: '16px' });
var detailBM = ui.Label('', { fontSize: '16px' });
var detailCO = ui.Label('', { fontSize: '16px' });
var detailVV_max = ui.Label('', { fontSize: '16px' });
var detailVV_mean = ui.Label('', { fontSize: '16px' });
var detailVV_min = ui.Label('', { fontSize: '16px' });
var detailVH_max = ui.Label('', { fontSize: '16px' });
var detailVH_mean = ui.Label('', { fontSize: '16px' });
var detailVH_min = ui.Label('', { fontSize: '16px' });
var detailVVsm_max = ui.Label('', { fontSize: '16px' });
var detailVVsm_mean = ui.Label('', { fontSize: '16px' });
var detailVVsm_min = ui.Label('', { fontSize: '16px' });

var analysisResults = {
    'Biomass and Carbon': [detailArea, detailBM, detailCO],
    'VV': [detailArea, detailVV_max, detailVV_mean, detailVV_min],
    'VH': [detailArea, detailVH_max, detailVH_mean, detailVH_min],
    'VVsm': [detailArea, detailVVsm_max, detailVVsm_mean, detailVVsm_min]
};

var analysisOptions = Object.keys(analysisResults);

var selectAnalysisTitle = ui.Label('Select Analysis Type', { fontSize: '16px', fontWeight: 'bold' });
var analysisSelect = ui.Select({
    items: analysisOptions,
    placeholder: 'Select Analysis Type',
    value: 'Biomass and Carbon',
    onChange: updateResultsPanel
});

function updateResultsPanel(selected) {
    panel.clear();
    panel.add(title).add(describe).add(selectYearTitle).add(yearSelect).add(selectPlotsTitle).add(plotSelect).add(selectAnalysisTitle).add(analysisSelect).add(resultTitle);

    var selectedDetails = analysisResults[selected];
    selectedDetails.forEach(function (detail) {
        panel.add(detail);
    });
}

var years = [{ label: '2022', value: 2022 }, { label: '2023', value: 2023 }];

var yearSelect = ui.Select({
    placeholder: 'Select Year',
    items: years,
    value: 2022
});

yearSelect.onChange(function () {
    selectYear();
});

var sta_plots = ee.FeatureCollection('users/wipawinee/sta_plots');
var names = sta_plots.aggregate_array('Name').getInfo().sort();
names.unshift('All');

var plotSelect = ui.Select({
    placeholder: 'Select Plot',
    items: names,
    value: "All"
});

plotSelect.onChange(function () {
    selectYear();
});

var map1 = ui.Map();
var map2 = ui.Map();

var linker = ui.Map.Linker([map1, map2]);

var splitPanel = ui.SplitPanel({
    firstPanel: map1,
    secondPanel: map2,
    orientation: 'horizontal',
    wipe: true,
    style: { height: '', width: '75%', stretch: 'both' }
});

var panel = ui.Panel({ style: { width: '25%' } });
panel.add(title)
    .add(describe)
    .add(selectYearTitle)
    .add(yearSelect)
    .add(selectPlotsTitle)
    .add(plotSelect)
    .add(selectAnalysisTitle)
    .add(analysisSelect)
    .add(resultTitle);

// Add default result details
analysisResults['Biomass and Carbon'].forEach(function (detail) {
    panel.add(detail);
});

ui.root.add(panel);
ui.root.add(splitPanel);






