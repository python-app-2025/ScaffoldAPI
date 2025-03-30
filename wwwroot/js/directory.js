const API_BASE_URL = 'https://scaffoldapi.onrender.com/api';
let currentDeleteItem = null;

// Предзаполненные значения
const DEFAULT_ORGANIZATIONS = [
    'ПАО «НЛМК»',
    'ООО «СМТ НЛМК»',
    'ОАО "ЮВЭМ-1"',
    'ООО «Промстройэксперт»',
    'ООО «ЭТП Инжиниринг»',
    'ООО "УДР-Е"',
    'ООО «ДДР-Липецк»',
    'ООО "Монолитпрокатмонтаж"'
];

const DEFAULT_PROJECTS = [
    'АНГЦ-5',
    'УТЭЦ-2',
    'ЦГП. Техническое перевооружение НП-1',
    'ДЦ-2',
    'ДЦ1',
    'ДП-4',
    'ЦТС',
    'ДЦ-2',
    'ДП7'
];

const DEFAULT_SPP_ELEMENTS = [
    '12-1522',
    '11-0373',
    '249797',
    '11-0361',
    '11-0166-01',
    '12-1284-01-06'
];

document.addEventListener('DOMContentLoaded', async () => {
    await initDefaultValues();
    await loadDirectoryItems('Organization', 'organizations-list');
    await loadDirectoryItems('Project', 'projects-list');
    await loadDirectoryItems('SppElement', 'spp-elements-list');
});

async function initDefaultValues() {
    // Инициализация организаций
    await initDictionary('Organization', DEFAULT_ORGANIZATIONS);
    // Инициализация проектов
    await initDictionary('Project', DEFAULT_PROJECTS);
    // Инициализация СПП элементов
    await initDictionary('SppElement', DEFAULT_SPP_ELEMENTS);
}

async function initDictionary(type, defaultValues) {
    try {
        // Проверяем, есть ли уже значения в справочнике
        const response = await fetch(`${API_BASE_URL}/dictionary/${type}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const existingItems = await response.json();
        
        // Если справочник пустой, добавляем значения по умолчанию
        if (existingItems.length === 0) {
            for (const value of defaultValues) {
                await fetch(`${API_BASE_URL}/dictionary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, value })
                });
            }
        }
    } catch (error) {
        console.error(`Ошибка инициализации справочника ${type}:`, error);
    }
}

async function loadDirectoryItems(type, elementId) {
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/${type}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const container = document.getElementById(elementId);
        
        container.innerHTML = data.map(item => `
            <div class="directory-item">
                <span>${item.value}</span>
                <div class="item-actions">
                    <button class="btn-delete" onclick="showDeleteConfirm('${type}', ${item.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(`Ошибка загрузки ${type}: ${error.message}`);
    }
}

function showDeleteConfirm(type, id) {
    currentDeleteItem = { type, id };
    document.getElementById('confirmModal').style.display = 'flex';
}

async function confirmDelete() {
    if (!currentDeleteItem) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/${currentDeleteItem.type}/${currentDeleteItem.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showSuccess('Элемент успешно удален');
        // Перезагружаем соответствующий список
        switch(currentDeleteItem.type) {
            case 'Organization':
                await loadDirectoryItems('Organization', 'organizations-list');
                break;
            case 'Project':
                await loadDirectoryItems('Project', 'projects-list');
                break;
            case 'SppElement':
                await loadDirectoryItems('SppElement', 'spp-elements-list');
                break;
        }
    } catch (error) {
        showError(`Ошибка удаления: ${error.message}`);
    } finally {
        closeModal();
        currentDeleteItem = null;
    }
}

async function addOrganization() {
    const input = document.getElementById('new-organization');
    await addDictionaryItem('Organization', input.value.trim(), input);
}

async function addProject() {
    const input = document.getElementById('new-project');
    await addDictionaryItem('Project', input.value.trim(), input);
}

async function addSppElement() {
    const input = document.getElementById('new-spp-element');
    await addDictionaryItem('SppElement', input.value.trim(), input);
}

async function addDictionaryItem(type, value, inputElement) {
    if (!value) {
        showError('Введите значение');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, value })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showSuccess('Элемент успешно добавлен');
        inputElement.value = '';
        
        // Перезагружаем соответствующий список
        switch(type) {
            case 'Organization':
                await loadDirectoryItems('Organization', 'organizations-list');
                break;
            case 'Project':
                await loadDirectoryItems('Project', 'projects-list');
                break;
            case 'SppElement':
                await loadDirectoryItems('SppElement', 'spp-elements-list');
                break;
        }
    } catch (error) {
        showError(`Ошибка добавления: ${error.message}`);
    }
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

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