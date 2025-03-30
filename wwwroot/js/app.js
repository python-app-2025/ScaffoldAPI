// Конфигурация API
const API_BASE_URL = 'https://scaffoldapi.onrender.com/api'
let currentDictionaryType = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDatePickers(); // Инициализация календарей
        await loadDictionaries(); // Загрузка справочников
        initButtons(); // Инициализация кнопок
        setupFormValidation(); // Настройка валидации формы
    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
});

// Инициализация календарей
function initDatePickers() {
    flatpickr(".datepicker", {
        dateFormat: "d.m.Y",
        locale: "ru",
        enableTime: false
    });
}

// Инициализация кнопок
function initButtons() {
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            openAddModal(type);
        });
    });
}

// Настройка валидации формы
function setupFormValidation() {
    document.getElementById('scaffoldForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        await submitForm();
    });
}

// Валидация формы
function validateForm() {
    const form = document.getElementById('scaffoldForm');
    if (!form.checkValidity()) {
        showError('Пожалуйста, заполните все обязательные поля корректно');
        return false;
    }

    // Проверка числовых полей
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);

    if (length <= 0 || width <= 0 || height <= 0) {
        showError('Значения длины, ширины и высоты должны быть положительными числами');
        return false;
    }

    return true;
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
        lmo: document.getElementById('lmoSelect').value.trim(),
        actNumber: document.getElementById('actNumber').value.trim(), // Оставляем как строку
        requestNumber: document.getElementById('requestNumber').value.trim(), // Оставляем как строку
        project: document.getElementById('projectSelect').value.trim(),
        sppElement: document.getElementById('sppElementSelect').value.trim(),
        location: document.getElementById('location').value.trim(),
        requestDate: formatDateForServer(document.getElementById('requestDate').value),
        mountingDate: formatDateForServer(document.getElementById('mountingDate').value),
        dismantlingDate: formatDateForServer(document.getElementById('dismantlingDate').value),
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
        status: document.getElementById('status').value.trim()
    };

    // Проверка обязательных полей
    const requiredFields = [
        'lmo', 'actNumber', 'requestNumber', 'project', 
        'sppElement', 'location', 'scaffoldType', 'workType',
        'customer', 'operatingOrganization', 'ownership', 'status',
        'requestDate', 'mountingDate', 'dismantlingDate'
    ];

    const emptyFields = requiredFields.filter(field => {
        const value = formData[field];
        return value === '' || value === null || value === undefined;
    });

    if (emptyFields.length > 0) {
        showError(`Заполните обязательные поля: ${emptyFields.join(', ')}`);
        return;
    }

    // Отправка данных
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData) // Отправляем плоский объект
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Ошибка сервера:", errorData);
            throw new Error(errorData.title || 'Ошибка сервера');
        }

        showSuccess('Карточка успешно сохранена!');
        setTimeout(() => window.location.href = '/registry.html', 1500);
    } catch (error) {
        console.error('Ошибка:', error);
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
    const container = document.getElementById('messages-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
    console.error(message);
    alert(message);
}

function showSuccess(message) {
    console.log('Успех:', message);
    const container = document.getElementById('messages-container') || 
                     createMessagesContainer();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    container.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 3000);
}