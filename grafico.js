// grafico.js - Código completo para el método gráfico

// ===================== MÉTODO GRÁFICO - FUNCIÓN PRINCIPAL ====================== //

function resolverGrafico(objetivo, restricciones, tipoOptimizacion) {
    try {
        console.log('Iniciando método gráfico...');
        console.log('Objetivo:', objetivo);
        console.log('Restricciones:', restricciones);
        console.log('Tipo:', tipoOptimizacion);

        // Validar que sea un problema 2D
        if (objetivo.length !== 2) {
            throw new Error("El método gráfico solo funciona con 2 variables");
        }

        // Encontrar todos los puntos factibles
        const puntosFactibles = encontrarPuntosFactiblesGrafico(restricciones);
        console.log('Puntos factibles encontrados:', puntosFactibles);
        
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

        console.log('Mejor punto:', mejorPunto, 'Valor:', mejorValor);

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
        console.error('Error en resolverGrafico:', error);
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

// ===================== FUNCIONES AUXILIARES PARA EL MÉTODO GRÁFICO ====================== //

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

// ===================== FUNCIÓN DIBUJAR GRÁFICO MEJORADA ====================== //

function dibujarGrafico(resultado, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Contenedor no encontrado:', containerId);
        return;
    }
    
    console.log('Dibujando gráfico...');
    
    // Limpiar contenedor primero
    container.innerHTML = '';
    
    const ancho = 700;
    const alto = 500;
    const margen = 80;
    
    // Encontrar los límites del gráfico con márgenes adecuados
    const todosPuntos = [...resultado.puntosFactibles, ...resultado.regionFactible];
    const todosX = todosPuntos.map(p => p[0]);
    const todosY = todosPuntos.map(p => p[1]);
    
    // Calcular límites con márgenes
    const maxX = Math.max(...todosX, 1) * 1.2;
    const maxY = Math.max(...todosY, 1) * 1.2;
    
    // Escalas
    const escalaX = (ancho - 2 * margen) / maxX;
    const escalaY = (alto - 2 * margen) / maxY;
    
    // Crear SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", ancho);
    svg.setAttribute("height", alto);
    svg.setAttribute("class", "grafico-svg");
    svg.setAttribute("style", "background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);");
    
    // Definir marcadores de flecha
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Flecha para restricciones
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
    
    // Flecha para función objetivo
    const markerObjetivo = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerObjetivo.setAttribute("id", "arrowhead-objetivo");
    markerObjetivo.setAttribute("markerWidth", "12");
    markerObjetivo.setAttribute("markerHeight", "8");
    markerObjetivo.setAttribute("refX", "10");
    markerObjetivo.setAttribute("refY", "4");
    markerObjetivo.setAttribute("orient", "auto");
    const polygonObjetivo = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygonObjetivo.setAttribute("points", "0 0, 12 4, 0 8");
    polygonObjetivo.setAttribute("fill", "#dc3545");
    markerObjetivo.appendChild(polygonObjetivo);
    defs.appendChild(markerObjetivo);
    
    // Patrón para región factible
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "region-pattern");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "20");
    pattern.setAttribute("height", "20");
    pattern.setAttribute("patternTransform", "rotate(45)");
    const rectPattern = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectPattern.setAttribute("width", "20");
    rectPattern.setAttribute("height", "20");
    rectPattern.setAttribute("fill", "rgba(13, 110, 253, 0.1)");
    pattern.appendChild(rectPattern);
    const linePattern = document.createElementNS("http://www.w3.org/2000/svg", "line");
    linePattern.setAttribute("x1", "0");
    linePattern.setAttribute("y1", "0");
    linePattern.setAttribute("x2", "0");
    linePattern.setAttribute("y2", "20");
    linePattern.setAttribute("stroke", "rgba(13, 110, 253, 0.3)");
    linePattern.setAttribute("stroke-width", "1");
    pattern.appendChild(linePattern);
    defs.appendChild(pattern);
    
    svg.appendChild(defs);
    
    // Dibujar componentes en orden correcto
    dibujarEjesMejorados(svg, ancho, alto, margen, maxX, maxY, escalaX, escalaY);
    
    // Región factible primero (fondo)
    if (resultado.regionFactible.length >= 3) {
        dibujarRegionFactibleMejorada(svg, resultado.regionFactible, margen, escalaX, escalaY, alto);
    }
    
    // Restricciones
    resultado.restricciones.forEach((restriccion, index) => {
        dibujarRestriccionMejorada(svg, restriccion, margen, escalaX, escalaY, alto, maxX, maxY, index);
    });
    
    // Función objetivo
    dibujarFuncionObjetivoMejorada(svg, resultado.objetivo, resultado.valorOptimo, margen, escalaX, escalaY, alto, maxX, maxY, resultado.tipoOptimizacion);
    
    // Puntos factibles
    resultado.puntosFactibles.forEach(punto => {
        dibujarPuntoMejorado(svg, punto, margen, escalaX, escalaY, alto, false, false);
    });
    
    // Punto óptimo (último para que quede encima)
    dibujarPuntoMejorado(svg, resultado.variables, margen, escalaX, escalaY, alto, true, false);
    
    // Leyenda
    dibujarLeyenda(svg, ancho, alto, margen);
    
    container.appendChild(svg);
    console.log('Gráfico dibujado exitosamente');
}

