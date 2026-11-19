-- IGO Agri Estate admin / CRM schema (MySQL 8 / MariaDB 10.6+)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(30) NOT NULL,
  UNIQUE KEY uq_perm (module, action)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(25),
  password_hash VARCHAR(100) NOT NULL,
  role_id INT NOT NULL,
  department VARCHAR(80),
  manager_id INT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  token_version INT NOT NULL DEFAULT 0,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_users_role (role_id),
  KEY ix_users_manager (manager_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_users_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  effect ENUM('allow','deny') NOT NULL,
  PRIMARY KEY (user_id, permission_id),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_up_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS landowners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(160),
  address TEXT,
  district VARCHAR(80), taluk VARCHAR(80), village VARCHAR(80),
  survey_number VARCHAR(80),
  total_area DECIMAL(12,2), area_unit ENUM('acres','cents','sqft') DEFAULT 'acres',
  expected_price DECIMAL(16,2),
  description TEXT,
  assigned_to INT NULL,
  verification_status ENUM('new','documents_pending','under_verification','verified','rejected') NOT NULL DEFAULT 'new',
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_lo_assigned (assigned_to), KEY ix_lo_phone (phone), KEY ix_lo_status (verification_status),
  CONSTRAINT fk_lo_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(80) NOT NULL,
  description TEXT,
  state VARCHAR(80), district VARCHAR(80), taluk VARCHAR(80), village VARCHAR(80),
  address TEXT,
  survey_number VARCHAR(80),
  total_area DECIMAL(12,2) NOT NULL,
  area_unit ENUM('acres','cents','sqft') NOT NULL DEFAULT 'acres',
  price DECIMAL(16,2),
  price_per_acre DECIMAL(16,2),
  map_url VARCHAR(500),
  latitude DECIMAL(10,7), longitude DECIMAL(10,7),
  video_url VARCHAR(500),
  features TEXT,
  landowner_id INT NULL,
  assigned_to INT NULL,
  status ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  website_visible TINYINT(1) NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_pr_status (status), KEY ix_pr_district (district), KEY ix_pr_pub (published, website_visible),
  KEY ix_pr_owner (landowner_id), KEY ix_pr_assigned (assigned_to),
  CONSTRAINT fk_pr_owner FOREIGN KEY (landowner_id) REFERENCES landowners(id) ON DELETE SET NULL,
  CONSTRAINT fk_pr_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS land_parcels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  property_id INT NOT NULL,
  parcel_number VARCHAR(40) NOT NULL,
  survey_number VARCHAR(80),
  area DECIMAL(12,2) NOT NULL,
  area_unit ENUM('acres','cents','sqft') NOT NULL DEFAULT 'acres',
  price DECIMAL(16,2),
  description TEXT,
  boundary_details TEXT,
  status ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_parcel (property_id, parcel_number, deleted_at),
  KEY ix_lp_status (status),
  CONSTRAINT fk_lp_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(40) NOT NULL DEFAULT 'general',
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  alt_text VARCHAR(255),
  uploaded_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_mf_cat (category),
  CONSTRAINT fk_mf_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NULL,
  parcel_id INT NULL,
  media_id INT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_cover TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_pi_prop (property_id), KEY ix_pi_parcel (parcel_id),
  CONSTRAINT fk_pi_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_parcel FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_media FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS property_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NULL,
  parcel_id INT NULL,
  landowner_id INT NULL,
  title VARCHAR(200) NOT NULL,
  media_id INT NOT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_pd_prop (property_id),
  CONSTRAINT fk_pd_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_pd_parcel FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE CASCADE,
  CONSTRAINT fk_pd_owner FOREIGN KEY (landowner_id) REFERENCES landowners(id) ON DELETE CASCADE,
  CONSTRAINT fk_pd_media FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS buyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(160),
  address TEXT,
  preferred_location VARCHAR(160),
  property_id INT NULL,
  land_type VARCHAR(80),
  required_area DECIMAL(12,2),
  min_budget DECIMAL(16,2), max_budget DECIMAL(16,2),
  purpose VARCHAR(120),
  contact_method ENUM('phone','whatsapp','email','in_person') DEFAULT 'phone',
  assigned_to INT NULL,
  status ENUM('new','contacted','interested','site_visit_scheduled','negotiation','converted','not_interested') NOT NULL DEFAULT 'new',
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_by_assigned (assigned_to), KEY ix_by_phone (phone), KEY ix_by_status (status),
  CONSTRAINT fk_by_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  CONSTRAINT fk_by_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  source ENUM('buy_land','sell_land','contact','property','consultation','manual') NOT NULL DEFAULT 'manual',
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(160),
  message TEXT,
  property_id INT NULL,
  property_title VARCHAR(200),
  budget VARCHAR(80),
  buyer_id INT NULL,
  assigned_to INT NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status ENUM('new','assigned','contacted','followup_pending','interested','site_visit_scheduled','negotiation','converted','closed','not_interested') NOT NULL DEFAULT 'new',
  next_followup_at DATETIME NULL,
  repeat_of_id INT NULL,
  repeat_count INT NOT NULL DEFAULT 0,
  conversion_notes TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_en_status (status), KEY ix_en_assigned (assigned_to), KEY ix_en_phone (phone),
  KEY ix_en_created (created_at), KEY ix_en_next (next_followup_at), KEY ix_en_source (source),
  CONSTRAINT fk_en_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  CONSTRAINT fk_en_buyer FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE SET NULL,
  CONSTRAINT fk_en_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_en_repeat FOREIGN KEY (repeat_of_id) REFERENCES enquiries(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lead_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT NOT NULL,
  assigned_to INT NOT NULL,
  assigned_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_la_enq (enquiry_id), KEY ix_la_user (assigned_to),
  CONSTRAINT fk_la_enq FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_la_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_la_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiry_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT NOT NULL,
  from_status VARCHAR(40),
  to_status VARCHAR(40) NOT NULL,
  user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_esh_enq (enquiry_id),
  CONSTRAINT fk_esh_enq FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_esh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS followups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT NOT NULL,
  user_id INT NULL,
  type ENUM('call','whatsapp','email','visit','note') NOT NULL DEFAULT 'call',
  notes TEXT,
  outcome VARCHAR(160),
  followup_date DATETIME NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_fu_enq (enquiry_id), KEY ix_fu_due (done, followup_date),
  CONSTRAINT fk_fu_enq FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_fu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  enquiry_id INT NULL,
  buyer_id INT NULL,
  buyer_name VARCHAR(120) NOT NULL,
  buyer_phone VARCHAR(25) NOT NULL,
  property_id INT NULL,
  parcel_id INT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NULL,
  assigned_to INT NULL,
  meeting_location VARCHAR(255),
  status ENUM('scheduled','confirmed','rescheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  feedback TEXT,
  followup_date DATE NULL,
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_sv_date (visit_date), KEY ix_sv_status (status), KEY ix_sv_assigned (assigned_to),
  CONSTRAINT fk_sv_enq FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  CONSTRAINT fk_sv_buyer FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE SET NULL,
  CONSTRAINT fk_sv_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  CONSTRAINT fk_sv_parcel FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE SET NULL,
  CONSTRAINT fk_sv_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  body VARCHAR(500),
  link VARCHAR(200),
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_nt_user (user_id, read_at),
  CONSTRAINT fk_nt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username VARCHAR(60),
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  record_id VARCHAR(40),
  previous_value MEDIUMTEXT,
  updated_value MEDIUMTEXT,
  ip_address VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_al_user (user_id), KEY ix_al_module (module, action), KEY ix_al_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  skey VARCHAR(80) PRIMARY KEY,
  svalue TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Reserved for Phase 2 (website CMS moves from browser storage to the database)
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  seo_title VARCHAR(200), meta_description VARCHAR(400),
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  updated_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  section_key VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  content_draft MEDIUMTEXT,
  content_published MEDIUMTEXT,
  UNIQUE KEY uq_section (page_id, section_key),
  CONSTRAINT fk_sec_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS content_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  content MEDIUMTEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cv_sec FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;
