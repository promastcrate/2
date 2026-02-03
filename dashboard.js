// ==============================================
// ЛИЧНЫЙ КАБИНЕТ СТУДЕНТА (ИСПРАВЛЕННЫЙ)
// ==============================================

console.log('🚀 Личный кабинет загружается...');

let currentUser = null;
let applications = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем кабинет...');
    
    // Проверяем сохраненного пользователя
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Найден пользователь:', currentUser);
            showDashboard();
            loadData();
        } catch (e) {
            console.error('Ошибка загрузки пользователя:', e);
            showAuth();
        }
    } else {
        showAuth();
    }
    
    setupEventListeners();
});

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

function showAuth() {
    console.log('Показываем форму авторизации');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    showTab('login');
}

function showDashboard() {
    console.log('Показываем личный кабинет');
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    
    // Обновляем данные пользователя
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.full_name || 'Студент';
        document.getElementById('userInfo').textContent = 
            (currentUser.group_name || 'Группа') + ' | ' + 
            (currentUser.course || 'Курс') + ' курс';
    }
    
    // Показываем первую секцию
    showSection('overview');
}

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

function showSection(sectionId) {
    console.log('Переходим в раздел:', sectionId);
    
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Убираем активный класс у всех пунктов меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Показываем выбранную секцию
    const section = document.getElementById(sectionId + 'Section');
    if (section) {
        section.style.display = 'block';
        section.classList.add('active');
    }
    
    // Находим и активируем пункт меню
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const span = item.querySelector('span');
        if (span && span.textContent.includes(getSectionName(sectionId))) {
            item.classList.add('active');
        }
    });
    
    // Загружаем данные для секции
    if (sectionId === 'overview') {
        updateOverview();
    } else if (sectionId === 'applications') {
        loadApplications();
    } else if (sectionId === 'profile') {
        setupProfileForm();
    } else if (sectionId === 'newApplication') {
        setupNewApplicationForm();
    }
}

// ========== РАБОТА С ДАННЫМИ ==========

async function loadData() {
    console.log('Загружаем данные с сервера...');
    
    if (!currentUser) return;
    
    try {
        // Пробуем загрузить заявки с сервера
        const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}/applications`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                applications = data.applications || [];
                console.log('Заявки загружены с сервера:', applications.length);
                
                // Сохраняем в localStorage для офлайн-доступа
                localStorage.setItem('user_applications_' + currentUser.id, JSON.stringify(applications));
                
                updateOverview();
                return;
            }
        }
    } catch (error) {
        console.log('Сервер недоступен, загружаем локальные данные:', error);
    }
    
    // Если сервер недоступен - загружаем локальные данные
    loadFromLocalStorage();
}

function loadFromLocalStorage() {
    // Загружаем заявки из localStorage
    const savedApps = localStorage.getItem('user_applications_' + (currentUser?.id || 'default'));
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
                description: 'Отличная успеваемость, средний балл 4.9',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                category: 'social',
                semester: '2024-осень',
                status: 'approved',
                points: 70,
                description: 'Организация студенческого фестиваля',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        saveApplications();
    }
    
    updateOverview();
}

function saveApplications() {
    if (currentUser) {
        localStorage.setItem('user_applications_' + currentUser.id, JSON.stringify(applications));
    }
}

function updateOverview() {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'submitted' || app.status === 'in_review').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const totalPoints = applications.reduce((sum, app) => sum + (app.points || 0), 0);
    
    document.getElementById('totalApps').textContent = total;
    document.getElementById('pendingApps').textContent = pending;
    document.getElementById('approvedApps').textContent = approved;
    document.getElementById('totalPoints').textContent = totalPoints;
}

function loadApplications() {
    const container = document.getElementById('applicationsList');
    
    if (!applications || applications.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: rgba(255,255,255,0.3); margin-bottom: 20px;"></i>
                <h4>Заявок пока нет</h4>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
                    Создайте свою первую заявку на стипендию!
                </p>
                <button class="submit-btn" onclick="showSection('newApplication')">
                    <i class="fas fa-plus"></i> Создать первую заявку
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div style="overflow-x: auto;">
            <table class="applications-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Категория</th>
                        <th>Семестр</th>
                        <th>Статус</th>
                        <th>Баллы</th>
                        <th>Дата подачи</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${applications.map(app => `
                        <tr>
                            <td>#${app.id}</td>
                            <td>${getCategoryName(app.category)}</td>
                            <td>${app.semester}</td>
                            <td><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></td>
                            <td>${app.points || 0}</td>
                            <td>${new Date(app.created_at).toLocaleDateString('ru-RU')}</td>
                            <td>
                                <button class="action-btn view" onclick="viewApplication(${app.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function setupProfileForm() {
    // Проверяем, есть ли уже форма
    let form = document.getElementById('profileForm');
    
    if (!form) {
        // Создаем форму если её нет
        const section = document.getElementById('profileSection');
        section.innerHTML = `
            <h3 style="margin-bottom: 20px;">Настройки профиля</h3>
            <form id="profileForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="profileEmail" value="${currentUser?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Телефон</label>
                    <input type="tel" id="profilePhone" value="${currentUser?.phone || ''}" placeholder="+7 (999) 123-45-67">
                </div>
                <div class="form-group">
                    <label>Новый пароль</label>
                    <input type="password" id="newPassword" placeholder="Оставьте пустым, если не хотите менять">
                </div>
                <div class="form-group">
                    <label>Подтвердите новый пароль</label>
                    <input type="password" id="confirmPassword" placeholder="Повторите новый пароль">
                </div>
                <button type="submit" class="submit-btn">
                    <i class="fas fa-save"></i> Сохранить изменения
                </button>
            </form>
        `;
        
        form = document.getElementById('profileForm');
    } else {
        // Заполняем существующую форму
        document.getElementById('profileEmail').value = currentUser?.email || '';
        document.getElementById('profilePhone').value = currentUser?.phone || '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

function setupNewApplicationForm() {
    // Загружаем список категорий с сервера
    loadCategories();
}

async function loadCategories() {
    try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.categories) {
                const select = document.getElementById('applicationCategory');
                select.innerHTML = '<option value="">Выберите категорию</option>' +
                    data.categories.map(cat => 
                        `<option value="${cat.id}">${cat.name}</option>`
                    ).join('');
            }
        }
    } catch (error) {
        console.log('Не удалось загрузить категории:', error);
    }
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

