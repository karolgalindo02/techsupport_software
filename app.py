from flask import Flask, render_template, request, jsonify
import numpy as np
import json
from models import TechSupportModel

app = Flask(__name__)
model = TechSupportModel()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict_time', methods=['POST'])
def predict_time():
    data = request.json
    complejidad = float(data['complejidad'])
    lineas = float(data['lineas'])
    experiencia = float(data['experiencia'])
    
    # Usar modelo de regresión lineal múltiple
    tiempo = model.regresion_lineal(complejidad, lineas, experiencia)
    
    return jsonify({
        'tiempo_estimado': round(tiempo, 2),
        'formula': f"T = 2.1*{complejidad} + 5.8*{lineas} + 8.5*{experiencia}"
    })

@app.route('/newton_iterations', methods=['POST'])
def newton_iterations():
    data = request.json
    h_inicial = float(data.get('h_inicial', 30.0))
    meta_desviacion = float(data.get('meta_desviacion', 0.15))
    
    iteraciones = model.metodo_newton(h_inicial, meta_desviacion)
    
    return jsonify({
        'iteraciones': iteraciones,
        'solucion_final': iteraciones[-1]['h_nuevo'] if iteraciones else None
    })

@app.route('/false_position', methods=['POST'])
def false_position():
    data = request.json
    a = float(data.get('a', 20.0))  # 20 dev-h/día -> 45% desviación
    b = float(data.get('b', 40.0))  # 40 dev-h/día -> 10% desviación
    meta = float(data.get('meta', 0.15))  # 15% desviación
    
    resultado = model.falsa_posicion(a, b, meta)
    
    return jsonify({
        'horas_correccion': round(resultado, 2),
        'porcentaje_capacidad': round((resultado/80)*100, 1)
    })

@app.route('/runge_kutta', methods=['POST'])
def runge_kutta():
    data = request.json
    bugs_iniciales = float(data.get('bugs_iniciales', 120))
    dias_simulacion = int(data.get('dias', 30))
    
    resultados = model.simular_bugs_rk4(bugs_iniciales, dias_simulacion)
    
    return jsonify({
        'dias': list(range(dias_simulacion + 1)),
        'bugs': resultados.tolist()
    })

@app.route('/euler_simulation', methods=['POST'])
def euler_simulation():
    data = request.json
    bugs_iniciales = float(data.get('bugs_iniciales', 120))
    lineas_iniciales = float(data.get('lineas_iniciales', 50000))
    dias_simulacion = int(data.get('dias', 30))
    
    resultados = model.simular_euler(bugs_iniciales, lineas_iniciales, dias_simulacion)
    
    return jsonify({
        'dias': list(range(dias_simulacion + 1)),
        'bugs': resultados['bugs'].tolist(),
        'lineas': resultados['lineas'].tolist(),
        'tiempo_acumulado': resultados['tiempo'].tolist()
    })

@app.route('/gauss_jordan', methods=['POST'])
def gauss_jordan():
    # Resolver sistema para coeficientes de regresión
    sistema = np.array([[10, 2, 1],
                        [2, 5, 3],
                        [1, 3, 8]])
    resultados = np.array([45, 60, 80])
    
    coeficientes = model.gauss_jordan(sistema, resultados)
    
    return jsonify({
        'coeficientes': coeficientes.tolist(),
        'formula': f"T = {coeficientes[0]:.1f}C + {coeficientes[1]:.1f}L + {coeficientes[2]:.1f}E"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)