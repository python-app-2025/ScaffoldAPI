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
        initButtons(); // Инициализация кнопок
        setupFormValidation(); // Настройка валидации формы
        // Проверяем, есть ли в URL параметр cardId (при открытии из реестра)
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get('cardId');
        const stage = urlParams.get('stage');
        
        if (cardId) {
            await loadCard(cardId, stage || 'Заявка на монтаж');
        } else {
            renderFormForStage({
                currentStage: 'Заявка на монтаж',
                status: 'Монтаж'
            });
        }
    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
});

// Рендер формы для текущего этапа
function renderFormForStage(card) {
    currentStage = card.CurrentStage || 'Заявка на монтаж';
    
    // Обновляем прогресс-бар
    document.querySelectorAll('.stage').forEach(stage => {
        stage.classList.remove('active', 'completed');
        
        if (stage.textContent.includes(currentStage)) {
            stage.classList.add('active');
        } else if (
            (currentStage === 'Допуск' && stage.textContent.includes('Заявка на монтаж')) ||
            (currentStage === 'Демонтаж' && (stage.textContent.includes('Заявка на монтаж') || stage.textContent.includes('Допуск')))
        ) {
            stage.classList.add('completed');
        }
    });
    
    // Обновляем заголовок
    document.getElementById('form-title').textContent = `Карточка учета лесов (${currentStage})`;
    
    // Скрываем/показываем соответствующие поля
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    if (currentStage === 'Заявка на монтаж') {
        document.getElementById('stage1-fields').style.display = 'block';
        const fields = document.querySelectorAll('#stage1-fields [required]');
        fields.forEach(field => field.required = true);
    } else if (currentStage === 'Допуск') {
        document.getElementById('stage2-fields').style.display = 'block';
    } else if (currentStage === 'Демонтаж') {
        document.getElementById('stage3-fields').style.display = 'block';
    }
    
    // Настраиваем доступность полей
    if (currentStage !== 'Заявка на монтаж') {
        document.querySelectorAll('#stage1-fields input, #stage1-fields select').forEach(el => {
            el.readOnly = true;
        });
    }

    if (currentStage === 'Демонтаж') {
        document.querySelectorAll('#stage2-fields input, #stage2-fields select').forEach(el => {
            el.readOnly = true;
        });
    }

    // Настраиваем кнопку
    const btnNext = document.getElementById('btn-next-stage');
    btnNext.innerHTML = currentStage === 'Демонтаж' ? 
        '<i class="fas fa-check"></i> Завершить' : 
        '<i class="fas fa-arrow-right"></i> Следующий этап';
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
    // Общие поля
    document.getElementById('lmoSelect').value = card.lmo || '';
    document.getElementById('location').value = card.location || '';
    document.getElementById('operatingOrganization').value = card.operatingOrganization || '';
    document.getElementById('ownership').value = card.ownership || '';
    document.getElementById('actNumber').value = card.actNumber || '';
    document.getElementById('requestNumber').value = card.requestNumber || '';
    document.getElementById('projectSelect').value = card.project || '';
    document.getElementById('sppElementSelect').value = card.sppElement || '';
    document.getElementById('requestDate').value = card.requestDate ? formatDateForDisplay(card.requestDate) : '';
    document.getElementById('mountingDate').value = card.mountingDate ? formatDateForDisplay(card.mountingDate) : '';
    document.getElementById('scaffoldType').value = card.scaffoldType || '';
    document.getElementById('length').value = card.length || '';
    document.getElementById('width').value = card.width || '';
    document.getElementById('height').value = card.height || '';
    document.getElementById('workType').value = card.workType || '';
    document.getElementById('customer').value = card.customer || '';
    document.getElementById('status').value = card.Status || 'Монтаж';

    // Поля этапа 2
    document.getElementById('acceptanceRequestDate').value = card.acceptanceRequestDate ? formatDateForDisplay(card.acceptanceRequestDate) : '';
    document.getElementById('acceptanceDate').value = card.acceptanceDate ? formatDateForDisplay(card.acceptanceDate) : '';
    document.getElementById('acceptanceStatus').value = card.Status === 'Не принято' ? 'Не принято' : 'Принято (в работе)';

    // Поля этапа 3
    document.getElementById('dismantlingRequestDate').value = card.dismantlingRequestDate ? formatDateForDisplay(card.dismantlingRequestDate) : '';
    document.getElementById('dismantlingRequestNumber').value = card.dismantlingRequestNumber || '';
    document.getElementById('dismantlingDate').value = card.dismantlingDate ? formatDateForDisplay(card.dismantlingDate) : '';
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
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
}


