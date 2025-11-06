// ===================== MÉTODO GRÁFICO ====================== //

function resolverGrafico(objetivo, restricciones, tipoOptimizacion) {
    try {
        // Validar que sea un problema 2D
        if (objetivo.length !== 2) {
            throw new Error("El método gráfico solo funciona con 2 variables");
        }

        // Encontrar todos los puntos factibles
        const puntosFactibles = encontrarPuntosFactiblesGrafico(restricciones);
        
        if (puntosFactibles.length === 0) {
            return {
                solucionOptima: false,
                valorOptimo: 0,
                variables: [0, 0],
                mensaje: "No se encontró región factible",
                puntosFactibles: [],
                regionFactible: []
            };
        }

        // Evaluar función objetivo en cada punto
        let mejorValor = tipoOptimizacion === 'maximizar' ? -Infinity : Infinity;
        let mejorPunto = puntosFactibles[0];
        const valores = [];

        for (const punto of puntosFactibles) {
            const valor = objetivo[0] * punto[0] + objetivo[1] * punto[1];
            valores.push({ punto, valor });
            
            if ((tipoOptimizacion === 'maximizar' && valor > mejorValor) ||
                (tipoOptimizacion === 'minimizar' && valor < mejorValor)) {
                mejorValor = valor;
                mejorPunto = punto;
            }
        }

        // Encontrar la región factible (polígono convexo)
        const regionFactible = encontrarRegionFactible(puntosFactibles);

        return {
            solucionOptima: true,
            valorOptimo: mejorValor,
            variables: mejorPunto,
            mensaje: "Solución óptima encontrada (método gráfico)",
            puntosFactibles: puntosFactibles,
            valores: valores,
            regionFactible: regionFactible,
            objetivo: objetivo,
            restricciones: restricciones,
            tipoOptimizacion: tipoOptimizacion
        };
        
    } catch (error) {
        return {
            solucionOptima: false,
            valorOptimo: 0,
            variables: [0, 0],
            mensaje: "Error: " + error.message,
            puntosFactibles: [],
            regionFactible: []
        };
    }
}

function encontrarPuntosFactiblesGrafico(restricciones) {
    const puntos = [];
    const epsilon = 1e-8;
    
    // Agregar origen si es factible
    const origen = [0, 0];
    if (esPuntoFactibleGrafico(origen, restricciones, epsilon)) {
        puntos.push(origen);
    }
    
    // Intersecciones entre cada par de restricciones
    for (let i = 0; i < restricciones.length; i++) {
        for (let j = i + 1; j < restricciones.length; j++) {
            const punto = encontrarInterseccionGrafico(
                restricciones[i].coeficientes, restricciones[i].valor, 
                restricciones[j].coeficientes, restricciones[j].valor,
                epsilon
            );
            
            if (punto && 
                esPuntoFactibleGrafico(punto, restricciones, epsilon) &&
                !puntoExiste(punto, puntos, epsilon)) {
                puntos.push(punto);
            }
        }
    }
    
    // Puntos en los ejes para cada restricción
    for (const restriccion of restricciones) {
        // Intersección con eje X (y=0)
        if (Math.abs(restriccion.coeficientes[0]) > epsilon) {
            const puntoX = [restriccion.valor / restriccion.coeficientes[0], 0];
            if (esPuntoFactibleGrafico(puntoX, restricciones, epsilon) && 
                !puntoExiste(puntoX, puntos, epsilon)) {
                puntos.push(puntoX);
            }
        }
        
        // Intersección con eje Y (x=0)
        if (Math.abs(restriccion.coeficientes[1]) > epsilon) {
            const puntoY = [0, restriccion.valor / restriccion.coeficientes[1]];
            if (esPuntoFactibleGrafico(puntoY, restricciones, epsilon) && 
                !puntoExiste(puntoY, puntos, epsilon)) {
                puntos.push(puntoY);
            }
        }
    }

    return puntos;
}

function encontrarInterseccionGrafico(coef1, rhs1, coef2, rhs2, epsilon) {
    const det = coef1[0] * coef2[1] - coef1[1] * coef2[0];
    
    if (Math.abs(det) < epsilon) {
        return null; // Rectas paralelas
    }
    
    const x = (rhs1 * coef2[1] - rhs2 * coef1[1]) / det;
    const y = (coef1[0] * rhs2 - coef2[0] * rhs1) / det;
    
    return [x, y];
}

