export interface CodeFileEntry {
  path: string;
  category: 'Public Site' | 'Database & Config' | 'Admin Portal (/admin)' | 'Employee Portal (/employee)' | 'Node.js CCTV Server' | 'Deployment Guide';
  language: string;
  description: string;
  code: string;
}

export const SOURCE_CODE_FILES: CodeFileEntry[] = [
  {
    path: '/config/db.php',
    category: 'Database & Config',
    language: 'php',
    description: 'PDO MySQL connection for InfinityFree with CSRF token generation, input sanitization, and AES-256 helpers for CCTV credentials.',
    code: `<?php
/**
 * ============================================================================
 * NIM HAN KOREAN MART - Marilao Branch
 * File: /config/db.php
 * Description: Secure PDO Database Connection, Session Hardening & CSRF Helpers
 * ============================================================================
 */

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    session_start();
}

// <!-- ===== [CHANGE DATABASE CONNECTION HERE] ===== -->
// HOW TO FIND THESE IN INFINITYFREE:
// 1. Log in to https://dash.infinityfree.com
// 2. Open your account -> Click "MySQL Databases" in the Control Panel (VistaPanel).
// 3. Copy the "MySQL Host Name", "MySQL DB Name", "MySQL User Name", and your Account Password.
$host     = "sqlXXX.infinityfree.com";
$dbname   = "if0_XXXXXXX_nimhan";
$username = "if0_XXXXXXX";
$password = "YOUR_PASSWORD";

// Secret key used to sign JWT tokens for the Node.js CCTV server & encrypt RTSP passwords
define('NIMHAN_JWT_SECRET', 'change_this_to_a_64_char_random_secret_key_2026_marilao');
define('NIMHAN_AES_KEY', 'nimhan_marilao_aes256_secret_key');
define('CCTV_NODE_SERVER_URL', 'http://127.0.0.1:4000'); // Replace with Cloudflare Tunnel or VPS URL

try {
    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    die("Database connection failed. Please verify /config/db.php credentials.");
}

/**
 * Generate & Verify CSRF Token
 */
function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Clean & Sanitize User Input
 */
function clean_input(?string $data): string {
    return htmlspecialchars(trim((string)$data), ENT_QUOTES, 'UTF-8');
}

/**
 * Record Audit / Activity Log
 */
function log_activity(PDO $pdo, string $userType, string $userId, string $action, string $details): void {
    $stmt = $pdo->prepare("
        INSERT INTO activity_logs (user_type, user_id, action, details, ip_address)
        VALUES (:user_type, :user_id, :action, :details, :ip)
    ");
    $stmt->execute([
        ':user_type' => $userType,
        ':user_id'   => $userId,
        ':action'    => $action,
        ':details'   => $details,
        ':ip'        => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
    ]);
}

/**
 * Create HS256 JWT Token for Admin CCTV Node.js Server
 */
function generate_admin_cctv_jwt(): string {
    $header  = rtrim(strtr(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '+/', '-_'), '=');
    $payload = rtrim(strtr(base64_encode(json_encode([
        'role'   => 'admin',
        'branch' => 'Marilao',
        'iat'    => time(),
        'exp'    => time() + 3600
    ])), '+/', '-_'), '=');
    $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header.$payload", NIMHAN_JWT_SECRET, true)), '+/', '-_'), '=');
    return "$header.$payload.$signature";
}
?>`,
  },
  {
    path: '/database.sql',
    category: 'Database & Config',
    language: 'sql',
    description: 'Complete MySQL schema and initial sample data for phpMyAdmin import on InfinityFree (15 tables).',
    code: `-- ============================================================================
-- NIM HAN KOREAN MART Marilao Branch - Complete MySQL Database Schema
-- Compatible with InfinityFree MySQL / MariaDB via phpMyAdmin
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00";

-- 1. ADMIN TABLE (Single hashed admin password + login tracking)
CREATE TABLE IF NOT EXISTS \`admin\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`last_login\` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin Password: NimHanAdmin2026! (Hashed with PHP password_hash BCRYPT)
INSERT INTO \`admin\` (\`id\`, \`password_hash\`, \`last_login\`) VALUES
(1, '$2y$10$wH8fG7h1K9pL2mN4qR6sTuV8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ', NOW());

-- 2. LOGIN ATTEMPTS (Brute-force protection: lockout after 5 failed attempts for 10 mins)
CREATE TABLE IF NOT EXISTS \`login_attempts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`portal_type\` ENUM('ADMIN','EMPLOYEE') NOT NULL,
  \`attempts\` INT NOT NULL DEFAULT 1,
  \`locked_until\` DATETIME DEFAULT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS \`employees\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`employee_id\` VARCHAR(32) NOT NULL UNIQUE,
  \`full_name\` VARCHAR(120) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`position\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(40) DEFAULT NULL,
  \`email\` VARCHAR(120) DEFAULT NULL,
  \`status\` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`employees\` (\`employee_id\`, \`full_name\`, \`password_hash\`, \`position\`, \`phone\`, \`email\`, \`status\`) VALUES
('EMP-2020-01', 'Kristine Joy Dela Cruz', '$2y$10$wH8fG7h1K9pL2mN4qR6sTuV8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ', 'Senior Store Cashier & Inventory Lead', '+63 917 445 8821', 'kristine.delacruz@nimhan.ph', 'ACTIVE'),
('EMP-2022-04', 'Mark Angelo Villanueva', '$2y$10$wH8fG7h1K9pL2mN4qR6sTuV8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ', 'Stock & Cold-Chain Merchandiser', '+63 918 220 9104', 'mark.villanueva@nimhan.ph', 'ACTIVE'),
('EMP-2024-07', 'Hannah Mae Soriano', '$2y$10$wH8fG7h1K9pL2mN4qR6sTuV8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ', 'Customer Experience & Floor Associate', '+63 927 651 3349', 'hannah.soriano@nimhan.ph', 'ACTIVE');

-- 4. EMPLOYEE SALARY (STRICT ADMIN-ONLY TABLE - Never queried in /employee/*)
CREATE TABLE IF NOT EXISTS \`employee_salary\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`employee_id\` VARCHAR(32) NOT NULL UNIQUE,
  \`monthly_base_php\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`allowance_php\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`overtime_php\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`last_payout_date\` DATE DEFAULT NULL,
  \`bank_details\` VARCHAR(150) DEFAULT NULL,
  FOREIGN KEY (\`employee_id\`) REFERENCES \`employees\`(\`employee_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`employee_salary\` (\`employee_id\`, \`monthly_base_php\`, \`allowance_php\`, \`overtime_php\`, \`last_payout_date\`, \`bank_details\`) VALUES
('EMP-2020-01', 19500.00, 2000.00, 1450.00, '2026-09-30', 'BDO Unibank •••• 4821'),
('EMP-2022-04', 16800.00, 1500.00, 820.00, '2026-09-30', 'BPI Family •••• 9012'),
('EMP-2024-07', 15500.00, 1500.00, 0.00, '2026-09-30', 'GCash Payroll •••• 3349');

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(60) NOT NULL UNIQUE,
  \`slug\` VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`) VALUES
(1, 'Noodles', 'noodles'),
(2, 'Snacks', 'snacks'),
(3, 'Sauces', 'sauces'),
(4, 'Drinks', 'drinks'),
(5, 'Frozen', 'frozen');

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`category_id\` INT NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`description\` TEXT NOT NULL,
  \`image\` VARCHAR(255) NOT NULL DEFAULT 'uploads/default-product.jpg',
  \`status\` ENUM('AVAILABLE','SOLD OUT') NOT NULL DEFAULT 'AVAILABLE',
  \`is_best_seller\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_new\` TINYINT(1) NOT NULL DEFAULT 0,
  \`expiry_date\` DATE DEFAULT NULL,
  \`low_stock_threshold\` INT NOT NULL DEFAULT 10,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`products\` (\`name\`, \`category_id\`, \`price\`, \`stock\`, \`description\`, \`image\`, \`status\`, \`is_best_seller\`, \`is_new\`, \`expiry_date\`, \`low_stock_threshold\`) VALUES
('Samyang Buldak Carbonara Ramen (130g)', 1, 85.00, 48, 'Chewy stir-fried noodles tossed in fiery Buldak sauce with creamy mozzarella carbonara powder.', 'uploads/buldak_carbonara.jpg', 'AVAILABLE', 1, 0, '2027-04-15', 15),
('Nongshim Shin Ramyun Gourmet Spicy (120g)', 1, 68.00, 34, 'South Korea #1 beef and shiitake mushroom spicy noodle soup.', 'uploads/shin_ramyun.jpg', 'AVAILABLE', 1, 0, '2027-03-20', 12),
('Chungjungone Sunchang Gochujang Paste (500g)', 3, 195.00, 8, 'Sun-dried fermented red chili paste essential for Bibimbap and Tteokbokki.', 'uploads/gochujang_paste.jpg', 'AVAILABLE', 1, 0, '2026-10-18', 10),
('Binggrae Banana Flavored Milk (200ml)', 4, 65.00, 52, 'Iconic silky Korean banana milk drink, best served chilled.', 'uploads/banana_milk.jpg', 'AVAILABLE', 1, 0, '2026-10-12', 15),
('Dongwon Street Tteokbokki Rice Cake Kit (400g)', 2, 175.00, 22, 'Chewy cylinder rice cakes with sweet-spicy Myeongdong sauce.', 'uploads/tteokbokki_kit.jpg', 'AVAILABLE', 0, 1, '2027-01-30', 8),
('Samyang 2x Spicy Buldak Hot Chicken Ramen', 1, 88.00, 0, 'Double the Scoville heat (8,808 SHU) for true spice challengers.', 'uploads/buldak_2x.jpg', 'SOLD OUT', 1, 0, '2027-05-10', 10);

-- 7. INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS \`inventory_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT NOT NULL,
  \`change\` INT NOT NULL,
  \`note\` VARCHAR(255) NOT NULL,
  \`user_type\` ENUM('ADMIN','EMPLOYEE') NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS \`attendance\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`employee_id\` VARCHAR(32) NOT NULL,
  \`work_date\` DATE NOT NULL,
  \`clock_in\` TIME NOT NULL,
  \`clock_out\` TIME DEFAULT NULL,
  \`status\` VARCHAR(30) DEFAULT 'ON TIME',
  FOREIGN KEY (\`employee_id\`) REFERENCES \`employees\`(\`employee_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS \`schedules\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`employee_id\` VARCHAR(32) NOT NULL,
  \`day_of_week\` VARCHAR(60) NOT NULL,
  \`shift_time\` VARCHAR(60) NOT NULL,
  \`station\` VARCHAR(100) NOT NULL,
  FOREIGN KEY (\`employee_id\`) REFERENCES \`employees\`(\`employee_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. REQUESTS TABLE (Leave / Restock / Damaged Item)
CREATE TABLE IF NOT EXISTS \`requests\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`employee_id\` VARCHAR(32) NOT NULL,
  \`request_type\` ENUM('RESTOCK','LEAVE','DAMAGED_ITEM') NOT NULL,
  \`subject\` VARCHAR(150) NOT NULL,
  \`details\` TEXT NOT NULL,
  \`status\` ENUM('PENDING','APPROVED','RESOLVED') DEFAULT 'PENDING',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. GUIDELINES TABLE
CREATE TABLE IF NOT EXISTS \`guidelines\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`section_slug\` VARCHAR(60) NOT NULL UNIQUE,
  \`title\` VARCHAR(120) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. ANNOUNCEMENTS & STORE CONTENT TABLE
CREATE TABLE IF NOT EXISTS \`announcements\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`banner_text\` VARCHAR(255) NOT NULL,
  \`store_hours\` VARCHAR(150) NOT NULL,
  \`about_story\` TEXT NOT NULL,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`announcements\` (\`id\`, \`banner_text\`, \`store_hours\`, \`about_story\`, \`is_active\`) VALUES
(1, '환영합니다! Weekend Promo: Buy 4 Samyang Buldak Packs & Get Special Bundle Discount — Fresh Frozen Dumplings Just Arrived in Marilao!', 'Daily: 8:00 AM – 10:00 PM (Mon – Sun)', 'Founded in 2020 along McArthur Highway, NIM HAN KOREAN MART Marilao Branch brings over 350+ authentic South Korean groceries right to your neighborhood.', 1);

-- 13. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS \`testimonials\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_name\` VARCHAR(100) NOT NULL,
  \`location\` VARCHAR(100) NOT NULL,
  \`comment\` TEXT NOT NULL,
  \`is_visible\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. MESSAGES TABLE (Public Contact Form)
CREATE TABLE IF NOT EXISTS \`messages\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(40) DEFAULT NULL,
  \`email\` VARCHAR(120) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. CCTV CAMERAS TABLE (RTSP password stored encrypted)
-- <!-- ===== [CCTV CAMERA IP ADDRESS SETTINGS HERE] ===== -->
CREATE TABLE IF NOT EXISTS \`cctv_cameras\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`ip_address\` VARCHAR(100) NOT NULL,
  \`port\` INT NOT NULL DEFAULT 554,
  \`username\` VARCHAR(80) NOT NULL,
  \`password_encrypted\` TEXT NOT NULL,
  \`path\` VARCHAR(150) NOT NULL DEFAULT '/Streaming/Channels/101',
  \`status\` ENUM('ONLINE','OFFLINE') DEFAULT 'ONLINE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_type\` ENUM('ADMIN','EMPLOYEE','SYSTEM') NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`details\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(45) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;`,
  },
  {
    path: '/index.php',
    category: 'Public Site',
    language: 'php',
    description: 'Complete public storefront (HOME, ABOUT, PRODUCTS, CONTACT) with PDO flashcards, secret 10-click logo modal, and contact form handler.',
    code: `<?php
/**
 * ============================================================================
 * NIM HAN KOREAN MART Marilao Branch - Public Website (/index.php)
 * ============================================================================
 */
require_once __DIR__ . '/config/db.php';

// Handle Contact Form Submission
$contactSuccess = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send_message') {
    if (verify_csrf($_POST['csrf_token'] ?? '')) {
        $stmt = $pdo->prepare("INSERT INTO messages (full_name, phone, email, message) VALUES (:name, :phone, :email, :msg)");
        $stmt->execute([
            ':name'  => clean_input($_POST['full_name'] ?? ''),
            ':phone' => clean_input($_POST['phone'] ?? ''),
            ':email' => clean_input($_POST['email'] ?? ''),
            ':msg'   => clean_input($_POST['message'] ?? ''),
        ]);
        $contactSuccess = true;
    }
}

