import numpy as np

class TechSupportModel:
    def __init__(self):
        # Coeficientes del modelo de regresión lineal
        self.alpha = 2.1  # Complejidad
        self.beta = 5.8   # Líneas de código
        self.gamma = 8.5  # Experiencia
        
        # Parámetros del modelo de bugs
        self.alpha_bugs = 0.02  # bugs por LOC
        self.fix_rate = 0.2     # bugs arreglados por dev-hora
        self.productividad = 3   # LOC por dev-hora
        
    def regresion_lineal(self, complejidad, lineas, experiencia):
        """Modelo de regresión lineal múltiple para estimar tiempo"""
        return (self.alpha * complejidad +
                self.beta * (lineas/100) +
                self.gamma * experiencia)
    
    def funcion_desviacion(self, h):
        """Función de desviación en función de horas de corrección"""
        return 0.8 * np.exp(-0.05 * h) + 0.05
    
    def derivada_desviacion(self, h):
        """Derivada de la función de desviación"""
        return -0.04 * np.exp(-0.05 * h)
    
    def metodo_newton(self, h_inicial, meta_desviacion=0.15, max_iter=10, tol=1e-6):
        """Método de Newton-Raphson para encontrar horas necesarias"""
        h = h_inicial
        iteraciones = []
        
        for i in range(max_iter):
            f_val = self.funcion_desviacion(h) - meta_desviacion
            f_prime = self.derivada_desviacion(h)
            
            if abs(f_prime) < 1e-12:
                break
                
            h_nuevo = h - f_val / f_prime
            error = abs(h_nuevo - h)
            
            iteraciones.append({
                'iteracion': i + 1,
                'h_actual': round(h, 6),
                'f_val': round(f_val, 6),
                'f_prime': round(f_prime, 6),
                'h_nuevo': round(h_nuevo, 6),
                'error': round(error, 6)
            })
            
            if error < tol:
                break
                
            h = h_nuevo
            
        return iteraciones
    
    def falsa_posicion(self, a, b, meta=0.15):
        """Método de la falsa posición"""
        f_a = self.funcion_desviacion(a) - meta
        f_b = self.funcion_desviacion(b) - meta
        
        for _ in range(20):
            x_r = b - f_b * (a - b) / (f_a - f_b)
            f_x = self.funcion_desviacion(x_r) - meta
            
            if abs(f_x) < 1e-6:
                return x_r
                
            if f_a * f_x < 0:
                b = x_r
                f_b = f_x
            else:
                a = x_r
                f_a = f_x
                
        return (a + b) / 2
    
    def simular_bugs_rk4(self, bugs_iniciales, dias):
        """Simulación de bugs usando Runge-Kutta 4"""
        def dB_dt(b, t):
            # EDO: tasa de cambio de bugs
            return 0.1 * b - 4  # Ejemplo simplificado
            
        t = np.linspace(0, dias, dias+1)
        b = np.zeros_like(t)
        b[0] = bugs_iniciales
        
        h = t[1] - t[0]
        
        for i in range(len(t)-1):
            k1 = h * dB_dt(b[i], t[i])
            k2 = h * dB_dt(b[i] + k1/2, t[i] + h/2)
            k3 = h * dB_dt(b[i] + k2/2, t[i] + h/2)
            k4 = h * dB_dt(b[i] + k3, t[i] + h)
            
            b[i+1] = b[i] + (k1 + 2*k2 + 2*k3 + k4) / 6
            
        return b
    
    def simular_euler(self, bugs_iniciales, lineas_iniciales, dias):
        """Simulación usando método de Euler"""
        bugs = np.zeros(dias + 1)
        lineas = np.zeros(dias + 1)
        tiempo = np.zeros(dias + 1)
        
        bugs[0] = bugs_iniciales
        lineas[0] = lineas_iniciales
        tiempo[0] = 1000  # horas acumuladas iniciales
        
        # Parámetros
        u_feat = 60  # horas a features por día
        u_fix = 20   # horas a corrección por día
        u_asig = 80  # horas totales asignadas
        
        for i in range(dias):
            # Código generado por día
            loc_dia = self.productividad * u_feat
            
            # Bugs generados y corregidos
            bugs_gen = self.alpha_bugs * loc_dia
            bugs_fix = self.fix_rate * u_fix
            
            # Actualización con Euler
            bugs[i+1] = bugs[i] + (bugs_gen - bugs_fix)
            lineas[i+1] = lineas[i] + loc_dia
            tiempo[i+1] = tiempo[i] + u_asig
            
        return {
            'bugs': bugs,
            'lineas': lineas,
            'tiempo': tiempo
        }
    
    def gauss_jordan(self, A, b):
        """Eliminación de Gauss-Jordan"""
        n = len(b)
        # Matriz aumentada
        Ab = np.hstack([A, b.reshape(-1, 1)])
        
        for i in range(n):
            # Pivoteo parcial
            max_row = np.argmax(np.abs(Ab[i:n, i])) + i
            Ab[[i, max_row]] = Ab[[max_row, i]]
            
            # Normalizar fila
            Ab[i] = Ab[i] / Ab[i, i]
            
            # Eliminación
            for j in range(n):
                if i != j:
                    Ab[j] = Ab[j] - Ab[i] * Ab[j, i]
                    
        return Ab[:, -1]
    
    def interpolacion_newton(self, puntos_x, puntos_y, x_nuevo):
        """Interpolación polinómica de Newton"""
        n = len(puntos_x)
        coef = np.zeros(n)
        coef[0] = puntos_y[0]
        
        # Diferencias divididas
        for j in range(1, n):
            for i in range(n-1, j-1, -1):
                puntos_y[i] = (puntos_y[i] - puntos_y[i-1]) / (puntos_x[i] - puntos_x[i-j])
            coef[j] = puntos_y[j]
        
        # Evaluar polinomio
        resultado = coef[0]
        producto = 1
        for i in range(1, n):
            producto *= (x_nuevo - puntos_x[i-1])
            resultado += coef[i] * producto
            
        return resultado