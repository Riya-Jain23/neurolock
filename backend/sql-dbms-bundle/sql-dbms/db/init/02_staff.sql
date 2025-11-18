-- Add staff table for authentication
USE neurolock;

CREATE TABLE IF NOT EXISTS staff (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  role ENUM('psychiatrist', 'psychologist', 'therapist', 'nurse', 'admin') NOT NULL,
  status ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Insert some demo staff users
-- Passwords are hashed with bcrypt (10 rounds)
-- All passwords: demo123
INSERT INTO staff (email, password_hash, name, role, status) VALUES
  ('admin@neurolock.com', '$2y$10$DCKz0K4E3HXL/ZGshWKDMOa4FJl/1/4pXyFl4e3J5LnMaLg6GWq6K', 'Admin User', 'admin', 'active'),
  ('psychiatrist@neurolock.com', '$2y$10$DCKz0K4E3HXL/ZGshWKDMOa4FJl/1/4pXyFl4e3J5LnMaLg6GWq6K', 'Dr. Jane Smith', 'psychiatrist', 'active'),
  ('therapist@neurolock.com', '$2y$10$DCKz0K4E3HXL/ZGshWKDMOa4FJl/1/4pXyFl4e3J5LnMaLg6GWq6K', 'John Therapist', 'therapist', 'active'),
  ('nurse@neurolock.com', '$2y$10$DCKz0K4E3HXL/ZGshWKDMOa4FJl/1/4pXyFl4e3J5LnMaLg6GWq6K', 'Sarah Nurse', 'nurse', 'active')
ON DUPLICATE KEY UPDATE email=email;
