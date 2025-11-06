// ===================== MÉTODO DE ASIGNACIÓN (HÚNGARO) ====================== //

function resolverAsignacion(costos, tipoProblema) {
    try {
        const n = costos.length;
        
        // Validar que la matriz sea cuadrada
        if (n === 0 || costos[0].length !== n) {
            throw new Error("La matriz de costos debe ser cuadrada (n x n)");
        }

        // Crear copia de la matriz de costos
        let matriz = costos.map(fila => [...fila]);
        
        // Convertir a problema de minimización si es maximización
        if (tipoProblema === 'maximizar') {
            const maxValor = Math.max(...matriz.flat());
            matriz = matriz.map(fila => fila.map(valor => maxValor - valor));
        }

        // Paso 1: Restar el mínimo de cada fila
        for (let i = 0; i < n; i++) {
            const minFila = Math.min(...matriz[i]);
            for (let j = 0; j < n; j++) {
                matriz[i][j] -= minFila;
            }
        }

        // Paso 2: Restar el mínimo de cada columna
        for (let j = 0; j < n; j++) {
            const minColumna = Math.min(...matriz.map(fila => fila[j]));
            for (let i = 0; i < n; i++) {
                matriz[i][j] -= minColumna;
            }
        }

        // Aplicar el algoritmo húngaro
        const { asignacion, costoTotal } = aplicarAlgoritmoHungaro(matriz, costos, tipoProblema);

        return {
            solucionOptima: true,
            asignacion: asignacion,
            costoTotal: costoTotal,
            mensaje: `Solución óptima encontrada (${tipoProblema})`
        };

    } catch (error) {
        return {
            solucionOptima: false,
            asignacion: [],
            costoTotal: 0,
            mensaje: "Error: " + error.message
        };
    }
}

function aplicarAlgoritmoHungaro(matrizReducida, costosOriginales, tipoProblema) {
    const n = matrizReducida.length;
    let asignacion = Array(n).fill(-1);
    let filasCubiertas = Array(n).fill(false);
    let columnasCubiertas = Array(n).fill(false);
    
    // Intentar hacer asignaciones iniciales
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrizReducida[i][j] === 0 && asignacion[j] === -1 && !filasCubiertas[i] && !columnasCubiertas[j]) {
                asignacion[j] = i;
                filasCubiertas[i] = true;
                columnasCubiertas[j] = true;
            }
        }
    }
    
    // Reiniciar coberturas
    filasCubiertas.fill(false);
    columnasCubiertas.fill(false);
    
    // Marcar filas sin asignación
    for (let j = 0; j < n; j++) {
        if (asignacion[j] !== -1) {
            filasCubiertas[asignacion[j]] = true;
        }
    }
    
    // Algoritmo de cobertura
    let cubiertas = [...filasCubiertas];
    let cambio = true;
    
    while (cambio) {
        cambio = false;
        
        // Cubrir columnas con ceros en filas descubiertas
        for (let i = 0; i < n; i++) {
            if (!cubiertas[i]) {
                for (let j = 0; j < n; j++) {
                    if (matrizReducida[i][j] === 0 && !columnasCubiertas[j]) {
                        columnasCubiertas[j] = true;
                        cambio = true;
                    }
                }
            }
        }
        
        // Cubrir filas con asignaciones en columnas cubiertas
        for (let j = 0; j < n; j++) {
            if (columnasCubiertas[j] && asignacion[j] !== -1 && !cubiertas[asignacion[j]]) {
                cubiertas[asignacion[j]] = true;
                cambio = true;
            }
        }
    }
    
    // Encontrar el mínimo valor no cubierto
    let minNoCubierto = Infinity;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (!cubiertas[i] && !columnasCubiertas[j]) {
                minNoCubierto = Math.min(minNoCubierto, matrizReducida[i][j]);
            }
        }
    }
    
    // Ajustar la matriz
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (!cubiertas[i] && !columnasCubiertas[j]) {
                matrizReducida[i][j] -= minNoCubierto;
            } else if (cubiertas[i] && columnasCubiertas[j]) {
                matrizReducida[i][j] += minNoCubierto;
            }
        }
    }
    
    // Hacer asignación final (algoritmo greedy)
    asignacion.fill(-1);
    const asignados = Array(n).fill(false);
    
    for (let iter = 0; iter < n; iter++) {
        // Encontrar el cero con menos opciones en su fila y columna
        let mejorI = -1, mejorJ = -1, minOpciones = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (asignados[i]) continue;
            
            for (let j = 0; j < n; j++) {
                if (asignacion[j] !== -1) continue;
                
                if (matrizReducida[i][j] === 0) {
                    // Contar opciones en fila y columna
                    let opciones = 0;
                    for (let k = 0; k < n; k++) {
                        if (matrizReducida[i][k] === 0 && asignacion[k] === -1) opciones++;
                        if (matrizReducida[k][j] === 0 && !asignados[k] && k !== i) opciones++;
                    }
                    
                    if (opciones < minOpciones) {
                        minOpciones = opciones;
                        mejorI = i;
                        mejorJ = j;
                    }
                }
            }
        }
        
        if (mejorI !== -1 && mejorJ !== -1) {
            asignacion[mejorJ] = mejorI;
            asignados[mejorI] = true;
        }
    }
    
    // Calcular costo total
    let costoTotal = 0;
    const asignacionDetallada = [];
    
    for (let j = 0; j < n; j++) {
        if (asignacion[j] !== -1) {
            const costo = costosOriginales[asignacion[j]][j];
            costoTotal += costo;
            asignacionDetallada.push({
                persona: asignacion[j] + 1,
                tarea: j + 1,
                costo: costo
            });
        }
    }
    
    // Si es maximización, ajustar el costo total
    if (tipoProblema === 'maximizar') {
        const maxValor = Math.max(...costosOriginales.flat());
        costoTotal = asignacionDetallada.reduce((total, asig) => total + (maxValor - costosOriginales[asig.persona-1][asig.tarea-1]), 0);
    }
    
    return {
        asignacion: asignacionDetallada,
        costoTotal: costoTotal
    };
}

function mostrarTablaAsignacion(asignacion, costos) {
    const n = costos.length;
    let html = `<div class="tabla-asignacion">
        <table>
            <tr>
                <th></th>`;
    
    // Encabezados de columnas (tareas)
    for (let j = 0; j < n; j++) {
        html += `<th>Tarea ${j + 1}</th>`;
    }
    html += `<th>Asignado a</th></tr>`;
    
    // Filas de personas y costos
    for (let i = 0; i < n; i++) {
        html += `<tr><th>Persona ${i + 1}</th>`;
        for (let j = 0; j < n; j++) {
            const asignada = asignacion.find(a => a.persona === i + 1 && a.tarea === j + 1);
            html += `<td class="${asignada ? 'celda-asignada' : ''}">${costos[i][j]}${asignada ? ' ★' : ''}</td>`;
        }
        
        // Mostrar a qué tarea está asignada esta persona
        const tareaAsignada = asignacion.find(a => a.persona === i + 1);
        html += `<td class="tarea-asignada">${tareaAsignada ? `Tarea ${tareaAsignada.tarea}` : '-'}</td>`;
        html += `</tr>`;
    }
    
    html += `</table></div>`;
    return html;
}