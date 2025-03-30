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
        // Загружаем проекты из реестра лесов, а не из справочника
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/projects`);
        if (!response.ok) throw new Error('Ошибка загрузки проектов');
        
        const projects = await response.json();
        const select = document.getElementById('projectFilter');
        
        select.innerHTML = '<option value="">Все проекты</option>';
        projects.forEach(project => {
            if (project) { // Проверяем, что проект не пустой
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
        
        const response = await fetch(`${API_BASE_URL}/scaffoldcards/analytics?` + new URLSearchParams({
            project,
            status
        }));
        
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
        const volumeCanvas = document.getElementById('volumeChart');
        const statusCanvas = document.getElementById('statusChart');
        const timelineCanvas = document.getElementById('timelineChart');
        
        if (!volumeCanvas || !statusCanvas || !timelineCanvas) {
            throw new Error('Элементы графиков не найдены');
        }
        
        if (volumeChart) volumeChart.destroy();
        if (statusChart) statusChart.destroy();
        if (timelineChart) timelineChart.destroy();
        
        // Новый график динамики по времени
        timelineChart = new Chart(timelineCanvas, {
            type: 'line',
            data: {
                labels: data.timelineLabels || ['Нет данных'],
                datasets: [{
                    label: 'Объем лесов (м³)',
                    data: data.timelineVolumes || [0],
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
        
        // График объемов лесов по проектам
        volumeChart = new Chart(volumeCanvas, {
            type: 'bar',
            data: {
                labels: data.projects || ['Нет данных'],
                datasets: [{
                    label: 'Объем лесов (м³)',
                    data: data.volumes || [0],
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
        
        // График статусов
        statusChart = new Chart(statusCanvas, {
            type: 'pie',
            data: {
                labels: data.statusLabels || ['Нет данных'],
                datasets: [{
                    data: data.statusCounts || [1],
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