function setupEventListeners() {
    console.log('Настраиваем обработчики событий...');
    
    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Регистрация
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Новая заявка - добавляем обработчик динамически
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'newApplicationForm' || 
                         e.target.closest('#newApplicationForm'))) {
            const form = document.getElementById('newApplicationForm');
            if (form && !form.hasAttribute('data-listener-added')) {
                form.addEventListener('submit', handleNewApplication);
                form.setAttribute('data-listener-added', 'true');
            }
        }
    });
    
    // Обновление профиля
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Обработка входа...');
    
    const studentId = document.getElementById('loginStudentId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!studentId || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    // Пробуем через API
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, password: password })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                currentUser = data.user;
                localStorage.setItem('user', JSON.stringify(currentUser));
                showDashboard();
                loadData();
                showNotification('Вход выполнен успешно!', 'success');
                return;
            }
        }
        
        // Если ответ есть, но статус не success
        const errorData = await response.json();
        showNotification(errorData.error || 'Ошибка входа', 'error');
        
    } catch (error) {
        console.log('API недоступен, используем локальный вход');
        // Локальный вход (если API не работает)
        if (studentId === '123456' && password === 'student123') {
            currentUser = {
                id: 1,
                student_id: '123456',
                email: 'student@bintu.ru',
                full_name: 'Иванов Иван',
                faculty: 'ИТ',
                group_name: 'ИТ-101',
                course: 2,
                phone: '+7 (999) 123-45-67'
            };
            
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
            loadData();
            showNotification('Вход выполнен успешно! (локальный режим)', 'success');
        } else {
            showNotification('Неверные данные для входа', 'error');
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Обработка регистрации...');
    
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
    
    // Валидация
    if (!userData.student_id || !userData.email || !userData.password || !userData.full_name || 
        !userData.faculty || !userData.group_name || !userData.course) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    if (userData.password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    // Пробуем через API
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                showNotification('Регистрация успешна! Выполняется вход...', 'success');
                
                // Автоматически входим
                setTimeout(async () => {
                    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            student_id: userData.student_id, 
                            password: userData.password 
                        })
                    });
                    
                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        if (loginData.status === 'success') {
                            currentUser = loginData.user;
                            localStorage.setItem('user', JSON.stringify(currentUser));
                            showDashboard();
                            loadData();
                        }
                    }
                }, 1500);
                return;
            } else {
                showNotification(data.error || 'Ошибка регистрации', 'error');
            }
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Ошибка сервера', 'error');
        }
    } catch (error) {
        console.log('API недоступен, используем локальную регистрацию');
        // Локальная регистрация
        currentUser = {
            id: Date.now(),
            ...userData
        };
        
        localStorage.setItem('user', JSON.stringify(currentUser));
        showDashboard();
        loadData();
        showNotification('Регистрация успешна! (локальный режим)', 'success');
        
        // Переключаемся на вкладку входа
        showTab('login');
    }
}