function esPuntoFactibleGrafico(punto, restricciones, epsilon = 1e-8) {
    // Verificar no negatividad
    if (punto[0] < -epsilon || punto[1] < -epsilon) {
        return false;
    }
    
    // Verificar cada restricción
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

function puntoExiste(punto, listaPuntos, epsilon) {
    return listaPuntos.some(p => 
        Math.abs(p[0] - punto[0]) < epsilon && 
        Math.abs(p[1] - punto[1]) < epsilon
    );
}

function encontrarRegionFactible(puntos) {
    if (puntos.length < 3) return puntos;
    
    // Algoritmo simple para encontrar el polígono convexo
    // Ordenar puntos por ángulo desde el centroide
    const centro = calcularCentroide(puntos);
    const puntosOrdenados = [...puntos].sort((a, b) => {
        const anguloA = Math.atan2(a[1] - centro[1], a[0] - centro[0]);
        const anguloB = Math.atan2(b[1] - centro[1], b[0] - centro[0]);
        return anguloA - anguloB;
    });
    
    return puntosOrdenados;
}

function calcularCentroide(puntos) {
    const sum = puntos.reduce((acc, punto) => [acc[0] + punto[0], acc[1] + punto[1]], [0, 0]);
    return [sum[0] / puntos.length, sum[1] / puntos.length];
}

// Función para dibujar el gráfico CORREGIDA
function dibujarGrafico(resultado, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const ancho = 600;
    const alto = 400;
    const margen = 50;
    
    // Encontrar los límites del gráfico
    const todosPuntos = [...resultado.puntosFactibles, ...resultado.regionFactible];
    const todosX = todosPuntos.map(p => p[0]);
    const todosY = todosPuntos.map(p => p[1]);
    
    const maxX = Math.max(...todosX, 10);
    const maxY = Math.max(...todosY, 10);
    
    // Escalas
    const escalaX = (ancho - 2 * margen) / maxX;
    const escalaY = (alto - 2 * margen) / maxY;
    
    // Crear SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", ancho);
    svg.setAttribute("height", alto);
    svg.setAttribute("class", "grafico-svg");
    
    // Fondo
    const fondo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    fondo.setAttribute("width", ancho);
    fondo.setAttribute("height", alto);
    fondo.setAttribute("fill", "#f8f9fa");
    svg.appendChild(fondo);
    
    // Definir marcador de flecha para restricciones
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#6f42c1");
    marker.appendChild(polygon);
    defs.appendChild(marker);
    
    const markerRojo = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerRojo.setAttribute("id", "arrowhead-rojo");
    markerRojo.setAttribute("markerWidth", "10");
    markerRojo.setAttribute("markerHeight", "7");
    markerRojo.setAttribute("refX", "9");
    markerRojo.setAttribute("refY", "3.5");
    markerRojo.setAttribute("orient", "auto");
    const polygonRojo = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygonRojo.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygonRojo.setAttribute("fill", "#dc3545");
    markerRojo.appendChild(polygonRojo);
    defs.appendChild(markerRojo);
    
    svg.appendChild(defs);
    
    // Ejes
    dibujarEjes(svg, ancho, alto, margen, maxX, maxY, escalaX, escalaY);
    
    // Región factible
    if (resultado.regionFactible.length >= 3) {
        dibujarRegionFactible(svg, resultado.regionFactible, margen, escalaX, escalaY, alto);
    }
    
    // Restricciones
    resultado.restricciones.forEach((restriccion, index) => {
        dibujarRestriccion(svg, restriccion, margen, escalaX, escalaY, alto, maxX, index);
    });
    
    // Puntos factibles - CORREGIDO: Ahora sí se dibujan
    resultado.puntosFactibles.forEach(punto => {
        dibujarPunto(svg, punto, margen, escalaX, escalaY, alto, false, false);
    });
    
    // Punto óptimo
    dibujarPunto(svg, resultado.variables, margen, escalaX, escalaY, alto, true, false);
    
    // Línea de la función objetivo
    dibujarFuncionObjetivo(svg, resultado.objetivo, resultado.valorOptimo, margen, escalaX, escalaY, alto, maxX);
    
    container.appendChild(svg);
}

function dibujarEjes(svg, ancho, alto, margen, maxX, maxY, escalaX, escalaY) {
    // Eje X
    const ejeX = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ejeX.setAttribute("x1", margen);
    ejeX.setAttribute("y1", alto - margen);
    ejeX.setAttribute("x2", ancho - margen);
    ejeX.setAttribute("y2", alto - margen);
    ejeX.setAttribute("stroke", "#333");
    ejeX.setAttribute("stroke-width", "2");
    svg.appendChild(ejeX);
    
    // Eje Y
    const ejeY = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ejeY.setAttribute("x1", margen);
    ejeY.setAttribute("y1", margen);
    ejeY.setAttribute("x2", margen);
    ejeY.setAttribute("y2", alto - margen);
    ejeY.setAttribute("stroke", "#333");
    ejeY.setAttribute("stroke-width", "2");
    svg.appendChild(ejeY);
    
    // Marcas en eje X
    for (let x = 0; x <= maxX; x += Math.ceil(maxX / 10)) {
        const xPixel = margen + x * escalaX;
        const marca = document.createElementNS("http://www.w3.org/2000/svg", "line");
        marca.setAttribute("x1", xPixel);
        marca.setAttribute("y1", alto - margen - 5);
        marca.setAttribute("x2", xPixel);
        marca.setAttribute("y2", alto - margen + 5);
        marca.setAttribute("stroke", "#333");
        svg.appendChild(marca);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", xPixel);
        texto.setAttribute("y", alto - margen + 20);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("fill", "#333");
        texto.textContent = x;
        svg.appendChild(texto);
    }
    
    // Marcas en eje Y
    for (let y = 0; y <= maxY; y += Math.ceil(maxY / 10)) {
        const yPixel = alto - margen - y * escalaY;
        const marca = document.createElementNS("http://www.w3.org/2000/svg", "line");
        marca.setAttribute("x1", margen - 5);
        marca.setAttribute("y1", yPixel);
        marca.setAttribute("x2", margen + 5);
        marca.setAttribute("y2", yPixel);
        marca.setAttribute("stroke", "#333");
        svg.appendChild(marca);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", margen - 15);
        texto.setAttribute("y", yPixel + 4);
        texto.setAttribute("text-anchor", "end");
        texto.setAttribute("fill", "#333");
        texto.textContent = y;
        svg.appendChild(texto);
    }
    
    // Etiquetas de ejes
    const etiquetaX = document.createElementNS("http://www.w3.org/2000/svg", "text");
    etiquetaX.setAttribute("x", ancho - margen + 10);
    etiquetaX.setAttribute("y", alto - margen);
    etiquetaX.setAttribute("fill", "#333");
    etiquetaX.setAttribute("font-weight", "bold");
    etiquetaX.textContent = "x₁";
    svg.appendChild(etiquetaX);
    
    const etiquetaY = document.createElementNS("http://www.w3.org/2000/svg", "text");
    etiquetaY.setAttribute("x", margen);
    etiquetaY.setAttribute("y", margen - 10);
    etiquetaY.setAttribute("fill", "#333");
    etiquetaY.setAttribute("font-weight", "bold");
    etiquetaY.textContent = "x₂";
    svg.appendChild(etiquetaY);
}

function dibujarRegionFactible(svg, region, margen, escalaX, escalaY, alto) {
    if (region.length < 3) return;
    
    const puntosSVG = region.map(punto => 
        `${margen + punto[0] * escalaX},${alto - margen - punto[1] * escalaY}`
    ).join(" ");
    
    const poligono = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poligono.setAttribute("points", puntosSVG);
    poligono.setAttribute("fill", "rgba(30, 144, 255, 0.3)");
    poligono.setAttribute("stroke", "rgba(30, 144, 255, 0.8)");
    poligono.setAttribute("stroke-width", "1");
    svg.appendChild(poligono);
}

function dibujarRestriccion(svg, restriccion, margen, escalaX, escalaY, alto, maxX, index) {
    const colores = ["#ff6b6b", "#51cf66", "#ffd43b", "#339af0", "#cc5de8"];
    const color = colores[index % colores.length];
    
    // Encontrar dos puntos para dibujar la línea
    let punto1, punto2;
    
    if (Math.abs(restriccion.coeficientes[1]) > 1e-8) {
        // Punto en eje Y (x=0)
        const y1 = restriccion.valor / restriccion.coeficientes[1];
        punto1 = [0, Math.min(y1, maxY)];
        
        // Punto en x máximo
        const x2 = maxX;
        const y2 = (restriccion.valor - restriccion.coeficientes[0] * x2) / restriccion.coeficientes[1];
        punto2 = [x2, Math.min(y2, maxY)];
    } else {
        // Línea vertical
        const x = restriccion.valor / restriccion.coeficientes[0];
        punto1 = [x, 0];
        punto2 = [x, maxY];
    }
    
    // Asegurar que los puntos estén dentro de los límites
    punto1[0] = Math.max(0, Math.min(punto1[0], maxX));
    punto1[1] = Math.max(0, Math.min(punto1[1], maxY));
    punto2[0] = Math.max(0, Math.min(punto2[0], maxX));
    punto2[1] = Math.max(0, Math.min(punto2[1], maxY));
    
    const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
    linea.setAttribute("x1", margen + punto1[0] * escalaX);
    linea.setAttribute("y1", alto - margen - punto1[1] * escalaY);
    linea.setAttribute("x2", margen + punto2[0] * escalaX);
    linea.setAttribute("y2", alto - margen - punto2[1] * escalaY);
    linea.setAttribute("stroke", color);
    linea.setAttribute("stroke-width", "2");
    linea.setAttribute("stroke-dasharray", "5,5");
    linea.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(linea);
    
    // Etiqueta de la restricción
    const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texto.setAttribute("x", margen + (punto1[0] + punto2[0]) / 2 * escalaX + 10);
    texto.setAttribute("y", alto - margen - (punto1[1] + punto2[1]) / 2 * escalaY - 10);
    texto.setAttribute("fill", color);
    texto.setAttribute("font-weight", "bold");
    texto.setAttribute("font-size", "12");
    texto.textContent = `${restriccion.coeficientes[0]}x₁ + ${restriccion.coeficientes[1]}x₂ ${restriccion.tipo} ${restriccion.valor}`;
    svg.appendChild(texto);
}

// FUNCIÓN CORREGIDA: Ahora dibuja todos los puntos correctamente
function dibujarPunto(svg, punto, margen, escalaX, escalaY, alto, esOptimo, esIntercepcion) {
    const xPixel = margen + punto[0] * escalaX;
    const yPixel = alto - margen - punto[1] * escalaY;
    
    // Solo dibujar puntos dentro del área visible
    if (xPixel < margen || xPixel > (margen + (maxX || 10) * escalaX) || 
        yPixel < margen || yPixel > (alto - margen)) {
        return;
    }
    
    const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circulo.setAttribute("cx", xPixel);
    circulo.setAttribute("cy", yPixel);
    circulo.setAttribute("r", esOptimo ? "6" : "4");
    circulo.setAttribute("fill", esOptimo ? "#ff6b6b" : (esIntercepcion ? "#20c997" : "#495057"));
    circulo.setAttribute("stroke", esOptimo ? "#c92a2a" : (esIntercepcion ? "#0ca678" : "#343a40"));
    circulo.setAttribute("stroke-width", esOptimo ? "2" : "1");
    svg.appendChild(circulo);
    
    if (esOptimo) {
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", xPixel + 10);
        texto.setAttribute("y", yPixel - 10);
        texto.setAttribute("fill", "#c92a2a");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "12");
        texto.textContent = `Óptimo (${punto[0].toFixed(2)}, ${punto[1].toFixed(2)})`;
        svg.appendChild(texto);
    }
}

