// Конфигурация API
const API_BASE_URL = 'https://localhost:5001/api';
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
        dateFormat: "Y-m-d",
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
    // Функция преобразования даты
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('.');
        return new Date(`${year}-${month}-${day}`).toISOString();
    };

    // Собираем данные с правильными именами полей
    const formData = {
        LMO: document.getElementById('lmoSelect').value.trim(),
        Status: document.getElementById('status').value.trim(),
        Project: document.getElementById('projectSelect').value.trim(),
        Customer: document.getElementById('customer').value.trim(),
        Location: document.getElementById('location').value.trim(),
        WorkType: document.getElementById('workType').value.trim(),
        ActNumber: document.getElementById('actNumber').value.trim(),
        Ownership: document.getElementById('ownership').value.trim(),
        SppElement: document.getElementById('sppElementSelect').value.trim(),
        ScaffoldType: document.getElementById('scaffoldType').value.trim(),
        RequestNumber: document.getElementById('requestNumber').value.trim(),
        OperatingOrganization: document.getElementById('operatingOrganization').value.trim(),
        RequestDate: formatDate(document.getElementById('requestDate').value),
        MountingDate: formatDate(document.getElementById('mountingDate').value),
        DismantlingDate: formatDate(document.getElementById('dismantlingDate').value),
        Length: Number(document.getElementById('length').value),
        Width: Number(document.getElementById('width').value),
        Height: Number(document.getElementById('height').value)
    };

    console.log("Отправляемые данные:", formData); // Для отладки

    // Проверка заполненности полей
    const requiredFields = [
        'LMO', 'Status', 'Project', 'Customer', 'Location',
        'WorkType', 'ActNumber', 'Ownership', 'SppElement',
        'ScaffoldType', 'RequestNumber', 'OperatingOrganization'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
        showError(`Заполните обязательные поля: ${emptyFields.join(', ')}`);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
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
        { type: 'LMO', elementId: 'lmoSelect' },
        { type: 'Project', elementId: 'projectSelect' },
        { type: 'SppElement', elementId: 'sppElementSelect' },
        { type: 'Organization', elementId: 'operatingOrganization' }
    ];

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

// Открытие модального окна
function openAddModal(type) {
    currentDictionaryType = type;
    document.getElementById('newItemInput').value = '';
    document.getElementById('addModal').style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
}

// Добавление нового элемента
async function addNewItem() {
    const input = document.getElementById('newItemInput');
    const value = input.value.trim();
    
    if (!value) {
        showError('Введите значение');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/dictionary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: currentDictionaryType,
                value: value
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка сервера');
        }

        // После успешного добавления обновляем список
        await loadDictionaries();
        closeModal();
        showSuccess('Значение успешно добавлено');
    } catch (error) {
        console.error('Ошибка добавления:', error);
        showError(`Ошибка добавления: ${error.message || 'Неизвестная ошибка'}`);
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
}

function showSuccess(message) {
    const container = document.getElementById('messages-container');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    container.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}