var bound = hex150.geometry().bounds();

ui.root.clear()

var mapPanel = ui.Map();
mapPanel.centerObject(bound, 12);

var leftPanel = ui.Panel({
    widgets: [ui.Label({ value: "param panel" })],
    style: { width: '25%' }
})

var chartPanel = ui.Panel({
    widgets: [ui.Label({ value: "chart panel" })],
    style: { width: '40%' }
})

var splitPanel = ui.SplitPanel({
    firstPanel: leftPanel,
    secondPanel: mapPanel,
    orientation: 'horizontal',
    style: { stretch: 'both' }
});

var mainPanel = ui.SplitPanel({
    firstPanel: ui.Panel(splitPanel),
    secondPanel: chartPanel,
    orientation: 'horizontal',
    style: { stretch: 'both' }
});

function createImage(z_state, col) {
    var empty = ee.Image().byte();
    var imgPaint = empty.paint({
        featureCollection: z_state,
        color: col,
    })
    return imgPaint
}

function renameFnc(feat, newName) {
    var meanValue = feat.get('mean');
    var nName = feat.set(newName, meanValue).set('mean', null);
    return nName;
}

function zonal_state(image, hex, paramName) {
    var zstat = image.reduceRegions({
        collection: hex,
        reducer: ee.Reducer.mean(),
        scale: 30
    });
    var newFeat = zstat.map(function (feat) {
        var reName = renameFnc(feat, paramName);
        return reName
    })
    return newFeat;
}

function showMap(img, feat, col, lyrName) {
    mapPanel.addLayer(img, {
        min: feat.aggregate_min(col).getInfo(),
        max: feat.aggregate_max(col).getInfo(),
        palette: ['red', 'green', 'blue']
    }, lyrName)
}

function showChart(usc, param, name) {
    var scatterChart = ui.Chart.array.values({
        array: usc, axis: 0, xLabels: param
    })
        .setChartType('ScatterChart')
        .setOptions({
            title: 'correlation co vs usc',
            colors: ['96356f'],
            hAxis: {
                title: name,
                titleTextStyle: { italic: false, bold: true }
            },
            vAxis: {
                title: 'usc',
                titleTextStyle: { italic: false, bold: true }
            },
            pointSize: 5,
            dataOpacity: 0.6,
            legend: { position: 'none' },
        });
    chartPanel.clear();
    chartPanel.add(scatterChart);
}

function showCorrelationOld(property1, property2) {
    var array1 = ee.Array(property1);
    var array2 = ee.Array(property2);

    var mean1 = array1.reduce(ee.Reducer.mean(), [0]).get([0]);
    var mean2 = array2.reduce(ee.Reducer.mean(), [0]).get([0]);

    var deviation1 = array1.subtract(mean1);
    var deviation2 = array2.subtract(mean2);

    var covariance = deviation1.multiply(deviation2).reduce(ee.Reducer.sum(), [0]).get([0]);

    var variance1 = deviation1.pow(2).reduce(ee.Reducer.sum(), [0]).get([0]);
    var variance2 = deviation2.pow(2).reduce(ee.Reducer.sum(), [0]).get([0]);

    var correlation = covariance.divide(variance1.multiply(variance2).sqrt());

    // print('Correlation:', correlation);
    var correUi = ui.Label('Correlation:' + correlation)
    chartPanel.add(correUi);
}

