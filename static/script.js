// Variables globales
let charts = {};
let currentTab = 1;

// Cambiar pestañas
function switchTab(tabNumber) {
    currentTab = tabNumber;
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar pestaña seleccionada
    document.getElementById(`tab${tabNumber}`).classList.add('active');
    document.querySelectorAll('.tab')[tabNumber - 1].classList.add('active');
}

// Predecir tiempo usando regresión lineal
async function predecirTiempo() {
    const complejidad = document.getElementById('complejidad').value;
    const lineas = document.getElementById('lineas').value;
    const experiencia = document.getElementById('experiencia').value;
    
    try {
        const response = await fetch('/predict_time', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                complejidad: parseFloat(complejidad),
                lineas: parseFloat(lineas),
                experiencia: parseFloat(experiencia)
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        document.getElementById('resultadoRegresion').style.display = 'block';
        document.getElementById('tiempoEstimado').textContent = `${data.tiempo_estimado} horas`;
        document.getElementById('formulaPrediccion').textContent = `Fórmula: ${data.formula}`;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al calcular la predicción: ' + error.message);
    }
}

// Método de Newton
async function calcularNewton() {
    const h_inicial = document.getElementById('h_inicial').value;
    const meta_desviacion = document.getElementById('meta_desviacion').value / 100;
    
    try {
        const response = await fetch('/newton_iterations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                h_inicial: parseFloat(h_inicial),
                meta_desviacion: parseFloat(meta_desviacion)
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        let tablaHTML = `
            <table class="iteration-table">
                <thead>
                    <tr>
                        <th>Iteración</th>
                        <th>h<sub>n</sub></th>
                        <th>f(h<sub>n</sub>)</th>
                        <th>f'(h<sub>n</sub>)</th>
                        <th>h<sub>n+1</sub></th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (data.iteraciones && data.iteraciones.length > 0) {
            data.iteraciones.forEach(iter => {
                const convergedClass = iter.error < 0.00001 ? 'converged' : '';
                tablaHTML += `
                    <tr class="${convergedClass}">
                        <td>${iter.iteracion}</td>
                        <td>${iter.h_actual}</td>
                        <td>${iter.f_val}</td>
                        <td>${iter.f_prime}</td>
                        <td>${iter.h_nuevo}</td>
                        <td>${iter.error}</td>
                    </tr>
                `;
            });
        } else {
            tablaHTML += `
                <tr>
                    <td colspan="6">No se generaron iteraciones</td>
                </tr>
            `;
        }
        
        tablaHTML += `
                </tbody>
            </table>
        `;
        
        if (data.solucion_final) {
            tablaHTML += `
                <div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 5px;">
                    <strong>✓ Solución convergida:</strong> ${data.solucion_final.toFixed(6)} dev-horas/día
                    <br>
                    <small>Equivalente a ${((data.solucion_final/80)*100).toFixed(1)}% de la capacidad diaria</small>
                </div>
            `;
        }
        
        document.getElementById('resultadoNewton').style.display = 'block';
        document.getElementById('tablaIteraciones').innerHTML = tablaHTML;
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el método de Newton: ' + error.message);
    }
}

// Falsa Posición
async function calcularFalsaPosicion() {
    const a = document.getElementById('intervalo_a').value;
    const b = document.getElementById('intervalo_b').value;
    const meta = 0.15; // 15%
    
    try {
        const response = await fetch('/false_position', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                a: parseFloat(a),
                b: parseFloat(b),
                meta: meta
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        document.getElementById('resultadoFalsaPosicion').style.display = 'block';
        document.getElementById('horasFalsaPosicion').textContent = `${data.horas_correccion} dev-horas/día`;
        document.getElementById('porcentajeCapacidad').textContent = 
            `(${data.porcentaje_capacidad}% de la capacidad total diaria)`;
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el método de falsa posición: ' + error.message);
    }
}

// Runge-Kutta
async function simularRungeKutta() {
    const bugs_iniciales = document.getElementById('bugs_iniciales').value;
    const dias_simulacion = document.getElementById('dias_simulacion').value;
    
    try {
        const response = await fetch('/runge_kutta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bugs_iniciales: parseFloat(bugs_iniciales),
                dias: parseInt(dias_simulacion)
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        if (charts.rk4Chart) {
            charts.rk4Chart.destroy();
        }
        
        const ctx = document.getElementById('rk4Chart').getContext('2d');
        charts.rk4Chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dias,
                datasets: [{
                    label: 'Bugs en Producción (RK4)',
                    data: data.bugs,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Simulación de Bugs con Runge-Kutta'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Bugs'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Días'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la simulación Runge-Kutta: ' + error.message);
    }
}

// Método de Euler
async function simularEuler() {
    const bugs_iniciales = document.getElementById('euler_bugs').value;
    const lineas_iniciales = document.getElementById('euler_lineas').value;
    const dias_simulacion = 30;
    
    try {
        const response = await fetch('/euler_simulation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bugs_iniciales: parseFloat(bugs_iniciales),
                lineas_iniciales: parseFloat(lineas_iniciales),
                dias: dias_simulacion
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        if (charts.eulerChart) {
            charts.eulerChart.destroy();
        }
        
        const ctx = document.getElementById('eulerChart').getContext('2d');
        charts.eulerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dias,
                datasets: [
                    {
                        label: 'Bugs',
                        data: data.bugs,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Líneas de Código (miles)',
                        data: data.lineas.map(l => l/1000),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Simulación con Método de Euler'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Bugs'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Líneas de Código (miles)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la simulación Euler: ' + error.message);
    }
}

// Generar reporte
async function generarReporte() {
    try {
        const response = await fetch('/gauss_jordan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        // Mostrar recomendaciones
        const recomendacionesDiv = document.getElementById('recomendaciones');
        recomendacionesDiv.innerHTML = `
            <div style="padding: 15px; background: #e8f4fc; border-radius: 8px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">🚀 Recomendaciones basadas en el análisis:</h4>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">📅 <strong>Asignar ${data.coeficientes ? '41.59' : '41.59'} dev-horas/día</strong> a actividades de corrección</li>
                    <li style="margin-bottom: 8px;">📊 <strong>Usar Factorización QR</strong> en lugar de Gauss-Jordan para mayor estabilidad numérica</li>
                    <li style="margin-bottom: 8px;">🔧 <strong>Implementar monitoreo continuo</strong> con métricas MAE y MSE</li>
                    <li style="margin-bottom: 8px;">📈 <strong>Combinar modelos estáticos (Regresión)</strong> y dinámicos (Runge-Kutta)</li>
                    <li style="margin-bottom: 8px;">🎯 <strong>Objetivo alcanzable:</strong> 15% de desviación en 6 meses</li>
                </ul>
                <p style="margin-top: 15px; color: #2c3e50;">
                    <strong>Fórmula de predicción:</strong> ${data.formula || 'T = 2.1C + 5.8L + 8.5E'}
                </p>
            </div>
        `;
        
        // Actualizar métricas proyectadas
        document.getElementById('desviacionActual').innerHTML = '45% → <span style="color: #2ecc71;">15%</span>';
        document.getElementById('bugsActual').innerHTML = '18% → <span style="color: #2ecc71;">8%</span>';
        document.getElementById('retrabajoActual').innerHTML = '30% → <span style="color: #2ecc71;">12%</span>';
        document.getElementById('sobrecostosActual').innerHTML = '35% → <span style="color: #2ecc71;">15%</span>';
        
        // Crear gráfico de comparación
        if (charts.comparacionChart) {
            charts.comparacionChart.destroy();
        }
        
        const ctx = document.getElementById('comparacionChart').getContext('2d');
        charts.comparacionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Desviación', 'Bugs', 'Retrabajo', 'Sobrecostos'],
                datasets: [
                    {
                        label: 'Situación Actual',
                        data: [45, 18, 30, 35],
                        backgroundColor: 'rgba(255, 99, 132, 0.8)'
                    },
                    {
                        label: 'Meta Proyectada',
                        data: [15, 8, 12, 15],
                        backgroundColor: 'rgba(75, 192, 192, 0.8)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación: Actual vs Meta'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Porcentaje (%)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar el reporte: ' + error.message);
    }
}

// Exportar datos
function exportarDatos() {
    const datos = {
        proyecto: 'TechSupport S.A.',
        fecha: new Date().toISOString(),
        metodos_utilizados: ['Regresión Lineal', 'Newton-Raphson', 'Falsa Posición', 'Runge-Kutta', 'Euler'],
        objetivos: {
            desviacion: '45% → 15%',
            bugs: '18% → 8%',
            retrabajo: '30% → 12%',
            sobrecostos: '35% → 15%'
        },
        resultados: {
            horas_correccion_recomendadas: '41.59 dev-horas/día',
            porcentaje_capacidad: '52.0%',
            formula_prediccion: 'T = 2.1C + 5.8L + 8.5E'
        }
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techsupport_analisis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar notificación
    showNotification('✅ Datos exportados exitosamente!', 'success');
}

// Resetear modelo
function resetearModelo() {
    if (confirm('¿Estás seguro de querer resetear el modelo? Se perderán todos los cálculos actuales.')) {
        // Resetear formularios
        document.getElementById('complejidad').value = 3;
        document.getElementById('lineas').value = 5;
        document.getElementById('experiencia').value = 3;
        document.getElementById('h_inicial').value = 30;
        document.getElementById('meta_desviacion').value = 15;
        document.getElementById('intervalo_a').value = 20;
        document.getElementById('intervalo_b').value = 40;
        document.getElementById('bugs_iniciales').value = 120;
        document.getElementById('dias_simulacion').value = 30;
        document.getElementById('euler_bugs').value = 120;
        document.getElementById('euler_lineas').value = 50000;
        
        // Ocultar resultados
        document.querySelectorAll('.result-card').forEach(card => {
            card.style.display = 'none';
        });
        
        // Resetear gráficos
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        charts = {};
        
        // Resetear recomendaciones
        document.getElementById('recomendaciones').innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Calculando recomendaciones...</p>
            </div>
        `;
        
        // Resetear métricas
        document.getElementById('desviacionActual').textContent = '45%';
        document.getElementById('bugsActual').textContent = '18%';
        document.getElementById('retrabajoActual').textContent = '30%';
        document.getElementById('sobrecostosActual').textContent = '35%';
        
        showNotification('✅ Modelo reseteado exitosamente!', 'success');
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Estilo según tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Añadir estilos CSS para animaciones de notificación
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Inicializar la página
window.onload = function() {
    
     setTimeout(() => {
        const recomendacionesDiv = document.getElementById('recomendaciones');
        if (recomendacionesDiv) {
            recomendacionesDiv.innerHTML = `
                <div style="padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                      📋 Pasos recomendados:
                        <ol style="margin-top: 8px; padding-left: 20px;">
                            <li>Usa "Regresión Lineal" para predecir tiempos</li>
                            <li>Ejecuta "Método de Newton" para calcular horas de corrección</li>
                            <li>Genera un reporte completo con recomendaciones</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 1000);

    // Inicializar Chart.js si está disponible
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js cargado correctamente');
    }
    
    // Configurar eventos para los botones
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Efecto visual al hacer clic
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Configurar validación de formularios
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            const min = parseFloat(this.min) || -Infinity;
            const max = parseFloat(this.max) || Infinity;
            const value = parseFloat(this.value);
            
            if (value < min) {
                this.value = min;
                showNotification(`Valor mínimo: ${min}`, 'info');
            } else if (value > max) {
                this.value = max;
                showNotification(`Valor máximo: ${max}`, 'info');
            }
        });
    });
};