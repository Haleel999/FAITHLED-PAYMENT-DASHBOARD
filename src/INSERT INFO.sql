-- Insert students
INSERT INTO students (first_name, last_name, class) VALUES
('BENEDICT', 'OZESUA', 'CRECHE'),
('LAWRENCE', 'DADA', 'CRECHE'),
('FATIMA', 'DAUDA', 'CRECHE'),
('OLATUNJI', 'EMMANUEL', 'KG 1'),
('KIKILOLUWA', 'OGUNMORIKE', 'KG 1'),
-- Add all other students from all sheets
('SHINDARA', 'ADELEYE', 'KG 2'),
('RUACH', 'AKINBODE', 'NURS 1'),
('DADA', 'GABRIEL MOJETOLUWA', 'NURS 2'),
('OSAGIE', 'EXCEL', 'PRY 2');

-- Insert payments (First Term 2024/2025)
INSERT INTO payments (student_id, student_name, class, amount, amount_paid, payment_date, status)
SELECT 
    s.id,
    s.first_name || ' ' || s.last_name,
    s.class,
    t.amount,
    CASE
        WHEN s.first_name = 'OLATUNJI' AND s.last_name = 'EMMANUEL' THEN 5500
        WHEN s.first_name = 'MUSA' AND s.last_name = 'AMIRAT' THEN 22000
        -- Add all other payment amounts
        ELSE 0
    END,
    CASE
        WHEN s.first_name = 'OLATUNJI' AND s.last_name = 'EMMANUEL' THEN '2024-09-28'
        WHEN s.first_name = 'MUSA' AND s.last_name = 'AMIRAT' THEN '2024-09-20'
        -- Add all other payment dates
        ELSE NULL
    END,
    CASE
        WHEN s.first_name = 'OLATUNJI' AND s.last_name = 'EMMANUEL' THEN 'partial'
        WHEN s.first_name = 'MUSA' AND s.last_name = 'AMIRAT' THEN 'paid'
        -- Add all other statuses
        ELSE 'unpaid'
    END
FROM students s
JOIN tuition t ON s.class = t.class;

-- Insert expenses
INSERT INTO expenses (term, category, amount) VALUES
('first', 'RENT', 200000),
('first', 'FUMIGATION', 20000),
('first', 'STAFFS BONUS', 6000),
('second', 'PRINTING & OFFICE SUPPLIES', 7000),
('second', 'MANTAINANCE', 50000),
('third', 'GRADUATION/EOY PARTY EXPENSES', 246850);

-- Insert books
INSERT INTO books (student_id, student_name, class, type, amount, deposit, date)
SELECT 
    s.id,
    s.first_name || ' ' || s.last_name,
    s.class,
    'textbook',
    CASE
        WHEN s.first_name = 'JAMAL' AND s.last_name = 'KOREDE SOWEMIMO' THEN 5800
        WHEN s.first_name = 'OLUWATOSIN' AND s.last_name = 'OLUWAFERANMI' THEN 15700
        -- Add all other book amounts
        ELSE 0
    END,
    CASE
        WHEN s.first_name = 'JAMAL' AND s.last_name = 'KOREDE SOWEMIMO' THEN 5000
        WHEN s.first_name = 'OLUWATOSIN' AND s.last_name = 'OLUWAFERANMI' THEN 15700
        -- Add all other deposits
        ELSE 0
    END,
    CURRENT_DATE
FROM students s;

-- Insert party data
INSERT INTO party (student_id, student_name, class, event_type, amount, deposit, payment_date)
SELECT 
    s.id,
    s.first_name || ' ' || s.last_name,
    s.class,
    'End of Year Party',
    6000,  -- Example amount
    CASE
        WHEN s.first_name = 'ADEGBITE' AND s.last_name = 'OLUWASHINDARA AZIZAT' THEN 6000
        -- Add all other deposits
        ELSE 0
    END,
    CASE
        WHEN s.first_name = 'ADEGBITE' AND s.last_name = 'OLUWASHINDARA AZIZAT' THEN '2024-07-01'
        -- Add all other payment dates
        ELSE NULL
    END
FROM students s;

-- Insert party class amounts
INSERT INTO party_class_amounts (class, event_type, amount) VALUES
('KG 1', 'End of Year Party', 6000),
('KG 2', 'End of Year Party', 6000),
('NURS 1', 'End of Year Party', 6000),
('NURS 2', 'End of Year Party', 12000),
('PRY 1', 'End of Year Party', 0),
('PRY 2', 'End of Year Party', 6000),
('PRY 3', 'End of Year Party', 6000),
('PRY 4', 'End of Year Party', 6000),
('PRY 5', 'End of Year Party', 12000);

-- Insert sessions
INSERT INTO sessions (term, year, open_date, close_date, holiday_weeks) VALUES
('First Term', '2024/2025', '2024-09-01', '2024-12-15', 3),
('Second Term', '2024/2025', '2025-01-08', '2025-04-12', 3),
('Third Term', '2024/2025', '2025-05-06', '2025-07-25', 6);