async function handleNewApplication(e) {
    e.preventDefault();
    console.log('Создание новой заявки...');
    
    if (!currentUser) {
        showNotification('Сначала войдите в систему', 'error');
        return;
    }
    
    const applicationData = {
        user_id: currentUser.id,
        category: document.getElementById('applicationCategory').value,
        semester: document.getElementById('applicationSemester').value,
        description: document.getElementById('applicationDescription').value.trim(),
        documents: document.getElementById('applicationDocuments').value.trim() || ''
    };
    
    if (!applicationData.category || !applicationData.semester || !applicationData.description) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    try {
        console.log('Отправляем заявку на сервер:', applicationData);
        
        // Отправляем заявку на сервер
        const response = await fetch('http://localhost:5000/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Ответ сервера:', data);
        
        if (data.status === 'success') {
            showNotification('Заявка успешно создана и отправлена на сервер!', 'success');
            
            // Очищаем форму
            e.target.reset();
            
            // Обновляем список заявок
            await loadData(); // Перезагружаем данные с сервера
            
            // Переходим к списку заявок
            showSection('applications');
        } else {
            showNotification('Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
        }
        
    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        showNotification('Ошибка подключения к серверу. Заявка сохранена локально.', 'warning');
        
        // Локальное сохранение (резервный вариант)
        const newApp = {
            id: Date.now(),
            ...applicationData,
            status: 'submitted',
            points: 0,
            created_at: new Date().toISOString()
        };
        
        applications.push(newApp);
        saveApplications();
        
        // Очищаем форму
        e.target.reset();
        
        // Показываем уведомление и обновляем данные
        setTimeout(() => {
            updateOverview();
            showSection('applications');
        }, 1000);
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    // Обновляем данные пользователя
    currentUser.email = email;
    currentUser.phone = phone;
    
    if (newPassword) {
        console.log('Пароль изменен (в реальном приложении здесь хеширование)');
    }
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    // Обновляем отображение
    document.getElementById('userName').textContent = currentUser.full_name;
    document.getElementById('userInfo').textContent = 
        currentUser.group_name + ' | ' + currentUser.course + ' курс';
    
    showNotification('Профиль обновлен', 'success');
    
    // Очищаем поля паролей
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function viewApplication(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) {
        showNotification('Заявка не найдена', 'error');
        return;
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Заявка #${app.id}</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="info-grid">
                    <div class="info-card">
                        <h4>Категория</h4>
                        <p>${getCategoryName(app.category)}</p>
                    </div>
                    <div class="info-card">
                        <h4>Семестр</h4>
                        <p>${app.semester}</p>
                    </div>
                    <div class="info-card">
                        <h4>Статус</h4>
                        <p><span class="status-badge status-${app.status}">${getStatusText(app.status)}</span></p>
                    </div>
                    <div class="info-card">
                        <h4>Баллы</h4>
                        <p>${app.points || 0}</p>
                    </div>
                </div>
                <div class="description-box">
                    <h4>Описание достижений</h4>
                    <p>${app.description || 'Нет описания'}</p>
                </div>
                ${app.documents ? `
                <div class="documents-box">
                    <h4>Документы</h4>
                    <p>${app.documents}</p>
                </div>
                ` : ''}
                <div class="dates">
                    <p><strong>Дата создания:</strong> ${new Date(app.created_at).toLocaleString('ru-RU')}</p>
                    ${app.updated_at ? `<p><strong>Дата обновления:</strong> ${new Date(app.updated_at).toLocaleString('ru-RU')}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function getSectionName(sectionId) {
    const names = {
        'overview': 'Обзор',
        'applications': 'Мои заявки',
        'newApplication': 'Новая заявка',
        'profile': 'Настройки профиля',
        'documents': 'Документы'
    };
    return names[sectionId] || sectionId;
}

function getCategoryName(categoryId) {
    const categories = {
        'academic': 'Учебная деятельность',
        'research': 'Научно-исследовательская',
        'social': 'Общественная деятельность',
        'cultural': 'Культурно-творческая',
        'sport': 'Спортивная деятельность'
    };
    return categories[categoryId] || categoryId;
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
                max-width: 400px;
            }
            .notification-success {
                background: linear-gradient(135deg, #38b000, #2d9100);
                border-left: 5px solid #1a7c00;
            }
            .notification-error {
                background: linear-gradient(135deg, #f72585, #d1146e);
                border-left: 5px solid #a81058;
            }
            .notification-warning {
                background: linear-gradient(135deg, #ff9e00, #e68a00);
                border-left: 5px solid #cc7700;
            }
            .notification-info {
                background: linear-gradient(135deg, #4361ee, #3a56d4);
                border-left: 5px solid #2d4ac9;
            }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                margin: 0;
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
    }, 5000);
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('user_applications_' + (currentUser?.id || 'default'));
    currentUser = null;
    applications = [];
    showAuth();
    showNotification('Вы вышли из системы', 'info');
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========

window.showTab = showTab;
window.showSection = showSection;
window.logout = logout;
window.viewApplication = viewApplication;

console.log('✅ Личный кабинет готов!');