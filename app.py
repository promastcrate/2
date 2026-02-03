# -*- coding: utf-8 -*-
from flask import Flask, jsonify, request, g, session, redirect, render_template
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime
import functools

app = Flask(__name__)
CORS(app)

# Конфигурация
DATABASE = 'scholarship.db'
SECRET_KEY = 'bintu-scholarship-secret-key-2026'
app.secret_key = SECRET_KEY

print("=" * 60)
print("🎓 СЕРВЕР СИСТЕМЫ СТИПЕНДИЙ БГИТУ v3.0")
print("=" * 60)
print("📡 Сервер запущен: http://localhost:5000")
print("💾 База данных: SQLite (scholarship.db)")
print("🔐 Админка: http://localhost:5000/admin (требуется вход)")
print("👤 API регистрации: POST /api/auth/register")
print("🔑 API входа: POST /api/auth/login")
print("📋 API заявок: GET /api/applications")
print("=" * 60)

# ========== БАЗА ДАННЫХ ==========
def get_db():
    """Получить соединение с БД"""
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Закрыть соединение с БД"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Инициализировать БД при первом запуске"""
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Таблица пользователей
        cursor.execute('''
        CREATE TABLE users (
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
        CREATE TABLE applications (
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
        
        # Добавляем тестового админа
        admin_password = hashlib.sha256('admin123'.encode()).hexdigest()
        cursor.execute('''
        INSERT OR IGNORE INTO users 
        (student_id, email, password_hash, full_name, faculty, group_name, course, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('admin001', 'admin@bintu.ru', admin_password, 'Администратор', 'Администрация', 'ADMIN', 0, 'admin'))
        
        # Добавляем тестового студента
        student_password = hashlib.sha256('student123'.encode()).hexdigest()
        cursor.execute('''
        INSERT OR IGNORE INTO users 
        (student_id, email, password_hash, full_name, faculty, group_name, course, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('123456', 'student@bintu.ru', student_password, 'Иванов Иван', 'ИТ', 'ИТ-101', 2, 'student'))
        
        conn.commit()
        conn.close()
        print("✅ База данных создана с тестовыми пользователями")

# ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
def hash_password(password):
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(password_hash, password):
    """Проверка пароля"""
    return password_hash == hashlib.sha256(password.encode()).hexdigest()

def admin_required(f):
    """Декоратор для проверки прав администратора"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect('/admin/login')
        return f(*args, **kwargs)
    return decorated_function

# ========== ЛОГИН АДМИНА ==========

@app.route('/admin', methods=['GET', 'POST'])
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'GET':
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Вход в админку | ПГАС БГИТУ</title>
            <style>
                body { 
                    background: linear-gradient(135deg, #0c0c0c, #1a1a2e); 
                    color: white; 
                    font-family: 'Segoe UI', sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0;
                }
                .login-box { 
                    background: rgba(26, 26, 46, 0.95); 
                    padding: 40px; 
                    border-radius: 15px; 
                    border: 1px solid rgba(67, 97, 238, 0.3); 
                    width: 100%; 
                    max-width: 400px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                h2 { 
                    text-align: center; 
                    color: #4cc9f0; 
                    margin-bottom: 30px;
                    font-size: 1.8rem;
                }
                input { 
                    width: 100%; 
                    padding: 12px 15px; 
                    margin: 10px 0 20px 0; 
                    background: rgba(255, 255, 255, 0.05); 
                    border: 1px solid rgba(67, 97, 238, 0.5); 
                    border-radius: 8px; 
                    color: white;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }
                input:focus {
                    outline: none;
                    border-color: #f72585;
                }
                button { 
                    background: linear-gradient(135deg, #f72585, #b5179e); 
                    color: white; 
                    border: none; 
                    padding: 14px; 
                    width: 100%; 
                    cursor: pointer; 
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-top: 10px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(247, 37, 133, 0.4);
                }
                .error { 
                    color: #f72585; 
                    text-align: center; 
                    margin: 15px 0;
                    padding: 10px;
                    background: rgba(247, 37, 133, 0.1);
                    border-radius: 6px;
                }
                .info {
                    text-align: center; 
                    margin-top: 20px; 
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }
                a {
                    color: #4cc9f0;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                a:hover {
                    color: #f72585;
                    text-decoration: underline;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo h1 {
                    font-size: 1.5rem;
                    color: #4cc9f0;
                    margin: 0;
                }
                .logo p {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 5px 0 0 0;
                    font-size: 0.9rem;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="login-box">
                <div class="logo">
                    <h1><i class="fas fa-graduation-cap"></i> ПГАС БГИТУ</h1>
                    <p>Система стипендиального обеспечения</p>
                </div>
                <h2><i class="fas fa-shield-alt"></i> Вход в админ-панель</h2>
                <form method="POST">
                    <input type="email" name="email" placeholder="Email администратора" required>
                    <input type="password" name="password" placeholder="Пароль" required>
                    <button type="submit"><i class="fas fa-sign-in-alt"></i> Войти</button>
                </form>
                <div class="info">
                    <p><i class="fas fa-info-circle"></i> Используйте учетные данные администратора</p>
                    <p><a href="/"><i class="fas fa-arrow-left"></i> На главную страницу</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    
    # Обработка POST запроса (форма входа)
    email = request.form.get('email')
    password = request.form.get('password')
    
    if not email or not password:
        return '''
        <div class="error" style="text-align: center; margin: 50px;">
            <h2 style="color: #f72585;">❌ Ошибка</h2>
            <p>Заполните все поля</p>
            <a href="/admin/login" style="color: #4361ee;">Попробовать снова</a>
        </div>
        '''
    
    db = get_db()
    cursor = db.cursor()
    
    # Ищем админа
    cursor.execute("SELECT * FROM users WHERE email = ? AND role = 'admin'", (email,))
    admin = cursor.fetchone()
    
    if not admin or not check_password(admin['password_hash'], password):
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { background: #0c0c0c; color: white; font-family: sans-serif; text-align: center; padding: 50px; }
                .error-box { background: #1a1a2e; padding: 40px; border-radius: 10px; display: inline-block; border: 1px solid #f72585; }
                a { color: #4cc9f0; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="error-box">
                <h2 style="color: #f72585;">❌ Ошибка входа</h2>
                <p>Неверный email или пароль</p>
                <br>
                <a href="/admin/login"><i class="fas fa-arrow-left"></i> Попробовать снова</a>
            </div>
        </body>
        </html>
        '''
    
    # Сохраняем в сессию
    session['admin_id'] = admin['id']
    session['admin_email'] = admin['email']
    session['admin_role'] = admin['role']
    
    # Перенаправляем на защищенную админку
    return redirect('/admin/dashboard')

# ========== ЗАЩИЩЕННАЯ АДМИНКА ==========

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    # Проверяем что это действительно админ
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT role FROM users WHERE id = ?", (session['admin_id'],))
    user = cursor.fetchone()
    
    if not user or user['role'] != 'admin':
        session.clear()
        return redirect('/admin/login')
    
    # Отдаем админ-панель
    return '''
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Админ-панель | ПГАС БГИТУ</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            :root { --primary: #4361ee; --primary-dark: #3a56d4; --secondary: #7209b7; --accent: #f72585; --success: #38b000; --warning: #ff9e00; --danger: #dc3545; --sidebar: 250px; }
            body { background: #f5f7fb; color: #333; min-height: 100vh; display: flex; }
            .sidebar { width: var(--sidebar); background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); color: white; height: 100vh; position: fixed; box-shadow: 2px 0 20px rgba(0,0,0,0.1); }
            .logo { padding: 25px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .logo h1 { font-size: 1.5rem; color: #4cc9f0; margin-bottom: 5px; }
            .logo p { color: rgba(255,255,255,0.7); font-size: 0.8rem; }
            .user-info { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .user-info .email { font-size: 0.85rem; color: rgba(255,255,255,0.6); }
            .nav-menu { padding: 20px 0; }
            .nav-item { display: flex; align-items: center; gap: 15px; padding: 15px 25px; color: rgba(255,255,255,0.8); text-decoration: none; transition: all 0.3s; border-left: 4px solid transparent; cursor: pointer; }
            .nav-item:hover, .nav-item.active { background: rgba(67,97,238,0.2); color: white; border-left-color: var(--primary); }
            .nav-item.logout { margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
            .nav-item.logout:hover { border-left-color: var(--accent); }
            .main-content { flex: 1; margin-left: var(--sidebar); padding: 20px; }
            .header { background: white; padding: 20px 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header h2 { color: var(--primary); font-size: 1.8rem; }
            .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 20px; transition: transform 0.3s; }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: white; }
            .stat-icon.users { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
            .stat-icon.applications { background: linear-gradient(135deg, var(--accent), #b5179e); }
            .stat-icon.pending { background: linear-gradient(135deg, var(--warning), #e68a00); }
            .stat-icon.approved { background: linear-gradient(135deg, var(--success), #2d9100); }
            .table-container { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 30px; }
            .table-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .filters { display: flex; gap: 15px; align-items: center; }
            .filter-select { padding: 8px 15px; border: 1px solid #ddd; border-radius: 8px; background: white; color: #333; }
            .refresh-btn { padding: 8px 15px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.3s; }
            .refresh-btn:hover { background: var(--primary-dark); }
            table { width: 100%; border-collapse: collapse; }
            th { padding: 18px 20px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #eee; background: #f8f9fa; }
            td { padding: 18px 20px; border-bottom: 1px solid #eee; color: #444; }
            tr:hover { background: #f8f9fa; }
            .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
            .status-draft { background: #fff3cd; color: #856404; }
            .status-submitted { background: #cce5ff; color: #004085; }
            .status-in_review { background: #d1ecf1; color: #0c5460; }
            .status-approved { background: #d4edda; color: #155724; }
            .status-rejected { background: #f8d7da; color: #721c24; }
            .action-btn { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; margin-right: 5px; }
            .action-btn.view { background: #e7f1ff; color: var(--primary); }
            .action-btn.approve { background: #d4edda; color: var(--success); }
            .action-btn:hover { transform: translateY(-2px); box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
            .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 1000; align-items: center; justify-content: center; }
            .modal { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalAppear 0.3s; }
            @keyframes modalAppear { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            .modal-header { padding: 25px 30px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .modal-body { padding: 30px; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .info-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid var(--primary); }
            .description-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .btn { padding: 12px 25px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.3s; }
            .btn-primary { background: var(--primary); color: white; }
            .btn-success { background: var(--success); color: white; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .points-input { width: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; text-align: center; }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
        <div class="sidebar">
            <div class="logo">
                <h1><i class="fas fa-graduation-cap"></i> ПГАС БГИТУ</h1>
                <p>Админ-панель</p>
            </div>
            <div class="user-info">
                <div><i class="fas fa-user-shield"></i> Администратор</div>
                <div class="email" id="adminEmail"></div>
            </div>
            <div class="nav-menu">
                <a href="#" class="nav-item active" onclick="showSection('dashboard')"><i class="fas fa-tachometer-alt"></i><span>Дашборд</span></a>
                <a href="#" class="nav-item" onclick="showSection('applications')"><i class="fas fa-file-alt"></i><span>Заявки</span></a>
                <a href="#" class="nav-item" onclick="showSection('students')"><i class="fas fa-users"></i><span>Студенты</span></a>
                <a href="#" class="nav-item" onclick="showSection('statistics')"><i class="fas fa-chart-bar"></i><span>Статистика</span></a>
                <a href="/admin/logout" class="nav-item logout"><i class="fas fa-sign-out-alt"></i><span>Выйти</span></a>
            </div>
        </div>
        <div class="main-content">
            <div id="dashboardSection" class="content-section">
                <div class="header">
                    <h2><i class="fas fa-tachometer-alt"></i> Панель управления</h2>
                    <div><i class="fas fa-calendar-alt"></i> <span id="currentDate"></span></div>
                </div>
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon users"><i class="fas fa-user-graduate"></i></div>
                        <div class="stat-info"><h3 id="totalUsers">0</h3><p>Студентов</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon applications"><i class="fas fa-file-contract"></i></div>
                        <div class="stat-info"><h3 id="totalApplications">0</h3><p>Заявок</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pending"><i class="fas fa-clock"></i></div>
                        <div class="stat-info"><h3 id="pendingApplications">0</h3><p>На рассмотрении</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon approved"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info"><h3 id="approvedApplications">0</h3><p>Одобрено</p></div>
                    </div>
                </div>
                <div class="table-container">
                    <div class="table-header">
                        <h3><i class="fas fa-history"></i> Последние заявки</h3>
                        <div class="filters">
                            <select class="filter-select" onchange="loadRecentApplications(this.value)">
                                <option value="all">Все статусы</option>
                                <option value="submitted">На рассмотрении</option>
                            </select>
                            <button class="refresh-btn" onclick="loadDashboard()">
                                <i class="fas fa-sync-alt"></i> Обновить
                            </button>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Студент</th>
                                <th>Факультет</th>
                                <th>Категория</th>
                                <th>Статус</th>
                                <th>Баллы</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="recentApplications"></tbody>
                    </table>
                </div>
            </div>
            <div id="applicationsSection" class="content-section" style="display:none;">
                <div class="header">
                    <h2><i class="fas fa-file-alt"></i> Управление заявками</h2>
                    <button class="refresh-btn" onclick="loadAllApplications()">
                        <i class="fas fa-sync-alt"></i> Обновить
                    </button>
                </div>
                <div class="table-container">
                    <div class="table-header">
                        <h3>Все заявки</h3>
                        <div class="filters">
                            <select class="filter-select" id="filterStatus" onchange="filterApplications()">
                                <option value="">Все статусы</option>
                                <option value="draft">Черновики</option>
                                <option value="submitted">На рассмотрении</option>
                                <option value="approved">Одобрено</option>
                            </select>
                            <select class="filter-select" id="filterCategory" onchange="filterApplications()">
                                <option value="">Все категории</option>
                                <option value="academic">Учебная</option>
                                <option value="research">Научная</option>
                                <option value="social">Общественная</option>
                                <option value="cultural">Культурная</option>
                                <option value="sport">Спортивная</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Студент</th>
                                <th>Факультет</th>
                                <th>Категория</th>
                                <th>Статус</th>
                                <th>Баллы</th>
                                <th>Дата подачи</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="allApplications"></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-overlay" id="viewApplicationModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-alt"></i> Заявка #<span id="modalAppId"></span></h3>
                        <button class="close-modal" onclick="closeModal()" style="background:none;border:none;font-size:24px;cursor:pointer;">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="info-grid">
                            <div class="info-card">
                                <h4>Студент</h4>
                                <p id="modalStudentName"></p>
                                <small id="modalStudentInfo"></small>
                            </div>
                            <div class="info-card">
                                <h4>Категория</h4>
                                <p id="modalCategory"></p>
                            </div>
                            <div class="info-card">
                                <h4>Статус</h4>
                                <p><span class="status-badge" id="modalStatus"></span></p>
                            </div>
                            <div class="info-card">
                                <h4>Баллы</h4>
                                <p id="modalPoints">0</p>
                            </div>
                        </div>
                        <div class="description-box">
                            <h4>Описание достижений</h4>
                            <p id="modalDescription"></p>
                        </div>
                        <div class="action-buttons" style="display:flex;align-items:center;gap:15px;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                            <label><strong>Баллы:</strong></label>
                            <input type="number" class="points-input" id="assignPoints" min="0" max="200" value="0">
                            <div style="display:flex;gap:10px;margin-left:auto;">
                                <button class="btn btn-success" onclick="updateStatus('approved')">
                                    <i class="fas fa-check"></i> Одобрить
                                </button>
                                <button class="btn btn-primary" onclick="updateStatus('in_review')">
                                    <i class="fas fa-eye"></i> В работу
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            const API_URL = '/api';
            let currentApplicationId = null;
            
            // Заполняем email админа
            document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                // Можно добавить email из сессии если нужно
                // document.getElementById('adminEmail').textContent = 'admin@bintu.ru';
                loadDashboard();
            });
            
            async function loadDashboard() {
                try {
                    const response = await fetch(API_URL + '/stats');
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        document.getElementById('totalUsers').textContent = data.users_count;
                        document.getElementById('totalApplications').textContent = data.applications_count;
                        document.getElementById('pendingApplications').textContent = data.pending_count;
                        document.getElementById('approvedApplications').textContent = data.approved_count;
                    }
                    loadRecentApplications('all');
                } catch (e) {
                    console.error('Ошибка загрузки:', e);
                }
            }
            
            async function loadRecentApplications(status) {
                try {
                    let url = API_URL + '/applications?limit=10';
                    if (status !== 'all') url += '&status=' + status;
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    const tbody = document.getElementById('recentApplications');
                    
                    if (data.status === 'success' && data.applications.length > 0) {
                        tbody.innerHTML = data.applications.map(app => `
                            <tr>
                                <td>${app.student_name}</td>
                                <td>${app.faculty}</td>
                                <td>${getCategoryName(app.category)}</td>
                                <td><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></td>
                                <td>${app.points || 0}</td>
                                <td>${new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <button class="action-btn view" onclick="viewApplication(${app.id})">
                                        <i class="fas fa-eye"></i> Просмотр
                                    </button>
                                </td>
                            </tr>
                        `).join('');
                    } else {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Нет заявок</td></tr>';
                    }
                } catch (e) {
                    console.error('Ошибка:', e);
                }
            }
            
            async function loadAllApplications() {
                try {
                    const status = document.getElementById('filterStatus').value;
                    const category = document.getElementById('filterCategory').value;
                    
                    let url = API_URL + '/applications';
                    const params = [];
                    if (status) params.push('status=' + status);
                    if (category) params.push('category=' + category);
                    
                    if (params.length > 0) url += '?' + params.join('&');
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    const tbody = document.getElementById('allApplications');
                    
                    if (data.status === 'success' && data.applications.length > 0) {
                        tbody.innerHTML = data.applications.map(app => `
                            <tr>
                                <td>${app.id}</td>
                                <td>${app.student_name}</td>
                                <td>${app.faculty}</td>
                                <td>${getCategoryName(app.category)}</td>
                                <td><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></td>
                                <td>${app.points || 0}</td>
                                <td>${new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <button class="action-btn view" onclick="viewApplication(${app.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="action-btn approve" onclick="approveApplication(${app.id})" ${app.status === 'approved' ? 'disabled' : ''}>
                                        <i class="fas fa-check"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('');
                    } else {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#666;">Нет заявок</td></tr>';
                    }
                } catch (e) {
                    console.error('Ошибка:', e);
                }
            }
            
            async function viewApplication(id) {
                try {
                    const response = await fetch(API_URL + '/applications/' + id);
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        currentApplicationId = id;
                        const app = data.application;
                        document.getElementById('modalAppId').textContent = app.id;
                        document.getElementById('modalStudentName').textContent = app.student_name;
                        document.getElementById('modalStudentInfo').textContent = app.faculty + ', ' + app.student_id;
                        document.getElementById('modalCategory').textContent = getCategoryName(app.category);
                        document.getElementById('modalStatus').textContent = getStatusText(app.status);
                        document.getElementById('modalStatus').className = 'status-badge status-' + app.status;
                        document.getElementById('modalPoints').textContent = app.points || 0;
                        document.getElementById('modalDescription').textContent = app.description;
                        document.getElementById('assignPoints').value = app.points || 0;
                        document.getElementById('viewApplicationModal').style.display = 'flex';
                    }
                } catch (e) {
                    console.error('Ошибка:', e);
                    alert('Ошибка загрузки заявки');
                }
            }
            
            async function approveApplication(id) {
                if (confirm('Вы уверены, что хотите одобрить эту заявку?')) {
                    try {
                        const response = await fetch(API_URL + '/applications/' + id + '/status', {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({status: 'approved'})
                        });
                        const data = await response.json();
                        
                        if (data.status === 'success') {
                            alert('Заявка одобрена!');
                            loadDashboard();
                            loadAllApplications();
                        } else {
                            alert('Ошибка: ' + data.error);
                        }
                    } catch (e) {
                        console.error('Ошибка:', e);
                        alert('Ошибка обновления статуса');
                    }
                }
            }
            
            async function updateStatus(status) {
                if (!currentApplicationId) return;
                const points = document.getElementById('assignPoints').value;
                
                try {
                    const response = await fetch(API_URL + '/applications/' + currentApplicationId + '/status', {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({status: status, points: parseInt(points)})
                    });
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        alert('Статус обновлён');
                        closeModal();
                        loadDashboard();
                        loadAllApplications();
                    } else {
                        alert('Ошибка: ' + data.error);
                    }
                } catch (e) {
                    console.error('Ошибка:', e);
                    alert('Ошибка обновления статуса');
                }
            }
            
            function closeModal() {
                document.getElementById('viewApplicationModal').style.display = 'none';
                currentApplicationId = null;
            }
            
            function getStatusText(status) {
                const statuses = {
                    'draft': 'Черновик',
                    'submitted': 'На рассмотрении',
                    'in_review': 'В работе',
                    'approved': 'Одобрено',
                    'rejected': 'Отклонено'
                };
                return statuses[status] || status;
            }
            
            function getCategoryName(category) {
                const categories = {
                    'academic': 'Учебная',
                    'research': 'Научная',
                    'social': 'Общественная',
                    'cultural': 'Культурная',
                    'sport': 'Спортивная'
                };
                return categories[category] || category;
            }
            
            function showSection(sectionId) {
                document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
                document.getElementById(sectionId + 'Section').style.display = 'block';
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelector(`.nav-item[onclick*="${sectionId}"]`).classList.add('active');
                
                if (sectionId === 'dashboard') loadDashboard();
                else if (sectionId === 'applications') loadAllApplications();
            }
            
            function filterApplications() {
                loadAllApplications();
            }
            
            // Закрытие модального окна при клике на оверлей
            document.getElementById('viewApplicationModal').addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        </script>
    </body>
    </html>
    '''

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect('/admin/login')

# ========== API РЕГИСТРАЦИИ И АУТЕНТИФИКАЦИИ ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Регистрация нового студента"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Нет данных", "status": "error"}), 400
        
        # Проверяем обязательные поля
        required = ["student_id", "email", "password", "full_name", "faculty", "group_name", "course"]
        missing = [field for field in required if field not in data]
        
        if missing:
            return jsonify({
                "error": f"Отсутствуют поля: {', '.join(missing)}",
                "status": "error"
            }), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Проверяем, не зарегистрирован ли уже студент
        cursor.execute("SELECT id FROM users WHERE student_id = ? OR email = ?", 
                      (data["student_id"], data["email"]))
        existing = cursor.fetchone()
        
        if existing:
            return jsonify({
                "error": "Студент с таким номером или email уже зарегистрирован",
                "status": "error"
            }), 409
        
        # Хешируем пароль
        password_hash = hash_password(data["password"])
        
        # Вставляем нового пользователя
        cursor.execute('''
        INSERT INTO users (student_id, email, password_hash, full_name, faculty, group_name, course, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data["student_id"],
            data["email"],
            password_hash,
            data["full_name"],
            data["faculty"],
            data["group_name"],
            data["course"],
            data.get("phone", "")
        ))
        
        user_id = cursor.lastrowid
        db.commit()
        
        # Получаем данные созданного пользователя
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        return jsonify({
            "status": "success",
            "message": f"Студент {data['full_name']} успешно зарегистрирован!",
            "user": {
                "id": user["id"],
                "student_id": user["student_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "faculty": user["faculty"],
                "group_name": user["group_name"],
                "course": user["course"],
                "phone": user["phone"],
                "role": user["role"],
                "created_at": user["created_at"]
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Ошибка сервера: {str(e)}"
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Вход в систему"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Нет данных", "status": "error"}), 400
        
        required = ["student_id", "password"]
        missing = [field for field in required if field not in data]
        
        if missing:
            return jsonify({
                "error": f"Отсутствуют поля: {', '.join(missing)}",
                "status": "error"
            }), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Ищем пользователя
        cursor.execute(
            "SELECT * FROM users WHERE student_id = ?", 
            (data["student_id"],)
        )
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                "error": "Студент не найден",
                "status": "error"
            }), 404
        
        # Проверяем пароль
        if not check_password(user["password_hash"], data["password"]):
            return jsonify({
                "error": "Неверный пароль",
                "status": "error"
            }), 401
        
        # Проверяем активен ли аккаунт
        if not user["is_active"]:
            return jsonify({
                "error": "Аккаунт деактивирован",
                "status": "error"
            }), 403
        
        # Возвращаем успешный ответ
        return jsonify({
            "status": "success",
            "message": "Вход выполнен успешно",
            "user": {
                "id": user["id"],
                "student_id": user["student_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "faculty": user["faculty"],
                "group_name": user["group_name"],
                "course": user["course"],
                "phone": user["phone"],
                "role": user["role"],
                "created_at": user["created_at"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

# ========== API ПОЛЬЗОВАТЕЛЕЙ ==========

@app.route('/api/users', methods=['GET'])
def get_users():
    """Получить список всех пользователей"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        return jsonify({
            "status": "success",
            "count": len(users),
            "users": [
                {
                    "id": user["id"],
                    "student_id": user["student_id"],
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "faculty": user["faculty"],
                    "group_name": user["group_name"],
                    "course": user["course"],
                    "role": user["role"],
                    "created_at": user["created_at"]
                }
                for user in users
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Получить профиль пользователя"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Пользователь не найден", "status": "error"}), 404
        
        return jsonify({
            "status": "success",
            "user": {
                "id": user["id"],
                "student_id": user["student_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "faculty": user["faculty"],
                "group_name": user["group_name"],
                "course": user["course"],
                "phone": user["phone"],
                "role": user["role"],
                "created_at": user["created_at"]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/users/<int:user_id>/applications', methods=['GET'])
def get_user_applications(user_id):
    """Получить заявки конкретного пользователя"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
        SELECT a.*, u.full_name, u.student_id, u.faculty 
        FROM applications a
        JOIN users u ON a.user_id = u.id
        WHERE u.id = ?
        ORDER BY a.created_at DESC
        ''', (user_id,))
        
        applications = cursor.fetchall()
        
        return jsonify({
            "status": "success",
            "count": len(applications),
            "applications": [
                {
                    "id": app["id"],
                    "category": app["category"],
                    "semester": app["semester"],
                    "status": app["status"],
                    "points": app["points"],
                    "description": app["description"],
                    "documents": app["documents"],
                    "created_at": app["created_at"],
                    "updated_at": app["updated_at"]
                }
                for app in applications
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

# ========== API СТАТИСТИКИ ==========

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Получить статистику системы"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Количество пользователей
        cursor.execute("SELECT COUNT(*) as count FROM users")
        users_count = cursor.fetchone()["count"]
        
        # Количество заявок
        cursor.execute("SELECT COUNT(*) as count FROM applications")
        applications_count = cursor.fetchone()["count"]
        
        # Заявки по статусам
        cursor.execute("SELECT status, COUNT(*) as count FROM applications GROUP BY status")
        status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}
        
        return jsonify({
            "status": "success",
            "users_count": users_count,
            "applications_count": applications_count,
            "pending_count": status_counts.get("draft", 0) + status_counts.get("submitted", 0),
            "approved_count": status_counts.get("approved", 0),
            "rejected_count": status_counts.get("rejected", 0)
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

# ========== API ЗАЯВОК ==========

@app.route('/api/applications', methods=['POST'])
def create_application():
    """Создать новую заявку на стипендию"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Нет данных", "status": "error"}), 400
        
        required = ["user_id", "category", "semester", "description"]
        missing = [field for field in required if field not in data]
        
        if missing:
            return jsonify({
                "error": f"Отсутствуют поля: {', '.join(missing)}",
                "status": "error"
            }), 400
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
        INSERT INTO applications (user_id, category, semester, description, documents)
        VALUES (?, ?, ?, ?, ?)
        ''', (
            data["user_id"],
            data["category"],
            data["semester"],
            data["description"],
            data.get("documents", "")
        ))
        
        application_id = cursor.lastrowid
        db.commit()
        
        return jsonify({
            "status": "success",
            "message": "Заявка создана успешно!",
            "application_id": application_id
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/applications', methods=['GET'])
def get_applications():
    """Получить список всех заявок"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Параметры фильтрации
        status = request.args.get('status')
        category = request.args.get('category')
        limit = request.args.get('limit')
        
        query = '''
        SELECT a.*, u.full_name, u.student_id, u.faculty 
        FROM applications a
        JOIN users u ON a.user_id = u.id
        WHERE 1=1
        '''
        params = []
        
        if status:
            query += ' AND a.status = ?'
            params.append(status)
        
        if category:
            query += ' AND a.category = ?'
            params.append(category)
            
        query += ' ORDER BY a.created_at DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(int(limit))
        
        cursor.execute(query, params)
        applications = cursor.fetchall()
        
        return jsonify({
            "status": "success",
            "count": len(applications),
            "applications": [
                {
                    "id": app["id"],
                    "user_id": app["user_id"],
                    "student_name": app["full_name"],
                    "student_id": app["student_id"],
                    "faculty": app["faculty"],
                    "category": app["category"],
                    "semester": app["semester"],
                    "status": app["status"],
                    "points": app["points"],
                    "description": app["description"],
                    "created_at": app["created_at"]
                }
                for app in applications
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    """Получить детальную информацию о заявке"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
        SELECT a.*, u.full_name, u.student_id, u.faculty, u.group_name, u.course, u.email, u.phone
        FROM applications a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
        ''', (application_id,))
        
        application = cursor.fetchone()
        
        if not application:
            return jsonify({"error": "Заявка не найдена", "status": "error"}), 404
        
        return jsonify({
            "status": "success",
            "application": {
                "id": application["id"],
                "user_id": application["user_id"],
                "student_name": application["full_name"],
                "student_id": application["student_id"],
                "faculty": application["faculty"],
                "group_name": application["group_name"],
                "course": application["course"],
                "email": application["email"],
                "phone": application["phone"],
                "category": application["category"],
                "semester": application["semester"],
                "status": application["status"],
                "points": application["points"],
                "description": application["description"],
                "documents": application["documents"],
                "created_at": application["created_at"],
                "updated_at": application["updated_at"]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/applications/<int:application_id>/status', methods=['PUT'])
def update_application_status(application_id):
    """Обновить статус заявки (одобрить/отклонить)"""
    try:
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({"error": "Статус обязателен", "status": "error"}), 400
        
        valid_statuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({"error": f"Неверный статус. Допустимые: {', '.join(valid_statuses)}", "status": "error"}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Проверяем существует ли заявка
        cursor.execute("SELECT id FROM applications WHERE id = ?", (application_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Заявка не найдена", "status": "error"}), 404
        
        # Обновляем статус и баллы
        update_query = "UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP"
        update_params = [data['status']]
        
        if 'points' in data:
            update_query += ", points = ?"
            update_params.append(data['points'])
        
        update_query += " WHERE id = ?"
        update_params.append(application_id)
        
        cursor.execute(update_query, update_params)
        db.commit()
        
        # Получаем обновлённую заявку
        cursor.execute('''
        SELECT a.*, u.full_name, u.student_id 
        FROM applications a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
        ''', (application_id,))
        
        application = cursor.fetchone()
        
        return jsonify({
            "status": "success",
            "message": f"Статус заявки обновлён на '{data['status']}'",
            "application": {
                "id": application["id"],
                "student_name": application["full_name"],
                "student_id": application["student_id"],
                "category": application["category"],
                "status": application["status"],
                "points": application["points"],
                "updated_at": application["updated_at"]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

# ========== API КАТЕГОРИЙ ==========

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Получить список категорий стипендий"""
    categories = [
        {
            "id": "academic",
            "name": "Учебная деятельность",
            "description": "Отличная успеваемость и академические достижения",
            "max_points": 100,
            "criteria": [
                "Средний балл не ниже 4.8",
                "Участие в олимпиадах",
                "Публикации в научных изданиях"
            ]
        },
        {
            "id": "research",
            "name": "Научно-исследовательская деятельность",
            "description": "Научные публикации, патенты и гранты",
            "max_points": 150,
            "criteria": [
                "Публикации в рецензируемых журналах",
                "Патенты на изобретения",
                "Участие в научных конференциях"
            ]
        },
        {
            "id": "social",
            "name": "Общественная деятельность",
            "description": "Участие в общественной жизни университета",
            "max_points": 80,
            "criteria": [
                "Волонтерская деятельность",
                "Организация мероприятий",
                "Участие в студенческом совете"
            ]
        },
        {
            "id": "cultural",
            "name": "Культурно-творческая деятельность",
            "description": "Творческие достижения и культурные мероприятия",
            "max_points": 70,
            "criteria": [
                "Участие в творческих конкурсах",
                "Организация культурных мероприятий",
                "Творческие достижения"
            ]
        },
        {
            "id": "sport",
            "name": "Спортивная деятельность",
            "description": "Спортивные достижения и соревнования",
            "max_points": 90,
            "criteria": [
                "Призовые места в соревнованиях",
                "Участие в спортивных мероприятиях",
                "Спортивные разряды и звания"
            ]
        }
    ]
    
    return jsonify({
        "status": "success",
        "count": len(categories),
        "categories": categories
    })

# ========== ЗАКРЫТИЕ БД ==========
@app.teardown_appcontext
def teardown_db(exception):
    close_db()


# ========== ЗАПУСК СЕРВЕРА ==========
if __name__ == '__main__':
    # Инициализируем БД при первом запуске
    with app.app_context():
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)