-- Create schema for NeuroLock (MySQL 8.x)
CREATE DATABASE IF NOT EXISTS neurolock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neurolock;

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mrn VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  dob DATE NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Encrypted therapy notes (envelope encrypted per record)
CREATE TABLE IF NOT EXISTS therapy_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  author VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dek_wrapped VARBINARY(64) NOT NULL,       -- AES key wrap output (KEK-wrapped DEK)
  iv VARBINARY(12) NOT NULL,                 -- 96-bit nonce for AES-GCM
  ciphertext LONGBLOB NOT NULL,              -- AES-GCM ciphertext (includes tag)
  CONSTRAINT fk_notes_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Medications (plaintext, non-sensitive demo)
CREATE TABLE IF NOT EXISTS medications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  dose VARCHAR(100) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_med_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor VARCHAR(80) NULL,
  action VARCHAR(40) NOT NULL,
  resource VARCHAR(40) NOT NULL,
  resource_id BIGINT UNSIGNED NULL,
  ip VARCHAR(45) NULL,
  details JSON NULL
) ENGINE=InnoDB;

-- Triggers to audit inserts
DROP TRIGGER IF EXISTS trg_notes_insert_audit;
DELIMITER $$
CREATE TRIGGER trg_notes_insert_audit
AFTER INSERT ON therapy_notes
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (actor, action, resource, resource_id, details)
  VALUES (NEW.author, 'create', 'therapy_note', NEW.id,
          JSON_OBJECT('patient_id', NEW.patient_id));
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_meds_insert_audit;
DELIMITER $$
CREATE TRIGGER trg_meds_insert_audit
AFTER INSERT ON medications
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (actor, action, resource, resource_id, details)
  VALUES ('system', 'create', 'medication', NEW.id,
          JSON_OBJECT('patient_id', NEW.patient_id, 'name', NEW.name));
END$$
DELIMITER ;
