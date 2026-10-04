<?php
/**
 * ============================================================================
 * NIM HAN KOREAN MART - Marilao Branch
 * File: /index.php
 * Description: Public Storefront with Database Fallback & Clean CSS/JS Separation
 * ============================================================================
 */

// Attempt database connection if config exists
$pdo = null;
if (file_exists(__DIR__ . '/config/db.php')) {
    try {
        require_once __DIR__ . '/config/db.php';
    } catch (Exception $e) {
        $pdo = null;
    }
}

// Fallback store content if database not yet imported
$bannerText = "✨ Chuseok Specials: Buy 2 Samyang Buldak get 1 Binggrae Drink at 20% off! Walk-In shoppers only.";
$aboutStory = "Established in 2020 along McArthur Highway in Marilao, NIM HAN KOREAN MART brings authentic Korean comfort food directly to Bulacan. From viral Buldak spicy ramen and sweet Binggrae banana milk to premium fermented Sunchang Gochujang and restaurant-grade Tteokbokki kits, we ensure every product on our shelves is 100% authentic and imported straight from South Korea.";

// Sample products array (works out-of-the-box even before MySQL import)
$products = [
    [
        'id' => 1,
        'name' => 'Samyang Buldak Carbonara Ramen (130g)',
        'category' => 'Noodles',
        'price' => 85.00,
        'stock' => 48,
        'description' => 'Chewy stir-fried noodles tossed in fiery Buldak sauce with creamy mozzarella carbonara powder.',
        'image' => 'assets/images/product_buldak_carbonara_1790947384775.jpg',
        'status' => 'AVAILABLE',
        'is_best_seller' => 1,
        'is_new' => 0
    ],
    [
        'id' => 2,
        'name' => 'Nongshim Shin Ramyun Gourmet Spicy (120g)',
        'category' => 'Noodles',
        'price' => 68.00,
        'stock' => 34,
        'description' => 'South Korea #1 beef and shiitake mushroom spicy noodle soup with rich, hearty broth.',
        'image' => 'assets/images/product_shin_ramyun_1790947398019.jpg',
        'status' => 'AVAILABLE',
        'is_best_seller' => 1,
        'is_new' => 0
    ],
    [
        'id' => 3,
        'name' => 'Chungjungone Sunchang Gochujang Paste (500g)',
        'category' => 'Sauces',
        'price' => 195.00,
        'stock' => 8,
        'description' => 'Sun-dried fermented red chili paste essential for Bibimbap, Tteokbokki, and Korean spicy marinades.',
        'image' => 'assets/images/product_gochujang_paste_1790947410166.jpg',
        'status' => 'AVAILABLE',
        'is_best_seller' => 1,
        'is_new' => 0
    ],
    [
        'id' => 4,
        'name' => 'Binggrae Banana Flavored Milk (200ml)',
        'category' => 'Drinks',
        'price' => 65.00,
        'stock' => 52,
        'description' => 'Iconic silky Korean banana milk drink, best served ice-cold with spicy Buldak noodles.',
        'image' => 'assets/images/product_banana_milk_1790947421876.jpg',
        'status' => 'AVAILABLE',
        'is_best_seller' => 1,
        'is_new' => 0
    ],
    [
        'id' => 5,
        'name' => 'Dongwon Street Tteokbokki Rice Cake Kit (400g)',
        'category' => 'Snacks',
        'price' => 175.00,
        'stock' => 22,
        'description' => 'Chewy cylinder rice cakes with sweet-spicy Myeongdong street market seasoning glaze.',
        'image' => 'assets/images/product_tteokbokki_snack_1790947433810.jpg',
        'status' => 'AVAILABLE',
        'is_best_seller' => 0,
        'is_new' => 1
    ],
    [
        'id' => 6,
        'name' => 'Samyang 2x Spicy Buldak Hot Chicken Ramen',
        'category' => 'Noodles',
        'price' => 88.00,
        'stock' => 0,
        'description' => 'Double the Scoville heat (8,808 SHU) for true spice challengers. Deeply flavorful with toasted sesame.',
        'image' => 'assets/images/product_buldak_carbonara_1790947384775.jpg',
        'status' => 'SOLD OUT',
        'is_best_seller' => 1,
        'is_new' => 0
    ]
];

