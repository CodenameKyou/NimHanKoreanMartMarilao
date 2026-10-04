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
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(900); // 15 mins auto-logout

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Toggle Product Availability with 1 Click
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
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-[#1B2A49] text-white flex flex-col justify-between shrink-0 border-r border-white/10">
        <div>
          <div className="p-5 border-b border-white/10">
            <NimHanLogo size="sm" />
            <div className="mt-2.5 text-xs font-semibold tracking-tight text-white">
              NIM HAN KOREAN MART
            </div>
            <div className="text-[11px] text-[#C89B3C] font-medium">
              Marilao Branch · Admin Console
            </div>
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
                  onClick={() => setActiveTab(item.id as AdminTab)}
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
        {/* Top Bar */}
        <header className={`px-8 py-4 border-b flex items-center justify-between ${cardBg}`}>
          <div>
            <div className={`text-xs font-mono ${mutedText}`}>
              /admin/{activeTab}.php · Session Role: ADMIN
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              NIM HAN KOREAN MART Marilao Branch — Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${cardBg}`}
              title="Toggle Dark / Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={handleDownloadInventoryCsv}
              className="px-3.5 py-2 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Inventory CSV
            </button>
          </div>
        </header>

        {/* Module Body */}
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Product Flashcard Management</h2>
                  <p className={`text-xs ${mutedText}`}>
                    One-click status toggles immediately update the public website flashcards.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Korean Product
                </button>
              </div>

              <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Price</th>
                      <th className="py-3.5 px-4 text-right">Stock</th>
                      <th className="py-3.5 px-4">Flags</th>
                      <th className="py-3.5 px-4">Public Status (1-Click Toggle)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-700/70 text-xs">
                    {products.map((p) => {
                      const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-500/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className={`w-11 h-11 rounded-lg object-cover shrink-0 ${
                                  isSoldOut ? 'grayscale opacity-60' : ''
                                }`}
                              />
                              <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className={`text-[11px] ${mutedText}`}>{p.koreanName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{p.category}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                            ₱{p.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular">
                            <span
                              className={
                                p.stock === 0
                                  ? 'text-[#C8102E] font-bold'
                                  : p.stock <= p.lowStockThreshold
                                  ? 'text-amber-600 font-bold'
                                  : ''
                              }
                            >
                              {p.stock}
                            </span>
                            <span className={`text-[11px] ml-1 ${mutedText}`}>
                              (min {p.lowStockThreshold})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[11px] space-x-1">
                              {p.isBestSeller && (
                                <span className="text-[#C89B3C] font-semibold">Best Seller</span>
                              )}
                              {p.isBestSeller && p.isNew && <span>·</span>}
                              {p.isNew && <span className="text-emerald-600 font-semibold">New</span>}
                              {!p.isBestSeller && !p.isNew && <span className={mutedText}>Standard</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleProductStatus(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                isSoldOut
                                  ? 'bg-[#C8102E] text-white hover:bg-[#A50D26]'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {isSoldOut ? 'SOLD OUT (Click -> Available)' : 'AVAILABLE (Click -> Sold Out)'}
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
                                setShowProductModal(true);
                              }}
                              className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-500/10 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-red-600 hover:bg-red-500/10 rounded"
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

              {/* Add/Edit Product Modal */}
              {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${cardBg}`}>
                    <h3 className="text-base font-bold mb-4">
                      {editingProduct ? 'Edit Korean Product' : 'Add New Korean Product'}
                    </h3>
                    <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Product Name</label>
                          <input
                            type="text"
                            required
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
                            placeholder="e.g. 까르보 불닭볶음면"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                          />
                        </div>
                      </div>

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
                          <label className="block font-medium mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={prodForm.stock}
                            onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Low-Stock Alert Threshold</label>
                          <input
                            type="number"
                            value={prodForm.lowStockThreshold}
                            onChange={(e) =>
                              setProdForm({ ...prodForm, lowStockThreshold: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Batch Expiry Date</label>
                          <input
                            type="date"
                            value={prodForm.expiryDate}
                            onChange={(e) => setProdForm({ ...prodForm, expiryDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono-tabular"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Short Description</label>
                        <textarea
                          rows={2}
                          required
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-1">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prodForm.isBestSeller}
                            onChange={(e) =>
                              setProdForm({ ...prodForm, isBestSeller: e.target.checked })
                            }
                          />
                          <span>Mark as Best Seller</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prodForm.isNew}
                            onChange={(e) => setProdForm({ ...prodForm, isNew: e.target.checked })}
                          />
                          <span>Mark as New Arrival</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowProductModal(false)}
                          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#C8102E] text-white font-semibold"
                        >
                          Save Product
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
              MODULE G: ACTIVITY / AUDIT LOG
             ================================================================ */}
          {activeTab === 'logs' && (
            <div className={`p-6 rounded-xl border ${cardBg}`}>
              <h2 className="text-base font-bold mb-4">Complete System Activity & Audit Log</h2>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Actor ID</th>
                    <th className="py-2.5 px-3">Action Code</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-3 font-mono-tabular whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{log.actorRole}</td>
                      <td className="py-2.5 px-3 font-mono">{log.actorId}</td>
                      <td className="py-2.5 px-3 font-mono text-[#C8102E]">{log.action}</td>
                      <td className={`py-2.5 px-3 ${mutedText}`}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
