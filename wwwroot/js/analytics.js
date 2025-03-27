const API_BASE_URL = 'https://localhost:5001/api';
let volumeChart = null;
let statusChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initFilters();
        await updateCharts();
        
        // Назначение обработчика кнопки
        document.getElementById('applyFilters').addEventListener('click', updateCharts);
    } catch (error) {
        showError(`Ошибка инициализации: ${error.message}`);
    }
});

async function initFilters() {
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/Project`);
        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        
        const projects = await response.json();
        const select = document.getElementById('projectFilter');
        
        // Очищаем и добавляем новые options
        select.innerHTML = '<option value="">Все проекты</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id || project.value;
            option.textContent = project.name || project.value;
            select.appendChild(option);
        });
    } catch (error) {
        showError(`Ошибка загрузки фильтров: ${error.message}`);
        throw error;
    }
}

async function updateCharts() {
    const loader = document.getElementById('analytics-loader');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Показываем загрузку и скрываем ошибки
        loader.style.display = 'block';
        errorElement.style.display = 'none';
        
        // Получаем параметры фильтров
        const projectId = document.getElementById('projectFilter').value;
        const status = document.getElementById('statusFilter').value;
        
        // Формируем URL с параметрами
        const url = new URL(`${API_BASE_URL}/analytics/data`);
        if (projectId) url.searchParams.append('projectId', projectId);
        if (status) url.searchParams.append('status', status);
        
        // Загружаем данные
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const data = await response.json();
        renderCharts(data);
        
    } catch (error) {
        showError(`Ошибка загрузки данных: ${error.message}`);
        console.error('Update charts error:', error);
    } finally {
        loader.style.display = 'none';
    }
}

function renderCharts(data) {
    try {
        // Получаем canvas элементы
        const volumeCanvas = document.getElementById('volumeChart');
        const statusCanvas = document.getElementById('statusChart');
        
        if (!volumeCanvas || !statusCanvas) {
            throw new Error('Элементы графиков не найдены');
        }
        
        // Уничтожаем старые графики
        if (volumeChart) volumeChart.destroy();
        if (statusChart) statusChart.destroy();
        
        // График объемов
        volumeChart = new Chart(volumeCanvas, {
            type: 'bar',
            data: {
                labels: data.volume?.labels || ['Нет данных'],
                datasets: [{
                    label: 'Объем лесов (м³)',
                    data: data.volume?.values || [0],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Объем лесов по проектам'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // График статусов
        statusChart = new Chart(statusCanvas, {
            type: 'pie',
            data: {
                labels: data.status?.labels || ['Нет данных'],
                datasets: [{
                    data: data.status?.values || [1],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Распределение по статусам'
                    }
                }
            }
        });
        
    } catch (error) {
        showError(`Ошибка отрисовки графиков: ${error.message}`);
        console.error('Render charts error:', error);
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    console.error('Analytics Error:', message);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (errorElement) errorElement.style.display = 'none';
    }, 5000);
}