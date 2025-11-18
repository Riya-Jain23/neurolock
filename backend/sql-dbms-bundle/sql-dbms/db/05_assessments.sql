-- Create assessments table for psychological assessments
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    assessment_type VARCHAR(255) NOT NULL,
    scheduled_by VARCHAR(255) NOT NULL,
    status ENUM('scheduled', 'completed', 'pending', 'cancelled') DEFAULT 'scheduled',
    scheduled_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Insert some sample assessments (only for existing patient ID 1)
INSERT INTO assessments (patient_id, assessment_type, scheduled_by, status, scheduled_date, notes) 
VALUES 
    (1, 'Beck Depression Inventory', 'psych@neurolock.com', 'completed', '2024-10-01', 'Patient showed improvement'),
    (1, 'GAD-7', 'psych@neurolock.com', 'pending', '2024-10-20', 'Anxiety assessment');
