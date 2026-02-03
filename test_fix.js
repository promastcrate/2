// test_fix.js - ПРОСТАЯ РАБОЧАЯ ВЕРСИЯ
console.log('🚀 Личный кабинет - простая версия загружена');

let currentUser = null;
let applications = [];

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем кабинет...');
    
    // Убираем дублирующиеся формы
    removeDuplicateForms();
    
    const userData = localStorage.getItem('user');
    
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('Найден пользователь:', currentUser);
            showDashboard();
            loadData();
        } catch (e) {
            console.error('Ошибка парсинга пользователя:', e);
            showAuth();
        }
    } else {
        showAuth();
    }
    
    setupEventListeners();
});

// Удаляем дублирующиеся формы
function removeDuplicateForms() {
    console.log('Проверяем дубликаты форм...');
    
    // Находим все формы входа
    const loginForms = document.querySelectorAll('#loginForm');
    if (loginForms.length > 1) {
        console.log('Найдены дубликаты форм входа, удаляем...');
        for (let i = 1; i < loginForms.length; i++) {
            loginForms[i].remove();
        }
    }
    
    // Находим все формы регистрации
    const registerForms = document.querySelectorAll('#registerForm');
    if (registerForms.length > 1) {
        console.log('Найдены дубликаты форм регистрации, удаляем...');
        for (let i = 1; i < registerForms.length; i++) {
            registerForms[i].remove();
        }
    }
}

// Показать авторизацию
function showAuth() {
    console.log('Показываем форму авторизации');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    showTab('login');
}

// Показать личный кабинет
function showDashboard() {
    console.log('Показываем личный кабинет');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    
    // Обновляем информацию пользователя
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.full_name || 'Студент';
        document.getElementById('userInfo').textContent = 
            (currentUser.group_name || 'Группа') + ' | ' + 
            (currentUser.course || 'Курс') + ' курс';
    }
    
    // Показываем первую вкладку
    showSection('overview');
}

// Показать вкладку (вход/регистрация)
function showTab(tabName) {
    console.log('Переключаем на вкладку:', tabName);
    
    // Убираем активный класс у всех вкладок
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Скрываем все формы
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Находим и активируем нужную вкладку
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        if (tab.textContent.includes(tabName === 'login' ? 'Вход' : 'Регистрация')) {
            tab.classList.add('active');
        }
    });
    
    // Показываем нужную форму
    const form = document.getElementById(tabName + 'Form');
    if (form) {
        form.classList.add('active');
    }
}

