# Software de Análisis Numérico - TechSupport S.A.

Sistema basado en métodos numéricos para optimizar procesos de desarrollo de software en TechSupport S.A.

## 🎯 Objetivos del Sistema

1. **Reducir desviación en estimaciones** de tiempo del 45% al 15%
2. **Disminuir bugs en producción** del 18% al 8%
3. **Optimizar asignación de recursos** humanos y técnicos
4. **Mejorar predicción** del ciclo de vida de proyectos

## 🚀 Métodos Numéricos Implementados

### 1. Regresión Lineal Múltiple
- **Propósito**: Predicción de tiempos de desarrollo
- **Fórmula**: T = 2.1C + 5.8L + 8.5E
- **Variables**: Complejidad (C), Líneas de código (L), Experiencia (E)

### 2. Método de Newton-Raphson
- **Propósito**: Encontrar horas de corrección para meta de desviación
- **Función**: d(h) = 0.8e^(-0.05h) + 0.05
- **Meta**: 15% de desviación

### 3. Método de la Falsa Posición
- **Propósito**: Cálculo de horas de corrección por intervalos
- **Intervalos**: 20h (45%) a 40h (10%)

### 4. Runge-Kutta (RK4)
- **Propósito**: Simulación dinámica de bugs en producción
- **EDO**: dB/dt = f(B, t)
- **Aplicación**: Predicción temporal de métricas

### 5. Método de Euler
- **Propósito**: Simulación múltiple de métricas del proyecto
- **Variables**: Bugs, líneas de código, tiempo acumulado

## 💻 Instalación y Ejecución

### Prerrequisitos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de instalación

1. **Clonar o descargar el proyecto**
```bash
git clone 
cd TechSupport-Software