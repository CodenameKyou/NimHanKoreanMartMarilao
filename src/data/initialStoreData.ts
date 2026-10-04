import heroFlatlayImg from '../assets/images/hero_cute_korean_snacks_flatlay_1790950015911.jpg';
import buldakImg from '../assets/images/product_buldak_carbonara_1790947384775.jpg';
import shinImg from '../assets/images/product_shin_ramyun_1790947398019.jpg';
import gochujangImg from '../assets/images/product_gochujang_paste_1790947410166.jpg';
import bananaMilkImg from '../assets/images/product_banana_milk_1790947421876.jpg';
import tteokbokkiImg from '../assets/images/product_tteokbokki_snack_1790947433810.jpg';

export const HERO_IMAGE_URL = heroFlatlayImg;
export const NOODLE_HERO_BG = buldakImg;
export { buldakImg, shinImg, gochujangImg, bananaMilkImg, tteokbokkiImg };

export type ProductCategory = 'Noodles' | 'Snacks' | 'Sauces' | 'Drinks' | 'Frozen';

export interface Product {
  id: number;
  name: string;
  koreanName: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  promoLabel?: string;
  stock: number;
  lowStockThreshold: number;
  description: string;
  image: string;
  status: 'AVAILABLE' | 'SOLD OUT';
  isBestSeller: boolean;
  isNew: boolean;
  expiryDate: string;
  aisleLocation?: string;
  spiceLevel?: 'None' | 'Mild' | 'Medium' | 'Hot' | '2x Extreme';
  pairingTip?: string;
}

export interface Employee {
  id: number;
  employeeId: string;
  fullName: string;
  passwordPlainForDemo: string;
  position: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface EmployeeSalary {
  employeeId: string;
  monthlyBasePhp: number;
  allowancePhp: number;
  overtimePhp: number;
  lastPayoutDate: string;
  bankDetails: string;
}

export interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  changeAmount: number;
  newStock: number;
  note: string;
  userType: 'ADMIN' | 'EMPLOYEE';
  userId: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: 'ON TIME' | 'LATE' | 'COMPLETED';
}

export interface ShiftSchedule {
  id: number;
  employeeId: string;
  dayOfWeek: string;
  shiftTime: string;
  station: string;
}

export interface StaffRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  type: 'RESTOCK' | 'LEAVE' | 'DAMAGED_ITEM';
  subject: string;
  details: string;
  status: 'PENDING' | 'APPROVED' | 'RESOLVED';
  createdAt: string;
}

