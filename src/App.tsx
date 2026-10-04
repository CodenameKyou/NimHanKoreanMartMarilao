/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  BellRing,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  X,
  Lock,
  UserCheck,
  Sparkles,
  ShoppingBag,
  Store,
  Sun,
  Moon,
  Flame,
  Plus,
  Minus,
  Trash2,
  Compass,
  Check,
  Navigation,
} from 'lucide-react';
import { NimHanLogo } from './components/NimHanLogo';
import { AdminPortal } from './components/AdminPortal';
import { EmployeePortal } from './components/EmployeePortal';
import {
  HERO_IMAGE_URL,
  buldakImg,
  INITIAL_STORE_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_EMPLOYEES,
  INITIAL_SALARIES,
  INITIAL_INVENTORY_LOGS,
  INITIAL_ATTENDANCE,
  INITIAL_SCHEDULES,
  INITIAL_REQUESTS,
  INITIAL_GUIDELINES,
  INITIAL_TESTIMONIALS,
  INITIAL_MESSAGES,
  INITIAL_CAMERAS,
  INITIAL_ACTIVITY_LOGS,
  Product,
  ProductCategory,
  ActivityLog,
} from './data/initialStoreData';

type ActivePortal = 'PUBLIC' | 'ADMIN' | 'EMPLOYEE' | '404';
type PublicSection = 'home' | 'about' | 'products' | 'contact';

interface WalkInListItem {
  productId: number;
  quantity: number;
}

