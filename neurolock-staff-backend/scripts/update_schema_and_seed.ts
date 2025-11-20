import pool from '../src/infra/db/mysql-client';

async function updateSchema() {
    console.log('Updating schema...');
    const connection: any = await pool.getConnection();
    try {
        // Check if columns exist
        const [columns] = await connection.query('SHOW COLUMNS FROM patients');
        const columnNames = columns.map((c: any) => c.Field);

        const columnsToAdd = [
            { name: 'status', def: "VARCHAR(20) DEFAULT 'Active'" },
            { name: 'gender', def: "VARCHAR(20)" },
            { name: 'diagnosis', def: "VARCHAR(255)" },
            { name: 'ward', def: "VARCHAR(50)" },
            { name: 'room', def: "VARCHAR(20)" },
            { name: 'attending_physician', def: "VARCHAR(100)" },
            { name: 'assigned_therapist', def: "VARCHAR(100)" },
            { name: 'admission_date', def: "DATE" }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding column ${col.name}...`);
                await connection.query(`ALTER TABLE patients ADD COLUMN ${col.name} ${col.def}`);
            }
        }

        console.log('Schema updated.');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        connection.release();
    }
}

async function seedData() {
    console.log('Seeding data...');
    const connection: any = await pool.getConnection();
    try {
        const patients = [
            {
                mrn: 'PAT-001',
                full_name: 'John Doe',
                dob: '1980-01-01',
                phone: '555-0101',
                email: 'john.doe@example.com',
                status: 'Active',
                gender: 'Male',
                diagnosis: 'Major Depressive Disorder',
                ward: 'Psychiatric A',
                room: '101',
                attending_physician: 'Dr. Smith (Psychiatrist)',
                assigned_therapist: 'Therapist Tom',
                admission_date: '2023-10-01'
            },
            {
                mrn: 'PAT-002',
                full_name: 'Jane Smith',
                dob: '1992-05-15',
                phone: '555-0102',
                email: 'jane.smith@example.com',
                status: 'Active',
                gender: 'Female',
                diagnosis: 'Generalized Anxiety Disorder',
                ward: 'Psychiatric B',
                room: '205',
                attending_physician: 'Dr. Phil (Psychologist)',
                assigned_therapist: 'Therapist Tom',
                admission_date: '2023-11-15'
            },
            {
                mrn: 'PAT-003',
                full_name: 'Robert Johnson',
                dob: '1975-08-20',
                phone: '555-0103',
                email: 'robert.j@example.com',
                status: 'Inactive',
                gender: 'Male',
                diagnosis: 'Bipolar I Disorder',
                ward: 'Psychiatric A',
                room: '102',
                attending_physician: 'Dr. Smith (Psychiatrist)',
                assigned_therapist: 'Nurse Joy',
                admission_date: '2023-09-10'
            },
            {
                mrn: 'PAT-004',
                full_name: 'Emily Davis',
                dob: '1988-12-10',
                phone: '555-0104',
                email: 'emily.d@example.com',
                status: 'Active',
                gender: 'Female',
                diagnosis: 'PTSD',
                ward: 'Psychiatric C',
                room: '301',
                attending_physician: 'Dr. Phil (Psychologist)',
                assigned_therapist: 'Nurse Joy',
                admission_date: '2023-12-01'
            },
             {
                mrn: 'PAT-005',
                full_name: 'Michael Brown',
                dob: '1995-03-25',
                phone: '555-0105',
                email: 'michael.b@example.com',
                status: 'Active',
                gender: 'Male',
                diagnosis: 'Schizophrenia',
                ward: 'Psychiatric A',
                room: '103',
                attending_physician: 'Dr. Smith (Psychiatrist)',
                assigned_therapist: 'Therapist Tom',
                admission_date: '2023-10-20'
            }
        ];

        for (const p of patients) {
            // Check if exists
            const [existing] = await connection.query('SELECT id FROM patients WHERE mrn = ?', [p.mrn]);
            if (existing.length === 0) {
                console.log(`Inserting patient ${p.full_name}...`);
                await connection.query(
                    `INSERT INTO patients (mrn, full_name, dob, phone, email, status, gender, diagnosis, ward, room, attending_physician, assigned_therapist, admission_date) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [p.mrn, p.full_name, p.dob, p.phone, p.email, p.status, p.gender, p.diagnosis, p.ward, p.room, p.attending_physician, p.assigned_therapist, p.admission_date]
                );
            } else {
                console.log(`Updating patient ${p.full_name}...`);
                 await connection.query(
                    `UPDATE patients SET 
                        full_name = ?, dob = ?, phone = ?, email = ?, status = ?, gender = ?, diagnosis = ?, ward = ?, room = ?, attending_physician = ?, assigned_therapist = ?, admission_date = ?
                     WHERE mrn = ?`,
                    [p.full_name, p.dob, p.phone, p.email, p.status, p.gender, p.diagnosis, p.ward, p.room, p.attending_physician, p.assigned_therapist, p.admission_date, p.mrn]
                );
            }
        }
        console.log('Data seeded.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        connection.release();
    }
}

async function main() {
    await updateSchema();
    await seedData();
    process.exit(0);
}

main();
