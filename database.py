# -*- coding: utf-8 -*-
import sqlite3
from datetime import datetime

def init_database():
    """Инициализация базы данных SQLite"""
    conn = sqlite3.connect('scholarship.db')
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        faculty TEXT NOT NULL,
        group_name TEXT NOT NULL,
        course INTEGER NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
    )
    ''')
    
    # Таблица заявок
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        semester TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        points INTEGER DEFAULT 0,
        description TEXT NOT NULL,
        documents TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Таблица достижений
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        proof_url TEXT,
        level TEXT,
        points INTEGER DEFAULT 0,
        FOREIGN KEY (application_id) REFERENCES applications (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ База данных инициализирована")

def get_connection():
    """Получить подключение к БД"""
    return sqlite3.connect('scholarship.db')

if __name__ == '__main__':
    init_database()