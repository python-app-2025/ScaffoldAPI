// analytics.js
const API_BASE_URL = 'https://scaffoldapi.onrender.com/api';
let volumeChart = null;
let statusChart = null;
let timelineChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initFilters();
        await updateCharts();
        document.getElementById('applyFilters').addEventListener('click', updateCharts);
    } catch (error) {
        showError(`Ошибка инициализации: ${error.message}`);
    }
});

async function initFilters() {
    try {
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/projects`);
        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        
        const projects = await response.json();
        const select = document.getElementById('projectFilter');
        
        select.innerHTML = '<option value="">Все проекты</option>';
        projects.forEach(project => {
            if (project) {
                const option = document.createElement('option');
                option.value = project;
                option.textContent = project;
                select.appendChild(option);
            }
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
        loader.style.display = 'block';
        errorElement.style.display = 'none';
        
        const project = document.getElementById('projectFilter').value;
        const status = document.getElementById('statusFilter').value;
        
        // Делаем три отдельных запроса
        const [volumeData, statusData, timelineData] = await Promise.all([
            fetchVolumeData(project, status),
            fetchStatusData(project),
            fetchTimelineData(project)
        ]);
        
        renderCharts({
            volumeLabels: volumeData.labels,
            volumeValues: volumeData.values,
            statusLabels: statusData.labels,
            statusValues: statusData.values,
            timelineLabels: timelineData.labels,
            timelineValues: timelineData.values
        });
        
    } catch (error) {
        showError(`Ошибка загрузки данных: ${error.message}`);
        console.error('Update charts error:', error);
    } finally {
        loader.style.display = 'none';
    }
}

async function fetchVolumeData(project, status) {
    const params = new URLSearchParams();
    if (project) params.append('project', project);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/analytics/volume-by-projects?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных объема');
    return await response.json();
}

async function fetchStatusData(project) {
    const params = new URLSearchParams();
    if (project) params.append('project', project);
    
    const response = await fetch(`${API_BASE_URL}/analytics/status-distribution?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных статусов');
    return await response.json();
}

async function fetchTimelineData(project) {
    const params = new URLSearchParams({ period: 'month' });
    if (project) params.append('project', project);
    
    const response = await fetch(`${API_BASE_URL}/analytics/timeline?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных временной шкалы');
    return await response.json();
}

function renderCharts({ volumeLabels, volumeValues, statusLabels, statusValues, timelineLabels, timelineValues }) {
    try {
        const volumeCanvas = document.getElementById('volumeChart');
        const statusCanvas = document.getElementById('statusChart');
        const timelineCanvas = document.getElementById('timelineChart');
        
        if (!volumeCanvas || !statusCanvas || !timelineCanvas) {
            throw new Error('Элементы графиков не найдены');
        }
        
        // Уничтожаем предыдущие графики, если они есть
        if (volumeChart) volumeChart.destroy();
        if (statusChart) statusChart.destroy();
        if (timelineChart) timelineChart.destroy();
        
        // График объемов по проектам
        volumeChart = new Chart(volumeCanvas, {
            type: 'bar',
            data: {
                labels: volumeLabels || ['Нет данных'],
                datasets: [{
                    label: 'Объем лесов (м³)',
                    data: volumeValues || [0],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Объем лесов по проектам'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Объем: ${context.raw} м³`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Объем (м³)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Проекты'
                        }
                    }
                }
            }
        });
        
        // График распределения статусов
        statusChart = new Chart(statusCanvas, {
            type: 'pie',
            data: {
                labels: statusLabels || ['Нет данных'],
                datasets: [{
                    data: statusValues || [1],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(231, 76, 60, 0.7)',
                        'rgba(241, 196, 15, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Распределение по статусам'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // График временной шкалы
        timelineChart = new Chart(timelineCanvas, {
            type: 'line',
            data: {
                labels: timelineLabels || ['Нет данных'],
                datasets: [{
                    label: 'Объем лесов (м³)',
                    data: timelineValues || [0],
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    borderColor: 'rgba(155, 89, 182, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Динамика объема лесов по времени'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Объем: ${context.raw} м³`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Объем (м³)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Период'
                        }
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
    setTimeout(() => {
        if (errorElement) errorElement.style.display = 'none';
    }, 5000);
}