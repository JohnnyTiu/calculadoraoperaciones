// ===================== MÉTODO SIMPLEX ====================== //

function resolverSimplex(objetivo, restricciones, tipoOptimizacion) {
    // Para problemas 2D simples, usar método gráfico
    if (objetivo.length === 2 && restricciones.length <= 4) {
        return resolverProblema2D(objetivo, restricciones, tipoOptimizacion);
    }
    
    // Para problemas más complejos, intentar con simplex numérico simple
    return resolverSimplexNumerico(objetivo, restricciones, tipoOptimizacion);
}

function resolverSimplexNumerico(objetivo, restricciones, tipoOptimizacion) {
    try {
        const numVariables = objetivo.length;
        const numRestricciones = restricciones.length;
        
        // Crear tabla simplex simple
        let tabla = [];
        
        // Fila objetivo (convertir a forma estándar)
        let filaObjetivo = objetivo.map(coef => 
            tipoOptimizacion === 'maximizar' ? -coef : coef
        );
        
        // Extender para variables de holgura
        for (let i = 0; i < numRestricciones; i++) {
            filaObjetivo.push(0);
        }
        filaObjetivo.push(0); // RHS
        
        tabla.push(filaObjetivo);
        
        // Restricciones
        for (let i = 0; i < numRestricciones; i++) {
            let fila = [...restricciones[i].coeficientes];
            
            // Variables de holgura
            for (let j = 0; j < numRestricciones; j++) {
                fila.push(i === j ? 1 : 0);
            }
            
            fila.push(restricciones[i].valor);
            tabla.push(fila);
        }
        
        // Ejecutar iteraciones simplex (versión simplificada)
        const maxIteraciones = 20;
        for (let iter = 0; iter < maxIteraciones; iter++) {
            // Encontrar columna pivote
            let colPivote = -1;
            let minValor = 0;
            
            for (let j = 0; j < tabla[0].length - 1; j++) {
                if (tabla[0][j] < minValor) {
                    minValor = tabla[0][j];
                    colPivote = j;
                }
            }
            
            if (colPivote === -1) break; // Solución óptima
            
            // Encontrar fila pivote
            let filaPivote = -1;
            let minRatio = Infinity;
            
            for (let i = 1; i < tabla.length; i++) {
                if (tabla[i][colPivote] > 0) {
                    const ratio = tabla[i][tabla[i].length - 1] / tabla[i][colPivote];
                    if (ratio < minRatio) {
                        minRatio = ratio;
                        filaPivote = i;
                    }
                }
            }
            
            if (filaPivote === -1) {
                return {
                    solucionOptima: false,
                    valorOptimo: 0,
                    variables: new Array(numVariables).fill(0),
                    mensaje: "El problema es no acotado"
                };
            }
            
            // Operación pivote
            const elementoPivote = tabla[filaPivote][colPivote];
            for (let j = 0; j < tabla[filaPivote].length; j++) {
                tabla[filaPivote][j] /= elementoPivote;
            }
            
            for (let i = 0; i < tabla.length; i++) {
                if (i !== filaPivote) {
                    const factor = tabla[i][colPivote];
                    for (let j = 0; j < tabla[i].length; j++) {
                        tabla[i][j] -= factor * tabla[filaPivote][j];
                    }
                }
            }
        }
        
        // Extraer solución
        const variables = new Array(numVariables).fill(0);
        for (let j = 0; j < numVariables; j++) {
            let countUnos = 0;
            let filaUnico = -1;
            
            for (let i = 1; i < tabla.length; i++) {
                if (Math.abs(tabla[i][j] - 1) < 1e-8) {
                    countUnos++;
                    filaUnico = i;
                } else if (Math.abs(tabla[i][j]) > 1e-8) {
                    countUnos = 0;
                    break;
                }
            }
            
            if (countUnos === 1) {
                variables[j] = tabla[filaUnico][tabla[filaUnico].length - 1];
            }
        }
        
        const valorOptimo = tipoOptimizacion === 'maximizar' 
            ? tabla[0][tabla[0].length - 1] 
            : -tabla[0][tabla[0].length - 1];
        
        return {
            solucionOptima: true,
            valorOptimo: valorOptimo,
            variables: variables,
            mensaje: "Solución encontrada con método simplex numérico"
        };
        
    } catch (error) {
        return {
            solucionOptima: false,
            valorOptimo: 0,
            variables: [],
            mensaje: "Error en el cálculo: " + error.message
        };
    }
}

