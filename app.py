import os
from flask import Flask, render_template, request, jsonify
import numpy as np

# Inicializar Flask con rutas explícitas
app = Flask(__name__,
    template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
    static_folder=os.path.join(os.path.dirname(__file__), 'static')
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "TechSupport S.A. Numerical Analysis System",
        "python_version": os.sys.version
    })

# Ruta de ejemplo para análisis
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        # Ejemplo: calcular media con numpy
        numbers = data.get('numbers', [1, 2, 3, 4, 5])
        mean = np.mean(numbers)
        
        return jsonify({
            "success": True,
            "mean": mean,
            "message": "Análisis completado exitosamente"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Alias para gunicorn
application = app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)