// ===================== FUNCIONES AUXILIARES MEJORADAS ====================== //

function dibujarEjesMejorados(svg, ancho, alto, margen, maxX, maxY, escalaX, escalaY) {
    // Cuadrícula de fondo
    for (let x = 0; x <= maxX; x += Math.ceil(maxX / 10)) {
        const lineaGridX = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineaGridX.setAttribute("x1", margen + x * escalaX);
        lineaGridX.setAttribute("y1", margen);
        lineaGridX.setAttribute("x2", margen + x * escalaX);
        lineaGridX.setAttribute("y2", alto - margen);
        lineaGridX.setAttribute("stroke", "rgba(0,0,0,0.1)");
        lineaGridX.setAttribute("stroke-width", "1");
        lineaGridX.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(lineaGridX);
    }
    
    for (let y = 0; y <= maxY; y += Math.ceil(maxY / 10)) {
        const lineaGridY = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineaGridY.setAttribute("x1", margen);
        lineaGridY.setAttribute("y1", alto - margen - y * escalaY);
        lineaGridY.setAttribute("x2", ancho - margen);
        lineaGridY.setAttribute("y2", alto - margen - y * escalaY);
        lineaGridY.setAttribute("stroke", "rgba(0,0,0,0.1)");
        lineaGridY.setAttribute("stroke-width", "1");
        lineaGridY.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(lineaGridY);
    }
    
    // Eje X
    const ejeX = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ejeX.setAttribute("x1", margen);
    ejeX.setAttribute("y1", alto - margen);
    ejeX.setAttribute("x2", ancho - margen);
    ejeX.setAttribute("y2", alto - margen);
    ejeX.setAttribute("stroke", "#333");
    ejeX.setAttribute("stroke-width", "3");
    svg.appendChild(ejeX);
    
    // Eje Y
    const ejeY = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ejeY.setAttribute("x1", margen);
    ejeY.setAttribute("y1", margen);
    ejeY.setAttribute("x2", margen);
    ejeY.setAttribute("y2", alto - margen);
    ejeY.setAttribute("stroke", "#333");
    ejeY.setAttribute("stroke-width", "3");
    svg.appendChild(ejeY);
    
    // Flechas de ejes
    const flechaX = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    flechaX.setAttribute("points", `${ancho - margen},${alto - margen} ${ancho - margen - 10},${alto - margen - 5} ${ancho - margen - 10},${alto - margen + 5}`);
    flechaX.setAttribute("fill", "#333");
    svg.appendChild(flechaX);
    
    const flechaY = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    flechaY.setAttribute("points", `${margen},${margen} ${margen - 5},${margen + 10} ${margen + 5},${margen + 10}`);
    flechaY.setAttribute("fill", "#333");
    svg.appendChild(flechaY);
    
    // Marcas y etiquetas en eje X
    for (let x = 0; x <= maxX; x += Math.max(1, Math.ceil(maxX / 8))) {
        const xPixel = margen + x * escalaX;
        const marca = document.createElementNS("http://www.w3.org/2000/svg", "line");
        marca.setAttribute("x1", xPixel);
        marca.setAttribute("y1", alto - margen - 8);
        marca.setAttribute("x2", xPixel);
        marca.setAttribute("y2", alto - margen + 8);
        marca.setAttribute("stroke", "#333");
        marca.setAttribute("stroke-width", "2");
        svg.appendChild(marca);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", xPixel);
        texto.setAttribute("y", alto - margen + 25);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("fill", "#333");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "11");
        texto.textContent = x;
        svg.appendChild(texto);
    }
    
    // Marcas y etiquetas en eje Y
    for (let y = 0; y <= maxY; y += Math.max(1, Math.ceil(maxY / 8))) {
        const yPixel = alto - margen - y * escalaY;
        const marca = document.createElementNS("http://www.w3.org/2000/svg", "line");
        marca.setAttribute("x1", margen - 8);
        marca.setAttribute("y1", yPixel);
        marca.setAttribute("x2", margen + 8);
        marca.setAttribute("y2", yPixel);
        marca.setAttribute("stroke", "#333");
        marca.setAttribute("stroke-width", "2");
        svg.appendChild(marca);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", margen - 15);
        texto.setAttribute("y", yPixel + 4);
        texto.setAttribute("text-anchor", "end");
        texto.setAttribute("fill", "#333");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "11");
        texto.textContent = y;
        svg.appendChild(texto);
    }
    
    // Etiquetas de ejes
    const etiquetaX = document.createElementNS("http://www.w3.org/2000/svg", "text");
    etiquetaX.setAttribute("x", ancho - margen + 20);
    etiquetaX.setAttribute("y", alto - margen - 10);
    etiquetaX.setAttribute("fill", "#333");
    etiquetaX.setAttribute("font-weight", "bold");
    etiquetaX.setAttribute("font-size", "14");
    etiquetaX.textContent = "x₁";
    svg.appendChild(etiquetaX);
    
    const etiquetaY = document.createElementNS("http://www.w3.org/2000/svg", "text");
    etiquetaY.setAttribute("x", margen - 20);
    etiquetaY.setAttribute("y", margen - 15);
    etiquetaY.setAttribute("fill", "#333");
    etiquetaY.setAttribute("font-weight", "bold");
    etiquetaY.setAttribute("font-size", "14");
    etiquetaY.textContent = "x₂";
    svg.appendChild(etiquetaY);
}

