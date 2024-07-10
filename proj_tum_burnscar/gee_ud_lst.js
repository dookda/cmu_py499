
var geometry = table.geometry().bounds();
ui.root.clear();

var layerLabel = ui.Label({
    value: 'Land Surface Temperature Monitoring',
    style: {
        fontSize: '20px',
        fontWeight: '800'
    }
});

var layerPanel = ui.Panel({
    widgets: [layerLabel],
    style: {
        width: '20%'
    }
});

var mapPanel = ui.Map();
mapPanel.setOptions('TERRAIN');

var mainPanel = ui.Panel({
    widgets: [layerPanel, mapPanel],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
        width: '100%',
        height: '100%'
    }
});

function prepareData(image) {
    return image.reproject({ crs: "EPSG:3857", scale: 500 }).clip(geometry)
}

function loadData(dateRange) {
    var dataset = ee.ImageCollection('MODIS/061/MOD11A2')
        .filterDate(dateRange)
        .select('LST_Day_1km')
        .map(prepareData);

    var meanLST = dataset.mean();

    var meanLST_Celsius = meanLST.multiply(0.02).subtract(273.15);

    var visParams = {
        min: 20,
        max: 40,
        palette: ['blue', 'yellow', 'red']
    };

    var border = table.style({
        color: 'blue',
        width: 2,
        fillColor: '00000000'
    });

    mapPanel.clear();
    mapPanel.centerObject(geometry);
    mapPanel.addLayer(meanLST_Celsius, visParams, 'Mean LST (°C)');
    mapPanel.addLayer(border, {}, 'ขอบเขตตำบล', true)
}

function getdate() {
    var year = selectYear.getValue();
    var dateRange = ee.DateRange(String(year - 1) + '-10-01', String(year) + '-06-30');

    loadData(dateRange)
}

var years = [
    { label: '2019', value: '2019' },
    { label: '2020', value: '2020' },
    { label: '2021', value: '2021' },
    { label: '2022', value: '2022' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
]

var selectYear = ui.Select({
    items: years,
    value: '2022'
});

layerPanel.add(ui.Label({ value: "เลือกปี" }))
layerPanel.add(selectYear)

selectYear.onChange(getdate);
getdate();

ui.root.add(mainPanel);











var dailyRunoff = dailyRain.map(function (image) {
    var r = calculateRunoff(image, curveNumber).rename('runoff')

    return image.addBands(r)
    // .set('system:time_start', image.get('system:time_start'));
});
