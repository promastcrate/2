import sqlite3
import hashlib
from datetime import datetime, timedelta

def create_test_data():
    conn = sqlite3.connect('scholarship.db')
    cursor = conn.cursor()
    
    print("Создаем тестовые данные...")
    
    # 1. Создаем тестовых студентов
    students = [
        ('200001', 'student1@bintu.ru', 'Иванов Иван Иванович', 'ИТ', 'ИТ-101', 2, '+7 (999) 111-11-11'),
        ('200002', 'student2@bintu.ru', 'Петров Петр Петрович', 'Экономика', 'ЭК-201', 3, '+7 (999) 222-22-22'),
        ('200003', 'student3@bintu.ru', 'Сидорова Анна Сергеевна', 'Юриспруденция', 'ЮР-102', 1, '+7 (999) 333-33-33'),
        ('200004', 'student4@bintu.ru', 'Кузнецов Алексей Владимирович', 'Строительство', 'СТ-301', 4, '+7 (999) 444-44-44'),
        ('200005', 'student5@bintu.ru', 'Смирнова Екатерина Дмитриевна', 'Медицина', 'МД-202', 2, '+7 (999) 555-55-55'),
    ]
    
    for student in students:
        cursor.execute('''
        INSERT OR IGNORE INTO users 
        (student_id, email, password_hash, full_name, faculty, group_name, course, phone, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (*student, hashlib.sha256('student123'.encode()).hexdigest(), 'student'))
    
    # 2. Создаем тестовые заявки
    categories = ['academic', 'research', 'social', 'cultural', 'sport']
    statuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected']
    
    cursor.execute("SELECT id FROM users WHERE role = 'student'")
    student_ids = [row[0] for row in cursor.fetchall()]
    
    for i in range(15):
        import random
        cursor.execute('''
        INSERT INTO applications 
        (user_id, category, semester, status, points, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            random.choice(student_ids),
            random.choice(categories),
            '2024-осень',
            random.choice(statuses),
            random.randint(50, 100),
            f'Тестовая заявка #{i+1}. Достижения студента в различных областях.',
            (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
        ))
    
    conn.commit()
    
    # Проверяем
    cursor.execute("SELECT COUNT(*) FROM users")
    print(f"Пользователей: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM applications")
    print(f"Заявок: {cursor.fetchone()[0]}")
    
    conn.close()
    print("✅ Тестовые данные созданы!")

if __name__ == '__main__':
    create_test_data()