export interface GuidelineSection {
  id: string;
  title: string;
  koreanSubtitle: string;
  rules: string[];
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  customerName: string;
  roleOrBarangay: string;
  comment: string;
  productPurchased: string;
  date: string;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface CctvCamera {
  id: number;
  name: string;
  locationZone: string;
  ipAddress: string;
  port: number;
  username: string;
  passwordEncrypted: string;
  rtspPath: string;
  status: 'ONLINE' | 'OFFLINE';
  fps: number;
  resolution: string;
}

export interface ActivityLog {
  id: number;
  actorRole: 'ADMIN' | 'EMPLOYEE' | 'SYSTEM';
  actorId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StoreSettings {
  navbarBrandName: string;
  storeName: string;
  tagline: string;
  announcementBanner: string;
  announcementActive: boolean;
  visitKicker: string;
  visitHeading: string;
  storeHours: string;
  branchAddress: string;
  phone: string;
  email: string;
  landmarkDirections: string;
  facebookUrl: string;
  messengerUrl: string;
  aboutStory: string;
  mission: string;
  vision: string;
}

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  navbarBrandName: 'Nim Han Korean Mart',
  storeName: 'NIM HAN KOREAN MART Marilao Branch',
  tagline: 'Authentic Korean Flavors, Right in Your Neighborhood',
  announcementBanner: '환영합니다! Walk-In Weekend Promo: Buy 4 Samyang Buldak Packs & Get Special Bundle Discount — Fresh Frozen Dumplings Now On Shelf in Marilao!',
  announcementActive: true,
  visitKicker: '매장 안내 · Visit Our Store',
  visitHeading: 'NIM HAN KOREAN MART Marilao Branch',
  storeHours: 'Daily: 8:00 AM – 10:00 PM (Mon – Sun, including Holidays)',
  branchAddress: 'McArthur Highway, Brgy. Ibayo, Marilao, Bulacan 3019, Philippines',
  phone: '+63 (917) 842-9021 / (044) 815-3390',
  email: 'marilao@nimhankoreanmart.ph',
  landmarkDirections: 'Landmark: 200 meters north of SM City Marilao along McArthur Highway. Walk-in shoppers welcome daily — convenient storefront parking available.',
  facebookUrl: 'https://facebook.com/NimHanKoreanMartMarilao',
  messengerUrl: 'https://m.me/NimHanKoreanMartMarilao',
  aboutStory:
    'Founded in 2020 during a time when Bulacan families craved authentic Korean comfort food close to home, NIM HAN KOREAN MART Marilao Branch started as a humble neighborhood pantry along McArthur Highway. Today, we directly curate over 350+ authentic South Korean staples—from fiery Samyang Buldak noodles and aged Sunchang Gochujang to chilled Binggrae milk and street-style Tteokbokki kits—bringing Seoul convenience culture right to Marilao for walk-in shoppers.',
  mission:
    'To provide Marilao and nearby Bulacan communities with 100% authentic, freshly stocked, and fairly priced Korean groceries delivered with warm Filipino-Korean in-store hospitality.',
  vision:
    'To be Bulacan’s most loved walk-in neighborhood Korean grocery destination, recognized for spotless food safety, real-time shelf transparency, and genuine community connection.',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Samyang Buldak Carbonara Ramen (130g)',
    koreanName: '까르보 불닭볶음면',
    category: 'Noodles',
    price: 85,
    originalPrice: 95,
    promoLabel: 'Walk-In Promo',
    stock: 48,
    lowStockThreshold: 15,
    description: 'Chewy stir-fried noodles tossed in Samyang’s signature fiery Buldak sauce balanced with rich, creamy mozzarella carbonara powder.',
    image: buldakImg,
    status: 'AVAILABLE',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2027-04-15',
    aisleLocation: 'Aisle 1 · Ramen Wall (Top Shelf)',
    spiceLevel: 'Hot',
    pairingTip: 'Best paired with Binggrae Banana Milk & shredded mozzarella cheese.',
  },
  {
    id: 2,
    name: 'Nongshim Shin Ramyun Gourmet Spicy (120g)',
    koreanName: '농심 신라면',
    category: 'Noodles',
    price: 68,
    stock: 34,
    lowStockThreshold: 12,
    description: 'South Korea’s #1 iconic beef and shiitake mushroom spicy noodle soup with springy noodles and aromatic chili broth.',
    image: shinImg,
    status: 'AVAILABLE',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2027-03-20',
    aisleLocation: 'Aisle 1 · Ramen Wall (Center)',
    spiceLevel: 'Medium',
    pairingTip: 'Top with a soft-boiled egg, scallions, and a slice of American cheese.',
  },
  {
    id: 3,
    name: 'Chungjungone Sunchang Gochujang Paste (500g)',
    koreanName: '순창 태양초 고추장',
    category: 'Sauces',
    price: 195,
    originalPrice: 220,
    promoLabel: '11% Off',
    stock: 8,
    lowStockThreshold: 10,
    description: 'Sun-dried red chili paste fermented using traditional Sunchang artisanal methods. Essential for Bibimbap, Tteokbokki, and K-BBQ marinades.',
    image: gochujangImg,
    status: 'AVAILABLE',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2026-10-18',
    aisleLocation: 'Aisle 3 · Sauces & Pantry',
    spiceLevel: 'Medium',
    pairingTip: 'Mix with sesame oil and honey for an instant Bibimbap sauce.',
  },
  {
    id: 4,
    name: 'Binggrae Banana Flavored Milk (200ml)',
    koreanName: '빙그레 바나나맛 우유',
    category: 'Drinks',
    price: 65,
    stock: 52,
    lowStockThreshold: 15,
    description: 'Korea’s beloved silky banana milk drink. Best enjoyed ice-cold alongside spicy Buldak noodles to cool the palate.',
    image: bananaMilkImg,
    status: 'AVAILABLE',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2026-10-12',
    aisleLocation: 'Chiller 1 · Cold Drinks Bay',
    spiceLevel: 'None',
    pairingTip: 'Grab straight from our upright chiller to cool down after spicy ramen!',
  },
  {
    id: 5,
    name: 'Dongwon Street Tteokbokki Rice Cake Kit (400g)',
    koreanName: '동원 국물떡볶이',
    category: 'Snacks',
    price: 175,
    stock: 22,
    lowStockThreshold: 8,
    description: 'Freshly vacuum-sealed chewy cylinder rice cakes paired with authentic Myeongdong sweet-spicy anchovy kelp sauce packet.',
    image: tteokbokkiImg,
    status: 'AVAILABLE',
    isBestSeller: false,
    isNew: true,
    expiryDate: '2027-01-30',
    aisleLocation: 'Aisle 2 · Street Food & Rice Cakes',
    spiceLevel: 'Medium',
    pairingTip: 'Simmer for 4 minutes with fish cakes and boiled eggs.',
  },
  {
    id: 6,
    name: 'Samyang 2x Spicy Buldak Hot Chicken Ramen',
    koreanName: '핵불닭볶음면 2x',
    category: 'Noodles',
    price: 88,
    stock: 0,
    lowStockThreshold: 10,
    description: 'Double the Scoville heat (8,808 SHU) for true spice challengers. Roasted sesame and crispy seaweed flakes included.',
    image: buldakImg,
    status: 'SOLD OUT',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2027-05-10',
    aisleLocation: 'Aisle 1 · Ramen Wall (Top Shelf)',
    spiceLevel: '2x Extreme',
    pairingTip: 'Keep 2 bottles of cold Binggrae Banana Milk ready!',
  },
  {
    id: 7,
    name: 'Haitai Honey Butter Potato Chips (60g)',
    koreanName: '해태 허니버터칩',
    category: 'Snacks',
    price: 92,
    stock: 19,
    lowStockThreshold: 8,
    description: 'Crispy thin-cut potato chips glazed with French gourmet butter and sweet domestic acacia honey.',
    image: tteokbokkiImg,
    status: 'AVAILABLE',
    isBestSeller: false,
    isNew: true,
    expiryDate: '2027-02-14',
    aisleLocation: 'Aisle 2 · Korean Chips & Seaweed',
    spiceLevel: 'None',
    pairingTip: 'Perfect sweet-savory movie snack with Chilsung Cider.',
  },
  {
    id: 8,
    name: 'Bibigo Mandu Pork & Vegetable Dumplings (1kg)',
    koreanName: '비비고 왕교자 만두',
    category: 'Frozen',
    price: 380,
    originalPrice: 410,
    promoLabel: 'Family Pack',
    stock: 6,
    lowStockThreshold: 10,
    description: 'Generously filled Korean king-sized dumplings with diced pork, glass noodles, tofu, garlic chives, and cabbage.',
    image: shinImg,
    status: 'AVAILABLE',
    isBestSeller: true,
    isNew: false,
    expiryDate: '2026-12-05',
    aisleLocation: 'Freezer Chest 2 · Frozen Dumplings',
    spiceLevel: 'None',
    pairingTip: 'Pan-fry for 5 minutes until golden crispy or drop into Shin Ramyun broth.',
  },
  {
    id: 9,
    name: 'Lotte Chilsung Cider & Milkis Variety Pack',
    koreanName: '롯데 칠성사이다 & 밀키스',
    category: 'Drinks',
    price: 55,
    stock: 0,
    lowStockThreshold: 12,
    description: 'Refreshing creamy carbonated yogurt soda and crisp lemon-lime Korean sparkling water.',
    image: bananaMilkImg,
    status: 'SOLD OUT',
    isBestSeller: false,
    isNew: false,
    expiryDate: '2027-06-01',
    aisleLocation: 'Chiller 2 · Sparkling Drinks',
    spiceLevel: 'None',
    pairingTip: 'Pour over ice for a classic Korean BBQ refresher.',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    employeeId: 'EMP-2020-01',
    fullName: 'Kristine Joy Dela Cruz',
    passwordPlainForDemo: 'nimhan123',
    position: 'Senior Store Cashier & Inventory Lead',
    phone: '+63 917 445 8821',
    email: 'kristine.delacruz@nimhan.ph',
    status: 'ACTIVE',
    createdAt: '2021-03-14',
  },
  {
    id: 2,
    employeeId: 'EMP-2022-04',
    fullName: 'Mark Angelo Villanueva',
    passwordPlainForDemo: 'marilao2026',
    position: 'Stock & Cold-Chain Merchandiser',
    phone: '+63 918 220 9104',
    email: 'mark.villanueva@nimhan.ph',
    status: 'ACTIVE',
    createdAt: '2022-08-01',
  },
  {
    id: 3,
    employeeId: 'EMP-2024-07',
    fullName: 'Hannah Mae Soriano',
    passwordPlainForDemo: 'hannah789',
    position: 'Customer Experience & Floor Associate',
    phone: '+63 927 651 3349',
    email: 'hannah.soriano@nimhan.ph',
    status: 'ACTIVE',
    createdAt: '2024-01-19',
  },
];