function dibujarFuncionObjetivo(svg, objetivo, valorOptimo, margen, escalaX, escalaY, alto, maxX) {
    // Dibujar línea de la función objetivo en el valor óptimo
    if (Math.abs(objetivo[1]) > 1e-8) {
        const punto1 = [0, valorOptimo / objetivo[1]];
        const punto2 = [maxX, (valorOptimo - objetivo[0] * maxX) / objetivo[1]];
        
        // Asegurar que los puntos estén dentro de los límites
        const y1 = Math.min(punto1[1], maxY || 10);
        const y2 = Math.min(punto2[1], maxY || 10);
        
        const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", margen + 0 * escalaX);
        linea.setAttribute("y1", alto - margen - y1 * escalaY);
        linea.setAttribute("x2", margen + maxX * escalaX);
        linea.setAttribute("y2", alto - margen - y2 * escalaY);
        linea.setAttribute("stroke", "#20c997");
        linea.setAttribute("stroke-width", "3");
        linea.setAttribute("stroke-dasharray", "8,4");
        linea.setAttribute("marker-end", "url(#arrowhead-rojo)");
        svg.appendChild(linea);
        
        // Etiqueta de la función objetivo
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", margen + (maxX / 2) * escalaX);
        texto.setAttribute("y", alto - margen - ((y1 + y2) / 2) * escalaY - 15);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("fill", "#20c997");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "12");
        texto.textContent = `Z = ${objetivo[0]}x₁ + ${objetivo[1]}x₂`;
        svg.appendChild(texto);
    }
}

// Variables globales para las funciones de dibujo
let maxX = 10;
let maxY = 10;