function showCorrelation(property1, property2) {
    var array1 = ee.Array(property1);
    var array2 = ee.Array(property2);

    var mean1 = array1.reduce(ee.Reducer.mean(), [0]).get([0]);
    var mean2 = array2.reduce(ee.Reducer.mean(), [0]).get([0]);

    var deviation1 = array1.subtract(mean1);
    var deviation2 = array2.subtract(mean2);

    var covariance = deviation1.multiply(deviation2).reduce(ee.Reducer.sum(), [0]).get([0]);

    var variance1 = deviation1.pow(2).reduce(ee.Reducer.sum(), [0]).get([0]);
    var variance2 = deviation2.pow(2).reduce(ee.Reducer.sum(), [0]).get([0]);

    var correlation = covariance.divide(variance1.multiply(variance2).sqrt());

    // Calculate regression slope and intercept
    var slope = covariance.divide(variance1);
    var intercept = mean2.subtract(slope.multiply(mean1));

    // Create the regression line points
    var minX = array1.reduce(ee.Reducer.min(), [0]).get([0]);
    var maxX = array1.reduce(ee.Reducer.max(), [0]).get([0]);
    var minY = slope.multiply(minX).add(intercept);
    var maxY = slope.multiply(maxX).add(intercept);

    // Print the correlation and regression info
    var correUi = ui.Label('Correlation: ' + correlation.getInfo());
    chartPanel.add(correUi);
    var slopeUi = ui.Label('Slope: ' + slope.getInfo());
    chartPanel.add(slopeUi);
    var interceptUi = ui.Label('Intercept: ' + intercept.getInfo());
    chartPanel.add(interceptUi);

    // Create a chart
    var scatterChart = ui.Chart.array.values({
        array: ee.Array.cat([array1, array2], 1),
        axis: 0
    })
        .setChartType('ScatterChart')
        .setOptions({
            title: 'Scatter Plot with Regression Line',
            hAxis: { title: 'Property 1' },
            vAxis: { title: 'Property 2' },
            pointSize: 5,
            series: {
                0: { pointShape: 'circle', pointSize: 5 },
                1: { pointShape: 'none', lineWidth: 2, color: 'red' } // Regression line
            }
        });

    // Add regression line data
    var regressionData = ee.Array.cat([
        ee.Array([[minX, minY], [maxX, maxY]])
    ], 1);

    scatterChart = scatterChart.setSeries([
        { series: { 0: 'circle' } },
        { series: { 1: 'line' } }
    ]);

    scatterChart.setSeriesData(1, regressionData);

    // Print the chart to the console
    print(scatterChart);
}


function getcollection(startDate, endDate, weekNumber, year) {
    var selectValue = selectParams.getValue();
    var NDVI = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .median()
        .normalizedDifference(['B8', 'B4'])

    var NDMI = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .median()
        .normalizedDifference(['B8', 'B11'])

    var CO = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_CO")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .select('CO_column_number_density')
        .median()

    var SO2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_SO2")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .select('SO2_column_number_density')
        .median()

    var NO2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .select('NO2_column_number_density')
        .median()

    var O3 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_O3")
        .filterDate(startDate, endDate)
        .filterBounds(bound)
        .select('O3_column_number_density')
        .median()

    var modisCollection = ee.ImageCollection("MODIS/061/MOD11A1")
        .filterBounds(bound)
        .filterDate(startDate, endDate)
        .median()
    var lst = modisCollection.expression(
        '((TB * 0.02) - 273.15)', {
        'TB': modisCollection.select('LST_Day_1km'),
    }).rename('LST_Celsius');

    var co_zStat = zonal_state(CO, hex150, 'co');
    var so2_zStat = zonal_state(SO2, co_zStat, 'so2');
    var no2_zStat = zonal_state(NO2, so2_zStat, 'no2');
    var o3_zStat = zonal_state(O3, no2_zStat, 'o3');
    var ndvi_zStat = zonal_state(NDVI, o3_zStat, 'ndvi');
    var temp_zStat = zonal_state(lst, ndvi_zStat, 'lst');
    // var ndmi_zStat = zonal_state(NDMI, temp_zStat, 'ndmi');

    var imgCo = createImage(co_zStat, 'co');
    var imgSo2 = createImage(so2_zStat, 'so2');
    var imgNo2 = createImage(no2_zStat, 'no2');
    var imgO3 = createImage(o3_zStat, 'o3');
    var imgNdvi = createImage(ndvi_zStat, 'ndvi');
    var imgTemp = createImage(temp_zStat, 'lst');
    // var imgNdmi = createImage(ndmi_zStat, 'ndmi');

    mapPanel.clear()
    mapPanel.centerObject(bound, 12);

    var filteredCollection;
    var usc;
    var val;
    switch (selectValue) {
        case 'ndvi':
            showMap(imgNdvi, ndvi_zStat, 'ndvi', 'NDVI_' + weekNumber + '-' + year);
            break;
        case 'co':
            showMap(imgCo, co_zStat, 'co', 'CO_' + weekNumber + '-' + year);
            filteredCollection = co_zStat.filter(ee.Filter.and(
                ee.Filter.notNull(['usc']),
                ee.Filter.notNull(['co'])
            ));
            usc = filteredCollection.aggregate_array('usc');
            val = filteredCollection.aggregate_array('co');
            showChart(usc, val, 'CO');
            showCorrelation(usc, val);
            break;
        case 'so2':
            showMap(imgSo2, so2_zStat, 'so2', 'SO2_' + weekNumber + '-' + year);
            filteredCollection = so2_zStat.filter(ee.Filter.and(
                ee.Filter.notNull(['usc']),
                ee.Filter.notNull(['so2'])
            ));
            usc = filteredCollection.aggregate_array('usc');
            val = filteredCollection.aggregate_array('so2');
            showChart(usc, val, 'SO2');
            showCorrelation(usc, val);
            break;
        case 'no2':
            showMap(imgNo2, no2_zStat, 'no2', 'NO2_' + weekNumber + '-' + year);
            filteredCollection = no2_zStat.filter(ee.Filter.and(
                ee.Filter.notNull(['usc']),
                ee.Filter.notNull(['no2'])
            ));
            usc = filteredCollection.aggregate_array('usc');
            val = filteredCollection.aggregate_array('no2');
            showChart(usc, val, 'no2');
            showCorrelation(usc, val);
            break;
        case 'o3':
            showMap(imgO3, o3_zStat, 'o3', 'O3_' + weekNumber + '-' + year);
            filteredCollection = o3_zStat.filter(ee.Filter.and(
                ee.Filter.notNull(['usc']),
                ee.Filter.notNull(['o3'])
            ));
            usc = filteredCollection.aggregate_array('usc');
            val = filteredCollection.aggregate_array('o3');
            showChart(usc, val, 'O3');
            showCorrelation(usc, val);
            break;
        case 'lst':
            showMap(imgTemp, temp_zStat, 'lst', 'LST_' + weekNumber + '-' + year);
            filteredCollection = temp_zStat.filter(ee.Filter.and(
                ee.Filter.notNull(['usc']),
                ee.Filter.notNull(['lst'])
            ));
            usc = filteredCollection.aggregate_array('usc');
            val = filteredCollection.aggregate_array('lst');
            showChart(usc, val, 'LST');
            showCorrelation(usc, val);
            break;
    }
}