function dibujarRegionFactibleMejorada(svg, region, margen, escalaX, escalaY, alto) {
    const puntosSVG = region.map(punto => 
        `${margen + punto[0] * escalaX},${alto - margen - punto[1] * escalaY}`
    ).join(" ");
    
    const poligono = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poligono.setAttribute("points", puntosSVG);
    poligono.setAttribute("fill", "url(#region-pattern)");
    poligono.setAttribute("stroke", "#0d6efd");
    poligono.setAttribute("stroke-width", "2");
    poligono.setAttribute("stroke-dasharray", "4,2");
    svg.appendChild(poligono);
}

function dibujarRestriccionMejorada(svg, restriccion, margen, escalaX, escalaY, alto, maxX, maxY, index) {
    const colores = ["#dc3545", "#198754", "#ffc107", "#6f42c1", "#fd7e14", "#20c997"];
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
    linea.setAttribute("stroke-width", "3");
    linea.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(linea);
    
    // Etiqueta de la restricción con fondo para mejor legibilidad
    const grupoTexto = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const fondoTexto = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const textoX = margen + (punto1[0] + punto2[0]) / 2 * escalaX + 5;
    const textoY = alto - margen - (punto1[1] + punto2[1]) / 2 * escalaY - 15;
    fondoTexto.setAttribute("x", textoX - 5);
    fondoTexto.setAttribute("y", textoY - 12);
    fondoTexto.setAttribute("width", "120");
    fondoTexto.setAttribute("height", "20");
    fondoTexto.setAttribute("fill", "white");
    fondoTexto.setAttribute("stroke", color);
    fondoTexto.setAttribute("stroke-width", "1");
    fondoTexto.setAttribute("rx", "3");
    grupoTexto.appendChild(fondoTexto);
    
    const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texto.setAttribute("x", textoX);
    texto.setAttribute("y", textoY);
    texto.setAttribute("fill", color);
    texto.setAttribute("font-weight", "bold");
    texto.setAttribute("font-size", "10");
    texto.textContent = `R${index + 1}: ${restriccion.coeficientes[0]}x₁ + ${restriccion.coeficientes[1]}x₂ ${restriccion.tipo} ${restriccion.valor}`;
    grupoTexto.appendChild(texto);
    
    svg.appendChild(grupoTexto);
}

function dibujarPuntoMejorado(svg, punto, margen, escalaX, escalaY, alto, esOptimo, esIntercepcion) {
    const xPixel = margen + punto[0] * escalaX;
    const yPixel = alto - margen - punto[1] * escalaY;
    
    const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circulo.setAttribute("cx", xPixel);
    circulo.setAttribute("cy", yPixel);
    circulo.setAttribute("r", esOptimo ? "8" : "5");
    circulo.setAttribute("fill", esOptimo ? "#dc3545" : (esIntercepcion ? "#20c997" : "#6f42c1"));
    circulo.setAttribute("stroke", esOptimo ? "#a71e2a" : (esIntercepcion ? "#0ca678" : "#5a3598"));
    circulo.setAttribute("stroke-width", esOptimo ? "3" : "2");
    circulo.setAttribute("filter", esOptimo ? "drop-shadow(0 2px 4px rgba(220, 53, 69, 0.5))" : "none");
    svg.appendChild(circulo);
    
    if (esOptimo) {
        const grupoTexto = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        const fondo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        fondo.setAttribute("x", xPixel + 12);
        fondo.setAttribute("y", yPixel - 25);
        fondo.setAttribute("width", "140");
        fondo.setAttribute("height", "20");
        fondo.setAttribute("fill", "#dc3545");
        fondo.setAttribute("rx", "10");
        fondo.setAttribute("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        grupoTexto.appendChild(fondo);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", xPixel + 20);
        texto.setAttribute("y", yPixel - 10);
        texto.setAttribute("fill", "white");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "11");
        texto.textContent = `Óptimo: (${punto[0].toFixed(2)}, ${punto[1].toFixed(2)})`;
        grupoTexto.appendChild(texto);
        
        svg.appendChild(grupoTexto);
    }
}

