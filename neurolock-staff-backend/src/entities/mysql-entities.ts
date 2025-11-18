export interface Patient {
    id?: number;
    mrn: string;
    full_name: string;
    dob?: string | null;
    phone?: string | null;
    email?: string | null;
    created_at?: Date;
}

export interface TherapyNote {
    id?: number;
    patient_id: number;
    author: string;
    created_at?: Date;
    dek_wrapped: Buffer;
    iv: Buffer;
    ciphertext: Buffer;
}

export interface Medication {
    id?: number;
    patient_id: number;
    name: string;
    dose?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: Date;
}

export interface AuditLog {
    id?: number;
    ts?: Date;
    actor?: string | null;
    action: string;
    resource: string;
    resource_id?: number | null;
    ip?: string | null;
    details?: any;
}

export interface Staff {
    id?: number;
    email: string;
    password_hash: string;
    name: string;
    role: 'psychiatrist' | 'therapist' | 'nurse' | 'admin';
    status: 'active' | 'locked';
    last_login_at?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

export interface Assessment {
    id?: number;
    patient_id: number;
    assessment_type: string;
    scheduled_by: string;
    status: 'scheduled' | 'completed' | 'pending' | 'cancelled';
    scheduled_date?: string | null;
    notes?: string | null;
    created_at?: Date;
}