// Отправка формы
async function submitForm() {
    const formatDateForServer = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`; // YYYY-MM-DD
    };

    // Собираем данные с правильной структурой (плоский объект)
    const formData = {
        Id: currentCardId ? parseInt(currentCardId) : 0,
        CurrentStage: currentStage,
        Status: currentStage === 'Допуск' ? document.getElementById('acceptanceStatus').value : 
               currentStage === 'Демонтаж' ? 'Демонтировано' : 'Монтаж',
        
        // Общие поля
        lmo: document.getElementById('lmoSelect').value.trim(),
        actNumber: document.getElementById('actNumber').value.trim(), // Оставляем как строку
        requestNumber: document.getElementById('requestNumber').value.trim(), // Оставляем как строку
        project: document.getElementById('projectSelect').value.trim(),
        sppElement: document.getElementById('sppElementSelect').value.trim(),
        location: document.getElementById('location').value.trim(),
        requestDate: formatDateForServer(document.getElementById('requestDate').value),
        mountingDate: formatDateForServer(document.getElementById('mountingDate').value),
        scaffoldType: document.getElementById('scaffoldType').value.trim(),
        length: Math.max(0.1, parseFloat(document.getElementById('length').value) || 0.1),
        width: Math.max(0.1, parseFloat(document.getElementById('width').value) || 0.1),
        height: Math.max(0.1, parseFloat(document.getElementById('height').value) || 0.1),
        volume: Math.max(0.1, parseFloat(document.getElementById('length').value) || 0.1) * 
                Math.max(0.1, parseFloat(document.getElementById('width').value) || 0.1) * 
                Math.max(0.1, parseFloat(document.getElementById('height').value) || 0.1),
        workType: document.getElementById('workType').value.trim(),
        customer: document.getElementById('customer').value.trim(),
        operatingOrganization: document.getElementById('operatingOrganization').value.trim(),
        ownership: document.getElementById('ownership').value.trim(),

        // Поля этапа 2
        acceptanceRequestDate: formatDateForServer(document.getElementById('acceptanceRequestDate').value),
        acceptanceDate: formatDateForServer(document.getElementById('acceptanceDate').value),
        
        // Поля этапа 3
        dismantlingRequestDate: formatDateForServer(document.getElementById('dismantlingRequestDate').value),
        dismantlingRequestNumber: document.getElementById('dismantlingRequestNumber').value.trim(),
        dismantlingDate: formatDateForServer(document.getElementById('dismantlingDate').value)
    };

    try {
        const endpoint = currentCardId ? `${API_BASE_URL}/scaffoldcards/submit-stage` : `${API_BASE_URL}/scaffoldcards`;
        const method = currentCardId ? 'POST' : 'POST';
        
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.title || 'Ошибка сервера');
        }

        const result = await response.json();
        currentCardId = result.id;
        
        if (!currentCardId) {
            currentCardId = result.id;
        }
        
        showSuccess('Карточка успешно сохранена!');
        
        // Если это новая карточка, обновляем URL
        if (!window.location.search.includes('cardId')) {
            window.history.pushState(null, '', `?cardId=${currentCardId}&stage=${result.currentStage}`);
        }
        
        // Переходим на следующий этап или в реестр
        if (result.currentStage === 'Демонтаж') {
            setTimeout(() => window.location.href = '/registry.html', 1500);
        } else {
            await loadCard(currentCardId, result.currentStage);
        }
    } catch (error) {
        showError(`Ошибка сохранения: ${error.message}`);
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