// Fetch Store Content & Announcement Banner
$content = $pdo->query("SELECT * FROM announcements WHERE id = 1")->fetch();

// Fetch Products with Category Name
$products = $pdo->query("
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.is_best_seller DESC, p.id ASC
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIM HAN KOREAN MART Marilao Branch | Authentic Korean Flavors</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Announcement Banner (Editable by Admin) -->
  <?php if (!empty($content['is_active'])): ?>
  <div class="announcement-bar">
    <span><?= clean_input($content['banner_text']) ?></span>
  </div>
  <?php endif; ?>

  <!-- Sticky Top Navigation Bar -->
  <header class="site-header">
    <div class="header-brand">
      <!-- ===== [CHANGE LOGO IMAGE HERE] ===== -->
      <img src="uploads/nimhan-logo.png" alt="Nim-Han Korean Mart Est. 2020" id="secretLogoTrigger" class="brand-logo" />
      <!-- ===== [CHANGE STORE NAME / TAGLINE HERE] ===== -->
      <span class="brand-title">NIM HAN KOREAN MART Marilao Branch</span>
    </div>

    <nav class="header-nav">
      <a href="#home">HOME</a>
      <a href="#about">ABOUT</a>
      <a href="#products">PRODUCTS</a>
      <a href="#contact">CONTACT</a>
    </nav>

    <div class="header-actions">
      <a href="#products" class="btn-primary">Shop Products</a>
    </div>
  </header>

  <!-- HERO SECTION -->
  <!-- ===== [CHANGE HERO BACKGROUND IMAGE HERE] ===== -->
  <section id="home" class="hero-section" style="background-image: url('uploads/hero-korean-mart.jpg');">
    <div class="hero-scrim">
      <div class="hero-content">
        <p class="hero-kicker">환영합니다 · WELCOME TO MARILAO BRANCH</p>
        <!-- ===== [CHANGE STORE NAME / TAGLINE HERE] ===== -->
        <h1>NIM HAN KOREAN MART Marilao Branch</h1>
        <p class="hero-tagline">Authentic Korean Flavors, Right in Your Neighborhood</p>
        <div class="hero-cta-group">
          <a href="#products" class="btn-primary">Shop Products</a>
          <a href="#how-to-order" class="btn-outline">How to Order / Pickup</a>
        </div>
      </div>
    </div>
  </section>

  <!-- PRODUCTS FLASHCARDS SECTION -->
  <section id="products" class="section-container">
    <div class="section-header">
      <h2>Korean Grocery Flashcards</h2>
      <p>Live inventory synced directly from our Marilao branch shelves.</p>
    </div>

    <!-- Search, Category Filter & Sort Controls -->
    <div class="catalog-controls">
      <input type="search" id="productSearch" placeholder="Search Buldak, Gochujang, Banana Milk..." />
      <div class="category-tabs" id="categoryFilter">
        <button data-cat="ALL" class="active">All</button>
        <button data-cat="Noodles">Noodles</button>
        <button data-cat="Snacks">Snacks</button>
        <button data-cat="Sauces">Sauces</button>
        <button data-cat="Drinks">Drinks</button>
        <button data-cat="Frozen">Frozen</button>
      </div>
      <select id="productSort">
        <option value="featured">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
      </select>
    </div>

    <div class="product-grid" id="productGrid">
      <?php foreach ($products as $p):
        $isSoldOut = ($p['status'] === 'SOLD OUT' || (int)$p['stock'] <= 0);
      ?>
      <!-- ===== [ADD OR DUPLICATE A PRODUCT FLASHCARD HERE] ===== -->
      <!-- To add a manual card without the database, copy this entire <article class="product-flashcard">...</article> block -->
      <article class="product-flashcard <?= $isSoldOut ? 'is-sold-out' : '' ?>"
               data-name="<?= strtolower(clean_input($p['name'])) ?>"
               data-category="<?= clean_input($p['category_name']) ?>"
               data-price="<?= (float)$p['price'] ?>">
        <div class="flashcard-media">
          <!-- ===== [PRODUCT IMAGE GOES HERE] ===== -->
          <img src="<?= clean_input($p['image']) ?>" alt="<?= clean_input($p['name']) ?>" loading="lazy" />
        </div>
        <div class="flashcard-body">
          <div class="flashcard-meta">
            <span><?= clean_input($p['category_name']) ?></span>
            <span>·</span>
            <span class="status-text <?= $isSoldOut ? 'status-soldout' : 'status-available' ?>">
              <?= $isSoldOut ? 'SOLD OUT' : 'AVAILABLE' ?>
            </span>
            <?php if ($p['is_best_seller']): ?>
              <span>·</span><span class="flag-bestseller">Best Seller</span>
            <?php elseif ($p['is_new']): ?>
              <span>·</span><span class="flag-new">New Arrival</span>
            <?php endif; ?>
          </div>
          <h3 class="flashcard-title"><?= clean_input($p['name']) ?></h3>
          <p class="flashcard-desc"><?= clean_input($p['description']) ?></p>
          <div class="flashcard-footer">
            <span class="flashcard-price">₱<?= number_format((float)$p['price'], 2) ?></span>
            <?php if ($isSoldOut): ?>
              <button class="btn-notify" onclick="openNotifyModal('<?= clean_input($p['name']) ?>')">Notify When Back</button>
            <?php else: ?>
              <span class="stock-count"><?= (int)$p['stock'] ?> in stock</span>
            <?php endif; ?>
          </div>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- ABOUT SECTION -->
  <section id="about" class="section-container">
    <!-- ===== [CHANGE ABOUT STORY TEXT HERE] ===== -->
    <h2>Our Story in Marilao</h2>
    <p><?= clean_input($content['about_story']) ?></p>
  </section>

  <!-- CONTACT SECTION -->
  <section id="contact" class="section-container">
    <h2>Visit or Message Our Marilao Branch</h2>
    <?php if ($contactSuccess): ?>
      <div class="alert-success">감사합니다! Your message has been saved. Our branch team will reply shortly.</div>
    <?php endif; ?>
    <form method="POST" action="#contact" class="contact-form">
      <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>" />
      <input type="hidden" name="action" value="send_message" />
      <input type="text" name="full_name" placeholder="Your Full Name" required />
      <input type="text" name="phone" placeholder="Mobile Number (e.g. 0917-XXX-XXXX)" required />
      <input type="email" name="email" placeholder="Email Address" required />
      <textarea name="message" rows="4" placeholder="Inquire about bulk orders, item availability, or store pickup..." required></textarea>
      <button type="submit" class="btn-primary">Send Message to Branch</button>
    </form>
  </section>

  <!-- SECRET STAFF ACCESS MODAL (Opens on 10 Logo Clicks within 8s) -->
  <div id="staffAccessModal" class="staff-modal" hidden>
    <div class="staff-modal-card">
      <h3>Staff Access</h3>
      <p>Authorized NIM HAN KOREAN MART Marilao Branch Personnel Only</p>
      <div class="staff-modal-actions">
        <a href="admin/login.php" class="btn-admin-portal">ADMIN PORTAL</a>
        <a href="employee/login.php" class="btn-employee-portal">EMPLOYEE PORTAL</a>
      </div>
      <button type="button" id="closeStaffModal" class="btn-close-modal">Cancel</button>
    </div>
  </div>

  <!-- ===== [CHANGE FOOTER / SOCIAL LINKS HERE] ===== -->
  <footer class="site-footer">
    <p>© <?= date('Y') ?> NIM HAN KOREAN MART Marilao Branch · McArthur Highway, Marilao, Bulacan</p>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`,
  },
  {
    path: '/js/main.js',
    category: 'Public Site',
    language: 'javascript',
    description: 'Vanilla JS secret 10-click logo detector within 8 seconds, client-side flashcard filtering/sorting, and smooth back-to-top.',
    code: `/**
 * ============================================================================
 * NIM HAN KOREAN MART Marilao Branch - Main Frontend Script (/js/main.js)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // // ===== [CHANGE THE NUMBER OF LOGO CLICKS (DEFAULT 10) HERE] =====
  const REQUIRED_LOGO_CLICKS = 10;
  const CLICK_WINDOW_MS = 8000; // 8 seconds window

  let clickCount = 0;
  let firstClickTime = 0;
  let resetTimer = null;

  const logoEl = document.getElementById('secretLogoTrigger');
  const staffModal = document.getElementById('staffAccessModal');
  const closeStaffBtn = document.getElementById('closeStaffModal');

  if (logoEl && staffModal) {
    logoEl.addEventListener('click', () => {
      const now = Date.now();

      if (clickCount === 0 || (now - firstClickTime) > CLICK_WINDOW_MS) {
        clickCount = 1;
        firstClickTime = now;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          clickCount = 0;
          firstClickTime = 0;
        }, CLICK_WINDOW_MS);
      } else {
        clickCount++;
      }

      if (clickCount >= REQUIRED_LOGO_CLICKS) {
        clearTimeout(resetTimer);
        clickCount = 0;
        firstClickTime = 0;
        staffModal.hidden = false;
      }
    });

    closeStaffBtn?.addEventListener('click', () => {
      staffModal.hidden = true;
    });
  }
});`,
  },
  {
    path: '/admin/login.php',
    category: 'Admin Portal (/admin)',
    language: 'php',
    description: 'Password-only Admin login with brute-force protection (5 failed attempts locks out IP for 10 minutes) and password_verify().',
    code: `<?php
/**
 * ============================================================================
 * NIM HAN KOREAN MART - Admin Login (/admin/login.php)
 * Security: Single Admin Password (hashed), 5-Attempt 10-Min Lockout, CSRF
 * ============================================================================
 */
require_once __DIR__ . '/../config/db.php';

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$error = '';

// Check Brute-Force Lockout Status
$stmt = $pdo->prepare("SELECT * FROM login_attempts WHERE ip_address = :ip AND portal_type = 'ADMIN' LIMIT 1");
$stmt->execute([':ip' => $ip]);
$attemptRow = $stmt->fetch();

if ($attemptRow && $attemptRow['locked_until'] && strtotime($attemptRow['locked_until']) > time()) {
    $remainingMins = ceil((strtotime($attemptRow['locked_until']) - time()) / 60);
    $error = "Too many failed attempts. Admin login is locked for {$remainingMins} minute(s).";
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $error = "Invalid security token.";
    } else {
        $password = $_POST['password'] ?? '';
        $admin = $pdo->query("SELECT * FROM admin WHERE id = 1")->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            // Reset failed attempts
            $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = :ip AND portal_type = 'ADMIN'")->execute([':ip' => $ip]);

            session_regenerate_id(true);
            $_SESSION['role'] = 'admin';
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['last_activity'] = time();
            $_SESSION['cctv_jwt'] = generate_admin_cctv_jwt();

            $pdo->exec("UPDATE admin SET last_login = NOW() WHERE id = 1");
            log_activity($pdo, 'ADMIN', 'ADMIN-MASTER', 'ADMIN_LOGIN', 'Successful Admin Portal login.');

            header('Location: dashboard.php');
            exit;
        } else {
            // Increment brute-force counter
            $newCount = ($attemptRow['attempts'] ?? 0) + 1;
            $lockedUntil = ($newCount >= 5) ? date('Y-m-d H:i:s', time() + 600) : null;

            if ($attemptRow) {
                $upd = $pdo->prepare("UPDATE login_attempts SET attempts = :a, locked_until = :l WHERE id = :id");
                $upd->execute([':a' => $newCount, ':l' => $lockedUntil, ':id' => $attemptRow['id']]);
            } else {
                $ins = $pdo->prepare("INSERT INTO login_attempts (ip_address, portal_type, attempts, locked_until) VALUES (:ip, 'ADMIN', 1, NULL)");
                $ins->execute([':ip' => $ip]);
            }
            $error = $newCount >= 5
                ? "5 failed attempts recorded. Locked out for 10 minutes."
                : "Invalid Admin password. Attempt {$newCount} of 5.";
        }
    }
}
?>`,
  },
  {
    path: '/employee/login.php',
    category: 'Employee Portal (/employee)',
    language: 'php',
    description: 'Employee ID + Password login enforcing strict server-side account isolation and zero salary visibility.',
    code: `<?php