// STRICT RULE: Visible ONLY to Admin, never sent or rendered in Employee Portal
export const INITIAL_SALARIES: EmployeeSalary[] = [
  {
    employeeId: 'EMP-2020-01',
    monthlyBasePhp: 19500,
    allowancePhp: 2000,
    overtimePhp: 1450,
    lastPayoutDate: '2026-09-30',
    bankDetails: 'BDO Unibank •••• 4821',
  },
  {
    employeeId: 'EMP-2022-04',
    monthlyBasePhp: 16800,
    allowancePhp: 1500,
    overtimePhp: 820,
    lastPayoutDate: '2026-09-30',
    bankDetails: 'BPI Family •••• 9012',
  },
  {
    employeeId: 'EMP-2024-07',
    monthlyBasePhp: 15500,
    allowancePhp: 1500,
    overtimePhp: 0,
    lastPayoutDate: '2026-09-30',
    bankDetails: 'GCash Payroll •••• 3349',
  },
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 101,
    productId: 1,
    productName: 'Samyang Buldak Carbonara Ramen (130g)',
    changeAmount: +24,
    newStock: 48,
    note: 'Restocked 1 master box from Manila cold/dry distributor',
    userType: 'EMPLOYEE',
    userId: 'EMP-2022-04',
    createdAt: '2026-10-02 08:15 AM',
  },
  {
    id: 102,
    productId: 6,
    productName: 'Samyang 2x Spicy Buldak Hot Chicken Ramen',
    changeAmount: -5,
    newStock: 0,
    note: 'Sold final 5 packs to walk-in customer; auto-marked SOLD OUT',
    userType: 'EMPLOYEE',
    userId: 'EMP-2020-01',
    createdAt: '2026-10-02 09:42 AM',
  },
  {
    id: 103,
    productId: 3,
    productName: 'Chungjungone Sunchang Gochujang Paste (500g)',
    changeAmount: -2,
    newStock: 8,
    note: 'Batch nearing October 18 expiry flagged for 11% promo display',
    userType: 'ADMIN',
    userId: 'ADMIN-MASTER',
    createdAt: '2026-10-01 05:30 PM',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 1,
    employeeId: 'EMP-2020-01',
    employeeName: 'Kristine Joy Dela Cruz',
    date: '2026-10-02',
    clockIn: '07:52 AM',
    clockOut: null,
    status: 'ON TIME',
  },
  {
    id: 2,
    employeeId: 'EMP-2022-04',
    employeeName: 'Mark Angelo Villanueva',
    date: '2026-10-02',
    clockIn: '07:58 AM',
    clockOut: null,
    status: 'ON TIME',
  },
  {
    id: 3,
    employeeId: 'EMP-2020-01',
    employeeName: 'Kristine Joy Dela Cruz',
    date: '2026-10-01',
    clockIn: '07:55 AM',
    clockOut: '05:04 PM',
    status: 'COMPLETED',
  },
  {
    id: 4,
    employeeId: 'EMP-2024-07',
    employeeName: 'Hannah Mae Soriano',
    date: '2026-10-01',
    clockIn: '01:02 PM',
    clockOut: '10:05 PM',
    status: 'COMPLETED',
  },
];

