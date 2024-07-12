ui.root.clear();

var layerPanel = ui.Panel({
    widgets: [ui.Label({
        value: 'Water Balance',
        style: {
            fontSize: '20px',
            fontWeight: '800'
        }
    })],
    style: { width: '20%' }
});

var mapPanel = ui.Map({ style: { height: '70%', width: '100%' } });
var chartPanel = ui.Panel({ style: { width: '100%' } });

var mapChartPanel = ui.SplitPanel({
    firstPanel: mapPanel,
    secondPanel: chartPanel,
    orientation: 'vertical'
});

var mainPanel = ui.Panel({
    widgets: [layerPanel, mapChartPanel],
    layout: ui.Panel.Layout.flow({ direction: 'horizontal', wrap: true }),
    style: {
        width: '100%',
        height: '100%'
    }
});

var nanBasin = ee.FeatureCollection(geometry);

var startDate = ee.Date('2023-01-01');
var endDate = ee.Date('2023-12-31');

function prepareImage(image) {
    return image.reproject({ crs: "EPSG:3857", scale: 500 }).clip(nanBasin);
}

function scaleFactor(image) {
    return image.multiply(0.1);
}

function getWeeklyDates(week) {
    var start = startDate.advance(week, 'week');
    var end = start.advance(1, 'week');
    return ee.Feature(null, { 'start': start, 'end': end });
}

function calculateRunoff(precip, cn) {
    var S = ee.Image.constant(25400).divide(cn).subtract(254);  // Potential maximum retention after runoff begins
    var P = precip.multiply(25.4);  // Convert to mm
    var Ia = S.multiply(0.2);  // Initial abstraction (20% of S)
    var runoff = P.gt(Ia).multiply(P.subtract(Ia).pow(2).divide(P.subtract(Ia).add(S)));
    return runoff;
}

function calculateRemainingWater(rain, evap, runoff) {
    return rain.subtract(evap.add(runoff)).rename('remain');
}

function checkAndReplace(image, defaultImage) {
    return ee.Image(ee.Algorithms.If(image.bandNames().size().gt(0), image, defaultImage));
}

function calculateWeeklySum(feature) {
    var start = ee.Date(feature.get('start'));
    var end = ee.Date(feature.get('end'));

    var etSum = ee.ImageCollection('MODIS/061/MOD16A2GF')
        .filterDate(start, end)
        .filterBounds(nanBasin)
        .map(prepareImage)
        .map(scaleFactor)
        .select('ET')
        .sum()
        .rename('evap');

    var rainSum = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
        .filterDate(start, end)
        .filterBounds(nanBasin)
        .map(prepareImage)
        .sum()
        .rename('rain');

    var curveNumber = ee.Image.constant(75);
    var runoffSum = calculateRunoff(rainSum, curveNumber).rename('runoff');

    etSum = checkAndReplace(etSum, ee.Image.constant(0).rename('evap'));
    rainSum = checkAndReplace(rainSum, ee.Image.constant(0).rename('rain'));
    runoffSum = checkAndReplace(runoffSum, ee.Image.constant(0).rename('runoff'));

    var remain = calculateRemainingWater(rainSum, etSum, runoffSum);

    return rainSum
        .addBands(etSum)
        .addBands(runoffSum)
        .addBands(remain)
        .set('system:time_start', start.millis());
}

function getMin(img, geom, param) {
    var min = img.reduceRegion({
        reducer: ee.Reducer.min(),
        geometry: geom,
        scale: 100,
        maxPixels: 1e9,
    }).get(param);

    return min
}

function getMax(img, geom, param) {
    var max = img.reduceRegion({
        reducer: ee.Reducer.max(),
        geometry: geom,
        scale: 100,
        maxPixels: 1e9,
    }).get(param);

    return max
}

function showChart(imgs, region) {
    var chart = ui.Chart.image.series({
        imageCollection: imgs,
        region: region,
        reducer: ee.Reducer.mean(),
        scale: 500,
        xProperty: 'system:time_start'
    }).setOptions({
        title: 'Time Series of Rain, Runoff, Evapotranspiration, and Remaining Water',
        vAxis: { title: 'Value' },
        hAxis: { title: 'Date' },
        series: {
            0: { color: 'blue', label: 'Rain' },
            1: { color: 'green', label: 'Evapotranspiration' },
            2: { color: 'red', label: 'Runoff' },
            3: { color: 'purple', label: 'Remaining Water' }
        }
    });

    chartPanel.add(chart)
}

function showData(img) {
    var minRain = getMin(img, nanBasin, 'rain');
    var maxRain = getMax(img, nanBasin, 'rain');
    var minEvap = getMin(img, nanBasin, 'evap');
    var maxEvap = getMax(img, nanBasin, 'evap');
    var minRunoff = getMin(img, nanBasin, 'runoff');
    var maxRunoff = getMax(img, nanBasin, 'runoff');
    var minRemain = getMin(img, nanBasin, 'remain');
    var maxRemain = getMax(img, nanBasin, 'remain');

    print(minRain, maxRain)

    var visRain = {
        min: minRain.getInfo(),
        max: maxRain.getInfo(),
        palette: ['blue', 'green', 'yellow', 'red']
    }

    var visEvap = {
        min: minEvap.getInfo(),
        max: maxEvap.getInfo(),
        palette: ['blue', 'green', 'yellow', 'red']
    }

    var visRunoff = {
        min: minRunoff.getInfo(),
        max: maxRunoff.getInfo(),
        palette: ['blue', 'green', 'yellow', 'red']
    }

    var visRemain = {
        min: minRemain.getInfo(),
        max: maxRemain.getInfo(),
        palette: ['blue', 'green', 'yellow', 'red']
    }

    mapPanel.centerObject(nanBasin);
    mapPanel.addLayer(nanBasin, {}, 'Nan Basin');
    mapPanel.addLayer(img.select('rain'), visRain, 'Weekly Rain');
    mapPanel.addLayer(img.select('evap'), visEvap, 'Weekly Evapotranspiration');
    mapPanel.addLayer(img.select('runoff'), visRunoff, 'Weekly Runoff');
    mapPanel.addLayer(img.select('remain'), visRemain, 'Weekly Remaining Water');
}

var weeks = ee.List.sequence(0, endDate.difference(startDate, 'week').subtract(1));
var weeklyDates = ee.FeatureCollection(weeks.map(getWeeklyDates));
var weeklyData = ee.ImageCollection(weeklyDates.map(calculateWeeklySum));

var filteredCollection = weeklyData.filter(ee.Filter.eq('system:index', '1'));
var a = filteredCollection.median()

showData(a)
showChart(filteredCollection, nanBasin)
ui.root.add(mainPanel);