// Конфигурация API
const API_BASE_URL = 'https://scaffoldapi.onrender.com/api'
let currentDictionaryType = null;
let currentStage = 'Заявка на монтаж';
let currentCardId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDatePickers(); // Инициализация календарей
        await loadDictionaries(); // Загрузка справочников
      
        // Проверяем, есть ли в URL параметр cardId (при открытии из реестра)
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get('cardId');
        const stage = urlParams.get('stage');

        let cardData = null;
        
        if (cardId) {
            const loadedCard = await loadCard(cardId, stage);
            if (!loadedCard) { // Добавлена проверка
                throw new Error("Карточка не загружена");
            }
            renderFormForStage(loadedCard);
        } else {
            setDefaultValues();
            renderFormForStage({
                currentStage: 'Заявка на монтаж',
                status: 'Монтаж'
            });
        }

        renderFormForStage(cardData);
        initButtons(); // Инициализация кнопок
        setupFormValidation(); // Настройка валидации формы

    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
});


function validateNumberInput(input) {
    try {
        // Если поле пустое, устанавливаем значение по умолчанию
        if (input.value.trim() === '') {
            input.value = '1';
            calculateVolume();
            return;
        }
        
        // Заменяем запятые на точки для корректного парсинга
        input.value = input.value.replace(',', '.');
        
        // Удаляем все символы, кроме цифр и точки
        input.value = input.value.replace(/[^\d.]/g, '');
        
        // Проверяем, что значение больше 0
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            input.value = '1';
        } else if (value <= 0) {
            input.value = '0.1';
        }
        
        // Ограничиваем до одного знака после запятой
        const fixedValue = parseFloat(input.value).toFixed(1);
        if (fixedValue !== input.value) {
            input.value = fixedValue;
        }
        
        calculateVolume(); // Пересчитываем объем
    } catch (error) {
        console.error('Ошибка валидации:', error);
        input.value = '1';
        calculateVolume();
    }
}

function setDefaultValues() {
    // Устанавливаем текущие даты
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
    
    document.getElementById('requestDate').value = formattedDate;
    document.getElementById('mountingDate').value = formattedDate;
    
    // Устанавливаем первые значения из выпадающих списков
    const setFirstSelectValue = (id) => {
        const select = document.getElementById(id);
        if (select && select.options.length > 1) {
            select.value = select.options[1].value;
        }
    };
    
    setFirstSelectValue('lmoSelect');
    setFirstSelectValue('operatingOrganization');
    setFirstSelectValue('ownership');
    setFirstSelectValue('projectSelect');
    setFirstSelectValue('sppElementSelect');
    setFirstSelectValue('scaffoldType');
    setFirstSelectValue('workType');
    setFirstSelectValue('customer');
    
    // Устанавливаем размеры по умолчанию
    document.getElementById('length').value = '1';
    document.getElementById('width').value = '1';
    document.getElementById('height').value = '1';
    calculateVolume(); // Пересчитываем объем
    
    // Устанавливаем статус по умолчанию для этапа допуска
    document.getElementById('acceptanceStatus').value = 'Принято (в работе)';
}


