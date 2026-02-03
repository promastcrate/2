document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initAnimations();
    initCategoryCards();
    initModal();
    initContactButton();
    
    // Данные для модальных окон
    const categoryData = {
        academic: {
            title: "Учебная деятельность",
            icon: "fas fa-graduation-cap",
            color: "#4cc9f0",
            content: `
                <div class="modal-details">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: rgba(76, 201, 240, 0.1); color: #4cc9f0;">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="detail-info">
                            <h4>Критерии для учебной деятельности</h4>
                            <p>Требования для получения ПГАС за учебные достижения</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-check-circle"></i> Основные требования</h5>
                        <ul class="detail-list">
                            <li><strong>Отличная успеваемость:</strong> Закрытие на "отлично" не менее 2-х следующих друг за другом сессий без академических задолженностей</li>
                            <li><strong>Средний балл:</strong> Средний балл за период не ниже 4.8</li>
                            <li><strong>Отсутствие пересдач:</strong> Все экзамены и зачеты сданы в установленные сроки</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-trophy"></i> Дополнительные достижения</h5>
                        <ul class="detail-list">
                            <li><strong>Олимпиады и конкурсы:</strong> Победа или призовое место в международных, всероссийских, ведомственных или региональных олимпиадах</li>
                            <li><strong>Проектная деятельность:</strong> Награда (приз) за результаты проектной и опытно-конструкторской работы</li>
                            <li><strong>Научные публикации:</strong> Публикации в рецензируемых изданиях по учебной тематике</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-file-alt"></i> Необходимые документы</h5>
                        <div class="documents-grid">
                            <div class="document-item">
                                <i class="fas fa-file-contract"></i>
                                <span>Заявление установленного образца</span>
                            </div>
                            <div class="document-item">
                                <i class="fas fa-book"></i>
                                <span>Копия зачетной книжки</span>
                            </div>
                            <div class="document-item">
                                <i class="fas fa-award"></i>
                                <span>Копии дипломов и наград</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        research: {
            title: "Научно-исследовательская деятельность",
            icon: "fas fa-flask",
            color: "#7209b7",
            content: `
                <div class="modal-details">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: rgba(114, 9, 183, 0.1); color: #7209b7;">
                            <i class="fas fa-flask"></i>
                        </div>
                        <div class="detail-info">
                            <h4>Критерии для научно-исследовательской деятельности</h4>
                            <p>Требования для получения ПГАС за научные достижения</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-check-circle"></i> Научные публикации</h5>
                        <ul class="detail-list">
                            <li><strong>Статьи в журналах:</strong> Публикации в научных изданиях, индексируемых в РИНЦ, Scopus или Web of Science</li>
                            <li><strong>Конференции:</strong> Участие в международных и всероссийских конференциях с публикацией тезисов</li>
                            <li><strong>Коллективные монографии:</strong> Участие в написании коллективных монографий</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-certificate"></i> Патенты и свидетельства</h5>
                        <ul class="detail-list">
                            <li><strong>Патенты на изобретения:</strong> Получение патента на изобретение, полезную модель или промышленный образец</li>
                            <li><strong>Свидетельства о регистрации:</strong> Свидетельства о регистрации программ для ЭВМ, баз данных</li>
                            <li><strong>Авторские свидетельства:</strong> Документы, подтверждающие авторство научных разработок</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-graduation-cap"></i> Гранты и конкурсы</h5>
                        <ul class="detail-list">
                            <li><strong>Гранты на исследования:</strong> Получение грантов на выполнение научно-исследовательских работ</li>
                            <li><strong>Конкурсы научных работ:</strong> Победы в конкурсах научных работ различного уровня</li>
                            <li><strong>Научные стипендии:</strong> Получение именных научных стипендий</li>
                        </ul>
                    </div>
                </div>
            `
        },
        social: {
            title: "Общественная деятельность",
            icon: "fas fa-users",
            color: "#f72585",
            content: `
                <div class="modal-details">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: rgba(247, 37, 133, 0.1); color: #f72585;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="detail-info">
                            <h4>Критерии для общественной деятельности</h4>
                            <p>Требования для получения ПГАС за общественную активность</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-check-circle"></i> Виды общественной деятельности</h5>
                        <ul class="detail-list">
                            <li><strong>Студенческое самоуправление:</strong> Участие в работе студенческого совета, профкома или других органов самоуправления</li>
                            <li><strong>Волонтерская деятельность:</strong> Систематическое участие в волонтерских проектах и акциях</li>
                            <li><strong>Организация мероприятий:</strong> Организация и проведение общественно значимых мероприятий</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-award"></i> Подтверждающие документы</h5>
                        <ul class="detail-list">
                            <li><strong>Благодарности и грамоты:</strong> Официальные благодарности за общественную работу</li>
                            <li><strong>Сертификаты участника:</strong> Сертификаты об участии в общественных проектах</li>
                            <li><strong>Характеристики:</strong> Характеристики от кураторов и руководителей проектов</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-chart-line"></i> Критерии оценки</h5>
                        <div class="criteria-grid">
                            <div class="criterion-item">
                                <i class="fas fa-calendar"></i>
                                <div>
                                    <h6>Регулярность</h6>
                                    <p>Систематическое участие в течение семестра</p>
                                </div>
                            </div>
                            <div class="criterion-item">
                                <i class="fas fa-star"></i>
                                <div>
                                    <h6>Результативность</h6>
                                    <p>Конкретные достижения и результаты работы</p>
                                </div>
                            </div>
                            <div class="criterion-item">
                                <i class="fas fa-users"></i>
                                <div>
                                    <h6>Масштаб</h6>
                                    <p>Количество вовлеченных участников</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        cultural: {
            title: "Культурно-творческая деятельность",
            icon: "fas fa-paint-brush",
            color: "#ff9e00",
            content: `
                <div class="modal-details">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: rgba(255, 158, 0, 0.1); color: #ff9e00;">
                            <i class="fas fa-paint-brush"></i>
                        </div>
                        <div class="detail-info">
                            <h4>Критерии для культурно-творческой деятельности</h4>
                            <p>Требования для получения ПГАС за творческие достижения</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-check-circle"></i> Творческие достижения</h5>
                        <ul class="detail-list">
                            <li><strong>Участие в конкурсах:</strong> Победы и призовые места в творческих конкурсах различного уровня</li>
                            <li><strong>Выставки и концерты:</strong> Участие в выставках, концертах, спектаклях в качестве исполнителя</li>
                            <li><strong>Творческие проекты:</strong> Реализация собственных творческих проектов</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-palette"></i> Направления творчества</h5>
                        <div class="directions-grid">
                            <div class="direction-item">
                                <i class="fas fa-music"></i>
                                <span>Музыкальное искусство</span>
                            </div>
                            <div class="direction-item">
                                <i class="fas fa-theater-masks"></i>
                                <span>Театральное искусство</span>
                            </div>
                            <div class="direction-item">
                                <i class="fas fa-paint-brush"></i>
                                <span>Изобразительное искусство</span>
                            </div>
                            <div class="direction-item">
                                <i class="fas fa-film"></i>
                                <span>Кинематография</span>
                            </div>
                            <div class="direction-item">
                                <i class="fas fa-pen-fancy"></i>
                                <span>Литературное творчество</span>
                            </div>
                            <div class="direction-item">
                                <i class="fas fa-dance"></i>
                                <span>Хореография</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-file-alt"></i> Подтверждение достижений</h5>
                        <ul class="detail-list">
                            <li><strong>Дипломы и грамоты:</strong> Копии дипломов победителей и призеров конкурсов</li>
                            <li><strong>Программы мероприятий:</strong> Программы концертов, выставок с указанием участия</li>
                            <li><strong>Публикации:</strong> Публикации творческих работ в СМИ или сборниках</li>
                            <li><strong>Видеозаписи:</strong> Видеозаписи выступлений и презентаций работ</li>
                        </ul>
                    </div>
                </div>
            `
        },
        sport: {
            title: "Спортивная деятельность",
            icon: "fas fa-trophy",
            color: "#38b000",
            content: `
                <div class="modal-details">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: rgba(56, 176, 0, 0.1); color: #38b000;">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="detail-info">
                            <h4>Критерии для спортивной деятельности</h4>
                            <p>Требования для получения ПГАС за спортивные достижения</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-check-circle"></i> Спортивные достижения</h5>
                        <ul class="detail-list">
                            <li><strong>Соревнования:</strong> Победы и призовые места в спортивных соревнованиях различного уровня</li>
                            <li><strong>Спортивные звания:</strong> Наличие спортивных разрядов, званий кандидата в мастера спорта, мастера спорта</li>
                            <li><strong>Членство в сборных:</strong> Участие в составе сборных команд университета, города, региона, страны</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-running"></i> Виды спорта</h5>
                        <div class="sports-grid">
                            <div class="sport-item">
                                <i class="fas fa-futbol"></i>
                                <span>Игровые виды</span>
                            </div>
                            <div class="sport-item">
                                <i class="fas fa-swimmer"></i>
                                <span>Водные виды</span>
                            </div>
                            <div class="sport-item">
                                <i class="fas fa-dumbbell"></i>
                                <span>Силовые виды</span>
                            </div>
                            <div class="sport-item">
                                <i class="fas fa-running"></i>
                                <span>Легкая атлетика</span>
                            </div>
                            <div class="sport-item">
                                <i class="fas fa-skiing"></i>
                                <span>Зимние виды</span>
                            </div>
                            <div class="sport-item">
                                <i class="fas fa-chess"></i>
                                <span>Интеллектуальные</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-calendar-alt"></i> Требования</h5>
                        <ul class="detail-list">
                            <li><strong>Регулярность тренировок:</strong> Систематические занятия спортом в течение семестра</li>
                            <li><strong>Участие в соревнованиях:</strong> Участие не менее чем в 2 соревнованиях за отчетный период</li>
                            <li><strong>Представительство университета:</strong> Выступление за команду БИНТУ на соревнованиях</li>
                            <li><strong>Спортивная дисциплина:</strong> Отсутствие дисциплинарных взысканий</li>
                        </ul>
                    </div>
                </div>
            `
        }
    };

    // Инициализация анимаций
    function initAnimations() {
        // Добавляем анимацию появления элементов при скролле
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за элементами, которые должны появляться при скролле
        const animatedElements = document.querySelectorAll('.category-card, .info-item, .section-header');
        animatedElements.forEach(el => {
            observer.observe(el);
        });

        // Анимация пузырьков
        createBubbles();
    }

    // Создание пузырьков
    function createBubbles() {
        const bubblesContainer = document.querySelector('.bubbles');
        
        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            // Случайные параметры
            const size = Math.random() * 100 + 50;
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = Math.random() * 10 + 20;
            
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDelay = `-${delay}s`;
            bubble.style.animationDuration = `${duration}s`;
            
            bubblesContainer.appendChild(bubble);
        }
    }

    // Инициализация карточек категорий
    function initCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                openModal(category);
                
                // Анимация нажатия
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            });
            
            // Эффект при наведении (для десктопов)
            card.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    this.style.transform = 'translateY(-10px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (window.innerWidth > 768) {
                    this.style.transform = 'translateY(0)';
                }
            });
        });
    }

    // Инициализация модального окна
    function initModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        // Закрытие модального окна
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Функция открытия модального окна
        window.openModal = function(category) {
            const data = categoryData[category];
            if (!data) return;
            
            modalTitle.textContent = data.title;
            modalContent.innerHTML = data.content;
            
            // Добавляем стили для модального окна
            addModalStyles();
            
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Анимация появления контента
            setTimeout(() => {
                const modalDetails = modalContent.querySelector('.modal-details');
                if (modalDetails) {
                    modalDetails.style.opacity = '0';
                    modalDetails.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        modalDetails.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        modalDetails.style.opacity = '1';
                        modalDetails.style.transform = 'translateY(0)';
                    }, 100);
                }
            }, 100);
        };
        
        // Функция закрытия модального окна
        window.closeModal = function() {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // Добавление стилей для модального окна
    function addModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-details {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                
                .detail-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .detail-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                }
                
                .detail-info h4 {
                    font-size: 1.3rem;
                    margin-bottom: 0.5rem;
                    color: white;
                }
                
                .detail-info p {
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .detail-section {
                    margin-bottom: 2rem;
                }
                
                .detail-section h5 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: white;
                }
                
                .detail-section h5 i {
                    color: var(--accent);
                }
                
                .detail-list {
                    list-style: none;
                    padding-left: 0;
                }
                
                .detail-list li {
                    margin-bottom: 0.8rem;
                    padding-left: 1.5rem;
                    position: relative;
                    line-height: 1.6;
                }
                
                .detail-list li:before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: var(--primary);
                    font-weight: bold;
                }
                
                .detail-list strong {
                    color: white;
                    font-weight: 600;
                }
                
                .documents-grid,
                .directions-grid,
                .sports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .document-item,
                .direction-item,
                .sport-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .document-item i,
                .direction-item i,
                .sport-item i {
                    font-size: 1.2rem;
                    color: var(--primary);
                }
                
                .criteria-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .criterion-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .criterion-item i {
                    font-size: 1.5rem;
                    color: var(--primary);
                }
                
                .criterion-item h6 {
                    font-size: 1rem;
                    margin-bottom: 0.3rem;
                    color: white;
                }
                
                .criterion-item p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Инициализация кнопки контактов
    function initContactButton() {
        const contactBtn = document.querySelector('.contact-btn');
        
        contactBtn.addEventListener('click', function() {
            openModal('social'); // Открываем информацию об общественной деятельности для контактов
            
            // Анимация кнопки
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Параллакс эффект для фона
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const background = document.querySelector('.background-elements');
        
        if (background) {
            background.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Анимация индикатора прокрутки
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const categoriesSection = document.querySelector('.categories-section');
            categoriesSection.scrollIntoView({ behavior: 'smooth' });
            
            // Анимация клика
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Добавляем звуковые эффекты (опционально)
    document.querySelectorAll('.category-card, .contact-btn, .modal-close').forEach(element => {
        element.addEventListener('click', function() {
            // Можно добавить звук клика
            // new Audio('click-sound.mp3').play();
        });
    });

    // Инициализация tooltip для карточек
    const tooltips = document.querySelectorAll('.card-hint');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'translateX(10px)';
        });
        
        tooltip.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'translateX(5px)';
        });
    });

    console.log('Сайт ПГАС БИНТУ успешно загружен! 🎓✨');
});
 // Добавляем эффекты при наведении на карточки