function resolverProblema2D(objetivo, restricciones, tipoOptimizacion) {
    // Encontrar puntos factibles
    const puntosFactibles = encontrarPuntosFactibles(restricciones);
    
    if (puntosFactibles.length === 0) {
        return {
            solucionOptima: false,
            valorOptimo: 0,
            variables: [0, 0],
            mensaje: "No se encontró región factible"
        };
    }
    
    // Evaluar función objetivo en cada punto
    let mejorValor = tipoOptimizacion === 'maximizar' ? -Infinity : Infinity;
    let mejorPunto = puntosFactibles[0];
    
    for (const punto of puntosFactibles) {
        const valor = objetivo[0] * punto[0] + objetivo[1] * punto[1];
        
        if ((tipoOptimizacion === 'maximizar' && valor > mejorValor) ||
            (tipoOptimizacion === 'minimizar' && valor < mejorValor)) {
            mejorValor = valor;
            mejorPunto = punto;
        }
    }
    
    return {
        solucionOptima: true,
        valorOptimo: mejorValor,
        variables: mejorPunto,
        mensaje: "Solución óptima encontrada (método gráfico 2D)"
    };
}

function encontrarPuntosFactibles(restricciones) {
    const puntos = [];
    const epsilon = 1e-8;
    
    // Agregar origen si es factible
    const origen = [0, 0];
    if (esPuntoFactible(origen, restricciones, epsilon)) {
        puntos.push(origen);
    }
    
    // Intersecciones entre restricciones
    for (let i = 0; i < restricciones.length; i++) {
        for (let j = i + 1; j < restricciones.length; j++) {
            const punto = encontrarInterseccion(
                restricciones[i].coeficientes, restricciones[i].valor, restricciones[i].tipo,
                restricciones[j].coeficientes, restricciones[j].valor, restricciones[j].tipo,
                epsilon
            );
            
            if (punto && esPuntoFactible(punto, restricciones, epsilon)) {
                // Evitar duplicados
                if (!puntos.some(p => Math.abs(p[0] - punto[0]) < epsilon && Math.abs(p[1] - punto[1]) < epsilon)) {
                    puntos.push(punto);
                }
            }
        }
    }
    
    // Puntos en los ejes
    for (const restriccion of restricciones) {
        // Intersección con eje X
        if (Math.abs(restriccion.coeficientes[1]) > epsilon) {
            const puntoX = [restriccion.valor / restriccion.coeficientes[0], 0];
            if (esPuntoFactible(puntoX, restricciones, epsilon)) {
                if (!puntos.some(p => Math.abs(p[0] - puntoX[0]) < epsilon && Math.abs(p[1]) < epsilon)) {
                    puntos.push(puntoX);
                }
            }
        }
        
        // Intersección con eje Y
        if (Math.abs(restriccion.coeficientes[0]) > epsilon) {
            const puntoY = [0, restriccion.valor / restriccion.coeficientes[1]];
            if (esPuntoFactible(puntoY, restricciones, epsilon)) {
                if (!puntos.some(p => Math.abs(p[0]) < epsilon && Math.abs(p[1] - puntoY[1]) < epsilon)) {
                    puntos.push(puntoY);
                }
            }
        }
    }
    
    return puntos;
}

function encontrarInterseccion(coef1, rhs1, tipo1, coef2, rhs2, tipo2, epsilon) {
    const det = coef1[0] * coef2[1] - coef1[1] * coef2[0];
    
    if (Math.abs(det) < epsilon) {
        return null; // Rectas paralelas
    }
    
    const x = (rhs1 * coef2[1] - rhs2 * coef1[1]) / det;
    const y = (coef1[0] * rhs2 - coef2[0] * rhs1) / det;
    
    return [x, y];
}

function esPuntoFactible(punto, restricciones, epsilon = 1e-8) {
    // Verificar no negatividad
    if (punto[0] < -epsilon || punto[1] < -epsilon) {
        return false;
    }
    
    // Verificar restricciones
    for (const restriccion of restricciones) {
        const valor = restriccion.coeficientes[0] * punto[0] + restriccion.coeficientes[1] * punto[1];
        
        switch (restriccion.tipo) {
            case '<=':
                if (valor > restriccion.valor + epsilon) return false;
                break;
            case '>=':
                if (valor < restriccion.valor - epsilon) return false;
                break;
            case '=':
                if (Math.abs(valor - restriccion.valor) > epsilon) return false;
                break;
        }
    }
    
    return true;
}