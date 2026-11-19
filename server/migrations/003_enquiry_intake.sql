-- Centralised enquiry intake: every website form lands in `enquiries` with the full set of CRM fields.
ALTER TABLE enquiries
  MODIFY COLUMN source ENUM('buy_land','sell_land','contact','property','consultation','manual','project','callback','popup','services','requirement','newsletter') NOT NULL DEFAULT 'manual',
  ADD COLUMN enquiry_type VARCHAR(60) NULL AFTER source,
  ADD COLUMN form_name VARCHAR(120) NULL AFTER enquiry_type,
  ADD COLUMN website_page VARCHAR(200) NULL AFTER form_name,
  ADD COLUMN location VARCHAR(160) NULL,
  ADD COLUMN address VARCHAR(300) NULL,
  ADD COLUMN interested_project VARCHAR(200) NULL,
  ADD COLUMN preferred_area VARCHAR(80) NULL,
  ADD COLUMN preferred_location VARCHAR(160) NULL,
  ADD COLUMN manager_id INT NULL,
  ADD COLUMN internal_remarks TEXT NULL,
  ADD COLUMN form_data MEDIUMTEXT NULL,
  ADD COLUMN assigned_at DATETIME NULL,
  ADD COLUMN assigned_by INT NULL,
  ADD KEY ix_en_type (enquiry_type),
  ADD KEY ix_en_email (email),
  ADD CONSTRAINT fk_en_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications
  ADD COLUMN dedupe_key VARCHAR(100) NULL,
  ADD UNIQUE KEY ux_nt_dedupe (user_id, dedupe_key);
