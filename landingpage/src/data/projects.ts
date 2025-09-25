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
    description: 'โครงการวิจัยระดับปริญญาตรีที่ใช้ปัญญาประดิษฐ์ในการวิเคราะห์ภาพจาก Google Street View เพื่อคำนวณค่า Sky View Factor สำหรับการวางแผนเมือง',
    tech: ['YOLO8', 'Flask', 'Computer Vision', 'OpenCV'],
    demoUrl: '/proj_earn_gsv/'
  },
  {
    id: 'roof-detection',
    title: 'ระบบตรวจจับหลังคาอาคารจากภาพดาวเทียม',
    description: 'โครงการนักศึกษาที่พัฒนาระบบ AI สำหรับการตรวจจับและแบ่งส่วนหลังคาอาคารจากภาพดาวเทียม โดยใช้เทคโนโลยี YOLO และการประมวลผลภาพเชิงพื้นที่',
    tech: ['YOLO9/10', 'Satellite Imagery', 'Segmentation', 'GeoTIFF'],
    demoUrl: '/proj_joam_roof_detection/',
    repoUrl: '/proj_joam_roof_detection/YOLO9_segmentation.ipynb'
  },
  {
    id: 'sentiment-analysis',
    title: 'การวิเคราะห์ความรู้สึกจากข้อความ Twitter',
    description: 'งานวิจัยปริญญาตรีด้านการประมวลผลภาษาธรรมชาติ ที่พัฒนาระบบวิเคราะห์ความรู้สึกและอารมณ์จากข้อความใน Twitter โดยใช้เทคนิค Machine Learning',
    tech: ['NLP', 'Twitter API', 'SQLite', 'Sentiment Analysis'],
    demoUrl: '/proj_knot_sentiment/'
  },
  {
    id: 'urban-classification',
    title: 'การจำแนกพื้นที่เมืองด้วย Deep Learning',
    description: 'โครงการที่ประยุกต์ใช้เทคโนโลยี Deep Learning ในการจำแนกประเภทพื้นที่เมืองจากภาพดาวเทียม เพื่อช่วยในการวางแผนและพัฒนาเมือง',
    tech: ['Deep Learning', 'Urban Planning', 'Classification', 'Satellite Data'],
    demoUrl: '/proj_fai_urban/'
  },
  {
    id: 'sam-segmentation',
    title: 'การแบ่งส่วนวัตถุด้วยโมเดล SAM',
    description: 'การนำโมเดล Segment Anything Model (SAM) มาประยุกต์ใช้ในการแบ่งส่วนวัตถุในภาพ พร้อมระบบประเมินผลแบบ COCO และเทคนิคคอมพิวเตอร์วิชัน',
    tech: ['SAM', 'Object Segmentation', 'COCO Dataset', 'PyTorch'],
    demoUrl: '/proj_joam_sam/'
  },
  {
    id: 'environmental-analysis',
    title: 'การวิเคราะห์ข้อมูลสิ่งแวดล้อม',
    description: 'งานวิจัยการวิเคราะห์คุณภาพอากาศ (PM10, PM2.5) ด้วยวิธีทางสำหรับสถิติ การทดสอบ ANOVA และการหาความสัมพันธ์เชิงพื้นที่และเวลา',
    tech: ['Environmental Science', 'ANOVA', 'Time Series', 'Statistics'],
    demoUrl: '/proj_jan/'
  },
  {
    id: 'air-quality-prediction',
    title: 'การพยากรณ์คุณภาพอากาศด้วย LSTM',
    description: 'โครงการที่ใช้เครือข่ายประสาทเทียม LSTM ในการพยากรณ์คุณภาพอากาศ โดยเฉพาะค่าความเข้มข้นของ CO และ NO2 ในเขตเมืองและชนบท',
    tech: ['LSTM', 'Time Series', 'Air Quality', 'TensorFlow'],
    demoUrl: '/proj_mook/'
  }
];
