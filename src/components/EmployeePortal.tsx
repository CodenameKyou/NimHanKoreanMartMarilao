import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Boxes,
  BookOpen,
  UserCircle,
  Clock,
  Calendar,
  Send,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Menu,
  X,
  Search,
  Filter,
  Plus,
  Minus,
  Tag,
  AlertTriangle,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { NimHanLogo } from './NimHanLogo';
import {
  Product,
  Employee,
  InventoryLog,
  AttendanceRecord,
  ShiftSchedule,
  StaffRequest,
  GuidelineSection,
  StoreSettings,
} from '../data/initialStoreData';

interface EmployeePortalProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  inventoryLogs: InventoryLog[];
  setInventoryLogs: React.Dispatch<React.SetStateAction<InventoryLog[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  schedules: ShiftSchedule[];
  requests: StaffRequest[];
  setRequests: React.Dispatch<React.SetStateAction<StaffRequest[]>>;
  guidelines: GuidelineSection[];
  storeSettings: StoreSettings;
  appendLog: (actorRole: 'ADMIN' | 'EMPLOYEE' | 'SYSTEM', actorId: string, action: string, details: string) => void;
  onReturnToPublic: () => void;
}

type EmployeeTab =
  | 'dashboard'
  | 'inventory'
  | 'guidelines'
  | 'attendance'
  | 'schedule'
  | 'requests'
  | 'profile';

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  products,
  setProducts,
  employees,
  setEmployees,
  inventoryLogs,
  setInventoryLogs,
  attendance,
  setAttendance,
  schedules,
  requests,
  setRequests,
  guidelines,
  storeSettings,
  appendLog,
  onReturnToPublic,
}) => {
  const [loggedInEmp, setLoggedInEmp] = useState<Employee | null>(null);
  const [empIdInput, setEmpIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<EmployeeTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inventory Update State & Mobile Shelf Filters
  const stockFormRef = useRef<HTMLDivElement>(null);
  const [selectedProdId, setSelectedProdId] = useState<number>(products[0]?.id || 1);
  const [newStockCount, setNewStockCount] = useState<number>(products[0]?.stock || 0);
  const [inventoryNote, setInventoryNote] = useState('');
  const [inventorySuccess, setInventorySuccess] = useState('');
  const [shelfSearch, setShelfSearch] = useState('');
  const [shelfCategory, setShelfCategory] = useState('All');
  const [shelfStatus, setShelfStatus] = useState<'ALL' | 'AVAILABLE' | 'LOW' | 'SOLD OUT'>('ALL');

  // Request Form State
  const [reqType, setReqType] = useState<'RESTOCK' | 'LEAVE' | 'DAMAGED_ITEM'>('RESTOCK');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDetails, setReqDetails] = useState('');

  // Profile Update State
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = employees.find(
      (emp) =>
        emp.employeeId.toUpperCase() === empIdInput.trim().toUpperCase() &&
        emp.passwordPlainForDemo === passwordInput
    );

    if (!found) {
      setLoginError('Invalid Employee ID or Password.');
      return;
    }
    if (found.status !== 'ACTIVE') {
      setLoginError('This employee account is deactivated. Please contact Branch Admin.');
      return;
    }

    setLoggedInEmp(found);
    setProfilePhone(found.phone);
    setProfileEmail(found.email);
    setLoginError('');
    appendLog('EMPLOYEE', found.employeeId, 'EMPLOYEE_LOGIN', `${found.fullName} signed in to Employee Portal.`);
  };

  // ============================================================================
  // RENDER 1: EMPLOYEE LOGIN SCREEN (/employee/login.php)
  // ============================================================================
  if (!loggedInEmp) {
    return (
      <div className="min-h-screen bg-[#1B2A49] text-white flex flex-col justify-between p-6">
        <div>
          <button
            onClick={onReturnToPublic}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Public Storefront (index.php)
          </button>
        </div>

        <div className="max-w-md w-full mx-auto bg-white text-[#18181B] rounded-2xl p-8 shadow-2xl border border-neutral-200">
          <div className="flex flex-col items-center text-center mb-6">
            <NimHanLogo size="md" />
            <div className="mt-4 text-xs font-mono uppercase tracking-widest text-[#C8102E] font-semibold">
              /employee/login.php · Staff Portal
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1B2A49] mt-1">
              Employee Portal Login
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              NIM HAN KOREAN MART Marilao Branch · Personal Staff Workspace
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#C8102E] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleEmployeeLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                required
                value={empIdInput}
                onChange={(e) => setEmpIdInput(e.target.value)}
                placeholder="e.g. EMP-2020-01"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 font-mono-tabular focus:outline-none focus:border-[#1B2A49]"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your staff password..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-[#1B2A49]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white font-semibold text-sm transition-colors"
            >
              Sign In to Staff Workspace
            </button>
          </form>

          {/* Quick Demo Account Selector */}
          <div className="mt-6 pt-5 border-t border-neutral-200 text-xs space-y-2">
            <div className="font-semibold text-neutral-600">
              Quick-Fill Demo Staff Accounts:
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    setEmpIdInput(emp.employeeId);
                    setPasswordInput(emp.passwordPlainForDemo);
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-between"
                >
                  <span>
                    <strong className="font-mono">{emp.employeeId}</strong> · {emp.fullName}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Pass: {emp.passwordPlainForDemo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-300 font-mono">
          Strict Server-Side Session Isolation: Employees only access their own records · Zero Payroll Exposure
        </div>
      </div>
    );
  }

  // ============================================================================
  // STRICT DATA ISOLATION: Filter records strictly by loggedInEmp.employeeId
  // ============================================================================
  const myAttendance = attendance.filter((a) => a.employeeId === loggedInEmp.employeeId);
  const mySchedules = schedules.filter((s) => s.employeeId === loggedInEmp.employeeId);
  const myRequests = requests.filter((r) => r.employeeId === loggedInEmp.employeeId);
  const todayRecord = myAttendance.find((a) => a.date === '2026-10-02');

  const handleEmployeeStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = products.find((p) => p.id === Number(selectedProdId));
    if (!target) return;

    const delta = Number(newStockCount) - target.stock;
    const updatedStock = Math.max(0, Number(newStockCount));
    const autoStatus: 'AVAILABLE' | 'SOLD OUT' = updatedStock === 0 ? 'SOLD OUT' : 'AVAILABLE';

    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, stock: updatedStock, status: autoStatus } : p
      )
    );

    const logEntry: InventoryLog = {
      id: Date.now(),
      productId: target.id,
      productName: target.name,
      changeAmount: delta,
      newStock: updatedStock,
      note: inventoryNote || 'Floor stock count verified by employee',
      userType: 'EMPLOYEE',
      userId: loggedInEmp.employeeId,
      createdAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setInventoryLogs((prev) => [logEntry, ...prev]);
    appendLog(
      'EMPLOYEE',
      loggedInEmp.employeeId,
      'EMPLOYEE_STOCK_UPDATE',
      `${loggedInEmp.employeeId} updated "${target.name}" stock to ${updatedStock} (${autoStatus}). Note: ${logEntry.note}`
    );
    setInventoryNote('');
    setInventorySuccess(`Updated "${target.name}" to ${updatedStock} units (${autoStatus}). Logged under ${loggedInEmp.employeeId}.`);
    setTimeout(() => setInventorySuccess(''), 4000);
  };

  // Quick Step adjustment directly from mobile shelf card (+1 or -1)
  const handleQuickStep = (product: Product, delta: number) => {
    if (!loggedInEmp) return;
    const updatedStock = Math.max(0, product.stock + delta);
    const autoStatus: 'AVAILABLE' | 'SOLD OUT' = updatedStock === 0 ? 'SOLD OUT' : 'AVAILABLE';

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: updatedStock, status: autoStatus } : p))
    );

    const logEntry: InventoryLog = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      changeAmount: delta,
      newStock: updatedStock,
      note: `Quick shelf count step (${delta > 0 ? '+' : ''}${delta}) by ${loggedInEmp.employeeId}`,
      userType: 'EMPLOYEE',
      userId: loggedInEmp.employeeId,
      createdAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setInventoryLogs((prev) => [logEntry, ...prev]);
    appendLog(
      'EMPLOYEE',
      loggedInEmp.employeeId,
      'EMPLOYEE_STOCK_UPDATE',
      `Quick shelf count: "${product.name}" is now ${updatedStock} units (${autoStatus}).`
    );
    setInventorySuccess(`Updated "${product.name}" shelf stock to ${updatedStock} units.`);
    setTimeout(() => setInventorySuccess(''), 3000);
  };

  const handleClockInOrOut = () => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (!todayRecord) {
      const rec: AttendanceRecord = {
        id: Date.now(),
        employeeId: loggedInEmp.employeeId,
        employeeName: loggedInEmp.fullName,
        date: '2026-10-02',
        clockIn: nowTime,
        clockOut: null,
        status: 'ON TIME',
      };
      setAttendance((prev) => [rec, ...prev]);
      appendLog('EMPLOYEE', loggedInEmp.employeeId, 'CLOCK_IN', `Clocked in at ${nowTime}`);
    } else if (!todayRecord.clockOut) {
      setAttendance((prev) =>
        prev.map((a) =>
          a.id === todayRecord.id ? { ...a, clockOut: nowTime, status: 'COMPLETED' } : a
        )
      );
      appendLog('EMPLOYEE', loggedInEmp.employeeId, 'CLOCK_OUT', `Clocked out at ${nowTime}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FBF9F5] text-[#18181B]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar (Slide-In on Mobile/Tablet) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1B2A49] text-white flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <NimHanLogo size="sm" />
              <div className="mt-2.5 text-xs font-semibold">{loggedInEmp.fullName}</div>
              <div className="text-[11px] font-mono text-[#C89B3C]">
                {loggedInEmp.employeeId} · {loggedInEmp.position}
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
              { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
              { id: 'inventory', label: 'Inventory & Shelf Notes', icon: Boxes },
              { id: 'guidelines', label: 'Branch Guidelines', icon: BookOpen },
              { id: 'attendance', label: 'Clock In / Attendance', icon: Clock },
              { id: 'schedule', label: 'My Shift Schedule', icon: Calendar },
              { id: 'requests', label: 'Leave & Restock Requests', icon: Send },
              { id: 'profile', label: 'My Profile', icon: UserCircle },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as EmployeeTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#C8102E] text-white'
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
          <button
            onClick={onReturnToPublic}
            className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Storefront
          </button>
          <button
            onClick={() => {
              appendLog('EMPLOYEE', loggedInEmp.employeeId, 'EMPLOYEE_LOGOUT', 'Signed out of Employee Portal.');
              setLoggedInEmp(null);
              setPasswordInput('');
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-red-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out ({loggedInEmp.employeeId})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-4 sm:px-8 py-3.5 sm:py-4 bg-white border-b border-neutral-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-neutral-300 text-neutral-700"
              aria-label="Open Employee Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-neutral-500 truncate">
                /employee/{activeTab}.php · Staff: {loggedInEmp.employeeId}
              </div>
              <h1 className="text-sm sm:text-lg font-bold text-[#1B2A49] truncate">
                Employee Portal — Marilao Branch
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Isolated Session</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* MODULE A: MY DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#1B2A49] text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#C89B3C] font-semibold uppercase tracking-wider">
                    환영합니다 · Welcome Back on Shift
                  </div>
                  <h2 className="text-2xl font-heading font-bold mt-1">
                    Annyeonghaseyo, {loggedInEmp.fullName}!
                  </h2>
                  <p className="text-xs text-neutral-300 mt-1">
                    Position: {loggedInEmp.position} · Employee ID: {loggedInEmp.employeeId}
                  </p>
                </div>
                <button
                  onClick={handleClockInOrOut}
                  className="px-5 py-2.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white text-xs font-semibold transition-colors"
                >
                  {!todayRecord
                    ? 'Clock In for Today'
                    : !todayRecord.clockOut
                    ? `Clock Out (In since ${todayRecord.clockIn})`
                    : 'Shift Completed Today'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white border border-neutral-200">
                  <h3 className="text-sm font-bold text-[#1B2A49] mb-3">
                    My Assigned Shift Schedule
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {mySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-lg bg-[#FBF9F5] border border-neutral-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold">{s.dayOfWeek}</div>
                          <div className="text-neutral-500">{s.station}</div>
                        </div>
                        <span className="font-mono-tabular font-semibold text-[#C8102E]">
                          {s.shiftTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white border border-neutral-200">
                  <h3 className="text-sm font-bold text-[#1B2A49] mb-3">
                    Branch Announcement & Shift Notice
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed bg-[#FBF9F5] p-4 rounded-lg border border-neutral-200">
                    {storeSettings.announcementBanner}
                  </p>
                  <div className="mt-4 text-xs text-neutral-500">
                    Reminder: Always verify FEFO expiry dates when restocking Samyang and Binggrae dairy items.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MODULE B: INVENTORY VIEW & STOCK UPDATE
             ================================================================ */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column: Shelf Stock Counting Form */}
              <div ref={stockFormRef} className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4 h-fit">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2A49]">
                      Update Shelf Stock & Add Note
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Logged with your Employee ID: <strong className="font-mono text-[#C8102E]">{loggedInEmp.employeeId}</strong>
                    </p>
                  </div>
                  <Boxes className="w-5 h-5 text-[#C8102E]" />
                </div>

                {inventorySuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{inventorySuccess}</span>
                  </div>
                )}

                <form onSubmit={handleEmployeeStockUpdate} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-700">Select Shelf Product</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => {
                        const pid = Number(e.target.value);
                        setSelectedProdId(pid);
                        const found = products.find((p) => p.id === pid);
                        if (found) setNewStockCount(found.stock);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#C8102E] text-xs"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · [{p.category}] (Shelf: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700">Physical Stock Count Verified</label>
                      <span className="text-[11px] text-neutral-400">Current on public site: {products.find(p => p.id === Number(selectedProdId))?.stock || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewStockCount((prev) => Math.max(0, prev - 1))}
                        className="w-9 h-9 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 active:scale-95"
                        title="Minus 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        required
                        value={newStockCount}
                        onChange={(e) => setNewStockCount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 font-mono-tabular text-center text-sm font-bold focus:outline-none focus:border-[#C8102E]"
                      />
                      <button
                        type="button"
                        onClick={() => setNewStockCount((prev) => prev + 1)}
                        className="w-9 h-9 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 active:scale-95"
                        title="Plus 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-neutral-700">
                      Shelf Note (Gondola / Restock / Expiry / Damaged Pack)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={inventoryNote}
                      onChange={(e) => setInventoryNote(e.target.value)}
                      placeholder="e.g. Restocked 12 packs on Gondola 2; verified FEFO expiry date"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#C8102E] text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Stock Count ({loggedInEmp.employeeId})</span>
                  </button>
                </form>
              </div>

              {/* Shelf Inventory View Column (Mobile Cards + Desktop Table) */}
              <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
                {/* Header & Quick Inventory Stats */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#1B2A49]">
                        Live Store Shelf Inventory
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {products.length} Products
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Verify physical quantities on store shelves · Tap &quot;Count&quot; to auto-load item
                    </p>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length} Low Stock</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#C8102E] border border-red-200 font-semibold text-[11px]">
                      {products.filter(p => p.stock === 0 || p.status === 'SOLD OUT').length} Sold Out
                    </span>
                  </div>
                </div>

                {/* Mobile & Tablet Search Bar & Category Filter Bar */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={shelfSearch}
                      onChange={(e) => setShelfSearch(e.target.value)}
                      placeholder="Search Korean ramen, snacks, drinks on shelves..."
                      className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:border-[#C8102E]"
                    />
                    {shelfSearch && (
                      <button
                        onClick={() => setShelfSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills & Status Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['All', 'Noodles', 'Snacks', 'Sauces', 'Drinks', 'Frozen'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setShelfCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            shelfCategory === cat
                              ? 'bg-[#1B2A49] text-white'
                              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShelfStatus('ALL')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          shelfStatus === 'ALL' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:bg-neutral-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setShelfStatus('AVAILABLE')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          shelfStatus === 'AVAILABLE' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        In Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setShelfStatus('LOW')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          shelfStatus === 'LOW' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setShelfStatus('SOLD OUT')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          shelfStatus === 'SOLD OUT' ? 'bg-[#C8102E] text-white' : 'text-red-700 hover:bg-red-50'
                        }`}
                      >
                        Sold Out
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Logic */}
                {(() => {
                  const filteredProducts = products.filter((p) => {
                    const matchSearch =
                      p.name.toLowerCase().includes(shelfSearch.toLowerCase()) ||
                      p.koreanName.toLowerCase().includes(shelfSearch.toLowerCase()) ||
                      p.category.toLowerCase().includes(shelfSearch.toLowerCase());
                    const matchCat =
                      shelfCategory === 'All' || p.category.toLowerCase() === shelfCategory.toLowerCase();
                    const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                    const matchStatus =
                      shelfStatus === 'ALL' ||
                      (shelfStatus === 'AVAILABLE' && !isSoldOut && !isLow) ||
                      (shelfStatus === 'LOW' && isLow) ||
                      (shelfStatus === 'SOLD OUT' && isSoldOut);
                    return matchSearch && matchCat && matchStatus;
                  });

                  if (filteredProducts.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-xl border border-neutral-200 space-y-2">
                        <Boxes className="w-8 h-8 text-neutral-400 mx-auto" />
                        <div className="text-sm font-bold text-neutral-700">No Shelf Products Found</div>
                        <p className="text-xs text-neutral-500">
                          No items match your search &quot;{shelfSearch}&quot; in category &quot;{shelfCategory}&quot;.
                        </p>
                        <button
                          onClick={() => {
                            setShelfSearch('');
                            setShelfCategory('All');
                            setShelfStatus('ALL');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
                        >
                          Clear Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* ========================================================
                          MOBILE SHELF CARDS VIEW (Under 768px - Optimized for Store Walk-In Staff)
                         ======================================================== */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
                        {filteredProducts.map((p) => {
                          const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                          const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                          return (
                            <div
                              key={p.id}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 shadow-xs bg-white transition-all ${
                                isSoldOut
                                  ? 'border-red-200 bg-red-50/20'
                                  : isLow
                                  ? 'border-amber-200 bg-amber-50/20'
                                  : 'border-neutral-200'
                              }`}
                            >
                              {/* Top Row: Thumbnail + Info */}
                              <div className="flex items-start gap-3">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className={`w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200 ${
                                    isSoldOut ? 'grayscale opacity-60' : ''
                                  }`}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="font-bold uppercase tracking-wider text-[#C89B3C]">
                                      {p.category}
                                    </span>
                                    <span>·</span>
                                    <span
                                      className={`font-bold ${
                                        isSoldOut
                                          ? 'text-[#C8102E]'
                                          : isLow
                                          ? 'text-amber-600'
                                          : 'text-emerald-600'
                                      }`}
                                    >
                                      {isSoldOut ? 'SOLD OUT' : isLow ? 'LOW STOCK' : 'AVAILABLE'}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-xs leading-snug line-clamp-2 mt-0.5 text-neutral-900">
                                    {p.name}
                                  </h4>
                                  <div className="text-[11px] text-neutral-400 line-clamp-1">
                                    {p.koreanName}
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Stock Level & Expiry */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100/70 text-xs font-mono-tabular">
                                <div>
                                  <span className="text-[10px] text-neutral-500 uppercase block">Shelf Count:</span>
                                  <span
                                    className={`text-sm font-extrabold ${
                                      p.stock === 0
                                        ? 'text-[#C8102E]'
                                        : p.stock <= p.lowStockThreshold
                                        ? 'text-amber-600'
                                        : 'text-emerald-700'
                                    }`}
                                  >
                                    {p.stock} units
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-neutral-500 uppercase block">FEFO Expiry:</span>
                                  <span className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3 text-neutral-400" />
                                    <span>{p.expiryDate}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Bottom: Quick Stepper [-] [+] & Count Shortcut */}
                              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                                {/* Quick Step Counter */}
                                <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStep(p, -1)}
                                    className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 active:scale-95 text-xs font-bold"
                                    title="Minus 1 from shelf"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStep(p, 1)}
                                    className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 active:scale-95 text-xs font-bold border-l border-neutral-200"
                                    title="Plus 1 to shelf"
                                  >
                                    +1
                                  </button>
                                </div>

                                {/* Full Count & Update Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProdId(p.id);
                                    setNewStockCount(p.stock);
                                    stockFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <span>Count & Update</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* ========================================================
                          DESKTOP & TABLET TABLE VIEW (768px and above)
                         ======================================================== */}
                      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200">
                        <table className="w-full text-left text-xs min-w-[620px]">
                          <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-semibold">
                              <th className="py-2.5 px-3">Product</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3 text-right">Physical Stock</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Expiry Date</th>
                              <th className="py-2.5 px-3 text-right">Floor Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200/70">
                            {filteredProducts.map((p) => {
                              const isSoldOut = p.status === 'SOLD OUT' || p.stock <= 0;
                              const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                              return (
                                <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                                      />
                                      <div>
                                        <div className="font-semibold text-neutral-900">{p.name}</div>
                                        <div className="text-[11px] text-neutral-400">{p.koreanName}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[11px]">
                                      {p.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-sm">
                                    <span
                                      className={
                                        p.stock === 0
                                          ? 'text-[#C8102E]'
                                          : p.stock <= p.lowStockThreshold
                                          ? 'text-amber-600'
                                          : 'text-emerald-700'
                                      }
                                    >
                                      {p.stock}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        isSoldOut
                                          ? 'bg-red-50 text-[#C8102E] border border-red-200'
                                          : isLow
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {isSoldOut ? 'SOLD OUT' : isLow ? 'LOW STOCK' : 'AVAILABLE'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono-tabular text-neutral-600 whitespace-nowrap">
                                    {p.expiryDate}
                                  </td>
                                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedProdId(p.id);
                                        setNewStockCount(p.stock);
                                        stockFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#1B2A49] hover:bg-[#111C33] text-white text-[11px] font-medium transition-colors"
                                    >
                                      Count & Log
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* MODULE C: BRANCH GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white border border-neutral-200">
                <div className="text-xs font-mono uppercase tracking-wider text-[#C8102E] font-semibold">
                  Official Staff Handbook · NIM HAN KOREAN MART Marilao Branch
                </div>
                <h2 className="text-xl font-heading font-bold text-[#1B2A49] mt-1">
                  Branch Standard Operating Guidelines & Store Rules
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Every staff member must uphold these standards for food safety, customer care, and store security.
                </p>
              </div>

              {/* <!-- ===== [EDIT BRANCH GUIDELINES HERE] ===== --> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {guidelines.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-6 rounded-xl bg-white border border-neutral-200 space-y-3"
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-bold text-[#1B2A49]">{sec.title}</h3>
                      <span className="text-xs text-neutral-400">{sec.koreanSubtitle}</span>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-700 list-disc pl-4">
                      {sec.rules.map((rule, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE D: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1B2A49]">
                    Personal Timekeeping ({loggedInEmp.employeeId})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Only your own attendance logs are visible in this portal.
                  </p>
                </div>
                <button
                  onClick={handleClockInOrOut}
                  className="px-4 py-2 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
                >
                  {!todayRecord
                    ? 'Clock In Now'
                    : !todayRecord.clockOut
                    ? 'Clock Out Now'
                    : 'Today Shift Recorded'}
                </button>
              </div>

              <div className="p-6 rounded-xl bg-white border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Clock In</th>
                      <th className="py-2.5 px-3">Clock Out</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70 font-mono-tabular">
                    {myAttendance.map((rec) => (
                      <tr key={rec.id}>
                        <td className="py-2.5 px-3">{rec.date}</td>
                        <td className="py-2.5 px-3">{rec.clockIn}</td>
                        <td className="py-2.5 px-3">{rec.clockOut || 'On Shift'}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-emerald-600">
                          {rec.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE E: SHIFT SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="p-6 rounded-xl bg-white border border-neutral-200 space-y-4">
              <h2 className="text-base font-bold text-[#1B2A49]">
                My Weekly Shift Assignment ({loggedInEmp.fullName})
              </h2>
              <div className="space-y-3 text-xs">
                {mySchedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-lg bg-[#FBF9F5] border border-neutral-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm">{s.dayOfWeek}</div>
                      <div className="text-neutral-500 mt-0.5">Assigned Station: {s.station}</div>
                    </div>
                    <div className="font-mono-tabular font-bold text-[#C8102E]">{s.shiftTime}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE F: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white border border-neutral-200 space-y-4">
                <h2 className="text-base font-bold text-[#1B2A49]">
                  Submit Leave or Restock Request to Admin
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reqSubject.trim()) return;
                    const newReq: StaffRequest = {
                      id: Date.now(),
                      employeeId: loggedInEmp.employeeId,
                      employeeName: loggedInEmp.fullName,
                      type: reqType,
                      subject: reqSubject,
                      details: reqDetails,
                      status: 'PENDING',
                      createdAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
                    };
                    setRequests((prev) => [newReq, ...prev]);
                    appendLog('EMPLOYEE', loggedInEmp.employeeId, 'REQUEST_SUBMITTED', `Submitted ${reqType} request: ${reqSubject}`);
                    setReqSubject('');
                    setReqDetails('');
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block font-semibold mb-1">Request Type</label>
                    <select
                      value={reqType}
                      onChange={(e) =>
                        setReqType(e.target.value as 'RESTOCK' | 'LEAVE' | 'DAMAGED_ITEM')
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                    >
                      <option value="RESTOCK">Urgent Shelf Restock Request</option>
                      <option value="LEAVE">Personal / Medical Leave Request</option>
                      <option value="DAMAGED_ITEM">Damaged / Spoiled Item Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={reqSubject}
                      onChange={(e) => setReqSubject(e.target.value)}
                      placeholder="e.g. Restock 2 boxes of Shin Ramyun"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Details</label>
                    <textarea
                      rows={3}
                      required
                      value={reqDetails}
                      onChange={(e) => setReqDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-[#1B2A49] text-white font-semibold"
                  >
                    Submit Request
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-xl bg-white border border-neutral-200 space-y-3">
                <h2 className="text-base font-bold text-[#1B2A49]">
                  My Submitted Requests ({loggedInEmp.employeeId})
                </h2>
                {myRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-lg bg-[#FBF9F5] border border-neutral-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        [{r.type}] {r.subject}
                      </span>
                      <span className="font-mono font-semibold text-[#C8102E]">{r.status}</span>
                    </div>
                    <p className="text-neutral-600">{r.details}</p>
                    <div className="text-[11px] font-mono text-neutral-400">{r.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE G: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-lg p-6 rounded-xl bg-white border border-neutral-200 space-y-4">
              <h2 className="text-base font-bold text-[#1B2A49]">
                My Personal Profile & Password ({loggedInEmp.employeeId})
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmployees((prev) =>
                    prev.map((emp) =>
                      emp.id === loggedInEmp.id
                        ? {
                            ...emp,
                            phone: profilePhone,
                            email: profileEmail,
                            passwordPlainForDemo: newPassword.trim()
                              ? newPassword
                              : emp.passwordPlainForDemo,
                          }
                        : emp
                    )
                  );
                  setProfileSaved(true);
                  appendLog('EMPLOYEE', loggedInEmp.employeeId, 'PROFILE_UPDATED', 'Updated personal contact details / password.');
                  setTimeout(() => setProfileSaved(false), 3000);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-semibold mb-1">Employee ID (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={loggedInEmp.employeeId}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-100 border border-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#C8102E] text-white font-semibold"
                >
                  Save My Profile
                </button>
                {profileSaved && (
                  <div className="text-emerald-600 font-semibold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Profile updated!
                  </div>
                )}
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
