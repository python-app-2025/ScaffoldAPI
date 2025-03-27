const API_BASE_URL = 'http://localhost:5000/api';
let currentPage = 1;
const pageSize = 10;
let sortField = 'id';
let sortDirection = 'asc';

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initSortListeners();
    initPaginationControls();
});


async function loadRegistry() {
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards`);
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

document.addEventListener('DOMContentLoaded', () => {
    loadRegistry();
});

// Загрузка данных
async function loadData() {
    try {
        const url = new URL(`${API_BASE_URL}/scaffoldcards`);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('pageSize', pageSize);
        url.searchParams.append('sortBy', sortField);
        url.searchParams.append('sortDir', sortDirection);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const { data, totalCount } = await response.json();
        renderTable(data);
        updatePaginationControls(totalCount);
    } catch (error) {
        showError(`Ошибка загрузки данных: ${error.message}`);
    }
}

// Рендер таблицы
function renderTable(data) {
    const tbody = document.querySelector('#registryTable tbody');
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.lmo}</td>
            <td>${item.actNumber}</td>
            <td>${item.project}</td>
            <td>${new Date(item.mountingDate).toLocaleDateString()}</td>
            <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>
                <button onclick="viewDetails(${item.id})">Просмотр</button>
                <button onclick="deleteCard(${item.id})">Удалить</button>
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

// Удаление карточки
async function deleteCard(id) {
    if (!confirm('Вы уверены, что хотите удалить карточку?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка удаления');
        
        showSuccess('Карточка удалена');
        await loadData();
    } catch (error) {
        showError(`Ошибка удаления: ${error.message}`);
    }
}