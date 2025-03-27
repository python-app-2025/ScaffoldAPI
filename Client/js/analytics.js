const API_BASE_URL = 'http://localhost:5000/api';
let volumeChart, statusChart;

document.addEventListener('DOMContentLoaded', async () => {
    await initFilters();
    await updateCharts();
});

// Инициализация фильтров
async function initFilters() {
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/Project`);
        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        
        const projects = await response.json();
        const select = document.getElementById('projectFilter');
        select.innerHTML = projects.map(p => 
            `<option value="${p.value}">${p.value}</option>`
        ).join('');
    } catch (error) {
        showError(`Ошибка инициализации фильтров: ${error.message}`);
    }
}

// Обновление графиков
async function updateCharts() {
    try {
        const params = new URLSearchParams({
            project: document.getElementById('projectFilter').value,
            status: document.getElementById('statusFilter').value
        });

        const response = await fetch(`${API_BASE_URL}/analytics?${params}`);
        if (!response.ok) throw new Error('Ошибка загрузки аналитики');
        
        const data = await response.json();
        renderCharts(data);
    } catch (error) {
        showError(`Ошибка обновления графиков: ${error.message}`);
    }
}

// Рендер графиков
function renderCharts(data) {
    // Объем по проектам
    if (volumeChart) volumeChart.destroy();
    volumeChart = new Chart(document.getElementById('volumeChart'), {
        type: 'bar',
        data: {
            labels: data.volumeByProject.map(p => p.project),
            datasets: [{
                label: 'Объем лесов (м³)',
                data: data.volumeByProject.map(p => p.volume),
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
        }
    });

    // Статусы
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById('statusChart'), {
        type: 'pie',
        data: {
            labels: data.statusDistribution.map(s => s.status),
            datasets: [{
                data: data.statusDistribution.map(s => s.count),
                backgroundColor: ['#4CAF50', '#F44336']
            }]
        }
    });
}