// If MySQL is connected, load live records
if ($pdo) {
    try {
        $announcement = $pdo->query("SELECT banner_text FROM announcements WHERE id = 1 AND is_active = 1")->fetch();
        if ($announcement && !empty($announcement['banner_text'])) {
            $bannerText = htmlspecialchars($announcement['banner_text'], ENT_QUOTES, 'UTF-8');
        }
        $dbProducts = $pdo->query("
            SELECT p.*, c.name AS category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            ORDER BY p.is_best_seller DESC, p.id ASC
        ")->fetchAll();
        if (!empty($dbProducts)) {
            $products = array_map(function($p) {
                return [
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'category' => $p['category_name'] ?? 'Snacks',
                    'price' => (float)$p['price'],
                    'stock' => (int)$p['stock'],
                    'description' => $p['description'],
                    'image' => $p['image'],
                    'status' => $p['status'],
                    'is_best_seller' => (int)$p['is_best_seller'],
                    'is_new' => (int)$p['is_new']
                ];
            }, $dbProducts);
        }
    } catch (Exception $e) {
        // Fallback array remains
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIM HAN KOREAN MART Marilao Branch | Authentic Korean Groceries</title>
  <meta name="description" content="Authentic Korean Flavors, Right in Your Neighborhood. Shop Samyang Buldak, Shin Ramyun, Korean snacks, and drinks at NIM HAN KOREAN MART Marilao Branch.">
  <!-- Separate CSS Stylesheet Link -->
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Top Announcement Banner -->
  <div class="announcement-bar">
    <span><?= htmlspecialchars($bannerText) ?></span>
  </div>

  <!-- Sticky Navbar (Logo, Nav Links, Theme Toggle, Walk-In List) -->
  <header class="site-header">
    <div class="header-brand">
      <div id="secretLogoTrigger" class="brand-logo" title="Nim-Han Korean Mart (Est. 2020)">님-한</div>
      <a href="#home" class="brand-title">NIM HAN KOREAN MART</a>
    </div>

    <nav class="header-nav">
      <a href="#home" class="active">HOME</a>
      <a href="#about">ABOUT</a>
      <a href="#products">PRODUCTS</a>
      <a href="#contact">CONTACT</a>
    </nav>

    <div class="header-actions">
      <button id="themeToggleBtn" class="btn-theme-toggle" type="button">🌙 Dark</button>
      <button id="openWalkInBtn" class="btn-walkin-list" type="button">
        🛒 Walk-In List (<span id="walkInCounterBadge">0</span>)
      </button>
    </div>
  </header>

  <!-- Hero Section with Authentic Korean Noodle Backdrop -->
  <section id="home" class="hero-section">
    <div class="hero-scrim"></div>
    <div class="hero-content">
      <span class="hero-kicker">환영합니다 · Welcome Walk-In Shoppers</span>
      <h1>NIM HAN KOREAN MART Marilao Branch</h1>
      <p class="hero-tagline">“Authentic Korean Flavors, Right in Your Neighborhood”</p>
      <p class="hero-desc">
        Browse our live shelf inventory from your phone, build your personal walk-in shopping checklist, and visit us along McArthur Highway in Marilao for authentic Samyang Buldak, Shin Ramyun, Binggrae Banana Milk, and Korean street snacks.
      </p>
      <div class="hero-cta-group">
        <a href="#products" class="btn-primary">Browse Store Flashcards</a>
        <a href="#contact" class="btn-outline">Walk-In Store Location</a>
      </div>
      <div class="hero-badges">
        <span>Walk-In Shopping Only</span>
        <span>100% Authentic Korean Imports</span>
        <span>Open Daily 8:00 AM – 10:00 PM</span>
      </div>
    </div>
  </section>

  <!-- Featured Highlights Section -->
  <section class="section-container">
    <div class="section-header">
      <div class="section-kicker">인기 상품 · Marilao Branch Highlights</div>
      <h2>Why Walk-In Shoppers Love Us</h2>
      <p>Directly stocked with genuine South Korean staples—no long delivery waits.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <h3>01. 100% Authentic Korean Imports</h3>
        <p>Directly stocked with genuine South Korean staples—Samyang Buldak, Nongshim Shin Ramyun, CJ Bibigo, Sunchang, and Binggrae.</p>
      </div>
      <div class="feature-card">
        <h3>02. Check Live Stock Before You Walk In</h3>
        <p>We are a dedicated walk-in neighborhood store. Check our real-time flashcards online so you always know what is on the shelf!</p>
      </div>
      <div class="feature-card">
        <h3>03. In-Store Budget & Shopping List</h3>
        <p>Tap "+ Walk-In List" on any product below to calculate your total PHP budget before you visit our store along McArthur Highway.</p>
      </div>
    </div>
  </section>

  <!-- Products Catalog Section -->
  <section id="products" class="section-container">
    <div class="section-header">
      <div class="section-kicker">전체 상품 목록 · Real-Time Shelf Availability</div>
      <h2>Korean Grocery Product Flashcards</h2>
      <p>Tap "+ Walk-In List" to add available groceries to your personal checklist.</p>
    </div>

    <!-- Search, Category Filter & Sort Controls -->
    <div class="catalog-controls">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input type="search" id="productSearch" class="search-input" placeholder="Search Buldak, Shin Ramyun, Gochujang, Banana Milk..." />
      </div>

      <div class="category-tabs" id="categoryFilter">
        <button data-cat="ALL" class="active">All Items</button>
        <button data-cat="Noodles">Noodles</button>
        <button data-cat="Snacks">Snacks</button>
        <button data-cat="Sauces">Sauces</button>
        <button data-cat="Drinks">Drinks</button>
        <button data-cat="Frozen">Frozen</button>
      </div>

      <select id="productSort" class="sort-select">
        <option value="featured">Sort: Featured</option>
        <option value="price-asc">Sort: Price (Low to High)</option>
        <option value="price-desc">Sort: Price (High to Low)</option>
        <option value="name-asc">Sort: Name (A to Z)</option>
      </select>
    </div>

    <!-- Product Flashcards Grid -->
    <div class="product-grid" id="productGrid">
      <?php foreach ($products as $p):
        $isSoldOut = ($p['status'] === 'SOLD OUT' || (int)$p['stock'] <= 0);
      ?>
      <article class="product-flashcard <?= $isSoldOut ? 'is-sold-out' : '' ?>"
               data-id="<?= htmlspecialchars((string)$p['id']) ?>"
               data-name="<?= htmlspecialchars(strtolower($p['name'])) ?>"
               data-category="<?= htmlspecialchars($p['category']) ?>"
               data-price="<?= (float)$p['price'] ?>">
        <div class="flashcard-media">
          <img src="<?= htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" loading="lazy" />
        </div>
        <div class="flashcard-body">
          <div class="flashcard-meta">
            <span><?= htmlspecialchars($p['category']) ?></span>
            <span>·</span>
            <span class="<?= $isSoldOut ? 'status-soldout' : 'status-available' ?>">
              <?= $isSoldOut ? 'SOLD OUT' : 'AVAILABLE' ?>
            </span>
            <?php if (!empty($p['is_best_seller'])): ?>
              <span>·</span><span class="flag-bestseller">Best Seller</span>
            <?php endif; ?>
          </div>
          <h3 class="flashcard-title"><?= htmlspecialchars($p['name']) ?></h3>
          <p class="flashcard-desc"><?= htmlspecialchars($p['description']) ?></p>
          <div class="flashcard-footer">
            <span class="flashcard-price">₱<?= number_format((float)$p['price'], 2) ?></span>
            <?php if ($isSoldOut): ?>
              <button class="btn-soldout-disabled" disabled>Sold Out</button>
            <?php else: ?>
              <button class="btn-add-walkin" onclick="addToWalkIn('<?= htmlspecialchars((string)$p['id']) ?>', '<?= htmlspecialchars(addslashes($p['name'])) ?>', <?= (float)$p['price'] ?>)">
                + Walk-In List
              </button>
            <?php endif; ?>
          </div>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="section-container" style="border-top: 1px solid var(--border-color);">
    <div class="section-header">
      <div class="section-kicker">브랜드 소개 · Our Story in Marilao</div>
      <h2>Authentic Korean Comfort Food in Bulacan</h2>
    </div>
    <p style="font-size: 15px; color: var(--text-muted); line-height: 1.8; max-width: 800px;">
      <?= htmlspecialchars($aboutStory) ?>
    </p>
  </section>

  <!-- Contact & Location Section -->
  <section id="contact" class="section-container" style="border-top: 1px solid var(--border-color);">
    <div class="section-header">
      <div class="section-kicker">매장 안내 · Visit Our Marilao Branch</div>
      <h2>Store Hours & Contact Information</h2>
      <p>Visit our neighborhood shelves along McArthur Highway.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 20px;">
      <div style="background: var(--bg-surface); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <h3 style="font-size: 16px; margin-bottom: 8px;">📍 Store Address</h3>
        <p style="font-size: 14px; color: var(--text-muted);">McArthur Highway, Brgy. Abangan Norte, Marilao, Bulacan, Philippines</p>
        <h3 style="font-size: 16px; margin: 16px 0 8px;">🕒 Operating Hours</h3>
        <p style="font-size: 14px; color: var(--text-muted);">Monday – Sunday: 8:00 AM – 10:00 PM (Daily Walk-In)</p>
        <h3 style="font-size: 16px; margin: 16px 0 8px;">📞 Contact Numbers</h3>
        <p style="font-size: 14px; color: var(--text-muted);">+63 917 555 6464 · (044) 791 2026</p>
      </div>

      <div style="background: var(--bg-surface); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <h3 style="font-size: 16px; margin-bottom: 8px;">✉️ Message Marilao Branch</h3>
        <form class="contact-form" onsubmit="event.preventDefault(); alert('감사합니다! Your message has been sent to our Marilao store team.'); this.reset();">
          <input type="text" placeholder="Your Full Name" required />
          <input type="tel" placeholder="Mobile Number (e.g. 0917-XXX-XXXX)" required />
          <textarea rows="3" placeholder="Inquire about bulk orders, stock inquiries, or store pickup..." required></textarea>
          <button type="submit" class="btn-primary">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Walk-In Shopping List Slide-In Drawer -->
  <div id="walkInDrawer" class="walkin-drawer">
    <div class="walkin-drawer-content">
      <div class="drawer-header">
        <h3>🛒 Walk-In Checklist</h3>
        <button id="closeWalkInBtn" class="btn-close-drawer">✕</button>
      </div>
      <div id="walkInItemsContainer" class="drawer-body">
        <!-- Rendered by js/main.js -->
      </div>
      <div class="drawer-footer">
        <div class="total-budget-row">
          <span>Estimated Total:</span>
          <span id="walkInTotalAmount">₱0.00</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="printWalkInBtn" class="btn-primary" style="flex: 1;" type="button">Print Checklist</button>
          <button id="clearWalkInBtn" class="btn-outline" style="color: var(--text-main); border-color: var(--border-strong);" type="button">Clear</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Secret Staff Access Modal (Triggered by 10 clicks on logo) -->
  <div id="staffAccessModal" class="staff-modal" hidden style="display: none;">
    <div class="staff-modal-card">
      <h3>Staff Access</h3>
      <p>Authorized NIM HAN KOREAN MART Marilao Personnel Only</p>
      <div class="staff-modal-actions">
        <a href="admin/login.php" class="btn-admin-portal">ADMIN PORTAL</a>
        <a href="employee/login.php" class="btn-employee-portal">EMPLOYEE PORTAL</a>
      </div>
      <button type="button" id="closeStaffModal" class="btn-close-modal">Cancel</button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="site-footer">
    <p>© <?= date('Y') ?> NIM HAN KOREAN MART Marilao Branch · McArthur Highway, Marilao, Bulacan</p>
  </footer>

  <!-- Separate JS Script Link -->
  <script src="js/main.js"></script>
</body>
</html>
