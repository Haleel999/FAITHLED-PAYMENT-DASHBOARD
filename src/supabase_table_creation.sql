-- Drop existing tables
DROP TABLE IF EXISTS custom_tabs CASCADE;
DROP TABLE IF EXISTS party_class_amounts CASCADE;
DROP TABLE IF EXISTS party CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tuition CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP VIEW IF EXISTS debtor_view CASCADE;

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INTEGER,
    class VARCHAR(20) NOT NULL CHECK (class IN (
        'CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 
        'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'
    )),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create tuition table
CREATE TABLE tuition (
    class VARCHAR(20) PRIMARY KEY CHECK (class IN (
        'CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 
        'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'
    )),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(101) NOT NULL,
    class VARCHAR(20) NOT NULL CHECK (class IN (
        'CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 
        'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'
    )),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    amount_paid INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    payment_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'partial', 'unpaid', 'scholarship')),
    is_scholarship BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL CHECK (term IN ('Session', 'First Term', 'Second Term', 'Third Term')),
    year VARCHAR(9) NOT NULL,
    open_date DATE NULL,
    close_date DATE NULL,
    holiday_weeks INTEGER NOT NULL CHECK (holiday_weeks >= 0),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
    category VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(101) NOT NULL,
    class VARCHAR(20) NOT NULL CHECK (class IN (
        'CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 
        'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'
    )),
    type VARCHAR(20) NOT NULL CHECK (type IN ('textbook', 'notebook')),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    deposit INTEGER NOT NULL DEFAULT 0 CHECK (deposit >= 0),
    date DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create party table
CREATE TABLE party (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(101) NOT NULL,
    class VARCHAR(20) NOT NULL CHECK (class IN (
        'CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 
        'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'
    )),
    event_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    deposit INTEGER NOT NULL DEFAULT 0 CHECK (deposit >= 0),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE (student_id, event_type)
);

-- Create party class amounts table
CREATE TABLE party_class_amounts (
    class VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    PRIMARY KEY (class, event_type)
);

-- Create custom tabs table
CREATE TABLE custom_tabs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    preset VARCHAR(50),
    columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE (name)
);

-- Create debtors view
CREATE VIEW debtor_view AS
SELECT 
    s.id AS student_id,
    s.first_name || ' ' || s.last_name AS student_name,
    p.class,
    p.amount - p.amount_paid AS balance
FROM payments p
JOIN students s ON p.student_id = s.id
WHERE p.status IN ('partial', 'unpaid');

-- Functions and Triggers
CREATE OR REPLACE FUNCTION cascade_student_deletion()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM payments WHERE student_id = OLD.id;
    DELETE FROM books WHERE student_id = OLD.id;
    DELETE FROM party WHERE student_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cascade_student_deletion
BEFORE DELETE ON students
FOR EACH ROW
EXECUTE FUNCTION cascade_student_deletion();

CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_scholarship THEN
        NEW.status := 'scholarship';
    ELSE
        NEW.status := CASE
            WHEN NEW.amount_paid = NEW.amount THEN 'paid'
            WHEN NEW.amount_paid > 0 THEN 'partial'
            ELSE 'unpaid'
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_status
BEFORE INSERT OR UPDATE OF amount_paid, is_scholarship ON payments
FOR EACH ROW EXECUTE FUNCTION update_payment_status();

-- Initial tuition data
INSERT INTO tuition (class, amount) VALUES
('CRECHE', 14000),
('KG 1', 21000),
('KG 2', 21000),
('NURS 1', 24000),
('NURS 2', 24000),
('PRY 1', 27000),
('PRY 2', 27000),
('PRY 3', 27000),
('PRY 4', 27000),
('PRY 5', 27000);

-- Default custom tab
INSERT INTO custom_tabs (name, preset, columns, rows) VALUES (
    'Fees Template',
    'payment',
    '["Student Name", "Amount", "Deposit", "Balance", "DatePaid", "Note"]'::jsonb,
    '[]'::jsonb
);

-- Indexes
CREATE INDEX idx_party_event_type ON party(event_type);
CREATE INDEX idx_expenses_term ON expenses(term);