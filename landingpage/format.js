

var imageCollection = ee.ImageCollection("MODIS/061/MCD19A2_GRANULES")
    .select('Optical_Depth_047')
    .filterDate('2024-01-01', '2024-01-07')
    .filterBounds(geometry)

print(imageCollection)

var getValue = function (image) {
    var meanDict = image.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: fov,
        scale: 500,
        maxPixels: 1e9
    });
    return ee.Feature(null, meanDict);
};

var values = imageCollection.map(getValue);

var valuesList = values.reduceColumns(ee.Reducer.toList(), ['Optical_Depth_047']).get('list');

print('Values list:', valuesList);
var reducer = ee.Reducer.mean();
var scale = 5000;
var xProperty = 'system:time_start';
var chart = ui.Chart.image.series({
    imageCollection: imageCollection,
    region: fov,
    reducer: reducer,
    scale: scale,
    xProperty: xProperty
})
chart.setOptions({
    title: 'NDVI Time Series',
    hAxis: { title: 'Date' },
    vAxis: { title: 'NDVI' }
});

print(chart);

SELECT * FROM users WHERE username = 'input_username' AND password = 'input_password';


connection.connect();

const input_username = "admin' OR '1'='1";
const input_password = "anything";

const query = `SELECT * FROM users WHERE username = '${input_username}' AND password = '${input_password}'`;

connection.query(query, (error, results, fields) => {
    if (error) throw error;
    console.log(results);
});

connection.end();





connection.connect();

const input_username = "admin' OR '1'='1";
const input_password = "anything";

const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

connection.query(query, [input_username, input_password], (error, results, fields) => {
    if (error) throw error;
    console.log(results);
});

connection.end();