export const INITIAL_SCHEDULES: ShiftSchedule[] = [
  { id: 1, employeeId: 'EMP-2020-01', dayOfWeek: 'Monday – Friday', shiftTime: '08:00 AM – 05:00 PM', station: 'POS Counter 1 & Vault' },
  { id: 2, employeeId: 'EMP-2020-01', dayOfWeek: 'Saturday', shiftTime: '09:00 AM – 06:00 PM', station: 'POS Counter 1 & Audit' },
  { id: 3, employeeId: 'EMP-2022-04', dayOfWeek: 'Monday – Saturday', shiftTime: '08:00 AM – 05:00 PM', station: 'Receiving Bay & Freezers' },
  { id: 4, employeeId: 'EMP-2024-07', dayOfWeek: 'Tuesday – Sunday', shiftTime: '01:00 PM – 10:00 PM', station: 'Aisle Merchandising & Closing POS' },
];

export const INITIAL_REQUESTS: StaffRequest[] = [
  {
    id: 1,
    employeeId: 'EMP-2022-04',
    employeeName: 'Mark Angelo Villanueva',
    type: 'RESTOCK',
    subject: 'Urgent Restock: Samyang 2x Spicy & Lotte Milkis',
    details: 'Both SKUs reached 0 units this morning. High weekend demand expected from Marilao students.',
    status: 'PENDING',
    createdAt: '2026-10-02 09:50 AM',
  },
  {
    id: 2,
    employeeId: 'EMP-2020-01',
    employeeName: 'Kristine Joy Dela Cruz',
    type: 'LEAVE',
    subject: '1-Day Personal Leave Request (Oct 14)',
    details: 'Requesting scheduled leave for family medical appointment in Malolos. Hannah agreed to cover morning POS.',
    status: 'APPROVED',
    createdAt: '2026-09-29 04:15 PM',
  },
];

