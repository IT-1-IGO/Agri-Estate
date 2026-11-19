CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NULL,
  email VARCHAR(160) NULL,
  address VARCHAR(300) NULL,
  customer_type ENUM('buyer','seller','investor','other') NOT NULL DEFAULT 'buyer',
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_cu_phone (phone), KEY ix_cu_email (email)
) ENGINE=InnoDB;

ALTER TABLE enquiries ADD COLUMN customer_id INT NULL, ADD COLUMN lead_id INT NULL, ADD KEY ix_en_customer (customer_id), ADD KEY ix_en_lead (lead_id);

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  customer_id INT NULL,
  enquiry_id INT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NULL,
  email VARCHAR(160) NULL,
  lead_type ENUM('buyer','seller') NOT NULL DEFAULT 'buyer',
  property_id INT NULL,
  budget DECIMAL(16,2) NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  assigned_to INT NULL,
  next_followup_date DATE NULL,
  status ENUM('new','contacted','qualified','site_visit_scheduled','negotiation','won','lost') NOT NULL DEFAULT 'new',
  lost_reason VARCHAR(300) NULL,
  notes TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_ld_status (status), KEY ix_ld_assigned (assigned_to), KEY ix_ld_customer (customer_id), KEY ix_ld_enquiry (enquiry_id), KEY ix_ld_next (next_followup_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lead_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  kind ENUM('created','status','note','call','followup','assigned') NOT NULL DEFAULT 'note',
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NULL,
  body TEXT,
  user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_la_lead (lead_id, created_at)
) ENGINE=InnoDB;

ALTER TABLE site_visits ADD COLUMN customer_id INT NULL, ADD COLUMN lead_id INT NULL, ADD COLUMN transport_details VARCHAR(300) NULL, ADD COLUMN photos MEDIUMTEXT NULL;

CREATE TABLE IF NOT EXISTS proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  customer_id INT NULL,
  lead_id INT NULL,
  property_id INT NULL,
  parcel_id INT NULL,
  quoted_price DECIMAL(16,2) NOT NULL DEFAULT 0,
  negotiated_price DECIMAL(16,2) NULL,
  advance_amount DECIMAL(16,2) NULL,
  payment_terms TEXT,
  valid_until DATE NULL,
  document_url VARCHAR(500) NULL,
  approval_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
  approved_by INT NULL,
  approved_at DATETIME NULL,
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_pr_status (approval_status), KEY ix_pr_customer (customer_id), KEY ix_pr_lead (lead_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  customer_id INT NULL,
  lead_id INT NULL,
  proposal_id INT NULL,
  property_id INT NOT NULL,
  parcel_id INT NULL,
  booking_date DATE NOT NULL,
  total_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
  booking_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
  payment_status ENUM('pending','partial','paid') NOT NULL DEFAULT 'pending',
  agreement_url VARCHAR(500) NULL,
  status ENUM('booked','confirmed','deal_closed','cancelled') NOT NULL DEFAULT 'booked',
  remarks TEXT,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_bk_status (status), KEY ix_bk_customer (customer_id), KEY ix_bk_property (property_id), KEY ix_bk_parcel (parcel_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(16,2) NOT NULL,
  paid_on DATE NOT NULL,
  mode ENUM('cash','bank_transfer','cheque','upi','card','other') NOT NULL DEFAULT 'bank_transfer',
  reference VARCHAR(120) NULL,
  notes VARCHAR(300) NULL,
  received_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_pay_booking (booking_id), KEY ix_pay_date (paid_on)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to INT NULL,
  lead_id INT NULL,
  customer_id INT NULL,
  due_date DATE NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status ENUM('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  completed_at DATETIME NULL,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY ix_tk_assigned (assigned_to, status), KEY ix_tk_due (due_date)
) ENGINE=InnoDB;

ALTER TABLE users ADD COLUMN designation VARCHAR(80) NULL;

CREATE TABLE IF NOT EXISTS login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username VARCHAR(160) NULL,
  success TINYINT(1) NOT NULL DEFAULT 1,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_lh_user (user_id, created_at), KEY ix_lh_created (created_at)
) ENGINE=InnoDB;
