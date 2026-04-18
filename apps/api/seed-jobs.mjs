/**
 * Seed 100 random jobs for employer: Banani1@gmail.com
 * Run: bun seed-jobs.mjs (from apps/api directory)
 */

import { PrismaClient } from './node_modules/.prisma/client/index.js';

const prisma = new PrismaClient();

const EMPLOYER_EMAIL = 'Banani1@gmail.com';

const provinces = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงใหม่',
  'ชลบุรี', 'ขอนแก่น', 'นครราชสีมา', 'ภูเก็ต', 'สงขลา',
];
const districts = [
  'วัฒนา', 'บึงกุ่ม', 'ลาดพร้าว', 'จตุจักร', 'บางรัก',
  'คลองเตย', 'ห้วยขวาง', 'ดอนเมือง', 'มีนบุรี', 'ลาดกระบัง',
];
const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
const workModels = ['ONSITE', 'REMOTE', 'HYBRID'];
const educations = ['ต่ำกว่ามัธยมศึกษา', 'มัธยมศึกษา', 'ปวช/ปวส', 'ปริญญาตรี', 'ปริญญาโท'];
const workingDaysOptions = ['5 วัน/สัปดาห์', '6 วัน/สัปดาห์', 'จันทร์-ศุกร์', 'จันทร์-เสาร์'];
const startTimes = ['08:00', '08:30', '09:00', '09:30'];
const endTimes = ['17:00', '17:30', '18:00', '18:30'];
const transportations = [['BTS'], ['MRT'], ['BTS', 'MRT'], ['รถประจำทาง'], ['รถส่วนตัว'], ['BTS', 'รถประจำทาง']];
const genders = ['ไม่จำกัดเพศ', 'ชาย', 'หญิง'];

const benefitPool = [
  'ประกันสังคม', 'ประกันสุขภาพกลุ่ม', 'โบนัสประจำปี', 'ค่าเดินทาง',
  'ค่าอาหาร', 'เบี้ยขยัน', 'วันหยุดพักร้อน', 'ฝึกอบรมพัฒนาทักษะ',
  'เสื้อผ้าพนักงาน', 'กองทุนสำรองเลี้ยงชีพ', 'ค่าคอมมิชชั่น',
  'ค่าน้ำมันรถ', 'โทรศัพท์บริษัท', 'ทำงานจากบ้านได้', 'ประกันอุบัติเหตุ',
];

// ─── Job Templates per Category ─────────────────────────────────────────────