// ===== [EDIT BRANCH GUIDELINES HERE] =====
export const INITIAL_GUIDELINES: GuidelineSection[] = [
  {
    id: 'dress-code',
    title: '01. Dress Code & Personal Hygiene',
    koreanSubtitle: '복장 및 위생 기준',
    updatedAt: '2026-09-15',
    rules: [
      'Wear the official NIM HAN black collared polo or red apron with your nametag visible at all times.',
      'Closed-toe non-slip shoes are mandatory on the sales floor and inside the stockroom.',
      'Hair longer than shoulder length must be neatly tied back, especially when handling open freezer chests or Tteokbokki bars.',
    ],
  },
  {
    id: 'customer-service',
    title: '02. Korean-Filipino Hospitality Standards',
    koreanSubtitle: '고객 응대 수칙',
    updatedAt: '2026-09-15',
    rules: [
      'Greet every entering customer warmly with "Annyeonghaseyo! Welcome to Nim Han Korean Mart!"',
      'Assist customers looking for spice levels (e.g., guide first-timers between Carbonara Buldak vs 2x Spicy).',
      'Always offer a carry basket when a customer is holding 3 or more items.',
    ],
  },
  {
    id: 'food-safety',
    title: '03. Cold-Chain & Expiry Date Control (FEFO)',
    koreanSubtitle: '식품 안전 및 유통기한 관리',
    updatedAt: '2026-09-28',
    rules: [
      'Strictly follow FEFO (First Expired, First Out) when shelving ramen packs, Binggrae milk, and kimchi.',
      'Check upright chiller temperatures (2°C to 4°C) and Mandu chest freezers (-18°C) at 8:00 AM and 4:00 PM daily.',
      'Flag any item within 21 days of expiry in the Employee Inventory Portal so Admin can activate Clearance Promos.',
    ],
  },
  {
    id: 'cash-handling',
    title: '04. POS & Cash Handling Protocol',
    koreanSubtitle: '현금 및 결제 관리',
    updatedAt: '2026-09-10',
    rules: [
      'Count opening petty cash float (₱5,000.00) in view of Counter CCTV Cam #01 before signing the shift log.',
      'Verify GCash and Maya reference numbers on the store merchant phone before releasing goods.',
      'Never leave the cash drawer unlocked when stepping away from the POS terminal.',
    ],
  },
  {
    id: 'opening-closing',
    title: '05. Opening & Closing Procedures',
    koreanSubtitle: '개점 및 폐점 절차',
    updatedAt: '2026-09-20',
    rules: [
      'Opening (7:45 AM): Disarm roller shutter, power on signage & air-conditioning, inspect freezer thermometers, sanitize counters.',
      'Closing (10:00 PM): Lock main glass doors, reconcile POS X/Z reading, ensure kitchen/water heaters are off, NEVER turn off freezer breakers or CCTV NVR.',
    ],
  },
  {
    id: 'attendance-emergency',
    title: '06. Attendance & Emergency Protocol',
    koreanSubtitle: '근태 및 비상 대처 요령',
    updatedAt: '2026-09-20',
    rules: [
      'Clock in via the Employee Portal at least 5 minutes prior to your shift. Notify Admin 4 hours ahead for emergencies.',
      'In case of power outage in Marilao, keep all chest freezers closed to preserve thermal insulation and switch the CCTV UPS backup check.',
      'Emergency Hotlines: Marilao Fire Station (044) 711-1234 | Marilao PNP (044) 248-8510 | Branch Admin Direct Line.',
    ],
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    customerName: 'Clarisse Santos-Reyes',
    roleOrBarangay: 'Regular Shopper · Brgy. Poblacion II, Marilao',
    comment: 'Before Nim Han opened in Marilao, we had to drive all the way to Quezon City just to buy authentic Sunchang Gochujang and Bibigo Mandu. Now I check their website flashcards before walking over—100% accurate stock updates!',
    productPurchased: 'Samyang Buldak Carbonara & Bibigo Mandu',
    date: 'September 2026',
  },
  {
    id: 2,
    customerName: 'Chef Marco Evangelista',
    roleOrBarangay: 'Home K-BBQ Caterer · Loma de Gato, Marilao',
    comment: 'Their cold-chain storage is spotless. Every pack of fish cake, mozzarella rice cake, and Binggrae milk is fresh with clear expiry dates. Our go-to supplier for weekend samgyupsal nights.',
    productPurchased: 'Chungjungone Gochujang & Tteokbokki Kit',
    date: 'September 2026',
  },
  {
    id: 3,
    customerName: 'Jisoo Kim & Paolo Mendoza',
    roleOrBarangay: 'Residents · Heritage Homes, Marilao',
    comment: 'Super friendly staff who greet you with Annyeonghaseyo and genuine smiles. Prices are PHP 15–25 lower per pack compared to mall supermarkets.',
    productPurchased: 'Shin Ramyun & Binggrae Banana Milk',
    date: 'October 2026',
  },
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 1,
    fullName: 'Rica Mae Bautista',
    phone: '0917-552-1920',
    email: 'ricamae.b@gmail.com',
    message: 'Annyeong! Do you accept bulk pre-orders for 3 boxes of Samyang Carbonara for our school event in St. Michael Marilao next Friday?',
    createdAt: '2026-10-02 10:12 AM',
    isRead: false,
  },
  {
    id: 2,
    fullName: 'Kevin Tan',
    phone: '0928-310-4481',
    email: 'kevintan.bulacan@yahoo.com',
    message: 'Just wanted to ask when the 2x Spicy Buldak will be back in stock. Signed up for the restock notification too. Thanks!',
    createdAt: '2026-10-01 07:45 PM',
    isRead: true,
  },
];