// Показать секцию в личном кабинете
function showSection(sectionId) {
    console.log('Переходим в раздел:', sectionId);
    
    // Скрыть все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показать выбранную секцию
    const section = document.getElementById(sectionId + 'Section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Обновить активную навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = document.querySelector(`.nav-item[onclick*="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Загрузить данные для секции
    if (sectionId === 'overview') {
        loadOverview();
    } else if (sectionId === 'applications') {
        loadApplications();
    } else if (sectionId === 'newApplication') {
        setupNewApplicationForm();
    } else if (sectionId === 'profile') {
        setupProfileForm();
    }
}

// Загрузить данные
function loadData() {
    // Загружаем заявки
    const savedApps = localStorage.getItem('user_applications');
    if (savedApps) {
        applications = JSON.parse(savedApps);
    } else {
        // Тестовые данные
        applications = [
            {
                id: 1,
                category: 'academic',
                semester: '2024-осень',
                status: 'submitted',
                points: 85,
                created_at: new Date().toISOString(),
                description: 'Отличная успеваемость, средний балл 4.9'
            },
            {
                id: 2,
                category: 'social',
                semester: '2024-осень',
                status: 'approved',
                points: 70,
                created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
                description: 'Организация студенческого фестиваля'
            }
        ];
        localStorage.setItem('user_applications', JSON.stringify(applications));
    }
    
    loadOverview();
}

// Загрузить обзор
function loadOverview() {
    const apps = JSON.parse(localStorage.getItem('user_applications') || '[]');
    
    document.getElementById('totalApps').textContent = apps.length;
    document.getElementById('pendingApps').textContent = apps.filter(a => a.status === 'submitted').length;
    document.getElementById('approvedApps').textContent = apps.filter(a => a.status === 'approved').length;
    document.getElementById('totalPoints').textContent = apps.reduce((sum, app) => sum + (app.points || 0), 0);
}

// Загрузить заявки
function loadApplications() {
    const container = document.getElementById('applicationsList');
    const apps = JSON.parse(localStorage.getItem('user_applications') || '[]');
    
    if (apps.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h4>Заявок пока нет</h4>
                <p>Создайте свою первую заявку!</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div style="overflow-x: auto;">
            <table class="applications-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 15px; text-align: left;">Категория</th>
                        <th style="padding: 15px; text-align: left;">Семестр</th>
                        <th style="padding: 15px; text-align: left;">Статус</th>
                        <th style="padding: 15px; text-align: left;">Баллы</th>
                        <th style="padding: 15px; text-align: left;">Дата</th>
                    </tr>
                </thead>
                <tbody>
                    ${apps.map(app => `
                        <tr>
                            <td style="padding: 15px;">${getCategoryName(app.category)}</td>
                            <td style="padding: 15px;">${app.semester}</td>
                            <td style="padding: 15px;">
                                <span style="padding: 5px 10px; border-radius: 20px; background: ${getStatusColor(app.status)}">
                                    ${getStatusText(app.status)}
                                </span>
                            </td>
                            <td style="padding: 15px;">${app.points || 0}</td>
                            <td style="padding: 15px;">${new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// Настроить форму новой заявки
function setupNewApplicationForm() {
    const form = document.getElementById('newApplicationForm');
    if (!form) return;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const category = document.getElementById('applicationCategory').value;
        const semester = document.getElementById('applicationSemester').value;
        const description = document.getElementById('applicationDescription').value;
        
        if (!category || !semester || !description) {
            alert('Заполните все обязательные поля!');
            return;
        }
        
        // Создаем новую заявку
        const newApplication = {
            id: Date.now(),
            category: category,
            semester: semester,
            description: description,
            status: 'draft',
            points: 0,
            created_at: new Date().toISOString()
        };
        
        // Сохраняем в localStorage
        const apps = JSON.parse(localStorage.getItem('user_applications') || '[]');
        apps.push(newApplication);
        localStorage.setItem('user_applications', JSON.stringify(apps));
        
        // Показываем сообщение
        showNotification('Заявка создана успешно!', 'success');
        
        // Очищаем форму
        form.reset();
        
        // Переходим к списку заявок
        showSection('applications');
        
        // Обновляем статистику
        loadOverview();
    };
}

// Настроить форму профиля
function setupProfileForm() {
    const section = document.getElementById('profileSection');
    
    // Если форма уже есть, не создаем заново
    if (document.getElementById('profileForm')) {
        // Заполняем данные
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('profilePhone').value = currentUser.phone || '';
        return;
    }
    
    // Создаем форму
    section.innerHTML = `
        <h3 style="margin-bottom: 20px;">Настройки профиля</h3>
        <form id="profileForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="profileEmail" value="${currentUser.email || ''}">
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="profilePhone" value="${currentUser.phone || ''}" placeholder="+7 (999) 123-45-67">
            </div>
            <div class="form-group">
                <label>Новый пароль</label>
                <input type="password" id="newPassword" placeholder="Оставьте пустым, если не хотите менять">
            </div>
            <button type="submit" class="submit-btn">
                <i class="fas fa-save"></i> Сохранить изменения
            </button>
        </form>
    `;
    
    // Добавляем обработчик
    document.getElementById('profileForm').onsubmit = function(e) {
        e.preventDefault();
        
        // Обновляем данные пользователя
        currentUser.email = document.getElementById('profileEmail').value;
        currentUser.phone = document.getElementById('profilePhone').value;
        
        // Сохраняем
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showNotification('Профиль обновлен!', 'success');
    };
}

// Вспомогательные функции
function getCategoryName(categoryId) {
    const categories = {
        'academic': 'Учебная',
        'research': 'Научная',
        'social': 'Общественная',
        'cultural': 'Культурная',
        'sport': 'Спортивная'
    };
    return categories[categoryId] || categoryId;
}

function getStatusText(status) {
    const statuses = {
        'draft': 'Черновик',
        'submitted': 'На рассмотрении',
        'approved': 'Одобрено',
        'rejected': 'Отклонено'
    };
    return statuses[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'draft': '#ff9e00',
        'submitted': '#4cc9f0',
        'approved': '#38b000',
        'rejected': '#f72585'
    };
    return colors[status] || '#666';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Добавляем стили если их нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .notification-success {
                background: linear-gradient(135deg, #38b000, #2d9100);
            }
            .notification-error {
                background: linear-gradient(135deg, #f72585, #d1146e);
            }
            .notification-info {
                background: linear-gradient(135deg, #4361ee, #3a56d4);
            }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Настраиваем обработчики событий...');
    
    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentId = document.getElementById('loginStudentId').value;
            const password = document.getElementById('loginPassword').value;
            
            if (studentId === '123456' && password === 'student123') {
                // Тестовый пользователь
                currentUser = {
                    id: 1,
                    student_id: '123456',
                    email: 'student@bintu.ru',
                    full_name: 'Иванов Иван',
                    faculty: 'ИТ',
                    group_name: 'ИТ-101',
                    course: 2,
                    phone: ''
                };
                
                localStorage.setItem('user', JSON.stringify(currentUser));
                showDashboard();
                loadData();
                showNotification('Вход выполнен успешно!', 'success');
            } else {
                showNotification('Неверные данные для входа!', 'error');
            }
        });
    }
    
    // Регистрация
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = {
                student_id: document.getElementById('regStudentId').value.trim(),
                email: document.getElementById('regEmail').value.trim(),
                password: document.getElementById('regPassword').value.trim(),
                full_name: document.getElementById('regFullName').value.trim(),
                faculty: document.getElementById('regFaculty').value,
                group_name: document.getElementById('regGroup').value.trim(),
                course: parseInt(document.getElementById('regCourse').value),
                phone: document.getElementById('regPhone').value.trim() || ''
            };
            
            // Простая валидация
            if (userData.password.length < 6) {
                showNotification('Пароль должен быть не менее 6 символов', 'error');
                return;
            }
            
            // Создаем нового пользователя
            currentUser = {
                id: Date.now(),
                ...userData
            };
            
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
            loadData();
            showNotification('Регистрация успешна!', 'success');
            
            // Переключаемся на вкладку входа
            showTab('login');
        });
    }
    
    // Выход
    window.logout = function() {
        localStorage.removeItem('user');
        currentUser = null;
        showAuth();
        showNotification('Вы вышли из системы', 'info');
    };
    
    // Глобальные функции
    window.showTab = showTab;
    window.showSection = showSection;
}

console.log('✅ Личный кабинет готов к работе!');