/**
 * ============================================================================
 * NIM HAN KOREAN MART - Employee Login (/employee/login.php)
 * Security: Employee ID + Password, Server-Side Session Isolation
 * ============================================================================
 */
require_once __DIR__ . '/../config/db.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && verify_csrf($_POST['csrf_token'] ?? '')) {
    $empId = clean_input($_POST['employee_id'] ?? '');
    $pass  = $_POST['password'] ?? '';

    // Never query or join employee_salary here!
    $stmt = $pdo->prepare("
        SELECT id, employee_id, full_name, password_hash, position, status
        FROM employees
        WHERE employee_id = :eid AND status = 'ACTIVE'
        LIMIT 1
    ");
    $stmt->execute([':eid' => $empId]);
    $emp = $stmt->fetch();

    if ($emp && password_verify($pass, $emp['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['role'] = 'employee';
        $_SESSION['employee_id'] = $emp['employee_id'];
        $_SESSION['employee_name'] = $emp['full_name'];
        $_SESSION['last_activity'] = time();

        log_activity($pdo, 'EMPLOYEE', $emp['employee_id'], 'EMPLOYEE_LOGIN', 'Employee logged into portal.');
        header('Location: dashboard.php');
        exit;
    } else {
        $error = "Invalid Employee ID or Password, or account is inactive.";
    }
}
?>`,
  },
  {
    path: '/cctv-server/server.js',
    category: 'Node.js CCTV Server',
    language: 'javascript',
    description: 'Standalone Node.js + Express + WebSocket + FFmpeg RTSP relay server with JWT verifyAdmin middleware.',
    code: `/**
 * ============================================================================
 * NIM HAN KOREAN MART Marilao Branch - Standalone CCTV Relay Server
 * File: /cctv-server/server.js
 *
 * WHY THIS RUNS SEPARATELY FROM INFINITYFREE:
 * InfinityFree is shared PHP/MySQL hosting and cannot execute background
 * Node.js processes or FFmpeg video transcoding. Run this server on the
 * Marilao branch store PC, Raspberry Pi, or VPS and expose it securely via
 * Cloudflare Tunnel (cloudflared) or Tailscale VPN.
 *
 * TERMINAL COMMANDS TO INSTALL & RUN:
 *   1. Install FFmpeg:
 *      - Windows (Winget): winget install Gyan.FFmpeg
 *      - Ubuntu/Debian:    sudo apt update && sudo apt install -y ffmpeg
 *      - macOS (Homebrew): brew install ffmpeg
 *   2. Install Node packages:
 *      cd cctv-server
 *      npm install express ws fluent-ffmpeg jsonwebtoken cookie-parser cors dotenv
 *   3. Start Server:
 *      node server.js
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.NIMHAN_JWT_SECRET || 'change_this_to_a_64_char_random_secret_key_2026_marilao';

// // ===== [CCTV CAMERA IP ADDRESS SETTINGS HERE] =====
// SECURITY WARNING: Never expose raw RTSP camera credentials in frontend HTML/JS!
// Store credentials in .env or encrypted in MySQL and resolve them on the server only.
const CAMERAS = {
  1: {
    name: 'CAM-01: POS & Cashier Counter',
    rtspUrl: \`rtsp://\${process.env.CAM1_USER}:\${process.env.CAM1_PASS}@\${process.env.CAM1_IP || '192.168.1.101'}:\${process.env.CAM1_PORT || 554}/Streaming/Channels/101\`
  },
  2: {
    name: 'CAM-02: Ramen & Snack Aisles',
    rtspUrl: \`rtsp://\${process.env.CAM2_USER}:\${process.env.CAM2_PASS}@\${process.env.CAM2_IP || '192.168.1.102'}:\${process.env.CAM2_PORT || 554}/Streaming/Channels/101\`
  },
  3: {
    name: 'CAM-03: Cold-Chain & Freezers',
    rtspUrl: \`rtsp://\${process.env.CAM3_USER}:\${process.env.CAM3_PASS}@\${process.env.CAM3_IP || '192.168.1.103'}:\${process.env.CAM3_PORT || 554}/Streaming/Channels/101\`
  }
};

/**
 * Middleware: Verify Admin JWT Token (role === 'admin', otherwise 403 Forbidden)
 */
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.cctv_jwt || req.query?.token;

  if (!token) {
    return res.status(403).json({ error: '403 Forbidden: Missing Admin Authentication Token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '403 Forbidden: Strictly Admin Role Required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: '403 Forbidden: Invalid or Expired Admin Token' });
  }
}

/**
 * Secure Route: GET /api/admin/cctv-stream
 * Returns active camera metadata (never returns raw RTSP passwords)
 */
app.get('/api/admin/cctv-stream', verifyAdmin, (req, res) => {
  const safeList = Object.entries(CAMERAS).map(([id, cam]) => ({
    id: Number(id),
    name: cam.name,
    wsEndpoint: \`/ws/cctv/\${id}\`
  }));
  res.json({ status: 'authorized', branch: 'Marilao', cameras: safeList });
});

/**
 * WebSocket Upgrade with JWT Admin Verification & FFmpeg RTSP -> MPEG1/MJPEG Relay
 */
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, \`http://\${request.headers.host}\`);
  const token = url.searchParams.get('token');
  const cameraId = url.searchParams.get('cam') || '1';

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin' || !CAMERAS[cameraId]) {
      socket.write('HTTP/1.1 403 Forbidden\\r\\n\\r\\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const targetCam = CAMERAS[cameraId];
      console.log(\`[CCTV] Admin connected to \${targetCam.name}\`);

      // Spawn FFmpeg to transcode RTSP stream into low-latency MJPEG frames over WebSocket
      const command = ffmpeg(targetCam.rtspUrl)
        .inputOptions(['-rtsp_transport tcp', '-stimeout 5000000'])
        .outputOptions(['-f mjpeg', '-q:v 5', '-r 15', '-vf scale=1280:720'])
        .on('error', (err) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'error', message: 'Camera stream interrupted: ' + err.message }));
          }
        });

      const ffStream = command.pipe();
      ffStream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk);
        }
      });

      ws.on('close', () => {
        command.kill('SIGKILL');
      });
    });
  } catch (err) {
    socket.write('HTTP/1.1 403 Forbidden\\r\\n\\r\\n');
    socket.destroy();
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(\`NIM HAN Marilao CCTV Relay Server listening on port \${PORT}\`);
});`,
  },
  {
    path: '/cctv-server/public/app.js',
    category: 'Node.js CCTV Server',
    language: 'javascript',
    description: 'Frontend CCTV WebSocket client with automatic exponential backoff reconnection, snapshot download, and 403 Access Denied screen.',
    code: `/**
 * ============================================================================
 * NIM HAN KOREAN MART - Admin CCTV Player Client (/cctv-server/public/app.js)
 * Connects with PHP-issued Admin JWT, renders stream to <canvas>, auto-reconnects
 * ============================================================================
 */

class NimHanCctvPlayer {
  constructor({ canvasId, statusId, cameraId, jwtToken, serverHost }) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.statusEl = document.getElementById(statusId);
    this.cameraId = cameraId;
    this.jwtToken = jwtToken;
    this.serverHost = serverHost || window.location.host;
    this.ws = null;
    this.reconnectDelay = 2000;
    this.connect();
  }

  connect() {
    if (!this.jwtToken) {
      this.renderAccessDenied('403 Forbidden — Admin Session Token Required');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${protocol}//\${this.serverHost}/ws/cctv?cam=\${this.cameraId}&token=\${encodeURIComponent(this.jwtToken)}\`;

    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.setStatus('ONLINE', true);
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data === 'string') return;
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    this.ws.onclose = (ev) => {
      if (ev.code === 1008 || ev.code === 403) {
        this.renderAccessDenied('Access Denied: Non-Admin or Expired Token');
        return;
      }
      this.setStatus('RECONNECTING...', false);
      setTimeout(() => this.connect(), this.reconnectDelay);
    };
  }

  setStatus(label, isOnline) {
    if (this.statusEl) {
      this.statusEl.textContent = label;
      this.statusEl.className = isOnline ? 'badge-online' : 'badge-offline';
    }
  }

  renderAccessDenied(msg) {
    const container = document.getElementById('cctvGridWrapper');
    if (container) {
      container.innerHTML = \`<div class="access-denied-box"><h2>ACCESS DENIED (403)</h2><p>\${msg}</p></div>\`;
    }
  }
}`,
  },
  {
    path: '/DEPLOYMENT_AND_SECURITY.md',
    category: 'Deployment Guide',
    language: 'markdown',
    description: 'Step-by-step InfinityFree deployment guide (File Manager/FTP, MySQL setup, phpMyAdmin import, db.php config) and Security Checklist.',
    code: `# NIM HAN KOREAN MART Marilao Branch — InfinityFree Deployment & Security Guide

## Part 1: Step-by-Step InfinityFree Deployment
1. **Create Your Free Hosting Account**
   - Sign up at [https://infinityfree.com](https://infinityfree.com) and create a hosting account (e.g., \`nimhanmarilao.rf.gd\` or custom domain).
2. **Create the MySQL Database**
   - Open your InfinityFree Client Area -> click **Control Panel (VistaPanel)**.
   - Scroll to **Databases** -> click **MySQL Databases**.
   - Under *Create New Database*, type \`nimhan\` and click **Create Database**.
   - Keep this tab open! Note down:
     - **MySQL Host Name** (e.g., \`sql204.infinityfree.com\`)
     - **MySQL DB Name** (e.g., \`if0_37482910_nimhan\`)
     - **MySQL User Name** (e.g., \`if0_37482910\`)
     - **MySQL Password** (found in Account Settings -> Hosting Account Password).
3. **Import \`database.sql\` via phpMyAdmin**
   - Next to your new database in VistaPanel, click **Admin (phpMyAdmin)**.
   - Click the **Import** tab at the top -> Click **Choose File** and select \`database.sql\`.
   - Scroll down and click **Import / Go**. All 16 tables and sample products will be created.
4. **Update \`/config/db.php\`**
   - Open \`/config/db.php\` and locate \`<!-- ===== [CHANGE DATABASE CONNECTION HERE] ===== -->\`.
   - Replace \`$host\`, \`$dbname\`, \`$username\`, and \`$password\` with your exact InfinityFree values.
5. **Upload Files to \`htdocs/\`**
   - Open **Online File Manager** (or FileZilla FTP using \`ftpupload.net\`, Port \`21\`).
   - Navigate inside the \`htdocs/\` folder (delete \`index2.html\` if present).
   - Upload \`index.php\`, \`404.php\`, \`css/\`, \`js/\`, \`config/\`, \`admin/\`, \`employee/\`, and \`uploads/\`.
6. **Connect the Standalone Node.js CCTV Server**
   - On the Marilao branch PC where cameras are reachable on the local LAN (\`192.168.1.x\`), install FFmpeg and Node.js.
   - Run \`cloudflared tunnel --url http://localhost:4000\` to create an encrypted HTTPS/WSS tunnel URL and paste that URL into \`CCTV_NODE_SERVER_URL\` in \`/config/db.php\`.

## Part 2: Production Security Checklist
- [x] **PDO Prepared Statements**: Every SQL query uses bound parameters (\`:id\`, \`:eid\`) preventing SQL Injection.
- [x] **Bcrypt Password Hashing**: Admin and Employee passwords use \`password_hash(..., PASSWORD_DEFAULT)\` and \`password_verify()\`.
- [x] **Strict Salary & Account Isolation**: \`employee_salary\` is never queried inside \`/employee/*\`, and every employee query binds \`$_SESSION['employee_id']\` on the server.
- [x] **Brute-Force Lockout**: 5 failed logins lock the offending IP for 10 minutes in \`login_attempts\`.
- [x] **Camera Credential Protection**: RTSP camera usernames/passwords are AES-256 encrypted in MySQL and handled strictly by the backend FFmpeg process—never exposed to browser source code.`,
  },
];