// ===== [CCTV CAMERA IP ADDRESS SETTINGS HERE] =====
export const INITIAL_CAMERAS: CctvCamera[] = [
  {
    id: 1,
    name: 'CAM-01: POS & Cashier Counter',
    locationZone: 'Front Register & Entrance',
    ipAddress: '192.168.1.101',
    port: 554,
    username: 'nimhan_rtsp',
    passwordEncrypted: 'AES256:9f8e2a1b4c7d...e391',
    rtspPath: '/Streaming/Channels/101',
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080 (1080p)',
  },
  {
    id: 2,
    name: 'CAM-02: Ramen & Snack Aisles',
    locationZone: 'Center Gondola Shelves 1–4',
    ipAddress: '192.168.1.102',
    port: 554,
    username: 'nimhan_rtsp',
    passwordEncrypted: 'AES256:4b2c7d8e1a9f...c012',
    rtspPath: '/Streaming/Channels/101',
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080 (1080p)',
  },
  {
    id: 3,
    name: 'CAM-03: Cold-Chain & Freezers',
    locationZone: 'Rear Beverage & Mandu Section',
    ipAddress: '192.168.1.103',
    port: 554,
    username: 'nimhan_rtsp',
    passwordEncrypted: 'AES256:7d1e5a9c3b8f...a449',
    rtspPath: '/Streaming/Channels/101',
    status: 'ONLINE',
    fps: 25,
    resolution: '1920x1080 (1080p)',
  },
  {
    id: 4,
    name: 'CAM-04: Stockroom & Delivery Bay',
    locationZone: 'Backdoor Inventory Storage',
    ipAddress: '192.168.1.104',
    port: 554,
    username: 'nimhan_rtsp',
    passwordEncrypted: 'AES256:2a9c4e8f1b6d...f803',
    rtspPath: '/h264Preview_01_main',
    status: 'OFFLINE',
    fps: 0,
    resolution: '1280x720 (720p)',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 501,
    actorRole: 'EMPLOYEE',
    actorId: 'EMP-2020-01',
    action: 'STOCK_ZERO_AUTO_SOLDOUT',
    details: 'Updated Samyang 2x Spicy Buldak stock to 0 -> Public status automatically set to SOLD OUT.',
    timestamp: '2026-10-02 09:42:11 AM',
  },
  {
    id: 502,
    actorRole: 'EMPLOYEE',
    actorId: 'EMP-2022-04',
    action: 'INVENTORY_STOCK_IN',
    details: 'Added +24 units to Samyang Buldak Carbonara Ramen (New Stock: 48).',
    timestamp: '2026-10-02 08:15:04 AM',
  },
  {
    id: 503,
    actorRole: 'EMPLOYEE',
    actorId: 'EMP-2020-01',
    action: 'ATTENDANCE_CLOCK_IN',
    details: 'Kristine Joy Dela Cruz clocked in at 07:52 AM (ON TIME).',
    timestamp: '2026-10-02 07:52:00 AM',
  },
  {
    id: 504,
    actorRole: 'ADMIN',
    actorId: 'ADMIN-MASTER',
    action: 'CCTV_STREAM_HANDSHAKE',
    details: 'Issued signed JWT token for Node.js RTSP-to-WebSocket relay (3 cameras online).',
    timestamp: '2026-10-01 09:10:28 PM',
  },
];
