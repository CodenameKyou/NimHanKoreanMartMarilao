import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Video,
  FileEdit,
  ClipboardList,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Camera,
  Maximize2,
  ShieldAlert,
  Download,
  Sun,
  Moon,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  Search,
  Filter,
  Shield,
  User,
  Cpu,
  Sparkles,
  Clock,
  Grid,
  List,
  AlertCircle,
} from 'lucide-react';
import { NimHanLogo } from './NimHanLogo';
import {
  Product,
  ProductCategory,
  Employee,
  EmployeeSalary,
  InventoryLog,
  AttendanceRecord,
  StaffRequest,
  GuidelineSection,
  Testimonial,
  ContactMessage,
  CctvCamera,
  ActivityLog,
  StoreSettings,
} from '../data/initialStoreData';

interface AdminPortalProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  salaries: EmployeeSalary[];
  setSalaries: React.Dispatch<React.SetStateAction<EmployeeSalary[]>>;
  inventoryLogs: InventoryLog[];
  setInventoryLogs: React.Dispatch<React.SetStateAction<InventoryLog[]>>;
  attendance: AttendanceRecord[];
  requests: StaffRequest[];
  setRequests: React.Dispatch<React.SetStateAction<StaffRequest[]>>;
  guidelines: GuidelineSection[];
  setGuidelines: React.Dispatch<React.SetStateAction<GuidelineSection[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  cameras: CctvCamera[];
  setCameras: React.Dispatch<React.SetStateAction<CctvCamera[]>>;
  activityLogs: ActivityLog[];
  appendLog: (actorRole: 'ADMIN' | 'EMPLOYEE' | 'SYSTEM', actorId: string, action: string, details: string) => void;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  onReturnToPublic: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'employees'
  | 'cctv'
  | 'content'
  | 'logs'
  | 'extras';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  setProducts,
  employees,
  setEmployees,
  salaries,
  setSalaries,
  inventoryLogs,
  setInventoryLogs,
  attendance,
  requests,
  setRequests,
  guidelines,
  setGuidelines,
  testimonials,
  setTestimonials,
  messages,
  setMessages,
  cameras,
  setCameras,
  activityLogs,
  appendLog,
  storeSettings,
  setStoreSettings,
  onReturnToPublic,
}) => {
  // Authentication & Brute-Force Protection State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordHashDemo, setAdminPasswordHashDemo] = useState('NimHanAdmin2026!');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [loginError, setLoginError] = useState('');

  // Portal UI State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(900); // 15 mins auto-logout

  // Product Form & Photo Picker State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'preset' | 'url'>('preset');
  const [prodForm, setProdForm] = useState({
    name: '',
    koreanName: '',
    category: 'Noodles' as ProductCategory,
    price: 85,
    stock: 20,
    lowStockThreshold: 10,
    description: '',
    image: products[0]?.image || '',
    isBestSeller: false,
    isNew: true,
    expiryDate: '2027-03-15',
  });

  // Product Flashcard Management Filters & Instant Toast
  const [flashcardSearch, setFlashcardSearch] = useState('');
  const [flashcardCategory, setFlashcardCategory] = useState<string>('All');
  const [flashcardStatusFilter, setFlashcardStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD OUT'>('ALL');
  const [flashcardViewMode, setFlashcardViewMode] = useState<'cards' | 'table'>('cards');
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // System Activity / Audit Log Search & Role Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE' | 'SYSTEM'>('ALL');

  // Inventory Stock Adjustment State
  const [selectedProdIdForStock, setSelectedProdIdForStock] = useState<number>(products[0]?.id || 1);
  const [stockDelta, setStockDelta] = useState<number>(12);
  const [stockNote, setStockNote] = useState<string>('Restocked from Manila warehouse');

  // Employee Form State
  const [newEmpForm, setNewEmpForm] = useState({
    employeeId: 'EMP-2026-09',
    fullName: '',
    passwordPlainForDemo: 'nimhan2026',
    position: 'Store Associate & Cashier',
    phone: '+63 917 ',
    email: '',
    monthlyBasePhp: 16000,
    allowancePhp: 1500,
  });

  // CCTV State
  const [simulateNonAdmin403, setSimulateNonAdmin403] = useState(false);
  const [fullscreenCamId, setFullscreenCamId] = useState<number | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [camForm, setCamForm] = useState({
    name: 'CAM-05: Side Parking & Delivery',
    locationZone: 'Exterior Side Gate',
    ipAddress: '192.168.1.105',
    port: 554,
    username: 'nimhan_rtsp',
    passwordPlain: '',
    rtspPath: '/Streaming/Channels/101',
  });
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // Admin Password Change State
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passSavedNotice, setPassSavedNotice] = useState(false);

  // Auto-logout inactivity countdown when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const resetTimer = () => setInactivitySecondsLeft(900);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    const interval = setInterval(() => {
      setInactivitySecondsLeft((prev) => {
        if (prev <= 1) {
          setIsAuthenticated(false);
          appendLog('SYSTEM', 'AUTO-LOGOUT', 'SESSION_TIMEOUT', 'Admin session auto-logged out due to inactivity.');
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearInterval(interval);
    };
  }, [isAuthenticated, appendLog]);

  // Live CCTV Canvas Renderer (Simulates FFmpeg RTSP -> WebSocket MJPEG frames)
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'cctv' || simulateNonAdmin403) return;
    let animFrameId: number;
    let tick = 0;

    const renderFeeds = () => {
      tick++;
      const nowStr = new Date().toLocaleTimeString('en-PH', { hour12: false });
      const dateStr = new Date().toISOString().slice(0, 10);

      cameras.forEach((cam, idx) => {
        const canvas = canvasRefs.current[cam.id];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        if (cam.status === 'OFFLINE') {
          ctx.fillStyle = '#090D16';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#EF4444';
          ctx.font = '600 13px "JetBrains Mono", monospace';
          ctx.fillText('RTSP SIGNAL LOST — RECONNECTING...', 24, h / 2 - 6);
          ctx.fillStyle = '#64748B';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText(`rtsp://${cam.username}:****@${cam.ipAddress}:${cam.port}${cam.rtspPath}`, 24, h / 2 + 16);
          return;
        }

        // Simulated Store Interior Perspective Grid + Moving Customer/Staff Silhouette
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, idx % 2 === 0 ? '#111C30' : '#14202E');
        grad.addColorStop(1, '#090F1B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw aisle shelves lines
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        for (let x = 40; x < w; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 35);
          ctx.lineTo(x, h - 30);
          ctx.stroke();
        }
        for (let y = 45; y < h - 30; y += 38) {
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(w - 20, y);
          ctx.stroke();
        }

        // Animated motion bounding box (simulating live store activity)
        const posX = 45 + ((tick * (0.6 + idx * 0.25) + idx * 70) % (w - 130));
        const posY = 65 + Math.sin((tick + idx * 40) * 0.04) * 22;
        ctx.fillStyle = 'rgba(57, 211, 41, 0.14)';
        ctx.fillRect(posX, posY, 54, 68);
        ctx.strokeStyle = 'rgba(57, 211, 41, 0.75)';
        ctx.strokeRect(posX, posY, 54, 68);
        ctx.fillStyle = '#39D329';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(idx === 0 ? 'CASHIER_POS' : 'FLOOR_MOTION', posX, posY - 4);

        // Top HUD Bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText(`${cam.name} · ${cam.ipAddress}:${cam.port}`, 10, 18);

        // REC dot
        if (Math.floor(tick / 25) % 2 === 0) {
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(w - 155, 14, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(`REC ${dateStr} ${nowStr}`, w - 144, 18);

        // Bottom HUD Bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
        ctx.fillRect(0, h - 24, w, 24);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`FFMPEG->WS STREAM · ${cam.resolution} · ${cam.fps} FPS · AES-256 AUTH`, 10, h - 8);
      });

      animFrameId = requestAnimationFrame(renderFeeds);
    };

    animFrameId = requestAnimationFrame(renderFeeds);
    return () => cancelAnimationFrame(animFrameId);
  }, [isAuthenticated, activeTab, cameras, simulateNonAdmin403]);

  // Admin Login Handler with 5-attempt 10-min Brute-Force Lockout
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const minsLeft = Math.ceil((lockoutUntil - now) / 60000);
      setLoginError(`Brute-force protection active: Locked out for ${minsLeft} more minute(s).`);
      return;
    }

    if (passwordInput === adminPasswordHashDemo) {
      setFailedAttempts(0);
      setLockoutUntil(null);
      setLoginError('');
      setIsAuthenticated(true);
      appendLog('ADMIN', 'ADMIN-MASTER', 'ADMIN_LOGIN_SUCCESS', 'Authenticated into Admin Portal & minted CCTV JWT.');
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const lockTime = now + 10 * 60 * 1000; // 10 minutes
        setLockoutUntil(lockTime);
        setLoginError('5 failed attempts recorded! Account locked for 10 minutes (Brute-Force Protection).');
        appendLog('SYSTEM', 'SECURITY-GUARD', 'ADMIN_LOCKOUT', '5 failed password attempts triggered 10-minute lockout.');
      } else {
        setLoginError(`Invalid Admin Password. Attempt ${nextAttempts} of 5 before 10-minute lockout.`);
      }
    }
  };

  // Toggle Product Availability with 1 Click (Instantly Updates Public Storefront Flashcards)
  const handleToggleProductStatus = (product: Product) => {
    const nextStatus = product.status === 'AVAILABLE' ? 'SOLD OUT' : 'AVAILABLE';
    const nextStock = nextStatus === 'AVAILABLE' && product.stock === 0 ? 15 : product.stock;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus, stock: nextStock } : p))
    );
    appendLog(
      'ADMIN',
      'ADMIN-MASTER',
      'PRODUCT_STATUS_TOGGLE',
      `Toggled "${product.name}" status to ${nextStatus} on public site.`
    );
    setStatusToast({
      message: `"${product.name}" is now marked as ${nextStatus}! Public website flashcards updated immediately.`,
      type: 'success',
    });
    setTimeout(() => {
      setStatusToast(null);
    }, 4500);
  };

  // Toggle Best Seller Flag with 1 Click
  const handleToggleBestSeller = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isBestSeller: !p.isBestSeller } : p))
    );
    appendLog(
      'ADMIN',
      'ADMIN-MASTER',
      'PRODUCT_FLAG_TOGGLE',
      `Toggled Best Seller flag for "${product.name}".`
    );
  };

  // Toggle New Arrival Flag with 1 Click
  const handleToggleNewArrival = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isNew: !p.isNew } : p))
    );
    appendLog(
      'ADMIN',
      'ADMIN-MASTER',
      'PRODUCT_FLAG_TOGGLE',
      `Toggled New Arrival flag for "${product.name}".`
    );
  };

  // Curated Authentic Korean Grocery Photo Presets (12 Popular Items)
  const PRESET_PRODUCT_PHOTOS = [
    { name: 'Buldak Carbonara', category: 'Noodles', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80' },
    { name: 'Shin Ramyun', category: 'Noodles', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80' },
    { name: 'Samyang 2x Spicy', category: 'Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80' },
    { name: 'Jin Ramen Spicy', category: 'Noodles', url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=80' },
    { name: 'Gochujang Paste', category: 'Pantry', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80' },
    { name: 'Tteokbokki Kit', category: 'Frozen', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80' },
    { name: 'Banana Milk Drink', category: 'Beverages', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80' },
    { name: 'Melona Melon Bar', category: 'Dessert', url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80' },
    { name: 'Fresh Kimchi Mat', category: 'Pantry', url: 'https://images.unsplash.com/photo-1583032015879-bf6b0c2688b1?w=600&auto=format&fit=crop&q=80' },
    { name: 'Mandu Dumplings', category: 'Frozen', url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80' },
    { name: 'Pepero Almond', category: 'Snacks', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80' },
    { name: 'Chilsung Cider', category: 'Beverages', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
  ];

  // Handle Local Photo File Upload (From Camera or Device)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdForm((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Added or Edited Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const computedStatus: 'AVAILABLE' | 'SOLD OUT' = prodForm.stock <= 0 ? 'SOLD OUT' : 'AVAILABLE';
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...prodForm, status: computedStatus }
            : p
        )
      );
      appendLog('ADMIN', 'ADMIN-MASTER', 'PRODUCT_EDIT', `Updated product details for "${prodForm.name}".`);
    } else {
      const newProd: Product = {
        id: Date.now(),
        ...prodForm,
        status: computedStatus,
      };
      setProducts((prev) => [newProd, ...prev]);
      appendLog('ADMIN', 'ADMIN-MASTER', 'PRODUCT_CREATE', `Added new product "${prodForm.name}" (Stock: ${prodForm.stock}).`);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = (product: Product) => {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    appendLog('ADMIN', 'ADMIN-MASTER', 'PRODUCT_DELETE', `Deleted product "${product.name}".`);
  };

  // Handle Stock In / Stock Out
  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const target = products.find((p) => p.id === Number(selectedProdIdForStock));
    if (!target) return;

    const updatedStock = Math.max(0, target.stock + Number(stockDelta));
    const autoStatus: 'AVAILABLE' | 'SOLD OUT' = updatedStock === 0 ? 'SOLD OUT' : 'AVAILABLE';

    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, stock: updatedStock, status: autoStatus } : p
      )
    );

    const newLog: InventoryLog = {
      id: Date.now(),
      productId: target.id,
      productName: target.name,
      changeAmount: Number(stockDelta),
      newStock: updatedStock,
      note:
        updatedStock === 0
          ? `${stockNote} (Auto-marked SOLD OUT at 0 stock)`
          : stockNote,
      userType: 'ADMIN',
      userId: 'ADMIN-MASTER',
      createdAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setInventoryLogs((prev) => [newLog, ...prev]);
    appendLog(
      'ADMIN',
      'ADMIN-MASTER',
      stockDelta >= 0 ? 'INVENTORY_STOCK_IN' : 'INVENTORY_STOCK_OUT',
      `${target.name}: ${stockDelta >= 0 ? '+' : ''}${stockDelta} units -> New stock: ${updatedStock} (${autoStatus})`
    );
    setStockNote('');
  };

  // Add Employee + Private Salary Record
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.fullName.trim()) return;
    const emp: Employee = {
      id: Date.now(),
      employeeId: newEmpForm.employeeId,
      fullName: newEmpForm.fullName,
      passwordPlainForDemo: newEmpForm.passwordPlainForDemo,
      position: newEmpForm.position,
      phone: newEmpForm.phone,
      email: newEmpForm.email,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const sal: EmployeeSalary = {
      employeeId: newEmpForm.employeeId,
      monthlyBasePhp: Number(newEmpForm.monthlyBasePhp),
      allowancePhp: Number(newEmpForm.allowancePhp),
      overtimePhp: 0,
      lastPayoutDate: new Date().toISOString().slice(0, 10),
      bankDetails: 'BDO Payroll Account',
    };
    setEmployees((prev) => [...prev, emp]);
    setSalaries((prev) => [...prev, sal]);
    appendLog('ADMIN', 'ADMIN-MASTER', 'EMPLOYEE_CREATED', `Created employee account ${emp.employeeId} (${emp.fullName}).`);
    setNewEmpForm({
      ...newEmpForm,
      employeeId: `EMP-2026-0${employees.length + 2}`,
      fullName: '',
      email: '',
    });
  };

  // Snapshot Download from CCTV Canvas
  const handleCaptureSnapshot = (cam: CctvCamera) => {
    const canvas = canvasRefs.current[cam.id];
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `NIMHAN_${cam.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    a.click();
    appendLog('ADMIN', 'ADMIN-MASTER', 'CCTV_SNAPSHOT', `Captured frame snapshot from ${cam.name}.`);
  };

  // Export Inventory CSV
  const handleDownloadInventoryCsv = () => {
    const headers = ['ID,Product Name,Category,Price (PHP),Stock,Status,Expiry Date'];
    const rows = products.map(
      (p) => `${p.id},"${p.name}",${p.category},${p.price},${p.stock},${p.status},${p.expiryDate}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nimhan_marilao_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    appendLog('ADMIN', 'ADMIN-MASTER', 'EXPORT_CSV', 'Downloaded full Marilao inventory CSV report.');
  };

  // Compute Dashboard KPIs
  const totalProducts = products.length;
  const availableCount = products.filter((p) => p.status === 'AVAILABLE' && p.stock > 0).length;
  const soldOutCount = products.filter((p) => p.status === 'SOLD OUT' || p.stock <= 0).length;
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const todayAttendanceCount = attendance.filter((a) => a.date === '2026-10-02').length;

  // Check Expiry Dates (within 30 days of 2026-10-02)
  const referenceNow = new Date('2026-10-02T00:00:00');
  const getDaysUntilExpiry = (dateStr: string) => {
    const exp = new Date(dateStr);
    return Math.ceil((exp.getTime() - referenceNow.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ============================================================================
  // RENDER 1: ADMIN LOGIN PAGE (/admin/login.php)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-between p-6">
        <div>
          <button
            onClick={onReturnToPublic}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Public Storefront (index.php)
          </button>
        </div>

        <div className="max-w-md w-full mx-auto bg-[#1E293B] border border-neutral-700/80 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <NimHanLogo size="md" />
            <div className="mt-4 text-xs font-mono uppercase tracking-widest text-[#C89B3C]">
              /admin/login.php · Master Security Gate
            </div>
            <h1 className="text-2xl font-heading font-bold text-white mt-1">
              Admin Portal Login
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              NIM HAN KOREAN MART Marilao Branch · Password-Only Authentication
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#C8102E]/20 border border-[#C8102E] text-xs text-red-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Master Admin Password (Bcrypt Hashed in MySQL)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter single admin password..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0F172A] border border-neutral-700 text-sm text-white focus:outline-none focus:border-[#C8102E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock Admin Dashboard
            </button>
          </form>

          {/* Quick Demo Fill Box for Testing */}
          <div className="mt-6 pt-5 border-t border-neutral-700/80 text-xs text-neutral-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Default Admin Password:</span>
              <code className="font-mono text-emerald-400 bg-black/30 px-2 py-0.5 rounded">
                {adminPasswordHashDemo}
              </code>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPasswordInput(adminPasswordHashDemo)}
                className="flex-1 py-1.5 px-3 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
              >
                Auto-Fill Password
              </button>
              {lockoutUntil && (
                <button
                  type="button"
                  onClick={() => {
                    setLockoutUntil(null);
                    setFailedAttempts(0);
                    setLoginError('');
                  }}
                  className="py-1.5 px-3 rounded bg-amber-500/20 text-amber-300 text-xs font-medium"
                >
                  Reset Lockout
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 font-mono">
          Brute-Force Protection: 5 failed attempts = 10-minute IP lockout · CSRF Protected
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: AUTHENTICATED ADMIN DASHBOARD (/admin/*)
  // ============================================================================
  const surfaceBg = darkMode ? 'bg-[#0F172A] text-neutral-100' : 'bg-[#FBF9F5] text-[#18181B]';
  const cardBg = darkMode ? 'bg-[#1E293B] border-neutral-800' : 'bg-white border-neutral-200/80';
  const mutedText = darkMode ? 'text-neutral-400' : 'text-neutral-500';

  return (
    <div className={`min-h-screen flex ${surfaceBg}`}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Sidebar Navigation (Responsive Slide-In Drawer on Mobile/Tablet) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1B2A49] text-white flex flex-col justify-between border-r border-white/10 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <NimHanLogo size="sm" />
              <div className="mt-2.5 text-xs font-semibold tracking-tight text-white">
                NIM HAN KOREAN MART
              </div>
              <div className="text-[11px] text-[#C89B3C] font-medium">
                Marilao Branch · Admin Console
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Product Management', icon: Package },
              { id: 'inventory', label: 'Inventory & Expiry', icon: Boxes },
              { id: 'employees', label: 'Employees & Payroll', icon: Users },
              { id: 'cctv', label: 'CCTV Live View', icon: Video },
              { id: 'content', label: 'Store Content & Inbox', icon: FileEdit },
              { id: 'logs', label: 'Activity / Audit Log', icon: ClipboardList },
              { id: 'extras', label: 'Reports & Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="text-[11px] text-neutral-400 font-mono-tabular flex items-center justify-between">
            <span>Auto-Logout Timer:</span>
            <span className="text-emerald-400">
              {Math.floor(inactivitySecondsLeft / 60)}m {inactivitySecondsLeft % 60}s
            </span>
          </div>
          <button
            onClick={onReturnToPublic}
            className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            View Public Website
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPasswordInput('');
              appendLog('ADMIN', 'ADMIN-MASTER', 'ADMIN_LOGOUT', 'Admin signed out.');
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock Admin Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Mobile Menu Toggle */}
        <header className={`px-4 sm:px-8 py-3.5 sm:py-4 border-b flex items-center justify-between gap-3 ${cardBg}`}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className={`text-[11px] font-mono truncate ${mutedText}`}>
                /admin/{activeTab}.php · Session: ADMIN
              </div>
              <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">
                Marilao Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${cardBg}`}
              title="Toggle Dark / Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleDownloadInventoryCsv}
              className="px-2.5 sm:px-3.5 py-2 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </header>

        {/* Module Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 sm:space-y-8">
          {/* ================================================================
              MODULE A: DASHBOARD
             ================================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* 6 Summary KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Products', value: totalProducts, sub: 'Active catalog SKUs' },
                  { label: 'Available Now', value: availableCount, sub: 'Live on public site', color: 'text-emerald-600' },
                  { label: 'Sold Out', value: soldOutCount, sub: 'Marked SOLD OUT', color: 'text-[#C8102E]' },
                  { label: 'Low Stock Alerts', value: lowStockItems.length, sub: 'Below threshold', color: 'text-amber-600' },
                  { label: 'Total Employees', value: employees.length, sub: 'Marilao staff' },
                  { label: "Today's Attendance", value: `${todayAttendanceCount}/${employees.length}`, sub: 'Clocked in today' },
                ].map((stat) => (
                  <div key={stat.label} className={`p-5 rounded-xl border ${cardBg}`}>
                    <div className={`text-xs font-medium ${mutedText}`}>{stat.label}</div>
                    <div className={`text-2xl font-bold font-mono-tabular mt-2 ${stat.color || ''}`}>
                      {stat.value}
                    </div>
                    <div className={`text-[11px] mt-1 ${mutedText}`}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row: Stock Levels & Weekly Sales Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Product Stock Levels */}
                <div className={`p-6 rounded-xl border ${cardBg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold">Live Stock Levels by Product</h2>
                      <p className={`text-xs ${mutedText}`}>
                        Bars turn red when SOLD OUT (0) or amber when below low-stock threshold
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {products.map((p) => {
                      const pct = Math.min(100, Math.round((p.stock / 60) * 100));
                      const barColor =
                        p.stock === 0
                          ? 'bg-[#C8102E]'
                          : p.stock <= p.lowStockThreshold
                          ? 'bg-amber-500'
                          : 'bg-[#1B2A49]';
                      return (
                        <div key={p.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium truncate max-w-[260px]">{p.name}</span>
                            <span className="font-mono-tabular font-semibold">
                              {p.stock} units · {p.status}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: 7-Day Marilao Branch Sales Trend */}
                <div className={`p-6 rounded-xl border flex flex-col justify-between ${cardBg}`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="text-base font-bold">7-Day Marilao Branch Revenue Trend</h2>
                        <p className={`text-xs ${mutedText}`}>
                          Daily walk-in POS + pickup orders (PHP)
                        </p>
                      </div>
                      <span className="font-mono-tabular text-sm font-bold text-emerald-600">
                        ₱148,920 · +14.2%
                      </span>
                    </div>

                    <svg viewBox="0 0 500 200" className="w-full h-48 mt-4 overflow-visible">
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#C8102E" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {[40, 85, 130, 175].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y}
                          x2="500"
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.08"
                          strokeDasharray="4 4"
                        />
                      ))}
                      <path
                        d="M 20 145 L 95 125 L 170 132 L 245 95 L 320 78 L 395 52 L 475 34 L 475 180 L 20 180 Z"
                        fill="url(#salesGrad)"
                      />
                      <polyline
                        fill="none"
                        stroke="#C8102E"
                        strokeWidth="3"
                        points="20,145 95,125 170,132 245,95 320,78 395,52 475,34"
                      />
                      {[
                        { x: 20, y: 145, day: 'Thu', val: '₱16.4k' },
                        { x: 95, y: 125, day: 'Fri', val: '₱19.8k' },
                        { x: 170, y: 132, day: 'Sat', val: '₱18.5k' },
                        { x: 245, y: 95, day: 'Sun', val: '₱22.1k' },
                        { x: 320, y: 78, day: 'Mon', val: '₱21.0k' },
                        { x: 395, y: 52, day: 'Tue', val: '₱24.2k' },
                        { x: 475, y: 34, day: 'Wed', val: '₱26.9k' },
                      ].map((pt) => (
                        <g key={pt.day}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#C8102E" stroke="#fff" strokeWidth="1.5" />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            className="text-[10px] fill-current font-mono"
                          >
                            {pt.val}
                          </text>
                          <text
                            x={pt.x}
                            y={195}
                            textAnchor="middle"
                            className="text-[10px] fill-current opacity-60"
                          >
                            {pt.day}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className={`pt-4 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs ${mutedText}`}>
                    <span>Top Moving Category: Korean Ramen & Buldak (46% of volume)</span>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-[#C8102E] font-semibold hover:underline"
                    >
                      Manage Products →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MODULE B: PRODUCT MANAGEMENT
             ================================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Product Flashcard Management</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#C8102E]/10 text-[#C8102E] text-[11px] font-bold">
                      {products.length} SKUs
                    </span>
                  </div>
                  <p className={`text-xs ${mutedText} mt-0.5`}>
                    One-click status toggles immediately update the public website flashcards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({
                        name: '',
                        koreanName: '',
                        category: 'Noodles',
                        price: 95,
                        stock: 25,
                        lowStockThreshold: 10,
                        description: '',
                        image: PRESET_PRODUCT_PHOTOS[0].url,
                        isBestSeller: false,
                        isNew: true,
                        expiryDate: '2027-03-15',
                      });
                      setPhotoInputMode('preset');
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Korean Product</span>
                  </button>
                </div>
              </div>

              {/* Instant Public Website Sync Notification Banner */}
              {statusToast && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{statusToast.message}</span>
                  </div>
                  <button
                    onClick={() => setStatusToast(null)}
                    className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Search, Filter & View Controls Toolbar */}
              <div className={`p-4 rounded-xl border ${cardBg} space-y-3`}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={flashcardSearch}
                      onChange={(e) => setFlashcardSearch(e.target.value)}
                      placeholder="Search Korean ramen, snacks, drinks..."
                      className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-[#C8102E]"
                    />
                    {flashcardSearch && (
                      <button
                        onClick={() => setFlashcardSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle: Flashcards Grid vs Table */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-500/10 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setFlashcardViewMode('cards')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        flashcardViewMode === 'cards'
                          ? 'bg-white dark:bg-neutral-800 text-[#C8102E] shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                      title="Interactive Flashcards View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Flashcards View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlashcardViewMode('table')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        flashcardViewMode === 'table'
                          ? 'bg-white dark:bg-neutral-800 text-[#C8102E] shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                      title="Compact Table View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills: Categories & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 text-xs">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Noodles', 'Snacks', 'Sauces', 'Drinks', 'Frozen'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFlashcardCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          flashcardCategory === cat
                            ? 'bg-[#1B2A49] text-white'
                            : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-500/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFlashcardStatusFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        flashcardStatusFilter === 'ALL'
                          ? 'bg-[#C8102E] text-white'
                          : 'bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlashcardStatusFilter('AVAILABLE')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        flashcardStatusFilter === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      Available ({availableCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlashcardStatusFilter('SOLD OUT')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        flashcardStatusFilter === 'SOLD OUT'
                          ? 'bg-[#C8102E] text-white'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      Sold Out ({soldOutCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtered Products Logic */}
              {(() => {
                const filtered = products.filter((p) => {
                  const matchSearch =
                    p.name.toLowerCase().includes(flashcardSearch.toLowerCase()) ||
                    p.koreanName.toLowerCase().includes(flashcardSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(flashcardSearch.toLowerCase());
                  const matchCat =
                    flashcardCategory === 'All' || p.category.toLowerCase() === flashcardCategory.toLowerCase();
                  const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                  const matchStatus =
                    flashcardStatusFilter === 'ALL' ||
                    (flashcardStatusFilter === 'AVAILABLE' && !isSoldOut) ||
                    (flashcardStatusFilter === 'SOLD OUT' && isSoldOut);
                  return matchSearch && matchCat && matchStatus;
                });

                if (filtered.length === 0) {
                  return (
                    <div className={`p-10 rounded-2xl border text-center space-y-3 ${cardBg}`}>
                      <div className="w-12 h-12 rounded-full bg-neutral-500/10 flex items-center justify-center mx-auto text-neutral-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base">No Products Found</h3>
                      <p className={`text-xs max-w-sm mx-auto ${mutedText}`}>
                        No Korean products match &quot;{flashcardSearch}&quot; in category &quot;{flashcardCategory}&quot;.
                      </p>
                      <button
                        onClick={() => {
                          setFlashcardSearch('');
                          setFlashcardCategory('All');
                          setFlashcardStatusFilter('ALL');
                        }}
                        className="px-4 py-2 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                // ========================================================
                // VIEW 1: FLASHCARDS GRID VIEW (Responsive on Phone, Tablet & Desktop)
                // ========================================================
                if (flashcardViewMode === 'cards') {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {filtered.map((p) => {
                        const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                        return (
                          <div
                            key={p.id}
                            className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 ${cardBg} ${
                              isSoldOut ? 'border-red-300 dark:border-red-900/60' : 'border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            {/* Card Media Header */}
                            <div className="relative aspect-4/3 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                                  isSoldOut ? 'grayscale opacity-60' : ''
                                }`}
                              />

                              {/* Category Badge */}
                              <div className="absolute top-2.5 left-2.5">
                                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[#C89B3C] text-[10px] font-bold uppercase tracking-wider">
                                  {p.category}
                                </span>
                              </div>

                              {/* Live Public Website Status Tag */}
                              <div className="absolute top-2.5 right-2.5">
                                {isSoldOut ? (
                                  <span className="px-2.5 py-1 rounded-md bg-[#C8102E] text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                                    <span>✕ SOLD OUT</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <span>AVAILABLE</span>
                                  </span>
                                )}
                              </div>

                              {/* Expiry Badge */}
                              <div className="absolute bottom-2 left-2 text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-black/60 text-neutral-200 backdrop-blur-xs">
                                Exp: {p.expiryDate}
                              </div>
                            </div>

                            {/* Card Content Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-sm leading-snug line-clamp-1">{p.name}</h4>
                                <div className={`text-xs line-clamp-1 font-medium ${mutedText}`}>
                                  {p.koreanName || '대한민국 인기 상품'}
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 font-mono-tabular">
                                  <div>
                                    <span className="text-base font-extrabold text-[#C8102E]">
                                      ₱{p.price.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                        p.stock === 0
                                          ? 'bg-red-500/15 text-[#C8102E] font-bold'
                                          : p.stock <= p.lowStockThreshold
                                          ? 'bg-amber-500/15 text-amber-600 font-bold'
                                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                      }`}
                                    >
                                      {p.stock} units
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* ===== ONE-CLICK STATUS TOGGLE BUTTON (INSTANT PUBLIC WEBSITE UPDATE) ===== */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(p)}
                                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex flex-col items-center justify-center gap-0.5 active:scale-98 ${
                                    isSoldOut
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-rose-50 dark:bg-rose-950/40 text-[#C8102E] border border-rose-300 dark:border-rose-800 hover:bg-[#C8102E] hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {isSoldOut ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>1-Click Restore to AVAILABLE</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>1-Click Mark as SOLD OUT</span>
                                      </>
                                    )}
                                  </div>
                                  <span className="text-[10px] opacity-75 font-normal">
                                    Syncs immediately to public storefront
                                  </span>
                                </button>
                              </div>

                              {/* Quick Flag Toggles & Edit/Delete Actions */}
                              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleBestSeller(p)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      p.isBestSeller
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300'
                                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-400'
                                    }`}
                                  >
                                    ⭐ Best
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleNewArrival(p)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      p.isNew
                                        ? 'bg-sky-500/20 border-sky-500 text-sky-600 dark:text-sky-300'
                                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-400'
                                    }`}
                                  >
                                    ✦ New
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setProdForm({
                                        name: p.name,
                                        koreanName: p.koreanName,
                                        category: p.category,
                                        price: p.price,
                                        stock: p.stock,
                                        lowStockThreshold: p.lowStockThreshold,
                                        description: p.description,
                                        image: p.image,
                                        isBestSeller: p.isBestSeller,
                                        isNew: p.isNew,
                                        expiryDate: p.expiryDate,
                                      });
                                      setPhotoInputMode('preset');
                                      setShowProductModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold text-xs hover:bg-neutral-500/10"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p)}
                                    className="p-1 text-red-600 hover:bg-red-500/10 rounded-lg"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // ========================================================
                // VIEW 2: COMPACT TABLE VIEW (Horizontally Scrollable on Tablet)
                // ========================================================
                return (
                  <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                    <div className="overflow-x-auto min-w-full">
                      <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            <th className="py-3.5 px-4">Product Flashcard</th>
                            <th className="py-3.5 px-4">Category</th>
                            <th className="py-3.5 px-4 text-right">Price</th>
                            <th className="py-3.5 px-4 text-right">Stock</th>
                            <th className="py-3.5 px-4">Flags</th>
                            <th className="py-3.5 px-4">1-Click Status Toggle (Live Website Sync)</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-700/70 text-xs">
                          {filtered.map((p) => {
                            const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                            return (
                              <tr key={p.id} className="hover:bg-neutral-500/5">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className={`w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700 ${
                                        isSoldOut ? 'grayscale opacity-60' : ''
                                      }`}
                                    />
                                    <div>
                                      <div className="font-semibold text-sm">{p.name}</div>
                                      <div className={`text-[11px] ${mutedText}`}>{p.koreanName}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded bg-neutral-500/10 font-medium text-[11px]">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-mono-tabular font-bold text-sm text-[#C8102E]">
                                  ₱{p.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono-tabular">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      p.stock === 0
                                        ? 'bg-red-500/15 text-[#C8102E] font-bold'
                                        : p.stock <= p.lowStockThreshold
                                        ? 'bg-amber-500/15 text-amber-600 font-bold'
                                        : 'text-neutral-700 dark:text-neutral-200'
                                    }`}
                                  >
                                    {p.stock}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-[11px] space-x-1">
                                    {p.isBestSeller && (
                                      <span className="text-[#C89B3C] font-semibold">⭐ Best</span>
                                    )}
                                    {p.isBestSeller && p.isNew && <span>·</span>}
                                    {p.isNew && <span className="text-emerald-600 font-semibold">✦ New</span>}
                                    {!p.isBestSeller && !p.isNew && <span className={mutedText}>Standard</span>}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleToggleProductStatus(p)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap ${
                                      isSoldOut
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-rose-50 text-[#C8102E] border border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 hover:bg-[#C8102E] hover:text-white'
                                    }`}
                                  >
                                    {isSoldOut ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Restore AVAILABLE (1-Click)</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>Mark as SOLD OUT (1-Click)</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setProdForm({
                                        name: p.name,
                                        koreanName: p.koreanName,
                                        category: p.category,
                                        price: p.price,
                                        stock: p.stock,
                                        lowStockThreshold: p.lowStockThreshold,
                                        description: p.description,
                                        image: p.image,
                                        isBestSeller: p.isBestSeller,
                                        isNew: p.isNew,
                                        expiryDate: p.expiryDate,
                                      });
                                      setPhotoInputMode('preset');
                                      setShowProductModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-500/10 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p)}
                                    className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Add/Edit Product Modal with Rich Picture Option */}
              {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <div className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl my-8 ${cardBg}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700 mb-4">
                      <div>
                        <h3 className="text-base font-bold">
                          {editingProduct ? 'Edit Korean Product' : 'Add New Korean Product'}
                        </h3>
                        <p className={`text-[11px] ${mutedText}`}>
                          Add details and picture for public website flashcard
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProductModal(false)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-500/10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                      {/* ===== PICTURE OPTION SECTION ===== */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold flex items-center gap-1.5 text-[#C8102E] text-xs">
                            <ImageIcon className="w-4 h-4" />
                            <span>Product Picture / Photo</span>
                          </label>
                          <span className={`text-[11px] ${mutedText}`}>
                            Upload phone photo, select preset, or paste URL
                          </span>
                        </div>

                        {/* Live Photo Preview Card */}
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shrink-0 relative">
                            {prodForm.image ? (
                              <img
                                src={prodForm.image}
                                alt="Selected product photo preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Photo Selected & Live-Ready</span>
                            </div>
                            <p className={`text-[11px] mt-0.5 line-clamp-2 ${mutedText}`}>
                              This image will render on the public website flashcards, walk-in shopping drawer, and search results.
                            </p>
                            {prodForm.image && (
                              <button
                                type="button"
                                onClick={() => setProdForm({ ...prodForm, image: PRESET_PRODUCT_PHOTOS[0].url })}
                                className="mt-1 text-[10px] text-[#C8102E] hover:underline font-semibold"
                              >
                                Reset to Default Photo
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Photo Mode Selector Tabs */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setPhotoInputMode('upload')}
                            className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                              photoInputMode === 'upload'
                                ? 'bg-white dark:bg-neutral-900 text-[#C8102E] shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                            }`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload / Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoInputMode('preset')}
                            className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                              photoInputMode === 'preset'
                                ? 'bg-white dark:bg-neutral-900 text-[#C8102E] shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>K-Mart Gallery</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoInputMode('url')}
                            className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                              photoInputMode === 'url'
                                ? 'bg-white dark:bg-neutral-900 text-[#C8102E] shadow-xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Web URL</span>
                          </button>
                        </div>

                        {/* TAB 1: DEVICE UPLOAD / CAMERA */}
                        {photoInputMode === 'upload' && (
                          <div className="space-y-2 p-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
                            <label className="cursor-pointer block">
                              <div className="w-10 h-10 rounded-full bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center mx-auto mb-1.5">
                                <Upload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-[#C8102E] hover:underline">
                                Choose Photo from Device or Take Picture
                              </span>
                              <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                                Supports JPG, PNG, WEBP (Up to 5MB)
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        {/* TAB 2: K-MART PRESET GALLERY (12 AUTHENTIC ITEMS) */}
                        {photoInputMode === 'preset' && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-neutral-500">
                              Tap to choose authentic Korean product photo:
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                              {PRESET_PRODUCT_PHOTOS.map((preset) => {
                                const selected = prodForm.image === preset.url;
                                return (
                                  <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => setProdForm({ ...prodForm, image: preset.url })}
                                    className={`p-1 rounded-xl border text-left transition-all relative group ${
                                      selected
                                        ? 'border-[#C8102E] bg-[#C8102E]/10 ring-2 ring-[#C8102E]'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 bg-white dark:bg-neutral-800'
                                    }`}
                                  >
                                    <img
                                      src={preset.url}
                                      alt={preset.name}
                                      className="w-full h-12 rounded-lg object-cover"
                                    />
                                    <div className="text-[10px] font-bold truncate mt-1 text-neutral-800 dark:text-neutral-200">
                                      {preset.name}
                                    </div>
                                    <div className="text-[9px] text-[#C89B3C] font-semibold truncate">
                                      {preset.category}
                                    </div>
                                    {selected && (
                                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C8102E] text-white flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* TAB 3: WEB IMAGE URL */}
                        {photoInputMode === 'url' && (
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-neutral-500">
                              Direct Web Image URL:
                            </label>
                            <input
                              type="url"
                              value={prodForm.image}
                              onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                              placeholder="https://example.com/korean-product-photo.jpg"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-[#C8102E]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Product Name & Korean Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Product Name (English)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Samyang Buldak Hot Chicken"
                            value={prodForm.name}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Korean Hangul Name</label>
                          <input
                            type="text"
                            value={prodForm.koreanName}
                            onChange={(e) => setProdForm({ ...prodForm, koreanName: e.target.value })}
                            placeholder="e.g. 삼양 불닭볶음면"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Category, Price & Stock */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Category</label>
                          <select
                            value={prodForm.category}
                            onChange={(e) =>
                              setProdForm({ ...prodForm, category: e.target.value as ProductCategory })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                          >
                            <option value="Noodles">Noodles</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Sauces">Sauces</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Frozen">Frozen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Price (₱)</label>
                          <input
                            type="number"
                            required
                            value={prodForm.price}
                            onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Stock Count</label>
                          <input
                            type="number"
                            min={0}
                            required
                            value={prodForm.stock}
                            onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                      </div>

                      {/* Expiry Date & Low Stock Threshold */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={prodForm.expiryDate}
                            onChange={(e) => setProdForm({ ...prodForm, expiryDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Low-Stock Alert Level</label>
                          <input
                            type="number"
                            min={1}
                            value={prodForm.lowStockThreshold}
                            onChange={(e) => setProdForm({ ...prodForm, lowStockThreshold: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                      </div>

                      {/* Flags Checkboxes */}
                      <div className="flex items-center gap-4 pt-1">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={prodForm.isBestSeller}
                            onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                            className="w-4 h-4 accent-[#C8102E]"
                          />
                          <span>⭐ Best Seller Badge</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={prodForm.isNew}
                            onChange={(e) => setProdForm({ ...prodForm, isNew: e.target.checked })}
                            className="w-4 h-4 accent-sky-600"
                          />
                          <span>✦ New Arrival Badge</span>
                        </label>
                      </div>

                      {/* Submit & Cancel Buttons */}
                      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowProductModal(false)}
                          className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white font-bold transition-colors shadow-xs"
                        >
                          {editingProduct ? 'Save Product Changes' : 'Publish Product to Public Site'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              MODULE C: INVENTORY CONTROL & EXPIRY TRACKER
             ================================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock In / Stock Out Action Card */}
                <div className={`p-6 rounded-xl border ${cardBg}`}>
                  <h2 className="text-base font-bold mb-1">Record Stock In / Stock Out</h2>
                  <p className={`text-xs mb-4 ${mutedText}`}>
                    When stock reaches 0, the product is automatically marked SOLD OUT on the public site.
                  </p>
                  <form onSubmit={handleStockAdjustment} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Select Product</label>
                      <select
                        value={selectedProdIdForStock}
                        onChange={(e) => setSelectedProdIdForStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id} className="text-black">
                            {p.name} (Current: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Quantity Change (+ for Stock In, - for Stock Out)
                      </label>
                      <input
                        type="number"
                        required
                        value={stockDelta}
                        onChange={(e) => setStockDelta(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Audit Note / Reason</label>
                      <input
                        type="text"
                        required
                        value={stockNote}
                        onChange={(e) => setStockNote(e.target.value)}
                        placeholder="e.g. Supplier delivery or damaged pack"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white font-semibold transition-colors"
                    >
                      Commit Stock Adjustment
                    </button>
                  </form>
                </div>

                {/* Expiry Date Tracking Table */}
                <div className={`lg:col-span-2 p-6 rounded-xl border ${cardBg}`}>
                  <h2 className="text-base font-bold mb-1">Food Safety & Expiry Date Tracker (FEFO)</h2>
                  <p className={`text-xs mb-4 ${mutedText}`}>
                    Highlights Korean food items nearing expiration within 30 days so Admin can run promos.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3 text-right">Stock</th>
                          <th className="py-2.5 px-3">Expiry Date</th>
                          <th className="py-2.5 px-3">FEFO Alert Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
                        {products.map((p) => {
                          const daysLeft = getDaysUntilExpiry(p.expiryDate);
                          const isNearExpiry = daysLeft <= 30;
                          return (
                            <tr key={p.id}>
                              <td className="py-2.5 px-3 font-medium">{p.name}</td>
                              <td className="py-2.5 px-3 text-right font-mono-tabular">{p.stock}</td>
                              <td className="py-2.5 px-3 font-mono-tabular">{p.expiryDate}</td>
                              <td className="py-2.5 px-3">
                                {isNearExpiry ? (
                                  <span className="text-[#C8102E] font-semibold">
                                    ⚠ Nearing Expiry ({daysLeft} days left)
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-medium">
                                    Fresh Batch ({daysLeft} days remaining)
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Inventory Movement Logs */}
              <div className={`p-6 rounded-xl border ${cardBg}`}>
                <h2 className="text-base font-bold mb-4">Stock In / Stock Out Audit History</h2>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-right">Change</th>
                      <th className="py-2.5 px-3 text-right">New Stock</th>
                      <th className="py-2.5 px-3">Logged By</th>
                      <th className="py-2.5 px-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
                    {inventoryLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 font-mono-tabular">{log.createdAt}</td>
                        <td className="py-2.5 px-3 font-medium">{log.productName}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono-tabular font-bold ${
                            log.changeAmount >= 0 ? 'text-emerald-600' : 'text-[#C8102E]'
                          }`}
                        >
                          {log.changeAmount >= 0 ? `+${log.changeAmount}` : log.changeAmount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular">{log.newStock}</td>
                        <td className="py-2.5 px-3 font-mono-tabular">
                          {log.userType} · {log.userId}
                        </td>
                        <td className={`py-2.5 px-3 ${mutedText}`}>{log.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              MODULE D: EMPLOYEE MANAGEMENT & PRIVATE ADMIN-ONLY PAYROLL
             ================================================================ */}
          {activeTab === 'employees' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create New Employee Account */}
                <div className={`p-6 rounded-xl border ${cardBg}`}>
                  <h2 className="text-base font-bold mb-1">Register Employee Account</h2>
                  <p className={`text-xs mb-4 ${mutedText}`}>
                    Assigns an Employee ID + hashed password for `/employee/login.php`.
                  </p>
                  <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Employee ID</label>
                      <input
                        type="text"
                        required
                        value={newEmpForm.employeeId}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, employeeId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newEmpForm.fullName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, fullName: e.target.value })}
                        placeholder="e.g. Joshua Reyes"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Position / Role</label>
                      <input
                        type="text"
                        required
                        value={newEmpForm.position}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, position: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium mb-1">Initial Password</label>
                        <input
                          type="text"
                          required
                          value={newEmpForm.passwordPlainForDemo}
                          onChange={(e) =>
                            setNewEmpForm({ ...newEmpForm, passwordPlainForDemo: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Monthly Base Salary (₱)</label>
                        <input
                          type="number"
                          required
                          value={newEmpForm.monthlyBasePhp}
                          onChange={(e) =>
                            setNewEmpForm({ ...newEmpForm, monthlyBasePhp: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white font-semibold transition-colors"
                    >
                      Create Employee Account
                    </button>
                  </form>
                </div>

                {/* Employee Roster & Status Toggle */}
                <div className={`lg:col-span-2 p-6 rounded-xl border ${cardBg}`}>
                  <h2 className="text-base font-bold mb-4">Marilao Branch Employee Roster</h2>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                        <th className="py-2.5 px-3">Employee ID</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="py-2.5 px-3 font-mono-tabular font-semibold">
                            {emp.employeeId}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{emp.fullName}</td>
                          <td className={`py-2.5 px-3 ${mutedText}`}>{emp.position}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={
                                emp.status === 'ACTIVE'
                                  ? 'text-emerald-600 font-semibold'
                                  : 'text-red-500 font-semibold'
                              }
                            >
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                const next = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setEmployees((prev) =>
                                  prev.map((e) => (e.id === emp.id ? { ...e, status: next } : e))
                                );
                                appendLog(
                                  'ADMIN',
                                  'ADMIN-MASTER',
                                  'EMPLOYEE_STATUS_CHANGE',
                                  `Set ${emp.employeeId} status to ${next}.`
                                );
                              }}
                              className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-xs"
                            >
                              {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STRICT ADMIN-ONLY PAYROLL & SALARY TABLE */}
              <div className={`p-6 rounded-xl border-2 border-[#C89B3C]/50 ${cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#C89B3C] font-semibold">
                      CONFIDENTIAL · ADMIN-ONLY TABLE (`employee_salary`)
                    </div>
                    <h2 className="text-base font-bold">
                      Private Payroll & Compensation Ledger
                    </h2>
                    <p className={`text-xs ${mutedText}`}>
                      Strict Rule Enforced: This data is isolated to `/admin` and is NEVER queried or visible inside `/employee`.
                    </p>
                  </div>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                      <th className="py-2.5 px-3">Employee ID</th>
                      <th className="py-2.5 px-3 text-right">Monthly Base (₱)</th>
                      <th className="py-2.5 px-3 text-right">Allowance (₱)</th>
                      <th className="py-2.5 px-3 text-right">Overtime (₱)</th>
                      <th className="py-2.5 px-3 text-right">Net Payout (₱)</th>
                      <th className="py-2.5 px-3">Disbursement Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60 font-mono-tabular">
                    {salaries.map((sal) => {
                      const net = sal.monthlyBasePhp + sal.allowancePhp + sal.overtimePhp;
                      return (
                        <tr key={sal.employeeId}>
                          <td className="py-2.5 px-3 font-semibold">{sal.employeeId}</td>
                          <td className="py-2.5 px-3 text-right">₱{sal.monthlyBasePhp.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right">₱{sal.allowancePhp.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right">₱{sal.overtimePhp.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            ₱{net.toLocaleString()}
                          </td>
                          <td className={`py-2.5 px-3 font-sans ${mutedText}`}>{sal.bankDetails}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Staff Requests Queue (Leave / Restock) */}
              <div className={`p-6 rounded-xl border ${cardBg}`}>
                <h2 className="text-base font-bold mb-4">Employee Leave & Restock Requests</h2>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-semibold">
                          [{req.type}] {req.subject} — <span className="font-mono">{req.employeeId}</span> ({req.employeeName})
                        </div>
                        <p className={`mt-1 ${mutedText}`}>{req.details}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-semibold">{req.status}</span>
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setRequests((prev) =>
                                prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
                              );
                              appendLog('ADMIN', 'ADMIN-MASTER', 'REQUEST_APPROVED', `Approved request #${req.id}`);
                            }}
                            className="px-3 py-1.5 rounded bg-emerald-600 text-white font-medium"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MODULE E: CCTV LIVE VIEW (ADMIN ONLY)
             ================================================================ */}
          {activeTab === 'cctv' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    Marilao Branch CCTV Live Matrix (Node.js RTSP → WebSocket Relay)
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Connected via signed HS256 Admin JWT to standalone Node.js + FFmpeg server (`/api/admin/cctv-stream`).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSimulateNonAdmin403(!simulateNonAdmin403)}
                    className="px-3.5 py-2 rounded-lg border border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {simulateNonAdmin403 ? 'Restore Admin JWT Access' : 'Preview Non-Admin 403 Screen'}
                  </button>
                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="px-4 py-2 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add / Configure RTSP Camera
                  </button>
                </div>
              </div>

              {simulateNonAdmin403 ? (
                <div className="p-12 rounded-2xl bg-[#1E293B] border-2 border-[#C8102E] text-center text-white space-y-3">
                  <ShieldAlert className="w-12 h-12 text-[#C8102E] mx-auto" />
                  <div className="text-xs font-mono uppercase tracking-widest text-red-400">
                    HTTP 403 FORBIDDEN · verifyAdmin Middleware Rejected Request
                  </div>
                  <h3 className="text-2xl font-bold">Access Denied — Admin Privileges Required</h3>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto">
                    Employees and unauthenticated visitors are strictly blocked from viewing or connecting to the Node.js RTSP CCTV WebSocket stream.
                  </p>
                  <button
                    onClick={() => setSimulateNonAdmin403(false)}
                    className="mt-2 px-4 py-2 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
                  >
                    Return to Authenticated Admin View
                  </button>
                </div>
              ) : (
                <>
                  {/* <!-- ===== [CCTV VIDEO PLAYER LOCATION] ===== --> */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {cameras
                      .filter((c) => fullscreenCamId === null || c.id === fullscreenCamId)
                      .map((cam) => (
                        <div
                          key={cam.id}
                          className="rounded-xl overflow-hidden bg-[#090D16] border border-neutral-800 shadow-lg flex flex-col"
                        >
                          <div className="relative aspect-video w-full bg-black">
                            <canvas
                              ref={(el) => {
                                canvasRefs.current[cam.id] = el;
                              }}
                              width={640}
                              height={360}
                              className="w-full h-full object-cover block"
                            />
                          </div>

                          <div className="p-3.5 bg-[#111827] text-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                <span>{cam.name}</span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                    cam.status === 'ONLINE'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {cam.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                {cam.locationZone} · Encrypted Pass: {cam.passwordEncrypted}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const nextStatus = cam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
                                  setCameras((prev) =>
                                    prev.map((c) =>
                                      c.id === cam.id
                                        ? { ...c, status: nextStatus, fps: nextStatus === 'ONLINE' ? 30 : 0 }
                                        : c
                                    )
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-[11px] flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                {cam.status === 'ONLINE' ? 'Simulate Drop' : 'Reconnect'}
                              </button>
                              <button
                                onClick={() => handleCaptureSnapshot(cam)}
                                className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-[11px] flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3" />
                                Snapshot
                              </button>
                              <button
                                onClick={() =>
                                  setFullscreenCamId(fullscreenCamId === cam.id ? null : cam.id)
                                }
                                className="px-2.5 py-1.5 rounded bg-[#C8102E] hover:bg-[#A50D26] text-white text-[11px] flex items-center gap-1"
                              >
                                <Maximize2 className="w-3 h-3" />
                                {fullscreenCamId === cam.id ? 'Exit Fullscreen' : 'Fullscreen'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}

              {/* Camera Settings Modal */}
              {showCameraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${cardBg}`}>
                    <h3 className="text-base font-bold mb-1">Add RTSP Security Camera</h3>
                    <p className={`text-xs mb-4 ${mutedText}`}>
                      Camera credentials are encrypted with AES-256 before saving to `cctv_cameras`.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const newCam: CctvCamera = {
                          id: Date.now(),
                          name: camForm.name,
                          locationZone: camForm.locationZone,
                          ipAddress: camForm.ipAddress,
                          port: Number(camForm.port),
                          username: camForm.username,
                          passwordEncrypted: 'AES256:8c4a1f9e2b7d...a901',
                          rtspPath: camForm.rtspPath,
                          status: 'ONLINE',
                          fps: 30,
                          resolution: '1920x1080 (1080p)',
                        };
                        setCameras((prev) => [...prev, newCam]);
                        appendLog('ADMIN', 'ADMIN-MASTER', 'CCTV_CAMERA_ADDED', `Added ${newCam.name} (${newCam.ipAddress}).`);
                        setShowCameraModal(false);
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div>
                        <label className="block font-medium mb-1">Camera Label</label>
                        <input
                          type="text"
                          required
                          value={camForm.name}
                          onChange={(e) => setCamForm({ ...camForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block font-medium mb-1">IP Address</label>
                          <input
                            type="text"
                            required
                            value={camForm.ipAddress}
                            onChange={(e) => setCamForm({ ...camForm, ipAddress: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">RTSP Port</label>
                          <input
                            type="number"
                            required
                            value={camForm.port}
                            onChange={(e) => setCamForm({ ...camForm, port: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium mb-1">RTSP Username</label>
                          <input
                            type="text"
                            required
                            value={camForm.username}
                            onChange={(e) => setCamForm({ ...camForm, username: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">RTSP Password (Encrypted)</label>
                          <input
                            type="password"
                            required
                            value={camForm.passwordPlain}
                            onChange={(e) => setCamForm({ ...camForm, passwordPlain: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">RTSP Stream Path</label>
                        <input
                          type="text"
                          required
                          value={camForm.rtspPath}
                          onChange={(e) => setCamForm({ ...camForm, rtspPath: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowCameraModal(false)}
                          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#C8102E] text-white font-semibold"
                        >
                          Encrypt & Save Camera
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              MODULE F: STORE CONTENT MANAGER & VISIT OUR STORE EDITOR
             ================================================================ */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Visit Our Store (매장 안내) Editor */}
              <div className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#C8102E] font-semibold">
                    LIVE PUBLIC STORE INFO EDITOR
                  </div>
                  <h2 className="text-base font-bold mt-0.5">
                    Edit “매장 안내 · Visit Our Store” Section
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Changes made here immediately update the Visit Our Store & Footer details on the public website.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Section Kicker (Korean/English)</label>
                      <input
                        type="text"
                        value={storeSettings.visitKicker}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, visitKicker: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Branch Title</label>
                      <input
                        type="text"
                        value={storeSettings.visitHeading}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            visitHeading: e.target.value,
                            storeName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Branch Street Address</label>
                    <input
                      type="text"
                      value={storeSettings.branchAddress}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, branchAddress: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Store Opening Hours</label>
                    <input
                      type="text"
                      value={storeSettings.storeHours}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, storeHours: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Contact Phone Number(s)</label>
                      <input
                        type="text"
                        value={storeSettings.phone}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Branch Email Address</label>
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Landmark & Walk-In Directions</label>
                    <textarea
                      rows={2}
                      value={storeSettings.landmarkDirections}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, landmarkDirections: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <button
                    onClick={() =>
                      appendLog(
                        'ADMIN',
                        'ADMIN-MASTER',
                        'VISIT_STORE_INFO_UPDATED',
                        `Updated Visit Our Store details (${storeSettings.visitHeading}, ${storeSettings.branchAddress}).`
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white font-semibold transition-colors btn-interactive"
                  >
                    Save “Visit Our Store” Details
                  </button>
                </div>
              </div>

              {/* Right Column: Announcement Banner & About Story Editor */}
              <div className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#C89B3C] font-semibold">
                    PROMO BANNER & STORY EDITOR
                  </div>
                  <h2 className="text-base font-bold mt-0.5">
                    Announcement Bar & About Us Story
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-500/5 border border-neutral-200 dark:border-neutral-700">
                    <span className="font-semibold">Show Top Announcement Banner on Website</span>
                    <input
                      type="checkbox"
                      checked={storeSettings.announcementActive}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          announcementActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#C8102E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Top Announcement Banner Text</label>
                    <textarea
                      rows={2}
                      value={storeSettings.announcementBanner}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, announcementBanner: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Hero Tagline</label>
                    <input
                      type="text"
                      value={storeSettings.tagline}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, tagline: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">About Us — Marilao Branch Story</label>
                    <textarea
                      rows={4}
                      value={storeSettings.aboutStory}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, aboutStory: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>

                  <button
                    onClick={() =>
                      appendLog(
                        'ADMIN',
                        'ADMIN-MASTER',
                        'CONTENT_UPDATED',
                        'Updated public store announcement banner and story.'
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white font-semibold transition-colors btn-interactive"
                  >
                    Publish Banner & Story Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MODULE G: ACTIVITY / AUDIT LOG (Responsive Mobile & Desktop)
             ================================================================ */}
          {activeTab === 'logs' && (
            <div className={`p-4 sm:p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold">Complete System Activity & Audit Log</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#1B2A49] text-white text-[11px] font-bold">
                      {activityLogs.length} Total
                    </span>
                  </div>
                  <p className={`text-xs ${mutedText} mt-0.5`}>
                    Immutable session audit trail capturing administrative changes, employee stock counts, and logins.
                  </p>
                </div>
              </div>

              {/* Mobile & Desktop Audit Toolbar: Search & Role Filters */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-500/5 space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs by action, actor ID (e.g. EMP-2020-01), or keyword..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-[#C8102E]"
                  />
                  {auditSearch && (
                    <button
                      onClick={() => setAuditSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Role Filter Chips */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-neutral-500 mr-1">Filter Role:</span>
                    <button
                      type="button"
                      onClick={() => setAuditRoleFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        auditRoleFilter === 'ALL'
                          ? 'bg-[#1B2A49] text-white'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-500/20'
                      }`}
                    >
                      All ({activityLogs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditRoleFilter('ADMIN')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        auditRoleFilter === 'ADMIN'
                          ? 'bg-[#C8102E] text-white'
                          : 'bg-red-500/10 text-[#C8102E] dark:text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Admin ({activityLogs.filter((l) => l.actorRole === 'ADMIN').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditRoleFilter('EMPLOYEE')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        auditRoleFilter === 'EMPLOYEE'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>Staff ({activityLogs.filter((l) => l.actorRole === 'EMPLOYEE').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditRoleFilter('SYSTEM')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        auditRoleFilter === 'SYSTEM'
                          ? 'bg-sky-600 text-white'
                          : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20'
                      }`}
                    >
                      <Cpu className="w-3 h-3" />
                      <span>System ({activityLogs.filter((l) => l.actorRole === 'SYSTEM').length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Logic */}
              {(() => {
                const filteredLogs = activityLogs.filter((log) => {
                  const matchRole = auditRoleFilter === 'ALL' || log.actorRole === auditRoleFilter;
                  const q = auditSearch.toLowerCase();
                  const matchQuery =
                    !auditSearch ||
                    log.action.toLowerCase().includes(q) ||
                    log.actorId.toLowerCase().includes(q) ||
                    log.details.toLowerCase().includes(q) ||
                    log.timestamp.toLowerCase().includes(q);
                  return matchRole && matchQuery;
                });

                if (filteredLogs.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-500/10 flex items-center justify-center mx-auto text-neutral-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-bold">No Audit Logs Match</div>
                      <p className={`text-xs ${mutedText}`}>
                        No records match your query &quot;{auditSearch}&quot;.
                      </p>
                      <button
                        onClick={() => {
                          setAuditSearch('');
                          setAuditRoleFilter('ALL');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
                      >
                        Reset Filter
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    {/* MOBILE TIMELINE CARDS VIEW (Under 768px - Optimized for Phone Screens) */}
                    <div className="space-y-3 md:hidden">
                      {filteredLogs.map((log) => {
                        const isAdm = log.actorRole === 'ADMIN';
                        const isEmp = log.actorRole === 'EMPLOYEE';
                        return (
                          <div
                            key={log.id}
                            className={`p-3.5 rounded-xl border bg-white dark:bg-neutral-900 shadow-xs space-y-2.5 text-xs ${
                              isAdm
                                ? 'border-l-4 border-l-[#C8102E] border-neutral-200 dark:border-neutral-800'
                                : isEmp
                                ? 'border-l-4 border-l-emerald-500 border-neutral-200 dark:border-neutral-800'
                                : 'border-l-4 border-l-sky-500 border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            {/* Top Row: Role, Actor ID & Timestamp */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md ${
                                    isAdm
                                      ? 'bg-[#C8102E]/15 text-[#C8102E] dark:text-red-400'
                                      : isEmp
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                      : 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                                  }`}
                                >
                                  {isAdm ? (
                                    <Shield className="w-2.5 h-2.5" />
                                  ) : isEmp ? (
                                    <User className="w-2.5 h-2.5" />
                                  ) : (
                                    <Cpu className="w-2.5 h-2.5" />
                                  )}
                                  <span>{log.actorRole}</span>
                                </span>
                                <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                  {log.actorId}
                                </span>
                              </div>
                              <span className="font-mono-tabular text-[10px] text-neutral-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{log.timestamp}</span>
                              </span>
                            </div>

                            {/* Middle Row: Action Code Pill */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                                  isAdm
                                    ? 'bg-[#C8102E]/10 text-[#C8102E]'
                                    : isEmp
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                {log.action}
                              </span>
                            </div>

                            {/* Bottom Row: Detailed Description */}
                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                              {log.details}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP & TABLET TABLE VIEW (768px and above with clean horizontal scrolling) */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                      <table className="w-full text-left text-xs min-w-[680px]">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-500/5 text-neutral-500">
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Actor ID</th>
                            <th className="py-2.5 px-3">Action Code</th>
                            <th className="py-2.5 px-3">Audit Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
                          {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-neutral-500/5 transition-colors">
                              <td className="py-2.5 px-3 font-mono-tabular whitespace-nowrap text-neutral-400">
                                {log.timestamp}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-semibold whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1 ${
                                    log.actorRole === 'ADMIN'
                                      ? 'bg-[#C8102E]/15 text-[#C8102E]'
                                      : log.actorRole === 'EMPLOYEE'
                                      ? 'bg-emerald-500/15 text-emerald-600'
                                      : 'bg-sky-500/15 text-sky-600'
                                  }`}
                                >
                                  {log.actorRole === 'ADMIN' ? (
                                    <Shield className="w-2.5 h-2.5" />
                                  ) : (
                                    <User className="w-2.5 h-2.5" />
                                  )}
                                  <span>{log.actorRole}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-medium">{log.actorId}</td>
                              <td className="py-2.5 px-3 font-mono text-[#C8102E] font-semibold whitespace-nowrap">
                                {log.action}
                              </td>
                              <td className={`py-2.5 px-3 ${mutedText} font-mono text-[11px]`}>{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ================================================================
              MODULE H: EXTRA FEATURES & SECURITY SETTINGS
             ================================================================ */}
          {activeTab === 'extras' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                <h2 className="text-base font-bold">Change Master Admin Password</h2>
                <p className={`text-xs ${mutedText}`}>
                  Updates the single bcrypt password hash stored in the `admin` table.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAdminPass.trim()) return;
                    setAdminPasswordHashDemo(newAdminPass);
                    setNewAdminPass('');
                    setPassSavedNotice(true);
                    appendLog('ADMIN', 'ADMIN-MASTER', 'PASSWORD_CHANGED', 'Updated master admin password hash.');
                    setTimeout(() => setPassSavedNotice(false), 3000);
                  }}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="password"
                    required
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Enter new Admin password..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1B2A49] text-white font-semibold"
                  >
                    Update Admin Password
                  </button>
                  {passSavedNotice && (
                    <div className="text-emerald-600 font-medium flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Admin password updated for this session!
                    </div>
                  )}
                </form>
              </div>

              <div className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                <h2 className="text-base font-bold">Database Backup & Reports</h2>
                <p className={`text-xs ${mutedText}`}>
                  Weekly InfinityFree phpMyAdmin SQL export reminder is active. Download CSV reports anytime.
                </p>
                <button
                  onClick={handleDownloadInventoryCsv}
                  className="px-4 py-2.5 rounded-lg bg-[#C8102E] text-white text-xs font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Full Inventory CSV Report
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