export default function App() {
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);

  // Consumer Dark Mode State (Light / Dark toggle for public shoppers)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Portal routing state
  const [activePortal, setActivePortal] = useState<ActivePortal>('PUBLIC');
  const [activePublicTab, setActivePublicTab] = useState<PublicSection>('home');

  // Shared Database State (Synchronized across Public, Admin, and Employee portals)
  const [storeSettings, setStoreSettings] = useState(INITIAL_STORE_SETTINGS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [salaries, setSalaries] = useState(INITIAL_SALARIES);
  const [inventoryLogs, setInventoryLogs] = useState(INITIAL_INVENTORY_LOGS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [schedules] = useState(INITIAL_SCHEDULES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [guidelines, setGuidelines] = useState(INITIAL_GUIDELINES);
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);

  // Public Catalog Filter / Search / Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ProductCategory>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');

  // Walk-In Shopping List & Budget Calculator State (Helps walk-in customers plan their store visit)
  const [walkInList, setWalkInList] = useState<WalkInListItem[]>([
    { productId: 1, quantity: 2 },
    { productId: 4, quantity: 2 },
  ]);
  const [isWalkInDrawerOpen, setIsWalkInDrawerOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  // Product Quick-View Modal (Shows Spice Level, Pairing Tip, and Aisle Location)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Wishlist & Restock Notification State
  const [wishlistIds, setWishlistIds] = useState<number[]>([1, 4]);
  const [notifyProduct, setNotifyProduct] = useState<Product | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySaved, setNotifySaved] = useState(false);

  // Featured Carousel & Testimonials Slider State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Back to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ==========================================================================
  // SECRET ADMIN / EMPLOYEE ACCESS (LOGO x10 CLICKS WITHIN 8 SECONDS)
  // ==========================================================================
  // // ===== [CHANGE THE NUMBER OF LOGO CLICKS (DEFAULT 10) HERE] =====
  const REQUIRED_LOGO_CLICKS = 10;
  const CLICK_WINDOW_MS = 8000;
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const logoClickCountRef = useRef(0);
  const firstClickTimeRef = useRef(0);
  const clickResetTimeoutRef = useRef<number | null>(null);

  const handleSecretLogoClick = () => {
    const now = Date.now();
    if (
      logoClickCountRef.current === 0 ||
      now - firstClickTimeRef.current > CLICK_WINDOW_MS
    ) {
      logoClickCountRef.current = 1;
      firstClickTimeRef.current = now;
      if (clickResetTimeoutRef.current) {
        window.clearTimeout(clickResetTimeoutRef.current);
      }
      clickResetTimeoutRef.current = window.setTimeout(() => {
        logoClickCountRef.current = 0;
        firstClickTimeRef.current = 0;
      }, CLICK_WINDOW_MS);
    } else {
      logoClickCountRef.current += 1;
    }

    if (logoClickCountRef.current >= REQUIRED_LOGO_CLICKS) {
      if (clickResetTimeoutRef.current) {
        window.clearTimeout(clickResetTimeoutRef.current);
      }
      logoClickCountRef.current = 0;
      firstClickTimeRef.current = 0;
      setStaffModalOpen(true);
    }
  };

  // Splash Screen Effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 650);
    return () => clearTimeout(timer);
  }, []);

  // Scroll listener for Back-to-Top button
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Audit Log Helper
  const appendLog = (
    actorRole: 'ADMIN' | 'EMPLOYEE' | 'SYSTEM',
    actorId: string,
    action: string,
    details: string
  ) => {
    const entry: ActivityLog = {
      id: Date.now(),
      actorRole,
      actorId,
      action,
      details,
      timestamp: new Date().toLocaleString('en-PH', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

  // Toggle Wishlist
  const toggleWishlist = (id: number) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add item to Walk-In Shopping Checklist
  const addToWalkInList = (product: Product) => {
    if (product.status === 'SOLD OUT' || product.stock <= 0) return;
    setWalkInList((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 900);
  };

  const updateWalkInQty = (productId: number, delta: number) => {
    setWalkInList((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const walkInTotalCount = walkInList.reduce((sum, i) => sum + i.quantity, 0);
  const walkInTotalPhp = walkInList.reduce((sum, i) => {
    const prod = products.find((p) => p.id === i.productId);
    return sum + (prod ? prod.price * i.quantity : 0);
  }, 0);

  // Filtered & Sorted Products for Public Flashcards
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.koreanName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return Number(b.isBestSeller) - Number(a.isBestSeller);
    });

  const bestSellers = products.filter((p) => p.isBestSeller);

  // Navigate to section smoothly
  const navigateToSection = (sec: PublicSection) => {
    setActivePublicTab(sec);
    const el = document.getElementById(`section-${sec}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================================================
  // PORTAL ROUTING: ADMIN PORTAL (/admin)
  // ==========================================================================
  if (activePortal === 'ADMIN') {
    return (
      <AdminPortal
        products={products}
        setProducts={setProducts}
        employees={employees}
        setEmployees={setEmployees}
        salaries={salaries}
        setSalaries={setSalaries}
        inventoryLogs={inventoryLogs}
        setInventoryLogs={setInventoryLogs}
        attendance={attendance}
        requests={requests}
        setRequests={setRequests}
        guidelines={guidelines}
        setGuidelines={setGuidelines}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        messages={messages}
        setMessages={setMessages}
        cameras={cameras}
        setCameras={setCameras}
        activityLogs={activityLogs}
        appendLog={appendLog}
        storeSettings={storeSettings}
        setStoreSettings={setStoreSettings}
        onReturnToPublic={() => setActivePortal('PUBLIC')}
      />
    );
  }

  // ==========================================================================
  // PORTAL ROUTING: EMPLOYEE PORTAL (/employee)
  // ==========================================================================
  if (activePortal === 'EMPLOYEE') {
    return (
      <EmployeePortal
        products={products}
        setProducts={setProducts}
        employees={employees}
        setEmployees={setEmployees}
        inventoryLogs={inventoryLogs}
        setInventoryLogs={setInventoryLogs}
        attendance={attendance}
        setAttendance={setAttendance}
        schedules={schedules}
        requests={requests}
        setRequests={setRequests}
        guidelines={guidelines}
        storeSettings={storeSettings}
        appendLog={appendLog}
        onReturnToPublic={() => setActivePortal('PUBLIC')}
      />
    );
  }

  // ==========================================================================
  // PORTAL ROUTING: STYLED 404 ERROR PAGE (/404.php)
  // ==========================================================================
  if (activePortal === '404') {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-center">
        <NimHanLogo size="lg" />
        <div className="mt-6 text-xs font-mono uppercase tracking-widest text-[#C8102E] font-semibold">
          ERROR 404 · 페이지를 찾을 수 없습니다
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#1B2A49] mt-2">
          Aisle Not Found in Marilao Branch
        </h1>
        <p className="text-sm text-neutral-600 max-w-md mt-2">
          The page or Korean grocery item you are looking for may have moved to another shelf. Let’s take you back to the main store entrance.
        </p>
        <button
          onClick={() => setActivePortal('PUBLIC')}
          className="mt-6 px-6 py-2.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white text-sm font-semibold transition-colors btn-interactive"
        >
          Return to Nim Han Korean Mart
        </button>
      </div>
    );
  }

  // Dynamic Consumer Theme Classes (Light Mode vs Dark Mode)
  const pageBg = isDarkMode ? 'bg-[#0B111E] text-[#F3F4F6]' : 'bg-[#FBF9F5] text-[#18181B]';
  const surfaceBg = isDarkMode ? 'bg-[#131C2E] border-neutral-800' : 'bg-white border-neutral-200/90';
  const cardSurface = isDarkMode ? 'bg-[#172236] border-neutral-800/90' : 'bg-white border-neutral-200/80';
  const subtleSurface = isDarkMode ? 'bg-[#0F172A] border-neutral-800' : 'bg-[#FBF9F5] border-neutral-200/80';
  const headingText = isDarkMode ? 'text-white' : 'text-[#1B2A49]';
  const bodyMuted = isDarkMode ? 'text-neutral-300' : 'text-neutral-600';
  const metaMuted = isDarkMode ? 'text-neutral-400' : 'text-neutral-500';

  // ==========================================================================
  // PUBLIC WEBSITE (/index.php)
  // ==========================================================================
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 pb-16 md:pb-0 ${pageBg}`}>
      {/* Loading Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A] text-white flex flex-col items-center justify-center transition-opacity duration-300">
          <NimHanLogo size="lg" />
          <div className="mt-4 text-base font-heading font-bold tracking-wide text-neutral-100">
            Nim Han Korean Mart
          </div>
          <div className="mt-1 text-xs text-[#C89B3C]">환영합니다 · Marilao Branch</div>
        </div>
      )}

      {/* Editable Top Announcement Banner (Clean for Public Consumers - No Staff/Code Links) */}
      {storeSettings.announcementActive && (
        <div className="bg-[#1B2A49] text-white px-4 py-2 text-xs text-center border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <p className="font-medium leading-snug">
              {storeSettings.announcementBanner}
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================
          STICKY NAVBAR (Strict 3-Zone Top Bar Contract)
          Zone 1: Logo + "Nim Han Korean Mart"
          Zone 2: HOME | ABOUT | PRODUCTS | CONTACT
          Zone 3: Consumer Dark Mode Toggle + Walk-In List Button
         ==================================================================== */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
          isDarkMode
            ? 'bg-[#0F172A]/95 border-neutral-800'
            : 'bg-white/95 border-neutral-200/90'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Logo (10-Click Secret Trigger) + "Nim Han Korean Mart" */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* <!-- ===== [CHANGE LOGO IMAGE HERE] ===== --> */}
            <NimHanLogo onClick={handleSecretLogoClick} size="sm" />
            {/* <!-- ===== [CHANGE STORE NAME / TAGLINE HERE] ===== --> */}
            <a
              href="#section-home"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection('home');
              }}
              className={`font-heading font-extrabold text-base sm:text-xl tracking-tight truncate ${headingText}`}
            >
              Nim Han Korean Mart
            </a>
          </div>

          {/* Zone 2: Primary Navigation Links (HOME | ABOUT | PRODUCTS | CONTACT) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wider">
            {(
              [
                { id: 'home', label: 'HOME' },
                { id: 'about', label: 'ABOUT' },
                { id: 'products', label: 'PRODUCTS' },
                { id: 'contact', label: 'CONTACT' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateToSection(tab.id)}
                className={`py-1.5 border-b-2 transition-colors whitespace-nowrap btn-interactive ${
                  activePublicTab === tab.id
                    ? 'border-[#C8102E] text-[#C8102E]'
                    : isDarkMode
                    ? 'border-transparent text-neutral-300 hover:text-white'
                    : 'border-transparent text-neutral-600 hover:text-[#1B2A49]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Consumer Dark Mode Toggle & Walk-In Shopping List Drawer Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Dark or Light Mode"
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 btn-interactive ${
                isDarkMode
                  ? 'bg-[#1E293B] border-neutral-700 text-amber-300 hover:bg-neutral-800'
                  : 'bg-[#FBF9F5] border-neutral-300 text-[#1B2A49] hover:bg-neutral-100'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#1B2A49]" />
                  <span className="hidden lg:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsWalkInDrawerOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap btn-interactive"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Walk-In List ({walkInTotalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          SECTION 1: HERO BANNER (HOME)
          Full background image with authentic Korean noodles & comfort food,
          high-contrast readable typography, and clean walk-in actions
         ==================================================================== */}
      {/* <!-- ===== [CHANGE HERO BACKGROUND IMAGE HERE] ===== --> */}
      <section
        id="section-home"
        className="relative overflow-hidden border-b transition-colors duration-200"
      >
        {/* Full Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={buldakImg}
            alt="Authentic Korean Noodles Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          {/* Contrast-enhancing gradient scrim for high readability in both light & dark mode */}
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#090E1A]/95 via-[#0F172A]/90 to-[#090E1A]/80'
                : 'bg-gradient-to-r from-[#1B2A49]/95 via-[#1B2A49]/85 to-[#0F172A]/75'
            }`}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 text-white">
          <div className="max-w-3xl space-y-5 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#E5B869] bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/15">
              <span>환영합니다 · Welcome Walk-In Shoppers</span>
            </div>

            {/* <!-- ===== [CHANGE STORE NAME / TAGLINE HERE] ===== --> */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-sm"
              style={{ textWrap: 'balance' }}
            >
              {storeSettings.storeName}
            </h1>

            <p className="text-lg sm:text-2xl font-semibold text-[#E5B869] drop-shadow-xs">
              “{storeSettings.tagline}”
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-100 max-w-2xl font-normal drop-shadow-xs">
              Browse our live shelf inventory from your phone, build your personal walk-in shopping checklist, and visit us along McArthur Highway in Marilao for authentic Samyang Buldak, Shin Ramyun, Binggrae Banana Milk, and Korean street snacks.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => navigateToSection('products')}
                className="px-6 py-3.5 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] text-white text-sm font-bold flex items-center gap-2 shadow-lg btn-interactive"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Store Flashcards
              </button>
              <button
                onClick={() => navigateToSection('contact')}
                className="px-5 py-3.5 rounded-xl border border-white/35 bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xs btn-interactive"
              >
                <MapPin className="w-4 h-4 text-[#E5B869]" />
                Walk-In Store Location
              </button>
            </div>

            {/* Unboxed Metadata Bar */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-200">
              <span className="bg-black/30 px-2.5 py-1 rounded-md border border-white/10">Walk-In Shopping Only</span>
              <span aria-hidden="true">·</span>
              <span className="bg-black/30 px-2.5 py-1 rounded-md border border-white/10">100% Authentic Korean Imports</span>
              <span aria-hidden="true">·</span>
              <span className="bg-black/30 px-2.5 py-1 rounded-md border border-white/10">Open Daily 8:00 AM – 10:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: FEATURED / BEST-SELLING PRODUCTS CAROUSEL & WALK-IN PERKS
         ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        {/* Featured Best Sellers Carousel */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                인기 상품 · Marilao Branch Best Sellers
              </div>
              <h2 className={`text-2xl sm:text-3xl font-heading font-extrabold mt-1 ${headingText}`}>
                Most-Loved Korean Groceries On Our Shelves
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCarouselIndex((prev) => (prev === 0 ? Math.max(0, bestSellers.length - 3) : prev - 1))
                }
                className={`p-2.5 rounded-xl border transition-colors btn-interactive ${cardSurface}`}
                aria-label="Previous featured products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCarouselIndex((prev) => (prev + 1 >= bestSellers.length ? 0 : prev + 1))
                }
                className={`p-2.5 rounded-xl border transition-colors btn-interactive ${cardSurface}`}
                aria-label="Next featured products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.slice(carouselIndex, carouselIndex + 3).map((item) => {
              const isSoldOut = item.status === 'SOLD OUT' || item.stock <= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => setQuickViewProduct(item)}
                  className={`rounded-2xl border overflow-hidden flashcard-hover cursor-pointer flex flex-col ${cardSurface}`}
                >
                  <div className="aspect-4/3 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${
                        isSoldOut ? 'grayscale opacity-55' : ''
                      }`}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className={`flex items-center gap-1.5 text-xs ${metaMuted}`}>
                        <span>{item.category}</span>
                        <span>·</span>
                        <span
                          className={
                            isSoldOut
                              ? 'text-[#C8102E] font-bold'
                              : 'text-emerald-600 dark:text-emerald-400 font-bold'
                          }
                        >
                          {isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                        </span>
                        <span>·</span>
                        <span className="text-[#C89B3C] font-semibold">Best Seller</span>
                      </div>
                      <h3 className={`text-base font-heading font-bold mt-1 ${headingText}`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs mt-1 line-clamp-2 ${bodyMuted}`}>
                        {item.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                      <span className="text-base font-bold font-mono-tabular">
                        ₱{item.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-[#C8102E]">
                        Tap for Aisle & Pairing →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Walk-In Shoppers Love Us (No Online Delivery / Walk-In Focused) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[
            {
              icon: Sparkles,
              title: '01. 100% Authentic Korean Imports',
              desc: 'Directly stocked with genuine South Korean staples—Samyang Buldak, Nongshim, CJ Bibigo, Sunchang, and Binggrae.',
            },
            {
              icon: Store,
              title: '02. Check Live Stock Before You Walk In',
              desc: 'We are a dedicated walk-in neighborhood store. Check our real-time flashcards online so you always know what is on the shelf!',
            },
            {
              icon: Compass,
              title: '03. In-Store Aisle Finder & Budget List',
              desc: 'Tap "+ Walk-In List" on any product below to calculate your total PHP budget and see which aisle & shelf to visit inside our Marilao branch.',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-6 rounded-2xl border space-y-2.5 ${cardSurface}`}
              >
                <Icon className="w-5 h-5 text-[#C8102E]" />
                <h3 className={`text-base font-heading font-bold ${headingText}`}>
                  {feat.title}
                </h3>
                <p className={`text-xs leading-relaxed ${bodyMuted}`}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: PRODUCTS FLASHCARDS CATALOG (PRODUCTS)
         ==================================================================== */}
      <section
        id="section-products"
        className={`border-y py-14 sm:py-16 transition-colors duration-200 ${surfaceBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                전체 상품 목록 · Real-Time Shelf Availability
              </div>
              <h2 className={`text-2xl sm:text-3xl font-heading font-extrabold mt-1 ${headingText}`}>
                Korean Grocery Product Flashcards
              </h2>
              <p className={`text-xs mt-1 ${metaMuted}`}>
                Tap any card to inspect its Spice Level & Aisle Location, or add available items to your personal Walk-In Shopping List.
              </p>
            </div>
            <div className={`text-xs font-mono-tabular ${metaMuted}`}>
              Showing {filteredProducts.length} of {products.length} items · Favorites: {wishlistIds.length}
            </div>
          </div>

          {/* Responsive Search Bar, Horizontal Swipeable Category Filter & Sort */}
          <div
            className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 p-4 rounded-2xl border ${subtleSurface}`}
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Buldak, Shin Ramyun, Gochujang, Banana Milk..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#C8102E] ${
                  isDarkMode
                    ? 'bg-[#1E293B] border-neutral-700 text-white placeholder:text-neutral-400'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
            </div>

            {/* Mobile-Friendly Swipeable Category Tabs */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-xl border overflow-x-auto no-scrollbar shadow-xs ${
                isDarkMode
                  ? 'bg-[#0B111E] border-neutral-700/80'
                  : 'bg-white border-neutral-300'
              }`}
            >
              {(['ALL', 'Noodles', 'Snacks', 'Sauces', 'Drinks', 'Frozen'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-interactive ${
                    selectedCategory === cat
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : isDarkMode
                      ? 'text-neutral-200 hover:text-white hover:bg-neutral-800'
                      : 'text-[#1B2A49] hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#C8102E] ${
                isDarkMode
                  ? 'bg-[#1E293B] border-neutral-700 text-white'
                  : 'bg-white border-neutral-300 text-neutral-700'
              }`}
            >
              <option value="featured">Sort: Featured & Best Sellers</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
            </select>
          </div>

          {/* Product Flashcards Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {/* <!-- ===== [ADD OR DUPLICATE A PRODUCT FLASHCARD HERE] ===== --> */}
            {filteredProducts.map((product) => {
              const isSoldOut = product.status === 'SOLD OUT' || product.stock <= 0;
              const isWished = wishlistIds.includes(product.id);
              const isJustAdded = justAddedId === product.id;

              return (
                <article
                  key={product.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between flashcard-hover ${
                    isDarkMode
                      ? 'bg-[#172236] border-neutral-800'
                      : 'bg-[#FBF9F5] border-neutral-200/90'
                  } ${isSoldOut ? 'opacity-90' : ''}`}
                >
                  <div>
                    {/* Product Image Container */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="aspect-4/3 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden cursor-pointer"
                    >
                      {/* <!-- ===== [PRODUCT IMAGE GOES HERE] ===== --> */}
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isSoldOut ? 'grayscale contrast-75 opacity-60' : 'hover:scale-105'
                        }`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        aria-label="Save to Favorites"
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-700 shadow-sm btn-interactive"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWished ? 'fill-[#C8102E] text-[#C8102E]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Flashcard Body */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      className="p-5 space-y-2.5 cursor-pointer"
                    >
                      {/* Unboxed Metadata Row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`font-semibold uppercase tracking-wider ${metaMuted}`}>
                          {product.category}
                        </span>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <span
                          className={`font-extrabold tracking-wide ${
                            isSoldOut
                              ? 'text-[#C8102E]'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                        </span>
                        {product.isBestSeller && (
                          <>
                            <span aria-hidden="true" className="opacity-40">
                              ·
                            </span>
                            <span className="text-[#C89B3C] font-bold">Best Seller</span>
                          </>
                        )}
                        {product.isNew && (
                          <>
                            <span aria-hidden="true" className="opacity-40">
                              ·
                            </span>
                            <span className="text-sky-500 font-bold">New</span>
                          </>
                        )}
                        {product.promoLabel && (
                          <>
                            <span aria-hidden="true" className="opacity-40">
                              ·
                            </span>
                            <span className="text-[#C8102E] font-bold">
                              {product.promoLabel}
                            </span>
                          </>
                        )}
                      </div>

                      <div>
                        <h3 className={`text-base font-heading font-bold leading-snug ${headingText}`}>
                          {product.name}
                        </h3>
                        <div className={`text-xs mt-0.5 ${metaMuted}`}>
                          {product.koreanName}
                          {product.aisleLocation ? ` · ${product.aisleLocation}` : ''}
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed ${bodyMuted}`}>
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Flashcard Footer */}
                  <div
                    className={`px-5 py-4 border-t flex items-center justify-between gap-3 ${
                      isDarkMode
                        ? 'bg-[#131C2E] border-neutral-800'
                        : 'bg-white border-neutral-200/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold font-mono-tabular">
                          ₱{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs font-mono-tabular text-neutral-400 line-through">
                            ₱{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {!isSoldOut && (
                        <div className={`text-[11px] font-mono-tabular ${metaMuted}`}>
                          {product.stock} packs on shelf
                        </div>
                      )}
                    </div>

                    {isSoldOut ? (
                      <button
                        onClick={() => {
                          setNotifyProduct(product);
                          setNotifySaved(false);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1B2A49] hover:bg-[#111C33] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap btn-interactive"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        Notify When Back
                      </button>
                    ) : (
                      <button
                        onClick={() => addToWalkInList(product)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap btn-interactive ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#C8102E] hover:bg-[#A50D26] text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added to List
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Walk-In List
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: ABOUT US, MILESTONES & TEAM (ABOUT) + TESTIMONIALS
         ==================================================================== */}
      <section id="section-about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
              우리의 이야기 · Est. 2020 in Marilao, Bulacan
            </div>
            {/* <!-- ===== [CHANGE ABOUT STORY TEXT HERE] ===== --> */}
            <h2 className={`text-2xl sm:text-3xl font-heading font-extrabold ${headingText}`}>
              Bringing Seoul’s Neighborhood Mart Culture to Marilao
            </h2>
            <p className={`text-sm leading-relaxed ${bodyMuted}`}>
              {storeSettings.aboutStory}
            </p>

            {/* Timeline of Milestones */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  year: '2020',
                  title: 'Humble Beginnings',
                  text: 'Launched Nim-Han Korean Mart with 60 essential Korean noodle & sauce SKUs.',
                },
                {
                  year: '2023',
                  title: 'Cold-Chain Expansion',
                  text: 'Added commercial upright chillers & Bibigo dumpling freezers in Marilao.',
                },
                {
                  year: '2026',
                  title: 'Live Walk-In Flashcards',
                  text: 'Launched live online product flashcards so walk-in shoppers can check shelf stock anytime.',
                },
              ].map((m) => (
                <div key={m.year} className={`p-4 rounded-2xl border ${cardSurface}`}>
                  <div className="text-sm font-mono-tabular font-bold text-[#C8102E]">{m.year}</div>
                  <div className={`text-xs font-heading font-bold mt-1 ${headingText}`}>
                    {m.title}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${bodyMuted}`}>{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#1B2A49] text-white space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#C89B3C] font-semibold">
                Our Mission
              </div>
              <p className="text-xs leading-relaxed text-neutral-200">{storeSettings.mission}</p>
            </div>
            <div className={`p-6 rounded-2xl border space-y-2 ${cardSurface}`}>
              <div className="text-xs font-mono uppercase tracking-wider text-[#C8102E] font-bold">
                Our Vision
              </div>
              <p className={`text-xs leading-relaxed ${bodyMuted}`}>{storeSettings.vision}</p>
            </div>

            {/* Meet the Marilao Branch Team */}
            <div className={`p-6 rounded-2xl border space-y-3 ${cardSurface}`}>
              <h3 className={`text-sm font-heading font-bold ${headingText}`}>
                Meet Our Marilao Branch Team
              </h3>
              <div className="space-y-2.5 text-xs">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between py-1.5 border-b border-neutral-200/50 dark:border-neutral-700/50 last:border-0"
                  >
                    <div>
                      <div className="font-bold">{emp.fullName}</div>
                      <div className={metaMuted}>{emp.position}</div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      In-Store Staff
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Testimonials Slider */}
        <div className={`p-6 sm:p-8 rounded-2xl border ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                고객 후기 · Marilao Walk-In Shoppers
              </div>
              <h3 className={`text-xl font-heading font-extrabold mt-0.5 ${headingText}`}>
                What Our Neighborhood Regulars Say
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold btn-interactive ${
                    testimonialIndex === idx
                      ? 'bg-[#C8102E] text-white'
                      : isDarkMode
                      ? 'bg-neutral-800 text-neutral-300'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {testimonials[testimonialIndex] && (
            <blockquote className="space-y-3">
              <p className="text-sm sm:text-base italic leading-relaxed max-w-3xl">
                “{testimonials[testimonialIndex].comment}”
              </p>
              <footer className={`text-xs flex flex-wrap items-center gap-2 pt-1 ${metaMuted}`}>
                <strong className={headingText}>
                  {testimonials[testimonialIndex].customerName}
                </strong>
                <span>·</span>
                <span>{testimonials[testimonialIndex].roleOrBarangay}</span>
                <span>·</span>
                <span className="text-[#C8102E] font-semibold">
                  Favorite Pick: {testimonials[testimonialIndex].productPurchased}
                </span>
              </footer>
            </blockquote>
          )}
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: VISIT OUR STORE (CONTACT) - WALK-IN ONLY (NO INQUIRY FORM)
          Fully Editable from Admin Portal -> Store Content Manager
         ==================================================================== */}
      <section
        id="section-contact"
        className={`border-t py-14 sm:py-16 transition-colors duration-200 ${surfaceBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Editable 매장 안내 · Visit Our Store Details */}
          <div className={`lg:col-span-6 p-6 sm:p-8 rounded-2xl border flex flex-col justify-between space-y-6 ${subtleSurface}`}>
            <div className="space-y-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                  {storeSettings.visitKicker}
                </div>
                <h2 className={`text-2xl sm:text-3xl font-heading font-extrabold mt-1 ${headingText}`}>
                  {storeSettings.visitHeading}
                </h2>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <span className="font-medium">{storeSettings.branchAddress}</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <span className="font-medium">{storeSettings.storeHours}</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <span className="font-mono-tabular font-semibold">{storeSettings.phone}</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
                  <span className="font-medium">{storeSettings.email}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${cardSurface} space-y-1.5`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold flex items-center gap-1.5 ${headingText}`}>
                  <Navigation className="w-3.5 h-3.5 text-[#C8102E]" />
                  Walk-In Storefront Landmark
                </span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Walk-In Only · Free Parking
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${bodyMuted}`}>
                {storeSettings.landmarkDirections}
              </p>
            </div>
          </div>

          {/* Right Column: In-Store Aisle Directory & Best Walk-In Hours Guide */}
          <div className={`lg:col-span-6 p-6 sm:p-8 rounded-2xl border flex flex-col justify-between space-y-6 ${subtleSurface}`}>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#C89B3C]">
                  매장 쇼핑 가이드 · Walk-In Shopper Guide
                </div>
                <h3 className={`text-xl sm:text-2xl font-heading font-extrabold mt-1 ${headingText}`}>
                  Quick Store Aisle Map & Payment Options
                </h3>
                <p className={`text-xs mt-1 ${metaMuted}`}>
                  We operate exclusively as a physical walk-in store so every pack of ramen, ice cream, and frozen dumpling stays in top condition.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { zone: 'Aisle 1 · Ramen Wall', items: 'Samyang Buldak, Shin Ramyun, Jin Ramen, Chapagetti' },
                  { zone: 'Aisle 2 · K-Snacks & Tteok', items: 'Honey Butter Chips, Roasted Gim Seaweed, Tteokbokki Kits' },
                  { zone: 'Aisle 3 · Sauces & Pantry', items: 'Sunchang Gochujang, Doenjang, Sesame Oil, Danmuji' },
                  { zone: 'Chillers & Freezers', items: 'Binggrae Banana Milk, Milkis, Bibigo Mandu, Fish Cakes' },
                ].map((aisle) => (
                  <div key={aisle.zone} className={`p-3.5 rounded-xl border ${cardSurface}`}>
                    <div className={`font-heading font-bold ${headingText}`}>{aisle.zone}</div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${bodyMuted}`}>{aisle.items}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1B2A49] text-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#C89B3C]">Accepted In-Store Payments</div>
                <div className="text-neutral-200 mt-0.5">
                  Cash (PHP) · GCash QR · Maya QR (At Marilao Cashier Counter)
                </div>
              </div>
              <button
                onClick={() => setIsWalkInDrawerOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#C8102E] hover:bg-[#A50D26] text-white font-bold btn-interactive"
              >
                Open My Walk-In List ({walkInTotalCount})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER (Clean Consumer Footer - No Public Developer/Staff Links)
         ==================================================================== */}
      {/* <!-- ===== [CHANGE FOOTER / SOCIAL LINKS HERE] ===== --> */}
      <footer className="bg-[#090E1A] text-neutral-300 py-12 border-t border-neutral-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <NimHanLogo onClick={handleSecretLogoClick} size="sm" />
            <div className="font-heading font-bold text-white text-sm">
              {storeSettings.visitHeading}
            </div>
            <p className="text-neutral-400 leading-relaxed">
              {storeSettings.tagline}. Proudly serving walk-in shoppers in Marilao, Bulacan since 2020.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-heading font-bold text-white uppercase tracking-wider">
              Walk-In Location & Hours
            </div>
            <p className="text-neutral-400">{storeSettings.branchAddress}</p>
            <p className="text-neutral-400">{storeSettings.storeHours}</p>
            <p className="text-neutral-400 font-mono">{storeSettings.phone}</p>
          </div>

          <div className="space-y-2">
            <div className="font-heading font-bold text-white uppercase tracking-wider">
              Store Navigation
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <button onClick={() => navigateToSection('home')} className="hover:text-white">
                Home
              </button>
              <button onClick={() => navigateToSection('products')} className="hover:text-white">
                Products
              </button>
              <button onClick={() => navigateToSection('about')} className="hover:text-white">
                About Us
              </button>
              <button onClick={() => navigateToSection('contact')} className="hover:text-white">
                Visit Store
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 pt-3">
              © {new Date().getFullYear()} {storeSettings.visitHeading}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MOBILE BOTTOM THUMB NAVIGATION BAR (iPhone / Android Responsive)
         ==================================================================== */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 flex items-center justify-around text-[11px] font-bold ${
          isDarkMode
            ? 'bg-[#0F172A]/95 border-neutral-800 text-neutral-300'
            : 'bg-white/95 border-neutral-200 text-neutral-600'
        } backdrop-blur-md`}
      >
        {(
          [
            { id: 'home', label: 'Home' },
            { id: 'products', label: 'Products' },
            { id: 'about', label: 'About' },
            { id: 'contact', label: 'Visit Us' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => navigateToSection(item.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors btn-interactive ${
              activePublicTab === item.id ? 'text-[#C8102E] font-extrabold' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setIsWalkInDrawerOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#C8102E] text-white font-extrabold btn-interactive"
        >
          List ({walkInTotalCount})
        </button>
      </nav>

      {/* ====================================================================
          WALK-IN SHOPPING LIST & BUDGET CALCULATOR DRAWER
         ==================================================================== */}
      {isWalkInDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs">
          <div
            className={`w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-pop-in ${
              isDarkMode ? 'bg-[#131C2E] text-white' : 'bg-white text-[#18181B]'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                  In-Store Walk-In Helper
                </div>
                <h3 className="text-lg font-heading font-extrabold">
                  My Walk-In Shopping Checklist
                </h3>
              </div>
              <button
                onClick={() => setIsWalkInDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {walkInList.length === 0 ? (
                <div className={`text-center py-12 text-xs space-y-2 ${metaMuted}`}>
                  <ShoppingBag className="w-8 h-8 mx-auto opacity-40" />
                  <p>Your walk-in shopping checklist is empty.</p>
                  <p>Tap “+ Walk-In List” on any product flashcard to plan your store visit & calculate your budget!</p>
                </div>
              ) : (
                walkInList.map((entry) => {
                  const prod = products.find((p) => p.id === entry.productId);
                  if (!prod) return null;
                  return (
                    <div
                      key={entry.productId}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${subtleSurface}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">{prod.name}</div>
                        <div className={`text-[11px] mt-0.5 ${metaMuted}`}>
                          {prod.aisleLocation || 'Main Aisle'} · ₱{prod.price.toFixed(2)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateWalkInQty(prod.id, -1)}
                          className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 btn-interactive"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono-tabular font-bold w-5 text-center">
                          {entry.quantity}
                        </span>
                        <button
                          onClick={() => updateWalkInQty(prod.id, 1)}
                          className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 btn-interactive"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Estimated Walk-In Total:</span>
                <span className="text-lg font-mono-tabular text-[#C8102E]">
                  ₱{walkInTotalPhp.toFixed(2)}
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${metaMuted}`}>
                Show this checklist on your phone when visiting {storeSettings.visitHeading} to find items quickly by aisle!
              </p>
              <div className="flex items-center gap-2">
                {walkInList.length > 0 && (
                  <button
                    onClick={() => setWalkInList([])}
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold flex items-center gap-1.5 btn-interactive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsWalkInDrawerOpen(false);
                    navigateToSection('contact');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B2A49] text-white font-bold btn-interactive"
                >
                  View Store Address & Hours
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          PRODUCT QUICK-VIEW MODAL (Spice Level, Aisle Location & Pairing Guide)
         ==================================================================== */}
      {quickViewProduct && (
        <div
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-lg w-full rounded-2xl border overflow-hidden shadow-2xl animate-pop-in ${
              isDarkMode ? 'bg-[#172236] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-[#18181B]'
            }`}
          >
            <div className="aspect-16/10 relative bg-neutral-100 dark:bg-neutral-800">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className={`flex items-center gap-2 ${metaMuted}`}>
                  <span>{quickViewProduct.category}</span>
                  <span>·</span>
                  <span>{quickViewProduct.koreanName}</span>
                  <span>·</span>
                  <span
                    className={
                      quickViewProduct.status === 'AVAILABLE' && quickViewProduct.stock > 0
                        ? 'text-emerald-500 font-bold'
                        : 'text-[#C8102E] font-bold'
                    }
                  >
                    {quickViewProduct.status} ({quickViewProduct.stock} in stock)
                  </span>
                </div>
                <h3 className="text-xl font-heading font-extrabold mt-1">
                  {quickViewProduct.name}
                </h3>
                <div className="text-lg font-mono-tabular font-bold text-[#C8102E] mt-1">
                  ₱{quickViewProduct.price.toFixed(2)}
                </div>
              </div>

              <p className={`leading-relaxed ${bodyMuted}`}>{quickViewProduct.description}</p>

              <div className={`p-3.5 rounded-xl border space-y-2 ${subtleSurface}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#C8102E]" />
                    Marilao Store Location:
                  </span>
                  <span className="font-semibold">
                    {quickViewProduct.aisleLocation || 'Center Gondola Shelf'}
                  </span>
                </div>
                {quickViewProduct.spiceLevel && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#C8102E]" />
                      Korean Spice Meter:
                    </span>
                    <span className="font-semibold text-[#C8102E]">
                      {quickViewProduct.spiceLevel}
                    </span>
                  </div>
                )}
                {quickViewProduct.pairingTip && (
                  <div className={`pt-1 border-t border-neutral-200 dark:border-neutral-700 ${bodyMuted}`}>
                    <strong>Best K-Food Pairing:</strong> {quickViewProduct.pairingTip}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold btn-interactive"
                >
                  Close
                </button>
                {quickViewProduct.status === 'AVAILABLE' && quickViewProduct.stock > 0 && (
                  <button
                    onClick={() => {
                      addToWalkInList(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#C8102E] text-white font-bold btn-interactive"
                  >
                    + Add to Walk-In List
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SECRET STAFF ACCESS MODAL (Triggered ONLY by 10 Logo Clicks within 8s)
         ==================================================================== */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white text-[#18181B] rounded-2xl border border-neutral-200 max-w-md w-full p-7 text-center shadow-2xl space-y-5 animate-pop-in">
            <div className="flex justify-center">
              <NimHanLogo size="md" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C8102E] font-semibold">
                Authorized Branch Personnel Gate
              </div>
              <h3 className="text-2xl font-heading font-extrabold text-[#1B2A49] mt-1">
                Staff Access
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Select your destination portal for NIM HAN KOREAN MART Marilao Branch:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setStaffModalOpen(false);
                  setActivePortal('ADMIN');
                }}
                className="p-4 rounded-xl bg-[#1B2A49] hover:bg-[#111C33] text-white text-center transition-colors flex flex-col items-center gap-2 btn-interactive"
              >
                <Lock className="w-5 h-5 text-[#C89B3C]" />
                <span className="text-xs font-bold tracking-wider">ADMIN PORTAL</span>
                <span className="text-[10px] text-neutral-300 font-mono">/admin/login.php</span>
              </button>

              <button
                onClick={() => {
                  setStaffModalOpen(false);
                  setActivePortal('EMPLOYEE');
                }}
                className="p-4 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] text-white text-center transition-colors flex flex-col items-center gap-2 btn-interactive"
              >
                <UserCheck className="w-5 h-5 text-white" />
                <span className="text-xs font-bold tracking-wider">EMPLOYEE PORTAL</span>
                <span className="text-[10px] text-red-100 font-mono">/employee/login.php</span>
              </button>
            </div>

            <button
              onClick={() => setStaffModalOpen(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold"
            >
              Cancel & Return to Storefront
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          "NOTIFY ME WHEN BACK IN STOCK" MODAL FOR SOLD-OUT PRODUCTS
         ==================================================================== */}
      {notifyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="bg-white text-[#18181B] rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">
                  Restock Alert Request
                </div>
                <h3 className="text-base font-heading font-bold text-[#1B2A49] mt-0.5">
                  {notifyProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setNotifyProduct(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifySaved ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold">Restock Alert Registered!</div>
                <p>
                  We’ll notify <strong>{notifyEmail}</strong> the moment our Marilao branch restocks {notifyProduct.name} on the shelf.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNotifySaved(true);
                  appendLog(
                    'SYSTEM',
                    'PUBLIC-RESTOCK-ALERT',
                    'BACK_IN_STOCK_SUB',
                    `Customer (${notifyEmail}) requested restock alert for ${notifyProduct.name}.`
                  );
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-neutral-600">
                  This item is currently marked <strong>SOLD OUT</strong> on our Marilao shelves. Enter your email or mobile number to get an alert when it’s ready for walk-in purchase:
                </p>
                <input
                  type="text"
                  required
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Email address or 0917-XXX-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifyProduct(null)}
                    className="px-4 py-2 rounded-lg border border-neutral-300"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#C8102E] text-white font-semibold btn-interactive"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          FLOATING BACK-TO-TOP BUTTON
         ==================================================================== */}
      {showBackToTop && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-[#1B2A49] text-white shadow-lg hover:bg-[#111C33] transition-colors btn-interactive"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
