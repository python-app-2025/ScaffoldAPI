const API_BASE_URL = 'https://scaffoldapi.onrender.com/api';
let currentPage = 1;
const pageSize = 10;
let sortField = 'id';
let sortDirection = 'asc';

// Добавьте в начало registry.js
function showError(message) {
    const errorElement = document.getElementById('error-message');
    
    // Если элемент не найден, создаем его динамически
    if (!errorElement) {
        const container = document.querySelector('.container');
        const newErrorElement = document.createElement('div');
        newErrorElement.id = 'error-message';
        newErrorElement.className = 'error-message';
        newErrorElement.style.display = 'block';
        newErrorElement.style.color = 'red';
        newErrorElement.textContent = message;
        container.prepend(newErrorElement);
        
        setTimeout(() => newErrorElement.remove(), 5000);
        return;
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => errorElement.style.display = 'none', 5000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initSortListeners();
    initPaginationControls();

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card-id');
            viewDetails(cardId);
        });
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteCard(e.target.dataset.cardId);
        }
    });


});


async function loadRegistry() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scaffoldcards`, {
            credentials: 'include' // Важно для CORS с перенаправлениями
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const tbody = document.querySelector('#registryTable tbody');
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.lmo}</td>
                <td>${item.actNumber}</td>
                <td>${item.project}</td>
                <td>${item.mountingDate}</td>
                <td>${item.status}</td>
                <td>
                    <button onclick="viewDetails(${item.id})">Просмотр</button>
                    <button onclick="deleteCard(${item.id})">Удалить</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки реестра:', error);
        showError(`Ошибка загрузки реестра: ${error.message}`);
    }
}



// Загрузка данных
async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Добавьте отладку
        console.log('Received data:', data);
        
        renderTable(data);
    } catch (error) {
        showError(error.message);
        console.error('Ошибка загрузки:', error);
    }
}

// Рендер таблицы
function renderTable(data) {
    const tbody = document.querySelector('#registryTable tbody');
    
    // Проверка данных
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data format:', data);
        showError('Ошибка формата данных');
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.lmo || ''}</td>
            <td>${item.actNumber || ''}</td>
            <td>${item.project || ''}</td>
            <td>${item.mountingDate ? new Date(item.mountingDate).toLocaleDateString() : ''}</td>
            <td><span class="status ${item.status ? item.status.toLowerCase() : ''}">${item.status || ''}</span></td>
            <td>
                <button class="details-btn" data-card-id="${item.id}">Просмотр</button>
                <button class="delete-btn" data-card-id="${item.id}">Удалить</button>
            </td>
        </tr>
    `).join('');
}

// Сортировка
function initSortListeners() {
    document.querySelectorAll('#registryTable th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            loadData();
        });
    });
}

// Пагинация
function initPaginationControls() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadData();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        loadData();
    });
}

function updatePaginationControls(totalCount) {
    const totalPages = Math.ceil(totalCount / pageSize);
    document.getElementById('pageInfo').textContent = 
        `Страница ${currentPage} из ${totalPages}`;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Редактирование
function viewDetails(id) {
    console.log(`View details for card ${id}`);
    // Например, открыть модальное окно или перенаправить
    showCardDetailsModal(id);
}

// Удаление карточки
async function deleteCard(cardId) {
    if (!confirm('Вы уверены, что хотите удалить эту карточку?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/${cardId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при удалении');
        }

        // Обновляем список после удаления
        loadRegistry();
        showSuccess('Карточка успешно удалена!');
    } catch (error) {
        showError(error.message);
        console.error('Delete error:', error);
    }
}

// Заменяем функцию showCardDetailsModal
function showCardDetailsModal(cardId) {
    fetch(`${API_BASE_URL}/scaffoldcards/${cardId}`)
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const modal = document.getElementById('details-modal');
            modal.dataset.cardId = cardId;
            
            document.getElementById('modal-title').textContent = `Карточка #${data.id}`;
            
            // Отображаем данные в режиме просмотра
            renderModalContent(data, false);
            
            // Показываем модальное окно
            modal.style.display = 'flex';
            
            // Сбрасываем состояние кнопок
            document.getElementById('edit-btn').style.display = 'block';
            document.getElementById('save-btn').style.display = 'none';
            document.getElementById('cancel-btn').style.display = 'none';
        })
        .catch(error => {
            showError(error.message);
            console.error('Ошибка загрузки деталей:', error);
        });
}

