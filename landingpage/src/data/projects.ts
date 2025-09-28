export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  demoUrl: string;
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'gsv-skyview',
    title: 'การวิเคราะห์ Sky View Factor จาก Google Street View',
    description: 'ใช้ AI วิเคราะห์ภาพ Google Street View เพื่อคำนวณ Sky View Factor สำหรับการวางแผนเมือง',
    tech: ['YOLO8', 'Flask', 'Computer Vision', 'OpenCV'],
    demoUrl: '/gsv/'
  },
  {
    id: 'roof-detection',
    title: 'ระบบตรวจจับหลังคาอาคารจากภาพดาวเทียม',
    description: 'ระบบ AI ตรวจจับหลังคาอาคารจากภาพดาวเทียมด้วย YOLO และการประมวลผลภาพเชิงพื้นที่',
    tech: ['YOLO9/10', 'Satellite Imagery', 'Segmentation', 'GeoTIFF'],
    demoUrl: '/rdt/',
    repoUrl: '/proj_joam_roof_detection/YOLO9_segmentation.ipynb'
  },
  {
    id: 'iot-sound-mapping',
    title: 'การทำแผนที่เสียงจาก IoT',
    description: 'ระบบแผนที่เสียงแบบเรียลไทม์ด้วย IoT sensors เพื่อสร้างแผนที่มลพิษทางเสียงสำหรับวางแผนเมือง',
    tech: ['IoT', 'Sound Mapping', 'Real-time Data', 'WebSocket'],
    demoUrl: '/sss/'
  },
  {
    id: 'sam-segmentation',
    title: 'การแบ่งส่วนวัตถุด้วยโมเดล SAM',
    description: 'ประยุกต์โมเดล SAM ในการแบ่งส่วนวัตถุในภาพ พร้อมระบบประเมินผล COCO',
    tech: ['SAM', 'Object Segmentation', 'COCO Dataset', 'PyTorch'],
    demoUrl: '/meji/'
  },
  {
    id: 'air-quality-cctv',
    title: 'การทำนายคุณภาพอากาศจากการจราจร',
    description: 'วิเคราะห์คุณภาพอากาศจากข้อมูลการจราจรและ CCTV ด้วย Computer Vision',
    tech: ['Computer Vision', 'CCTV Analytics', 'Air Quality', 'Deep Learning'],
    demoUrl: '/rsn/'
  },
  {
    id: 'urban-classification',
    title: 'การจำแนก "ย่าน" ของเมืองด้วย Deep Learning',
    description: 'ใช้ Deep Learning จำแนกประเภทย่านเมืองจาก Google Street View เพื่อวางแผนพัฒนาเมือง',
    tech: ['Deep Learning', 'Urban Planning', 'Classification', 'Satellite Data'],
    demoUrl: '/svi/'
  },
  {
    id: 'sentiment-analysis',
    title: 'การวิเคราะห์ความรู้สึกจากข้อความ',
    description: 'ระบบวิเคราะห์ความรู้สึกและอารมณ์จากข้อความ Twitter ด้วย NLP และ Machine Learning',
    tech: ['NLP', 'Twitter API', 'SQLite', 'Sentiment Analysis'],
    demoUrl: '/sgi/'
  },
  {
    id: 'environmental-analysis',
    title: 'การสกัดหุบเมืองกับข้อมูลคุณภาพอากาศ',
    description: 'วิเคราะห์ street canyon กับคุณภาพอากาศ PM10, PM2.5 ด้วยสถิติ ANOVA และความสัมพันธ์เชิงพื้นที่',
    tech: ['Environmental Science', 'ANOVA', 'Time Series', 'Statistics'],
    demoUrl: '/usc/'
  },
  {
    id: 'air-quality-prediction',
    title: 'การพยากรณ์คุณภาพอากาศด้วย LSTM',
    description: 'ใช้โครงข่ายประสาท LSTM พยากรณ์คุณภาพอากาศ CO และ NO2 ในเขตเมืองและชนบท',
    tech: ['LSTM', 'Time Series', 'Air Quality', 'TensorFlow'],
    demoUrl: '/snn/'
  },
  {
    id: 'urban-temperature-prediction',
    title: 'การทำนายอุณหภูมิของเมืองจาก Google Traffic',
    description: 'ใช้ข้อมูล Google Traffic API สร้างแบบจำลองทำนายอุณหภูมิเมืองและเกาะความร้อน',
    tech: ['Google API', 'Machine Learning', 'Urban Heat', 'Regression'],
    demoUrl: '/pnp/'
  }
];
