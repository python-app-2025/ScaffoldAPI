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
    // Сразу отображаем предзаполненные значения
    displayDefaultValues('Organization', 'organizations-list', DEFAULT_ORGANIZATIONS);
    displayDefaultValues('Project', 'projects-list', DEFAULT_PROJECTS);
    displayDefaultValues('SppElement', 'spp-elements-list', DEFAULT_SPP_ELEMENTS);

    // Затем проверяем сервер и обновляем
    await checkAndUpdateDictionary('Organization', 'organizations-list', DEFAULT_ORGANIZATIONS);
    await checkAndUpdateDictionary('Project', 'projects-list', DEFAULT_PROJECTS);
    await checkAndUpdateDictionary('SppElement', 'spp-elements-list', DEFAULT_SPP_ELEMENTS);
}

function displayDefaultValues(type, elementId, defaultValues) {
    const container = document.getElementById(elementId);
    container.innerHTML = defaultValues.map(value => `
        <div class="directory-item">
            <span>${value}</span>
            <div class="item-actions">
                <button class="btn-delete" disabled>
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');
}

async function checkAndUpdateDictionary(type, elementId, defaultValues) {
    try {
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
            // После добавления загружаем актуальные данные
            await loadDirectoryItems(type, elementId);
        } else {
            // Если данные уже есть, просто загружаем их
            await loadDirectoryItems(type, elementId);
        }
    } catch (error) {
        console.error(`Ошибка инициализации справочника ${type}:`, error);
        // Если ошибка при загрузке, оставляем предзаполненные значения
        const container = document.getElementById(elementId);
        container.innerHTML += `
            <div class="error-message">
                Ошибка загрузки данных с сервера. Отображаются локальные значения.
            </div>
        `;
    }
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