function dibujarFuncionObjetivoMejorada(svg, objetivo, valorOptimo, margen, escalaX, escalaY, alto, maxX, maxY, tipoOptimizacion) {
    if (Math.abs(objetivo[1]) > 1e-8) {
        const punto1 = [0, valorOptimo / objetivo[1]];
        const punto2 = [maxX, (valorOptimo - objetivo[0] * maxX) / objetivo[1]];
        
        const y1 = Math.min(punto1[1], maxY);
        const y2 = Math.min(punto2[1], maxY);
        
        const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", margen + 0 * escalaX);
        linea.setAttribute("y1", alto - margen - y1 * escalaY);
        linea.setAttribute("x2", margen + maxX * escalaX);
        linea.setAttribute("y2", alto - margen - y2 * escalaY);
        linea.setAttribute("stroke", "#fd7e14");
        linea.setAttribute("stroke-width", "4");
        linea.setAttribute("stroke-dasharray", "10,6");
        linea.setAttribute("marker-end", "url(#arrowhead-objetivo)");
        linea.setAttribute("filter", "drop-shadow(0 2px 3px rgba(253, 126, 20, 0.3))");
        svg.appendChild(linea);
        
        // Etiqueta con fondo
        const grupoTexto = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        const fondo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const textoX = margen + (maxX / 2) * escalaX - 60;
        const textoY = alto - margen - ((y1 + y2) / 2) * escalaY - 25;
        fondo.setAttribute("x", textoX - 5);
        fondo.setAttribute("y", textoY - 12);
        fondo.setAttribute("width", "130");
        fondo.setAttribute("height", "20");
        fondo.setAttribute("fill", "#fd7e14");
        fondo.setAttribute("rx", "10");
        grupoTexto.appendChild(fondo);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", textoX);
        texto.setAttribute("y", textoY);
        texto.setAttribute("fill", "white");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "10");
        texto.textContent = `Z = ${objetivo[0]}x₁ + ${objetivo[1]}x₂ (${tipoOptimizacion})`;
        grupoTexto.appendChild(texto);
        
        svg.appendChild(grupoTexto);
    }
}

function dibujarLeyenda(svg, ancho, alto, margen) {
    const leyenda = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const fondo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    fondo.setAttribute("x", ancho - 180);
    fondo.setAttribute("y", margen - 40);
    fondo.setAttribute("width", "160");
    fondo.setAttribute("height", "120");
    fondo.setAttribute("fill", "white");
    fondo.setAttribute("stroke", "#ddd");
    fondo.setAttribute("stroke-width", "1");
    fondo.setAttribute("rx", "8");
    fondo.setAttribute("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
    leyenda.appendChild(fondo);
    
    const titulo = document.createElementNS("http://www.w3.org/2000/svg", "text");
    titulo.setAttribute("x", ancho - 100);
    titulo.setAttribute("y", margen - 20);
    titulo.setAttribute("text-anchor", "middle");
    titulo.setAttribute("fill", "#333");
    titulo.setAttribute("font-weight", "bold");
    titulo.setAttribute("font-size", "12");
    titulo.textContent = "LEYENDA";
    leyenda.appendChild(titulo);
    
    // Elementos de la leyenda
    const elementos = [
        { color: "#fd7e14", texto: "Función Objetivo" },
        { color: "#0d6efd", texto: "Región Factible" },
        { color: "#dc3545", texto: "Punto Óptimo" },
        { color: "#6f42c1", texto: "Puntos Factibles" }
    ];
    
    elementos.forEach((elemento, index) => {
        const yPos = margen + index * 25;
        
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        circulo.setAttribute("x", ancho - 170);
        circulo.setAttribute("y", yPos - 8);
        circulo.setAttribute("width", "12");
        circulo.setAttribute("height", "12");
        circulo.setAttribute("fill", elemento.color);
        circulo.setAttribute("rx", "2");
        leyenda.appendChild(circulo);
        
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", ancho - 150);
        texto.setAttribute("y", yPos);
        texto.setAttribute("fill", "#333");
        texto.setAttribute("font-size", "10");
        texto.setAttribute("dominant-baseline", "middle");
        texto.textContent = elemento.texto;
        leyenda.appendChild(texto);
    });
    
    svg.appendChild(leyenda);
}