function getWeekDates(year, weekNumber) {
    var firstDate = 1

    switch (year) {
        case "2021":
            firstDate = 4
            break;
        case "2022":
            firstDate = 3
            break;
        case "2023":
            firstDate = 2
            break;
        case "2024":
            firstDate = 1
            break;
        default:
            firstDate = 1
    }

    var janFirst = ee.Date.fromYMD(Number(year), 1, firstDate);
    var firstDateOfWeek = janFirst.advance((Number(weekNumber) - 1) * 7, 'day');
    var lastDateOfWeek = firstDateOfWeek.advance(6, 'day');

    return { first: firstDateOfWeek, last: lastDateOfWeek };
}

// Example usage
// var year = 2024;
// var weekNumber = 20
// var weekDates = getWeekDates(year, weekNumber);
// print(weekDates.first.format('YYYY-MM-dd'), weekDates.last.format('YYYY-MM-dd'))


var btnOk = ui.Button({ label: "ok" })
var chkBoxYes = ui.Checkbox({ label: "yes" })
var chkBoxNo = ui.Checkbox({ label: "no" })
var dateSelect = ui.DateSlider()

var selectParams = ui.Select({
    items: ["co", "no2", "o3", "so2", "lst"],
    placeholder: 'air pollution',
    value: "co",
});

function getWeekYear() {
    var y = yearSelect.getValue()
    var w = weekSelect.getValue()
    var weekDates = getWeekDates(y, w);
    getcollection(weekDates.first.format('YYYY-MM-dd'),
        weekDates.last.format('YYYY-MM-dd').getInfo() + 'T23:59:00',
        Number(w),
        Number(y)
    );
    print("success")
}

var yearSelect = ui.Select({
    items: ['2021', '2022', '2023', '2024'],
    placeholder: 'year',
    value: "2021",
    // onChange:function(){
    //   getWeekYear()
    // }
});

var weekSelect = ui.Select({
    items: ["45", "46", "47", "48", "49", "50", "51", "52", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",],
    placeholder: 'week',
    value: "45",
    // onChange:function(){
    //   getWeekYear()
    // }
});
var button = ui.Button({
    label: "ok",
    onClick: function () {
        getWeekYear()

    }
});

leftPanel.add(yearSelect)
    .add(weekSelect)
    .add(selectParams)
    .add(button)

ui.root.add(mainPanel)
