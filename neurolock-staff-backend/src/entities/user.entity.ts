export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    status: string;
    last_login_at?: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}