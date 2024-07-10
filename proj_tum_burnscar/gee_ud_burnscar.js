
ui.root.clear()

var layerPanel = ui.Panel({
    widgets: [ui.Label({
        value: 'ร่องรอยการเผาไหม้',
        style: {
            fontSize: '20px',
            fontWeight: '800'
        }
    })],
    style: { width: '20%' }
})

var map = ui.Map()

var mainPanel = ui.Panel({
    widgets: [layerPanel, map],
    layout: ui.Panel.Layout.flow({ direction: 'horizontal', wrap: true }),
    style: {
        width: '100%',
        height: '100%'
    }
})

ui.root.add(mainPanel)

var geometry = table.geometry().bounds();
var preFireDateRange = ee.DateRange('2022-10-01', '2022-12-31');
var postFireDateRange = ee.DateRange('2023-03-01', '2023-06-30');

// ฟังก์ชันในการคำนวณ NBR
function calculateNBR(image) {
    var nir = image.select('B8');
    var swir = image.select('B12');
    var nbr = nir.subtract(swir).divide(nir.add(swir)).rename('NBR');
    return image.addBands(nbr);
}

// s2 NIR=B8 SWIR2=B12
function calculateCSI(image) {
    var nir = image.select('B8');
    var swir = image.select('B12');
    var csi = nir.divide(swir).rename('CSI');
    return image.addBands(csi);
}

function prepareData(image) {
    return image.clip(geometry)
}

// โหลดข้อมูล Sentinel-2 และกรองตามช่วงเวลา
function loadSentinel2Data(dateRange) {
    var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

    var cc = collection.filterBounds(geometry)
        .filterDate(dateRange)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
        .map(prepareData)
        .map(calculateNBR)
        .map(calculateCSI);
    return cc.median();
}

function callBurnScar() {
    // โหลดข้อมูลก่อนและหลังไฟไหม้
    var preFireImage = loadSentinel2Data(preFireDateRange);
    var postFireImage = loadSentinel2Data(postFireDateRange);

    // คำนวณ dNBR dCSI
    var dNBR = postFireImage.select('NBR').subtract(preFireImage.select('NBR')).rename('dNBR');
    var dCSI = postFireImage.select('CSI').subtract(preFireImage.select('CSI')).rename('dCSI');

    // visualize
    var visTrueColor = { bands: ['B4', 'B3', 'B2'], min: 0, max: 3000 };
    var visBurnScar = { palette: ['white', 'black', 'red'], min: -1, max: 1 };

    var border = table.style({
        color: 'blue',  // Black border
        width: 2,  // Border width
        fillColor: '00000000'  // Transparent fill
    });

    // แสดงผลลัพธ์บนแผนที
    map.setOptions('TERRAIN');
    map.centerObject(geometry);
    map.addLayer(preFireImage, visTrueColor, 'Pre-fire Image', false, 0.8);
    map.addLayer(postFireImage, visTrueColor, 'Post-fire Image', false, 0.8);
    map.addLayer(dNBR, visBurnScar, 'dNBR', false, 0.8);
    // map.addLayer(dCSI, visBurnScar, 'dCSI', true, 0.8);

    map.addLayer({
        eeObject: dCSI,
        visParams: visBurnScar,
        // name: 'dCSI', 
        // shown: true, 
        // opacity: 0.8

    })

    map.addLayer(border, {}, 'ขอบเขตตำบล', true)
}
var years = [
    { label: '2022', value: '2022' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
]

var selectYear = ui.Select({
    items: years,
    value: '2022'
})


layerPanel.add(ui.Label({ value: "เลือกปี" }))
layerPanel.add(selectYear)