function initHoverEffects() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        // Эффект при наведении
        card.addEventListener('mouseenter', function() {
            // Добавляем класс для анимации
            this.classList.add('hover-active');
            
            // Показываем дополнительную информацию
            const hoverContent = this.querySelector('.card-hover-content');
            if (hoverContent) {
                hoverContent.style.display = 'block';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Убираем класс
            this.classList.remove('hover-active');
            
            // Скрываем дополнительную информацию
            const hoverContent = this.querySelector('.card-hover-content');
            if (hoverContent) {
                hoverContent.style.display = 'none';
            }
        });
    });
}

// Инициализируем эффекты при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // ... остальной код ...
    
    initHoverEffects(); // Добавьте эту строку
});
// ==============================================
// РЕАЛЬНЫЙ API ДЛЯ ФРОНТЕНДА
// ==============================================

class RealScholarshipAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('auth_token');
        console.log('🎓 Реальный API подключен');
    }
    
    // Проверка статуса API
    async checkAPI() {
        try {
            const response = await fetch(`${this.baseURL}/stats`);
            const data = await response.json();
            console.log('📊 Статистика системы:', data);
            return data;
        } catch (error) {
            console.error('❌ API недоступен:', error);
            return null;
        }
    }
    
    // Регистрация нового студента
    async registerStudent(studentData) {
        try {
            console.log('📝 Регистрация студента:', studentData.student_id);
            
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }
            
            if (data.status === 'success') {
                // Сохраняем информацию о пользователе
                localStorage.setItem('user', JSON.stringify(data.user));
                this.showNotification('✅ Регистрация успешна!', 'success');
            }
            
            return data;
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showNotification(`❌ ${error.message}`, 'error');
            return { status: 'error', error: error.message };
        }
    }
    
    // Получить список категорий
    async getCategories() {
        try {
            const response = await fetch(`${this.baseURL}/categories`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            return null;
        }
    }
    
    // Создать заявку на стипендию
    async createApplication(applicationData) {
        try {
            const response = await fetch(`${this.baseURL}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.showNotification('✅ Заявка создана успешно!', 'success');
            }
            
            return data;
            
        } catch (error) {
            console.error('Ошибка создания заявки:', error);
            this.showNotification('❌ Ошибка создания заявки', 'error');
            return null;
        }
    }
    
    // Показать уведомление
    showNotification(message, type = 'info') {
        // Код уведомлений оставляем без изменений
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Стили уже должны быть добавлены ранее
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Создаём экземпляр API
const realAPI = new RealScholarshipAPI();

// Проверяем API при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    const apiStatus = await realAPI.checkAPI();
    if (apiStatus) {
        console.log('✅ Бэкенд готов к работе!');
        
        // Добавляем кнопку регистрации в хедер
        //addRegisterButton();
        
        // Загружаем категории с сервера
        const categories = await realAPI.getCategories();
        if (categories) {
            console.log('📋 Категории загружены:', categories.count);
        }
    }
});

// Функция для добавления кнопки регистрации в хедер
function addRegisterButton() {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;
    
    const registerBtn = document.createElement('button');
    registerBtn.className = 'register-btn';
    registerBtn.innerHTML = `
        <i class="fas fa-user-plus"></i>
        <span>Регистрация студента</span>
    `;
    
    registerBtn.onclick = function() {
        showRegistrationForm();
    };
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'header-register-btn';
    btnContainer.appendChild(registerBtn);
    headerContent.appendChild(btnContainer);
    
    // Добавляем стили
    if (!document.querySelector('#register-btn-styles')) {
        const style = document.createElement('style');
        style.id = 'register-btn-styles';
        style.textContent = `
            .header-register-btn {
                margin-left: auto;
            }
            
            .register-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 24px;
                background: linear-gradient(135deg, #f72585, #b5179e);
                color: white;
                border: none;
                border-radius: 50px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Montserrat', sans-serif;
                font-size: 1rem;
            }
            
            .register-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(247, 37, 133, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

// Функция показа формы регистрации
function showRegistrationForm() {
    // Создаём модальное окно
    const modalHTML = `
    <div class="registration-modal-overlay">
        <div class="registration-modal">
            <div class="modal-header">
                <h3><i class="fas fa-user-graduate"></i> Регистрация студента БИНТУ</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="studentRegistrationForm">
                    <div class="form-group">
                        <label>Номер студенческого билета *</label>
                        <input type="text" name="student_id" placeholder="Пример: 123456" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" placeholder="student@bintu.ru" required>
                        </div>
                        <div class="form-group">
                            <label>Пароль *</label>
                            <input type="password" name="password" placeholder="Минимум 6 символов" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>ФИО *</label>
                        <input type="text" name="full_name" placeholder="Иванов Иван Иванович" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Факультет *</label>
                            <select name="faculty" required>
                                <option value="">Выберите факультет</option>
                                <option value="ИТ">Информационные технологии</option>
                                <option value="СТРОИТ">Строительный</option>
                                <option value="ЭКОНОМ">Экономический</option>
                                <option value="МЕХ">Механический</option>
                                <option value="ЭНЕРГ">Энергетический</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Группа *</label>
                            <input type="text" name="group_name" placeholder="Пример: ИТ-101" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Курс *</label>
                            <select name="course" required>
                                <option value="">Выберите курс</option>
                                <option value="1">1 курс</option>
                                <option value="2">2 курс</option>
                                <option value="3">3 курс</option>
                                <option value="4">4 курс</option>
                                <option value="5">5 курс</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" name="phone" placeholder="+7 (999) 123-45-67">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">
                            <i class="fas fa-check"></i> Зарегистрироваться
                        </button>
                        <button type="button" class="cancel-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
    
    // Добавляем модалку в body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Добавляем стили
    if (!document.querySelector('#registration-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'registration-modal-styles';
        style.textContent = `
            .registration-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .registration-modal {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(67, 97, 238, 0.3);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            .modal-header {
                padding: 25px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(67, 97, 238, 0.1);
            }
            
            .modal-header h3 {
                color: white;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
            }
            
            .modal-body {
                padding: 30px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: white;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #4361ee;
                box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                margin-top: 30px;
            }
            
            .submit-btn {
                flex: 2;
                padding: 16px;
                background: linear-gradient(135deg, #f72585, #b5179e);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s ease;
            }
            
            .submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(247, 37, 133, 0.3);
            }
            
            .cancel-btn {
                flex: 1;
                padding: 16px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .cancel-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Обработка формы
    document.getElementById('studentRegistrationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const studentData = {
            student_id: formData.get('student_id'),
            email: formData.get('email'),
            password: formData.get('password'),
            full_name: formData.get('full_name'),
            faculty: formData.get('faculty'),
            group_name: formData.get('group_name'),
            course: parseInt(formData.get('course')),
            phone: formData.get('phone') || ''
        };
        
        const result = await realAPI.registerStudent(studentData);
        
        if (result && result.status === 'success') {
            // Закрываем модалку через 2 секунды
            setTimeout(() => {
                modalContainer.remove();
            }, 2000);
        }
    });
}

// Проверяем при загрузке - есть ли уже кнопка регистрации
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем небольшую задержку чтобы DOM точно загрузился
    setTimeout(addRegisterButton, 1000);
});
// ==============================================
// ПОЛНОЕ УДАЛЕНИЕ ВСЕХ КНОПОК РЕГИСТРАЦИИ
// ==============================================

// Эта функция будет удалять ВСЕ кнопки регистрации
function removeAllRegistrationButtons() {
    console.log('🔍 Ищем все кнопки регистрации...');
    
    // 1. Удаляем все элементы с классом register-btn
    document.querySelectorAll('.register-btn').forEach(btn => {
        console.log('Удаляем кнопку:', btn);
        btn.remove();
    });
    
    // 2. Удаляем все контейнеры с кнопками
    document.querySelectorAll('.header-register-btn').forEach(container => {
        console.log('Удаляем контейнер кнопки:', container);
        container.remove();
    });
    
    // 3. Удаляем кнопки по тексту (на всякий случай)
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Регистрация') || 
            btn.textContent.includes('Регистрация студента')) {
            console.log('Удаляем кнопку по тексту:', btn);
            btn.remove();
        }
    });
    
    // 4. Удаляем стили
    const styles = document.getElementById('register-btn-styles');
    if (styles) {
        console.log('Удаляем стили кнопки');
        styles.remove();
    }
    
    // 5. Удаляем кнопки в header-actions
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        // Ищем все кнопки кроме dashboard-btn
        headerActions.querySelectorAll('button:not(.dashboard-btn)').forEach(btn => {
            if (btn.textContent.includes('Регистрация')) {
                console.log('Удаляем кнопку из header-actions:', btn);
                btn.remove();
            }
        });
    }
    
    console.log('✅ Все кнопки регистрации удалены!');
}

// Запускаем удаление несколько раз для надежности
document.addEventListener('DOMContentLoaded', function() {
    // Первый раз сразу
    removeAllRegistrationButtons();
    
    // Второй раз через небольшую задержку (когда скрипты загрузятся)
    setTimeout(removeAllRegistrationButtons, 500);
    
    // Третий раз через 1 секунду (на всякий случай)
    setTimeout(removeAllRegistrationButtons, 1000);
    
    // Наблюдаем за изменениями DOM (если кнопки добавляются динамически позже)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                removeAllRegistrationButtons();
            }
        });
    });
    
    // Начинаем наблюдение
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});