const categories = [
  {
    name: 'งานขาย',
    function: 'ขายสินค้าและบริการ',
    jobs: [
      {
        title: 'พนักงานขายอุปกรณ์อิเล็กทรอนิกส์',
        description: 'รับสมัครพนักงานขายอุปกรณ์อิเล็กทรอนิกส์ มีความกระตือรือร้น ใจรักงานขาย และสามารถอธิบายคุณสมบัติสินค้าให้ลูกค้าเข้าใจได้ดี รับผิดชอบการขายสินค้าในพื้นที่ที่ได้รับมอบหมาย พร้อมทั้งดูแลยอดขายให้บรรลุเป้าหมายที่กำหนด',
        requirements: 'วุฒิการศึกษาม.6 ขึ้นไป มีทักษะการนำเสนอและสื่อสารดี มีประสบการณ์งานขายจะพิจารณาเป็นพิเศษ',
        skills: ['การขาย', 'การเจรจาต่อรอง', 'การบริการลูกค้า', 'สินค้าอิเล็กทรอนิกส์'],
        salaryMin: 15000, salaryMax: 25000,
      },
      {
        title: 'ตัวแทนขายประกัน',
        description: 'รับสมัครตัวแทนขายประกันชีวิตและประกันภัย ดูแลลูกค้าทั้งรายเก่าและรายใหม่ นำเสนอแผนประกันที่เหมาะสมกับความต้องการของลูกค้าแต่ละราย สร้างฐานลูกค้าของตัวเอง มีรายได้จากค่าคอมมิชชั่น',
        requirements: 'อายุ 20 ปีขึ้นไป มีใจรักงานขาย มีทักษะการสื่อสารที่ดี สามารถทำงานภายใต้แรงกดดันได้',
        skills: ['การขายประกัน', 'การสร้างความสัมพันธ์กับลูกค้า', 'การเจรจาต่อรอง'],
        salaryMin: 20000, salaryMax: 50000,
      },
      {
        title: 'นักขายอสังหาริมทรัพย์',
        description: 'รับสมัครนักขายอสังหาริมทรัพย์ ทำหน้าที่นำเสนอโครงการบ้านและคอนโดให้แก่ลูกค้า พาลูกค้าชมโครงการ ประสานงานด้านสัญญา และปิดการขาย ทำงานในสำนักงานขายโครงการ',
        requirements: 'จบการศึกษาระดับปริญญาตรีขึ้นไป มีทักษะการนำเสนอ มีรถยนต์เป็นของตัวเอง มีใบขับขี่',
        skills: ['การขายอสังหาริมทรัพย์', 'การเจรจาต่อรอง', 'MS Office', 'การนำเสนอ'],
        salaryMin: 18000, salaryMax: 40000,
      },
      {
        title: 'Sales Executive (B2B)',
        description: 'รับสมัคร Sales Executive สำหรับงานขายสินค้า B2B รับผิดชอบการหาลูกค้าใหม่ในกลุ่มธุรกิจ นำเสนอสินค้าและบริการ ติดตามผลการขาย ทำรายงานยอดขายประจำสัปดาห์ และรักษาความสัมพันธ์กับลูกค้าที่มีอยู่',
        requirements: 'ปริญญาตรีทุกสาขา ประสบการณ์งานขาย B2B อย่างน้อย 1 ปี สามารถขับรถได้ มีใบขับขี่',
        skills: ['B2B Sales', 'CRM', 'การนำเสนอ', 'MS Excel', 'การสื่อสาร'],
        salaryMin: 25000, salaryMax: 45000,
      },
      {
        title: 'พนักงานขายโทรศัพท์มือถือ',
        description: 'รับสมัครพนักงานขายโทรศัพท์มือถือและอุปกรณ์เสริม ประจำร้านค้า ดูแลลูกค้าที่เข้ามาในร้าน แนะนำผลิตภัณฑ์ที่เหมาะสม จัดแสดงสินค้า และดูแลความเป็นระเบียบเรียบร้อยในร้าน',
        requirements: 'วุฒิการศึกษาม.6 ขึ้นไป มีบุคลิกภาพดี ยิ้มแย้มแจ่มใส มีใจรักการบริการ พร้อมเรียนรู้ผลิตภัณฑ์ใหม่',
        skills: ['การขาย', 'บริการลูกค้า', 'สมาร์ทโฟน', 'POS System'],
        salaryMin: 13000, salaryMax: 20000,
      },
    ],
  },
  {
    name: 'งานอาหารและเครื่องดื่ม',
    function: 'อาหารและเครื่องดื่ม',
    jobs: [
      {
        title: 'พ่อครัว/แม่ครัวประจำร้านอาหาร',
        description: 'รับสมัครพ่อครัว/แม่ครัวสำหรับร้านอาหารไทย ดูแลการปรุงอาหารทุกประเภทในเมนู ดูแลความสะอาดในครัว จัดเตรียมวัตถุดิบ ตรวจสอบคุณภาพอาหารก่อนเสิร์ฟ และดูแลสต็อกวัตถุดิบ',
        requirements: 'มีประสบการณ์ทำครัวอย่างน้อย 2 ปี มีความรู้เรื่องอาหารไทย รักษาความสะอาด ทำงานภายใต้แรงกดดันได้',
        skills: ['การปรุงอาหารไทย', 'การจัดการวัตถุดิบ', 'HACCP', 'การควบคุมต้นทุน'],
        salaryMin: 16000, salaryMax: 28000,
      },
      {
        title: 'บาริสต้า',
        description: 'รับสมัครบาริสต้าสำหรับร้านกาแฟ รับผิดชอบการชงเครื่องดื่มกาแฟและเครื่องดื่มต่างๆ ดูแลความสะอาดของอุปกรณ์ บริการลูกค้าด้วยความยิ้มแย้ม และช่วยจัดเตรียมร้านก่อนเปิดและหลังปิด',
        requirements: 'ชื่นชอบกาแฟ มีใจรักบริการ มีประสบการณ์หรือผ่านการอบรมบาริสต้าจะพิจารณาเป็นพิเศษ',
        skills: ['ชงกาแฟ', 'Latte Art', 'บริการลูกค้า', 'POS System'],
        salaryMin: 13000, salaryMax: 20000,
      },
      {
        title: 'พนักงานเสิร์ฟ',
        description: 'รับสมัครพนักงานเสิร์ฟประจำร้านอาหาร ต้อนรับลูกค้า รับออเดอร์ เสิร์ฟอาหารและเครื่องดื่ม ดูแลความสะอาดโต๊ะและบริเวณร้าน ให้บริการด้วยความเป็นมิตรและมืออาชีพ',
        requirements: 'วุฒิการศึกษาม.3 ขึ้นไป มีใจรักการบริการ บุคลิกดี ยิ้มแย้ม สามารถทำงานเป็นกะได้',
        skills: ['บริการลูกค้า', 'การสื่อสาร', 'ทำงานเป็นทีม', 'POS'],
        salaryMin: 12000, salaryMax: 18000,
      },
      {
        title: 'ผู้จัดการร้านอาหาร',
        description: 'รับสมัครผู้จัดการร้านอาหาร บริหารจัดการร้านทั้งหมด ดูแลทีมงาน ควบคุมคุณภาพอาหารและบริการ จัดการสต็อก วางแผนโปรโมชั่น และรายงานยอดขาย',
        requirements: 'ปริญญาตรีการโรงแรมหรือที่เกี่ยวข้อง ประสบการณ์บริหารร้านอาหารอย่างน้อย 3 ปี ภาวะผู้นำดี',
        skills: ['บริหารร้านอาหาร', 'ภาวะผู้นำ', 'ควบคุมต้นทุน', 'POS', 'การวางแผน'],
        salaryMin: 30000, salaryMax: 55000,
      },
      {
        title: 'เบเกอร์/พนักงานทำขนม',
        description: 'รับสมัครเบเกอร์สำหรับร้านเบเกอรี่ รับผิดชอบการทำขนมปัง เค้ก และขนมอบต่างๆ ตามสูตรมาตรฐาน ดูแลความสะอาดอุปกรณ์ จัดเตรียมวัตถุดิบ และควบคุมคุณภาพผลิตภัณฑ์',
        requirements: 'มีความรู้หรือประสบการณ์ด้านเบเกอรี่ รักงาน มีความละเอียดรอบคอบ สามารถทำงานตอนเช้าตรู่ได้',
        skills: ['การทำเบเกอรี่', 'การตกแต่งเค้ก', 'ควบคุมคุณภาพ', 'สุขอนามัย'],
        salaryMin: 14000, salaryMax: 22000,
      },
    ],
  },
  {
    name: 'งานบริการลูกค้า',
    function: 'บริการลูกค้า',
    jobs: [
      {
        title: 'เจ้าหน้าที่ Call Center',
        description: 'รับสมัครเจ้าหน้าที่ Call Center รับสายและตอบคำถามลูกค้าเกี่ยวกับสินค้าและบริการ บันทึกข้อมูลการติดต่อ ประสานงานกับแผนกที่เกี่ยวข้อง และติดตามปัญหาจนกว่าจะได้รับการแก้ไข',
        requirements: 'วุฒิการศึกษาม.6 หรือปวช ขึ้นไป เสียงดี สื่อสารชัดเจน อดทน ใจเย็น พิมพ์ดีดได้',
        skills: ['การสื่อสาร', 'CRM', 'การแก้ปัญหา', 'การพิมพ์ดีด', 'ใจเย็น'],
        salaryMin: 14000, salaryMax: 22000,
      },
      {
        title: 'Customer Service Officer',
        description: 'รับสมัคร Customer Service Officer ดูแลและแก้ไขปัญหาให้ลูกค้าทั้งทางออนไลน์และออฟไลน์ สร้างความพึงพอใจให้ลูกค้า จัดการข้อร้องเรียน และรวบรวม Feedback เพื่อปรับปรุงบริการ',
        requirements: 'ปริญญาตรีทุกสาขา สื่อสารภาษาไทยได้ดีเป็นเลิศ มีทักษะการแก้ปัญหา ใจเย็นและมีความอดทน',
        skills: ['บริการลูกค้า', 'การแก้ปัญหา', 'MS Office', 'CRM', 'การสื่อสาร'],
        salaryMin: 18000, salaryMax: 30000,
      },
      {
        title: 'พนักงานต้อนรับ (Receptionist)',
        description: 'รับสมัครพนักงานต้อนรับประจำสำนักงาน ต้อนรับแขกและลูกค้า รับโทรศัพท์ จัดการนัดหมาย ดูแลพื้นที่ต้อนรับให้สะอาดและเป็นระเบียบ ประสานงานกับแผนกต่างๆ',
        requirements: 'วุฒิปริญญาตรี บุคลิกดี ภาษาอังกฤษพอสื่อสารได้ MS Office คล่อง ยิ้มแย้มแจ่มใส',
        skills: ['การต้อนรับ', 'MS Office', 'ภาษาอังกฤษ', 'การโทรศัพท์', 'การประสานงาน'],
        salaryMin: 16000, salaryMax: 24000,
      },
      {
        title: 'เจ้าหน้าที่ Live Chat Support',
        description: 'รับสมัครเจ้าหน้าที่ Live Chat Support ตอบคำถามลูกค้าผ่านช่องทาง Chat บนเว็บไซต์และ Social Media แก้ไขปัญหาเบื้องต้น ส่งต่อเรื่องให้ทีมที่เกี่ยวข้อง และรักษาเวลาตอบสนองที่รวดเร็ว',
        requirements: 'วุฒิม.6 ขึ้นไป พิมพ์เร็ว สื่อสารภาษาไทยเขียนได้ดี ใจเย็น สามารถจัดการหลายการสนทนาพร้อมกัน',
        skills: ['Live Chat', 'การพิมพ์ดีด', 'CRM', 'Social Media', 'การแก้ปัญหา'],
        salaryMin: 15000, salaryMax: 22000,
      },
      {
        title: 'ที่ปรึกษาลูกค้า (Customer Advisor)',
        description: 'รับสมัครที่ปรึกษาลูกค้า ให้คำแนะนำสินค้าและบริการที่เหมาะสมกับความต้องการลูกค้า สร้างความสัมพันธ์ระยะยาว ติดตามหลังการขาย และรับ Feedback เพื่อปรับปรุงบริการ',
        requirements: 'ปริญญาตรีทุกสาขา มีทักษะการสื่อสารดีเยี่ยม มีความรู้ด้านผลิตภัณฑ์ที่นำเสนอ',
        skills: ['การให้คำปรึกษา', 'CRM', 'การสื่อสาร', 'การขาย', 'บริการหลังการขาย'],
        salaryMin: 20000, salaryMax: 35000,
      },
    ],
  },
  {
    name: 'งานห้างสรรพสินค้า สาขาและหน้าร้าน',
    function: 'ค้าปลีกและหน้าร้าน',
    jobs: [
      {
        title: 'พนักงานขายประจำร้านแฟชั่น',
        description: 'รับสมัครพนักงานขายประจำร้านเสื้อผ้าแฟชั่นในห้างสรรพสินค้า บริการลูกค้า แนะนำสินค้า จัดเรียงสินค้าให้สวยงาม ตรวจรับสินค้าใหม่ และดูแลยอดขายรายวัน',
        requirements: 'วุฒิม.6 ขึ้นไป บุคลิกดี รักแฟชั่น มีใจรักการบริการ ยืนได้นานๆ',
        skills: ['การขาย', 'บริการลูกค้า', 'การจัดแสดงสินค้า', 'POS'],
        salaryMin: 13000, salaryMax: 18000,
      },
      {
        title: 'ผู้จัดการสาขา',
        description: 'รับสมัครผู้จัดการสาขาประจำห้างสรรพสินค้า บริหารทีมงานทั้งหมด ควบคุมยอดขาย ดูแลสต็อกสินค้า ฝึกอบรมพนักงาน วางแผนการโปรโมต และรายงานผลการดำเนินงาน',
        requirements: 'ปริญญาตรีขึ้นไป ประสบการณ์บริหารสาขาอย่างน้อย 3 ปี มีภาวะผู้นำ ทำงานวันหยุดได้',
        skills: ['บริหารสาขา', 'ภาวะผู้นำ', 'ยอดขาย', 'การฝึกอบรม', 'Excel'],
        salaryMin: 35000, salaryMax: 60000,
      },
      {
        title: 'พนักงานแคชเชียร์',
        description: 'รับสมัครพนักงานแคชเชียร์ประจำห้างสรรพสินค้า รับชำระเงินสด บัตรเครดิต และโอนเงิน ออกใบเสร็จ ดูแลเงินสด และบริการลูกค้าด้วยความรวดเร็วและถูกต้อง',
        requirements: 'วุฒิม.6 ขึ้นไป ซื่อสัตย์ รับผิดชอบ คิดเลขเร็ว สามารถทำงานเป็นกะได้',
        skills: ['POS System', 'การนับเงิน', 'บริการลูกค้า', 'ความซื่อสัตย์'],
        salaryMin: 12000, salaryMax: 17000,
      },
      {
        title: 'พนักงานประจำร้านสะดวกซื้อ',
        description: 'รับสมัครพนักงานประจำร้านสะดวกซื้อ บริการลูกค้า เติมสินค้าบนชั้น รับชำระเงิน ตรวจสอบสินค้าหมดอายุ รักษาความสะอาดร้าน ทำงานเป็นกะ',
        requirements: 'วุฒิม.3 ขึ้นไป ขยัน รับผิดชอบ สามารถทำงานกะดึกได้ มีความซื่อสัตย์',
        skills: ['POS', 'บริการลูกค้า', 'การจัดเรียงสินค้า', 'ทำความสะอาด'],
        salaryMin: 11000, salaryMax: 16000,
      },
      {
        title: 'Visual Merchandiser',
        description: 'รับสมัคร Visual Merchandiser ออกแบบและจัดแสดงสินค้าในร้านและหน้าต่าง สร้างสรรค์ดิสเพลย์ตามธีมโปรโมชั่น ประสานงานกับทีมการตลาด และวิเคราะห์ผลการแสดงสินค้า',
        requirements: 'ปริญญาตรีออกแบบหรือที่เกี่ยวข้อง มีพอร์ตโฟลิโอ รักงานสร้างสรรค์ มีความสามารถด้านศิลปะ',
        skills: ['Visual Merchandising', 'Adobe Creative Suite', 'การออกแบบ', 'ความคิดสร้างสรรค์'],
        salaryMin: 22000, salaryMax: 38000,
      },
    ],
  },
  {
    name: 'งานการตลาดและอีคอมเมิร์ซ',
    function: 'การตลาดและอีคอมเมิร์ซ',
    jobs: [
      {
        title: 'Digital Marketing Specialist',
        description: 'รับสมัคร Digital Marketing Specialist วางแผนและดำเนินการแคมเปญโฆษณาออนไลน์ ดูแล SEO/SEM บริหาร Social Media ทำ Content Marketing วิเคราะห์ข้อมูลและรายงานผล',
        requirements: 'ปริญญาตรีการตลาดหรือที่เกี่ยวข้อง มีประสบการณ์ด้าน Digital Marketing อย่างน้อย 2 ปี มีความรู้ Google Ads, Facebook Ads',
        skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Google Analytics', 'Content Marketing'],
        salaryMin: 25000, salaryMax: 45000,
      },
      {
        title: 'E-commerce Manager',
        description: 'รับสมัคร E-commerce Manager บริหารจัดการร้านค้าออนไลน์บนแพลตฟอร์ม Lazada, Shopee, TikTok Shop วางกลยุทธ์การขาย ออกแบบหน้าร้าน จัดการโปรโมชั่น และวิเคราะห์ยอดขาย',
        requirements: 'ปริญญาตรีที่เกี่ยวข้อง มีประสบการณ์บริหาร E-commerce อย่างน้อย 2 ปี มีความรู้ Lazada/Shopee Seller Center',
        skills: ['Shopee', 'Lazada', 'TikTok Shop', 'การวิเคราะห์ข้อมูล', 'การตลาดออนไลน์'],
        salaryMin: 30000, salaryMax: 55000,
      },
      {
        title: 'Content Creator / Social Media',
        description: 'รับสมัคร Content Creator สร้างคอนเทนต์สำหรับ Social Media ทุกช่องทาง ถ่ายและตัดต่อวิดีโอ เขียน Caption ที่น่าสนใจ วางแผนคอนเทนต์รายเดือน และวิเคราะห์ประสิทธิภาพโพสต์',
        requirements: 'มีความคิดสร้างสรรค์ รู้จัก Trend บน Social Media ใช้งาน Adobe Premiere, Canva หรือ CapCut ได้',
        skills: ['Content Creation', 'Video Editing', 'Canva', 'Instagram', 'TikTok'],
        salaryMin: 20000, salaryMax: 38000,
      },
      {
        title: 'Performance Marketing Manager',
        description: 'รับสมัคร Performance Marketing Manager วางกลยุทธ์และบริหารแคมเปญ Paid Media บน Google, Meta, TikTok ควบคุม Budget ทำ A/B Testing วิเคราะห์ ROI และปรับปรุงประสิทธิภาพ',
        requirements: 'ปริญญาตรีที่เกี่ยวข้อง ประสบการณ์ 3 ปีขึ้นไปด้าน Paid Media ทักษะวิเคราะห์ข้อมูลแกร่ง',
        skills: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Data Analytics', 'A/B Testing'],
        salaryMin: 40000, salaryMax: 70000,
      },
      {
        title: 'SEO/SEM Specialist',
        description: 'รับสมัคร SEO/SEM Specialist วิเคราะห์ keyword ทำ On-page และ Off-page SEO บริหารแคมเปญ Google Search Ads ติดตามอันดับเว็บไซต์ และรายงานผลรายเดือน',
        requirements: 'ปริญญาตรีที่เกี่ยวข้อง มีประสบการณ์ SEO/SEM อย่างน้อย 2 ปี ใช้ Google Search Console, SEMrush หรือ Ahrefs ได้',
        skills: ['SEO', 'Google Ads', 'Google Analytics', 'SEMrush', 'Keyword Research'],
        salaryMin: 25000, salaryMax: 45000,
      },
    ],
  },
  {
    name: 'งาน Technology/IT และออกแบบ UX/UI',
    function: 'เทคโนโลยีสารสนเทศ',
    jobs: [
      {
        title: 'Full Stack Developer (React/Node.js)',
        description: 'รับสมัคร Full Stack Developer พัฒนา Web Application ทั้ง Frontend และ Backend ออกแบบ API เชื่อมต่อฐานข้อมูล ทำ Code Review และ Unit Testing เขียนเอกสาร Technical',
        requirements: 'ปริญญาตรีวิทยาการคอมพิวเตอร์หรือที่เกี่ยวข้อง ประสบการณ์ React/Node.js อย่างน้อย 2 ปี รู้จัก Git, Docker',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git'],
        salaryMin: 40000, salaryMax: 80000,
      },
      {
        title: 'UX/UI Designer',
        description: 'รับสมัคร UX/UI Designer ออกแบบประสบการณ์ผู้ใช้และ Interface สำหรับ Web และ Mobile App ทำ User Research, Wireframe, Prototype ทดสอบกับผู้ใช้ และส่งมอบ Design Specs ให้ Developer',
        requirements: 'ปริญญาตรีออกแบบหรือที่เกี่ยวข้อง ใช้ Figma คล่อง มีพอร์ตโฟลิโอ มีประสบการณ์ UX/UI อย่างน้อย 2 ปี',
        skills: ['Figma', 'UX Research', 'Prototyping', 'Design System', 'Adobe XD'],
        salaryMin: 35000, salaryMax: 70000,
      },
      {
        title: 'DevOps Engineer',
        description: 'รับสมัคร DevOps Engineer ดูแล CI/CD Pipeline บริหาร Cloud Infrastructure บน AWS/GCP ตั้งค่า Kubernetes, Docker ดูแล Monitoring และ Alerting และปรับปรุง Performance ระบบ',
        requirements: 'ปริญญาตรีวิทยาการคอมพิวเตอร์ ประสบการณ์ DevOps อย่างน้อย 3 ปี มีความรู้ AWS/GCP, Terraform, Kubernetes',
        skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'Monitoring'],
        salaryMin: 50000, salaryMax: 100000,
      },
      {
        title: 'Mobile Developer (iOS/Android)',
        description: 'รับสมัคร Mobile Developer พัฒนาแอปพลิเคชันมือถือทั้ง iOS และ Android โดยใช้ Flutter หรือ React Native ออกแบบ UI ตาม Mockup เชื่อมต่อ API และ Publish บน App Store',
        requirements: 'ปริญญาตรีวิทยาการคอมพิวเตอร์ ประสบการณ์ Flutter หรือ React Native อย่างน้อย 2 ปี มีแอปที่ publish แล้วจะพิจารณาเป็นพิเศษ',
        skills: ['Flutter', 'React Native', 'iOS', 'Android', 'REST API', 'Firebase'],
        salaryMin: 40000, salaryMax: 80000,
      },
      {
        title: 'Data Engineer',
        description: 'รับสมัคร Data Engineer สร้างและดูแล Data Pipeline เชื่อมต่อแหล่งข้อมูลหลายแหล่ง สร้าง Data Warehouse ทำ ETL Process และสนับสนุนทีม Data Science และ Business Intelligence',
        requirements: 'ปริญญาตรีวิทยาการคอมพิวเตอร์หรือสถิติ ประสบการณ์ Data Engineering อย่างน้อย 2 ปี รู้จัก Spark, Airflow, SQL',
        skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'BigQuery', 'dbt'],
        salaryMin: 45000, salaryMax: 90000,
      },
    ],
  },
  {
    name: 'งานบัญชี ธนาคารและประกันภัย',
    function: 'บัญชีและการเงิน',
    jobs: [
      {
        title: 'นักบัญชี (Accountant)',
        description: 'รับสมัครนักบัญชี รับผิดชอบการจัดทำบัญชีรายวัน บัญชีแยกประเภท จัดทำงบการเงิน ยื่นภาษี ปิดงบประจำเดือน ประสานงานกับสำนักงานบัญชีและสรรพากร',
        requirements: 'ปริญญาตรีบัญชี มีประสบการณ์ด้านบัญชีอย่างน้อย 1-2 ปี รู้จักโปรแกรมบัญชีและ MS Excel',
        skills: ['บัญชีการเงิน', 'TFRS', 'MS Excel', 'โปรแกรมบัญชี', 'ภาษีอากร'],
        salaryMin: 20000, salaryMax: 40000,
      },
      {
        title: 'เจ้าหน้าที่สินเชื่อธนาคาร',
        description: 'รับสมัครเจ้าหน้าที่สินเชื่อ วิเคราะห์ความสามารถในการชำระหนี้ของลูกค้า ตรวจสอบเอกสาร อนุมัติสินเชื่อตามวงเงินที่กำหนด ติดตามลูกหนี้ และรายงานพอร์ตสินเชื่อ',
        requirements: 'ปริญญาตรีการเงินหรือที่เกี่ยวข้อง มีทักษะวิเคราะห์ข้อมูลทางการเงิน มีความรู้ด้านสินเชื่อจะพิจารณาเป็นพิเศษ',
        skills: ['วิเคราะห์สินเชื่อ', 'งบการเงิน', 'MS Excel', 'การประเมินความเสี่ยง'],
        salaryMin: 22000, salaryMax: 40000,
      },
      {
        title: 'ผู้ตรวจสอบบัญชีภายใน (Internal Auditor)',
        description: 'รับสมัครผู้ตรวจสอบบัญชีภายใน ตรวจสอบระบบบัญชีและการควบคุมภายใน ประเมินความเสี่ยง จัดทำรายงานการตรวจสอบ และให้คำแนะนำการปรับปรุงกระบวนการ',
        requirements: 'ปริญญาตรีบัญชีหรือการเงิน มีประสบการณ์ตรวจสอบบัญชีอย่างน้อย 2 ปี มีใบ CPA หรือ CIA จะพิจารณาเป็นพิเศษ',
        skills: ['Internal Audit', 'COSO Framework', 'Risk Assessment', 'MS Excel', 'การรายงาน'],
        salaryMin: 30000, salaryMax: 55000,
      },
      {
        title: 'เจ้าหน้าที่ประกันภัย',
        description: 'รับสมัครเจ้าหน้าที่ประกันภัย ดูแลกรมธรรม์ประกันภัย ประมวลผลการเรียกร้อง ตรวจสอบเอกสาร ติดต่อประสานงานกับผู้เอาประกัน และจัดทำรายงาน',
        requirements: 'ปริญญาตรีประกันภัยหรือที่เกี่ยวข้อง มีความรู้ด้านประกันภัย ทำงานละเอียดรอบคอบ',
        skills: ['ประกันภัย', 'การเรียกร้องสินไหม', 'MS Office', 'การประเมินความเสี่ยง'],
        salaryMin: 18000, salaryMax: 35000,
      },
      {
        title: 'นักวิเคราะห์การเงิน (Financial Analyst)',
        description: 'รับสมัครนักวิเคราะห์การเงิน วิเคราะห์ข้อมูลทางการเงิน จัดทำรายงาน Financial Model ประมาณการงบประมาณ วิเคราะห์ผลตอบแทนการลงทุน และสนับสนุนการตัดสินใจเชิงกลยุทธ์',
        requirements: 'ปริญญาตรีการเงินหรือบัญชี ประสบการณ์วิเคราะห์การเงินอย่างน้อย 2 ปี Excel ขั้นสูง รู้จัก Power BI จะพิจารณาเป็นพิเศษ',
        skills: ['Financial Modeling', 'MS Excel', 'Power BI', 'การวิเคราะห์', 'งบการเงิน'],
        salaryMin: 35000, salaryMax: 65000,
      },
    ],
  },
  {
    name: 'งานจัดการเอกสาร (แอดมิน ธุรการ แปล ล่าม)',
    function: 'ธุรการและเอกสาร',
    jobs: [
      {
        title: 'เจ้าหน้าที่ธุรการ (Admin)',
        description: 'รับสมัครเจ้าหน้าที่ธุรการ จัดการเอกสาร จัดทำหนังสือโต้ตอบ ดูแลการจัดเก็บไฟล์ ประสานงานกับแผนกต่างๆ จัดซื้อวัสดุสำนักงาน และดูแลความเป็นระเบียบของสำนักงาน',
        requirements: 'ปริญญาตรีทุกสาขา MS Office คล่อง มีความละเอียดรอบคอบ ทำงานเป็นระเบียบ',
        skills: ['MS Office', 'การจัดเอกสาร', 'การประสานงาน', 'Email', 'การพิมพ์ดีด'],
        salaryMin: 16000, salaryMax: 26000,
      },
      {
        title: 'นักแปลภาษาอังกฤษ-ไทย',
        description: 'รับสมัครนักแปลภาษาอังกฤษ-ไทย แปลเอกสารทางธุรกิจ กฎหมาย เทคนิค และทั่วไป ตรวจทานความถูกต้องของการแปล และส่งมอบงานตรงเวลา',
        requirements: 'ปริญญาตรีภาษาอังกฤษหรือที่เกี่ยวข้อง มีทักษะแปลดีเยี่ยมทั้ง 2 ภาษา มีประสบการณ์แปลอย่างน้อย 1 ปี',
        skills: ['การแปลภาษา', 'ภาษาอังกฤษ', 'ภาษาไทย', 'MS Word', 'SDL Trados'],
        salaryMin: 25000, salaryMax: 45000,
      },
      {
        title: 'ล่ามภาษาญี่ปุ่น',
        description: 'รับสมัครล่ามภาษาญี่ปุ่น แปลภาษาญี่ปุ่น-ไทย ในการประชุม การเจรจาธุรกิจ และการอบรม แปลเอกสารทางธุรกิจและเทคนิค ประสานงานกับลูกค้าชาวญี่ปุ่น',
        requirements: 'ปริญญาตรีภาษาญี่ปุ่น สอบวัดระดับ JLPT N2 ขึ้นไป มีประสบการณ์เป็นล่ามหรือนักแปลจะพิจารณาเป็นพิเศษ',
        skills: ['ภาษาญี่ปุ่น', 'JLPT N2', 'การแปล', 'การล่าม', 'ภาษาอังกฤษ'],
        salaryMin: 35000, salaryMax: 65000,
      },
      {
        title: 'เจ้าหน้าที่จัดการเอกสารกฎหมาย',
        description: 'รับสมัครเจ้าหน้าที่จัดการเอกสารกฎหมาย จัดทำและตรวจสอบสัญญา ดูแลนิติกรรม จัดเก็บเอกสารทางกฎหมาย ติดต่อหน่วยงานราชการ และสนับสนุนทีมกฎหมาย',
        requirements: 'ปริญญาตรีนิติศาสตร์หรือที่เกี่ยวข้อง มีความรู้ด้านกฎหมายธุรกิจ ละเอียดรอบคอบ',
        skills: ['กฎหมายธุรกิจ', 'สัญญา', 'MS Word', 'การจัดเอกสาร', 'ภาษากฎหมาย'],
        salaryMin: 22000, salaryMax: 40000,
      },
      {
        title: 'Personal Assistant (PA)',
        description: 'รับสมัคร Personal Assistant สำหรับผู้บริหาร จัดตารางนัดหมาย ประสานงาน จัดทำรายงาน ดูแลการเดินทาง เตรียมเอกสารประชุม และงานธุรการทั่วไปของผู้บริหาร',
        requirements: 'ปริญญาตรีทุกสาขา ภาษาอังกฤษดีมาก บุคลิกดี ไหวพริบดี เก็บความลับได้ มีความรับผิดชอบสูง',
        skills: ['MS Office', 'ภาษาอังกฤษ', 'การประสานงาน', 'Calendar Management', 'ความรับผิดชอบ'],
        salaryMin: 25000, salaryMax: 45000,
      },
    ],
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBenefits(count = 4) {
  const shuffled = [...benefitPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateSlug(title, index) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\sก-๙เแโใไ-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${Date.now().toString(36)}-${index}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Looking up employer:', EMPLOYER_EMAIL);

  const user = await prisma.user.findUnique({
    where: { email: EMPLOYER_EMAIL },
    include: { companies: true },
  });

  if (!user) {
    throw new Error(`❌ ไม่พบผู้ใช้ ${EMPLOYER_EMAIL} กรุณาสมัครสมาชิกก่อน`);
  }

  if (user.role !== 'EMPLOYER') {
    throw new Error(`❌ ${EMPLOYER_EMAIL} ไม่ใช่ EMPLOYER (role: ${user.role})`);
  }

  if (!user.companies || user.companies.length === 0) {
    throw new Error(`❌ ไม่พบบริษัทของ ${EMPLOYER_EMAIL} กรุณาสร้างบริษัทก่อน`);
  }

  const company = user.companies[0];
  console.log(`✅ พบบริษัท: "${company.name}" (ID: ${company.id})`);
  console.log('🚀 กำลังสร้าง 100 งาน...\n');

  // Build 100 jobs by cycling through categories
  const jobsToCreate = [];
  let jobIndex = 0;

  // Each category has 5 templates — 9 categories × ~11 = 99, last needs extra
  // We'll cycle: each template appears ~2 times, total ~90 + extra 10
  while (jobsToCreate.length < 100) {
    for (const cat of categories) {
      for (const template of cat.jobs) {
        if (jobsToCreate.length >= 100) break;

        const province = rand(provinces);
        const district = rand(districts);
        const jobType = rand(jobTypes);
        const workModel = rand(workModels);
        const education = rand(educations);
        const workingDays = rand(workingDaysOptions);
        const startTime = rand(startTimes);
        const endTime = rand(endTimes);
        const transport = rand(transportations);
        const gender = rand(genders);
        const experience = randInt(0, 5);
        const ageMin = randInt(18, 25);
        const ageMax = randInt(30, 45);
        const positions = randInt(1, 5);
        const benefits = randBenefits(randInt(3, 6));
        const contactNames = ['คุณสมชาย ใจดี', 'คุณนภา รักงาน', 'คุณวิชัย มั่นคง', 'HR Department', 'คุณสุภา พรมดี'];
        const contactName = rand(contactNames);
        const contactPhone = `0${randInt(6, 9)}${randInt(0, 9)}-${randInt(100, 999)}-${randInt(1000, 9999)}`;

        // Slightly vary the title to avoid slug collisions
        const titleVariants = ['', ' (Part-time)', ' (อาวุโส)', ' (จูเนียร์)', ' (ประจำสำนักงาน)', ' (ประจำสาขา)'];
        const titleSuffix = jobsToCreate.length > 44 ? rand(titleVariants) : '';
        const title = template.title + titleSuffix;

        const slug = generateSlug(title, jobIndex++);

        jobsToCreate.push({
          companyId: company.id,
          title,
          slug,
          description: template.description,
          requirements: template.requirements,
          benefits,
          salaryMin: template.salaryMin,
          salaryMax: template.salaryMax,
          salaryVisible: Math.random() > 0.2, // 80% visible
          jobType,
          workModel,
          locationProvince: province,
          locationDistrict: district,
          companyAddress: `${randInt(1, 999)} ถนน${rand(['สุขุมวิท', 'พหลโยธิน', 'รามคำแหง', 'ลาดพร้าว', 'บางนา', 'สาทร'])} แขวง${district} เขต${district} ${province}`,
          requiredSkills: template.skills,
          positions,
          workingDays,
          startTime,
          endTime,
          canOnlineInterview: Math.random() > 0.5,
          welcomeRecentGrads: Math.random() > 0.5,
          education,
          category: cat.name,
          jobFunction: cat.function,
          qualificationGender: gender,
          qualificationAgeMin: ageMin,
          qualificationAgeMax: ageMax,
          qualificationExperience: experience,
          contactName,
          contactPhone,
          transportation: transport,
          status: 'ACTIVE',
          publishedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        });
      }
      if (jobsToCreate.length >= 100) break;
    }
  }

  // Insert in batches of 20
  const BATCH = 20;
  let created = 0;
  for (let i = 0; i < jobsToCreate.length; i += BATCH) {
    const batch = jobsToCreate.slice(i, i + BATCH);
    await prisma.job.createMany({ data: batch });
    created += batch.length;
    console.log(`  ✅ สร้างงานแล้ว ${created}/${jobsToCreate.length}`);
  }

  console.log(`\n🎉 สร้างงานสำเร็จ ${created} ตำแหน่ง สำหรับบริษัท "${company.name}"`);
  console.log('📊 สรุปหมวดหมู่:');
  const catCount = {};
  jobsToCreate.forEach((j) => {
    catCount[j.category] = (catCount[j.category] || 0) + 1;
  });
  Object.entries(catCount).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} งาน`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