// Новая функция для рендеринга содержимого модального окна
function renderModalContent(data, editMode = false) {
    const modalContent = document.getElementById('modal-content');
    
    if (editMode) {
        modalContent.innerHTML = `
            <p>
                <label for="edit-lmo">ЛМО:</label>
                <input type="text" id="edit-lmo" value="${data.lmo || ''}">
            </p>
            <p>
                <label for="edit-actNumber">№ Акта:</label>
                <input type="text" id="edit-actNumber" value="${data.actNumber || ''}">
            </p>
            <p>
                <label for="edit-project">Проект:</label>
                <input type="text" id="edit-project" value="${data.project || ''}">
            </p>
            <p>
                <label for="edit-mountingDate">Дата монтажа:</label>
                <input type="date" id="edit-mountingDate" value="${data.mountingDate ? data.mountingDate.split('T')[0] : ''}">
            </p>
            <p>
                <label for="edit-status">Статус:</label>
                <select id="edit-status">
                    <option value="Активный" ${data.status === 'Активный' ? 'selected' : ''}>Активный</option>
                    <option value="Завершенный" ${data.status === 'Завершенный' ? 'selected' : ''}>Завершенный</option>
                    <option value="Архивный" ${data.status === 'Архивный' ? 'selected' : ''}>Архивный</option>
                </select>
            </p>
        `;
    } else {
        modalContent.innerHTML = `
            <p><label>ЛМО:</label> <span>${data.lmo || 'не указано'}</span></p>
            <p><label>№ Акта:</label> <span>${data.actNumber || 'не указано'}</span></p>
            <p><label>Проект:</label> <span>${data.project || 'не указано'}</span></p>
            <p><label>Дата монтажа:</label> <span>${data.mountingDate ? new Date(data.mountingDate).toLocaleDateString() : 'не указана'}</span></p>
            <p><label>Статус:</label> <span class="status ${data.status ? data.status.toLowerCase() : ''}">${data.status || 'не указан'}</span></p>
        `;
    }
}

// Функция для получения списка уникальных проектов
async function getUniqueProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/projects`);
        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        return [];
    }
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

// Функция сохранения изменений
async function saveCardChanges() {
    const cardId = document.getElementById('details-modal').dataset.cardId;
    const updatedData = {
        id: parseInt(cardId), // Добавляем ID в тело запроса
        lmo: document.getElementById('edit-lmo').value,
        actNumber: document.getElementById('edit-actNumber').value,
        project: document.getElementById('edit-project').value,
        mountingDate: document.getElementById('edit-mountingDate').value,
        status: document.getElementById('edit-status').value
    };

    // Показываем индикатор загрузки
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';

    try {
        // Используем POST запрос как основной метод
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updatedData),
            credentials: 'include'
        });

        // Проверяем статус ответа
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                console.error('Ошибка парсинга ответа:', e);
            }
            throw new Error(errorMessage);
        }

        // Пытаемся получить ответ
        let result;
        try {
            result = await response.json();
        } catch {
            result = { success: true };
        }

        showSuccess('Изменения успешно сохранены!');
        showCardDetailsModal(cardId);
        loadData();
        
        return result;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showError(`Ошибка сохранения: ${error.message}`);
        throw error;
    } finally {
        // Восстанавливаем кнопку
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить';
    }
}


// Добавляем в конец registry.js обработчик закрытия модального окна
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('details-modal').style.display = 'none';
    });
    
    // Обработчик кнопки "Редактировать"
    document.getElementById('edit-btn').addEventListener('click', () => {
        const cardId = document.getElementById('details-modal').dataset.cardId;
        fetch(`${API_BASE_URL}/scaffoldcards/${cardId}`)
            .then(response => response.json())
            .then(data => {
                renderModalContent(data, true);
                document.getElementById('edit-btn').style.display = 'none';
                document.getElementById('save-btn').style.display = 'block';
                document.getElementById('cancel-btn').style.display = 'block';
            });
    });
    
    // Обработчик кнопки "Сохранить"
    document.getElementById('save-btn').addEventListener('click', saveCardChanges);
    
    // Обработчик кнопки "Отмена"
    document.getElementById('cancel-btn').addEventListener('click', () => {
        const cardId = document.getElementById('details-modal').dataset.cardId;
        showCardDetailsModal(cardId); // Перезагружаем данные
    });

    // Закрытие при клике вне модального окна
    document.getElementById('details-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('details-modal')) {
            document.getElementById('details-modal').style.display = 'none';
        }
    });
});