const cardCache = new Map();
// Загрузка карточки по ID
async function loadCard(cardId, stage) {

    if (cardCache.has(cardId)) {
        return cardCache.get(cardId);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/${cardId}/${stage || currentStage}`);
        if (!response.ok) {
            throw new Error('Карточка не найдена');
        }

        if (!response.ok) {
            console.warn(`Карточка ${cardId} не найдена. Создаем новую.`);
            return {
                currentStage: stage || currentStage,
                status: 'Черновик',
                isNew: true // Добавляем флаг новой карточки
            };
        }
        
        const card = await response.json();
        if (!card.currentStage) { // Добавлена проверка
            card.currentStage = stage || currentStage;
        }
        currentCardId = cardId;
        currentStage = stage || card.currentStage || currentStage;

        // Рендерим форму для текущего этапа
        renderFormForStage(card);
        // Заполняем форму данными
        populateForm(card);
        cardCache.set(cardId, card);
        return card;
        
        
        
    } catch (error) {
        console.error('Ошибка загрузки карточки:', error);
        showError(`Ошибка загрузки карточки: ${error.message}`);
        return { // Всегда возвращаем объект
            currentStage: stage || currentStage,
            status: 'Ошибка загрузки',
            error: true
        };
    }
}


// Рендер формы для текущего этапа
function renderFormForStage(cardData) {

    // Гарантируем, что card всегда является объектом
    const card = (typeof cardData === 'object' && cardData !== null) 
        ? cardData 
        : {
            currentStage: 'Заявка на монтаж',
            status: 'Монтаж',
            isFallback: true // Добавляем флаг для отладки
        };

    console.log('Render started for card:', card); // Добавляем логирование

      
    // Жёсткая проверка этапов
    const allowedStages = ['Заявка на монтаж', 'Допуск', 'Демонтаж'];
    if (!allowedStages.includes(card.currentStage)) {
        console.warn('Некорректный этап:', card.currentStage);
        card.currentStage = 'Заявка на монтаж';
    }

    // Сбрасываем все этапы
    document.querySelectorAll('.stage').forEach(stage => {
        stage.classList.remove('active', 'completed');
    });

    // Добавляем защиту от undefined
    if (!card) {
        console.error("Card is undefined. Using default values.");
        card = { currentStage: 'Заявка на монтаж' }; // Дефолтные значения
    }

    // Устанавливаем активный этап
    currentStage = card.currentStage || 'Заявка на монтаж';
    
    // Обновляем прогресс-бар
    const stages = {
        'Заявка на монтаж': 0,
        'Допуск': 1,
        'Демонтаж': 2
    };
    
    // Исправляем прогресс-бар
    Object.entries(stages).forEach(([stageName, index]) => {
        const stageElement = document.querySelectorAll('.stage')[index];
        if (stageElement) { // Добавляем проверку на существование элемента
            stageElement.classList.remove('active', 'completed');
            if (stageName === currentStage) {
                stageElement.classList.add('active');
            } else if (stages[stageName] < stages[currentStage]) {
                stageElement.classList.add('completed');
            }
        }
    });

    // Обновляем заголовок
    document.getElementById('form-title').textContent = `Карточка учета лесов (${currentStage})`;

    // Скрываем/показываем соответствующие разделы формы
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const activeSectionId = `stage${stages[currentStage] + 1}-fields`;
    document.getElementById(activeSectionId).style.display = 'block';

    // Обновляем кнопку
    const btnNext = document.getElementById('btn-next-stage');
    if (currentStage === 'Демонтаж') {
        btnNext.innerHTML = '<i class="fas fa-check"></i> Завершить';
    } else {
        btnNext.innerHTML = '<i class="fas fa-arrow-right"></i> Следующий этап';
    }
}

// Инициализация календарей
function initDatePickers() {
    flatpickr(".datepicker", {
        dateFormat: "d.m.Y",
        locale: "ru",
        enableTime: false
    });
}

function validateCurrentStage() {
    const currentSection = document.querySelector('.form-section[style="display: block;"]');
    const requiredFields = currentSection.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        // Проверяем только видимые поля
        if (field.offsetParent !== null && !field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
            
            if (isValid === false) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                field.focus(); // Добавляем фокус
            }
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showError('Заполните все обязательные поля');
    }
    
    return isValid;
}

// Инициализация кнопок
function initButtons() {
    document.getElementById('btn-next-stage').addEventListener('click', async (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение
        if (validateCurrentStage()) {
            await submitForm();
        }
    });
}

// Настройка валидации формы
function setupFormValidation() {
    document.getElementById('scaffoldForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateCurrentStage()) {
            await submitForm();
        }
    });
}

// Заполнение формы данными
function populateForm(card) {
    
    if (!card) { // Добавляем защиту
        console.warn('Попытка заполнить форму без данных');
        return;
    }

    // Общие поля
    if (card.lmo) document.getElementById('lmoSelect').value = card.lmo;
    if (card.location) document.getElementById('location').value = card.location;
    if (card.operatingOrganization) document.getElementById('operatingOrganization').value = card.operatingOrganization;
    if (card.ownership) document.getElementById('ownership').value = card.ownership;
    if (card.actNumber) document.getElementById('actNumber').value = card.actNumber;
    if (card.requestNumber) document.getElementById('requestNumber').value = card.requestNumber;
    if (card.project) document.getElementById('projectSelect').value = card.project;
    if (card.sppElement) document.getElementById('sppElementSelect').value = card.sppElement;
    
    // Даты
    if (card.requestDate) document.getElementById('requestDate').value = formatDateForDisplay(card.requestDate);
    if (card.mountingDate) document.getElementById('mountingDate').value = formatDateForDisplay(card.mountingDate);
    
    // Характеристики
    if (card.scaffoldType) document.getElementById('scaffoldType').value = card.scaffoldType;
    if (card.length) document.getElementById('length').value = card.length;
    if (card.width) document.getElementById('width').value = card.width;
    if (card.height) document.getElementById('height').value = card.height;
    calculateVolume(); // Пересчитываем объем
    
    if (card.workType) document.getElementById('workType').value = card.workType;
    if (card.customer) document.getElementById('customer').value = card.customer;
    
    // Поля этапа 2
    if (card.acceptanceRequestDate) document.getElementById('acceptanceRequestDate').value = formatDateForDisplay(card.acceptanceRequestDate);
    if (card.acceptanceDate) document.getElementById('acceptanceDate').value = formatDateForDisplay(card.acceptanceDate);
    if (card.status) document.getElementById('acceptanceStatus').value = card.status;
    
    // Поля этапа 3
    if (card.dismantlingRequestDate) document.getElementById('dismantlingRequestDate').value = formatDateForDisplay(card.dismantlingRequestDate);
    if (card.dismantlingRequestNumber) document.getElementById('dismantlingRequestNumber').value = card.dismantlingRequestNumber;
    if (card.dismantlingDate) document.getElementById('dismantlingDate').value = formatDateForDisplay(card.dismantlingDate);
}

// Форматирование даты для отображения
function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

// Форматирование даты для сервера
function formatDateForServer(dateStr) {
    if (!dateStr) return null;
    try {
        const [day, month, year] = dateStr.split('.');
        if (!day || !month || !year) return null;
        // Формат: YYYY-MM-DD
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        return null;
    }
}


// Отправка формы
async function submitForm() {
    try {
        // Проверяем числовые значения перед отправкой
        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);

        if (isNaN(length) || length <= 0) {
            throw new Error("Длина должна быть числом больше 0");
        }
        if (isNaN(width) || width <= 0) {
            throw new Error("Ширина должна быть числом больше 0");
        }
        if (isNaN(height) || height <= 0) {
            throw new Error("Высота должна быть числом больше 0");
        }

        // Форматируем даты
        const formatDateForServer = (dateStr) => {
            if (!dateStr) return null;
            const [day, month, year] = dateStr.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        };

        // Формируем данные для отправки
        const requestData = {
            Id: currentCardId ? parseInt(currentCardId) : 0,
            currentStage: currentStage,
            status: currentStage === 'Допуск' ? document.getElementById('acceptanceStatus').value : 
                   currentStage === 'Демонтаж' ? 'Демонтировано' : 'Монтаж',
            
            // Основные поля с гарантированными значениями
            lmo: document.getElementById('lmoSelect').value || "Лесавик",
            actNumber: document.getElementById('actNumber').value || "АКТ-0001",
            requestNumber: document.getElementById('requestNumber').value || "ЗАЯВКА-0001",
            project: document.getElementById('projectSelect').value || "Основной проект",
            sppElement: document.getElementById('sppElementSelect').value || "Основной элемент",
            location: document.getElementById('location').value || "Основная площадка",
            requestDate: formatDateForServer(document.getElementById('requestDate').value) || DateTime.Today.ToString("yyyy-MM-dd"),
            mountingDate: formatDateForServer(document.getElementById('mountingDate').value) || DateTime.Today.ToString("yyyy-MM-dd"),
            scaffoldType: document.getElementById('scaffoldType').value || "Стоечные",
            length: length,
            width: width,
            height: height,
            workType: document.getElementById('workType').value || "Монтаж",
            customer: document.getElementById('customer').value || "ПАО НЛМК",
            operatingOrganization: document.getElementById('operatingOrganization').value || "ПАО НЛМК",
            ownership: document.getElementById('ownership').value || "ПАО НЛМК",
            
            // Поля для этапа допуска
            acceptanceRequestDate: currentStage === 'Допуск' ? formatDateForServer(document.getElementById('acceptanceRequestDate').value) : null,
            acceptanceDate: currentStage === 'Допуск' ? formatDateForServer(document.getElementById('acceptanceDate').value) : null,
            
            // Поля для этапа демонтажа
            dismantlingRequestDate: currentStage === 'Демонтаж' ? formatDateForServer(document.getElementById('dismantlingRequestDate').value) : null,
            dismantlingRequestNumber: currentStage === 'Демонтаж' ? document.getElementById('dismantlingRequestNumber').value : null,
            dismantlingDate: currentStage === 'Демонтаж' ? formatDateForServer(document.getElementById('dismantlingDate').value) : null
        };

        const response = await fetch(`${API_BASE_URL}/scaffoldcards/submit-stage`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Ошибка сохранения данных');
        }

        const result = await response.json();
        if (!result) throw new Error("Пустой ответ от сервера"); // Добавлено
        currentCardId = result.id || currentCardId;
        
        // Определяем следующий этап
        let nextStage;
        switch(currentStage) {
            case 'Заявка на монтаж':
                nextStage = 'Допуск';
                break;
            case 'Допуск':
                nextStage = 'Демонтаж';
                break;
            case 'Демонтаж':
                showSuccess('Карточка успешно завершена!');
                setTimeout(() => window.location.href = '/registry.html', 1500);
                return;
            default:
                throw new Error('Неизвестный текущий этап');
        }

        // Обновляем данные для следующего этапа
        const updatedCard = {
            ...result,
            currentStage: nextStage,
            status: nextStage === 'Допуск' ? 'Принято (в работе)' : 'Демонтировано'
        };

        if (!updatedCard.currentStage) { // Добавлена проверка
            updatedCard.currentStage = nextStage;
        }

        // Обновляем URL
        window.history.pushState(null, '', `?cardId=${currentCardId}&stage=${nextStage}`);
        
        // Перерисовываем форму для нового этапа
        renderFormForStage(updatedCard);
        showSuccess('Данные сохранены, переходим к следующему этапу');

    } catch (error) {
        console.error('Ошибка:', error);
        showError(error.message);
    }
}

// Загрузка справочников
async function loadDictionaries() {
    const dictionaries = [
        { type: 'Project', elementId: 'projectSelect' },
        { type: 'SppElement', elementId: 'sppElementSelect' },
        { type: 'Organization', elementId: 'operatingOrganization' }
    ];

    // Фиксированные значения для ЛМО
    const lmoSelect = document.getElementById('lmoSelect');
    if (lmoSelect) {
        lmoSelect.innerHTML = `
            <option value="">Выберите организацию</option>
            <option value="Лесавик">Лесавик</option>
            <option value="Инструктура">Инструктура</option>
            <option value="СМТ НЛМК">СМТ НЛМК</option>
            <option value="Подрядчик">Подрядчик</option>
        `;
    }
    
    try {
        await Promise.all(dictionaries.map(async ({ type, elementId }) => {
            const response = await fetch(`${API_BASE_URL}/dictionary/${type}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const select = document.getElementById(elementId);
            
            // Сохраняем текущее выбранное значение
            const currentValue = select.value;
            
            // Обновляем список опций
            select.innerHTML = `<option value="">Выберите значение</option>` + 
                data.map(item => `<option value="${item.value}">${item.value}</option>`).join('');
            
            // Восстанавливаем выбранное значение, если оно все еще существует
            if (currentValue && [...select.options].some(opt => opt.value === currentValue)) {
                select.value = currentValue;
            }
        }));
    } catch (error) {
        showError(`Ошибка загрузки справочников: ${error.message}`);
        throw error;
    }
}


    
// Вспомогательные функции
function showError(message) {
    let container = document.getElementById('messages-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'messages-container';
        document.body.appendChild(container);
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
    console.error(message);
}

function showSuccess(message) {
    console.log('Успех:', message);
    let container = document.getElementById('messages-container');
    
    // Если контейнера нет — создаем его
    if (!container) {
        container = document.createElement('div');
        container.id = 'messages-container';
        document.body.appendChild(container);
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    container.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 3000);
}

// Автоматический расчет объема
document.getElementById('length').addEventListener('input', calculateVolume);
document.getElementById('width').addEventListener('input', calculateVolume);
document.getElementById('height').addEventListener('input', calculateVolume);

function calculateVolume() {
    const length = parseFloat(document.getElementById('length').value) || 0;
    const width = parseFloat(document.getElementById('width').value) || 0;
    const height = parseFloat(document.getElementById('height').value) || 0;
    const volume = (length * width * height).toFixed(2);
    document.getElementById('volume-display').textContent = volume;
}