// ===================== MÉTODO CPM (RUTA CRÍTICA) - FORMATO ESTÁNDAR ====================== //

function resolverCPM(actividades) {
    try {
        // Validar actividades
        if (!actividades || actividades.length === 0) {
            throw new Error("Debe haber al menos una actividad");
        }

        // Asignar IDs numéricos a las actividades
        const actividadesConId = actividades.map((act, index) => ({
            ...act,
            id: index + 1,
            predecesores: act.predecesor ? act.predecesor.split(',').map(p => p.trim()).filter(p => p !== '') : []
        }));

        // Crear nodos (eventos) basados en las actividades
        const eventos = new Set();
        actividadesConId.forEach(act => {
            eventos.add(`Inicio-${act.id}`);
            eventos.add(`Fin-${act.id}`);
        });

        // Agregar evento inicial y final
        eventos.add('Inicio');
        eventos.add('Fin');

        const listaEventos = Array.from(eventos);
        const n = listaEventos.length;
        const indices = {};
        listaEventos.forEach((evento, idx) => indices[evento] = idx);

        // Crear matriz de adyacencia
        const grafo = Array(n).fill().map(() => Array(n).fill(null));

        // Conectar actividades
        actividadesConId.forEach(act => {
            const inicioAct = `Inicio-${act.id}`;
            const finAct = `Fin-${act.id}`;
            
            // Conectar inicio y fin de la actividad
            grafo[indices[inicioAct]][indices[finAct]] = {
                actividad: act.nombre,
                duracion: act.duracion,
                tipo: 'actividad'
            };

            // Conectar predecesores
            if (act.predecesores.length === 0) {
                // Si no tiene predecesores, conectar desde el evento inicial
                grafo[indices['Inicio']][indices[inicioAct]] = {
                    actividad: '',
                    duracion: 0,
                    tipo: 'dummy'
                };
            } else {
                // Conectar desde el fin de cada predecesor al inicio de esta actividad
                act.predecesores.forEach(predecesor => {
                    const actPredecesora = actividadesConId.find(a => a.nombre === predecesor);
                    if (actPredecesora) {
                        grafo[indices[`Fin-${actPredecesora.id}`]][indices[inicioAct]] = {
                            actividad: '',
                            duracion: 0,
                            tipo: 'dummy'
                        };
                    }
                });
            }
        });

        // Conectar actividades sin sucesores al evento final
        actividadesConId.forEach(act => {
            const esUltima = !actividadesConId.some(a => 
                a.predecesores.includes(act.nombre)
            );
            if (esUltima) {
                grafo[indices[`Fin-${act.id}`]][indices['Fin']] = {
                    actividad: '',
                    duracion: 0,
                    tipo: 'dummy'
                };
            }
        });

        // Calcular tiempos más tempranos (Forward Pass)
        const tiempoTemprano = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (grafo[i][j] !== null) {
                    const nuevoTiempo = tiempoTemprano[i] + grafo[i][j].duracion;
                    if (nuevoTiempo > tiempoTemprano[j]) {
                        tiempoTemprano[j] = nuevoTiempo;
                    }
                }
            }
        }

        const duracionTotal = tiempoTemprano[indices['Fin']];

        // Calcular tiempos más tardíos (Backward Pass)
        const tiempoTardio = Array(n).fill(duracionTotal);
        for (let i = n - 1; i >= 0; i--) {
            for (let j = 0; j < n; j++) {
                if (grafo[i][j] !== null) {
                    const posibleTiempo = tiempoTardio[j] - grafo[i][j].duracion;
                    if (posibleTiempo < tiempoTardio[i]) {
                        tiempoTardio[i] = posibleTiempo;
                    }
                }
            }
        }

        // Calcular holguras y identificar ruta crítica
        const actividadesConHolgura = [];
        const rutaCritica = [];

        actividadesConId.forEach(act => {
            const inicioEvento = `Inicio-${act.id}`;
            const finEvento = `Fin-${act.id}`;
            const i = indices[inicioEvento];
            const j = indices[finEvento];
            
            const holgura = tiempoTardio[j] - tiempoTemprano[i] - act.duracion;
            const esCritica = holgura === 0;

            const actividadInfo = {
                id: act.id,
                nombre: act.nombre,
                duracion: act.duracion,
                predecesor: act.predecesor || 'Ninguno',
                tiempoTempranoInicio: tiempoTemprano[i],
                tiempoTempranoFin: tiempoTemprano[j],
                tiempoTardioInicio: tiempoTardio[i],
                tiempoTardioFin: tiempoTardio[j],
                holgura: holgura,
                esCritica: esCritica
            };
            
            actividadesConHolgura.push(actividadInfo);
            
            if (esCritica) {
                rutaCritica.push(actividadInfo);
            }
        });

        // Ordenar ruta crítica por tiempo temprano de inicio
        rutaCritica.sort((a, b) => a.tiempoTempranoInicio - b.tiempoTempranoInicio);

        return {
            exito: true,
            duracionTotal: duracionTotal,
            actividades: actividadesConHolgura,
            rutaCritica: rutaCritica,
            eventos: listaEventos.map((evento, idx) => ({
                nombre: evento,
                tiempoTemprano: tiempoTemprano[idx],
                tiempoTardio: tiempoTardio[idx]
            })),
            mensaje: `Proyecto completado en ${duracionTotal} unidades de tiempo`
        };

    } catch (error) {
        return {
            exito: false,
            duracionTotal: 0,
            actividades: [],
            rutaCritica: [],
            eventos: [],
            mensaje: "Error: " + error.message
        };
    }
}

function generarGrafoCPM(resultado) {
    if (!resultado.exito) return '<p>No se puede generar el grafo</p>';
    
    const ancho = 800;
    const alto = 500;
    const radioNodo = 25;
    const margen = 80;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", ancho);
    svg.setAttribute("height", alto);
    svg.setAttribute("class", "grafo-cpm");
    
    // Fondo
    const fondo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    fondo.setAttribute("width", ancho);
    fondo.setAttribute("height", alto);
    fondo.setAttribute("fill", "#f8f9fa");
    svg.appendChild(fondo);
    
    // Calcular posiciones de nodos (eventos)
    const eventosActividades = resultado.eventos.filter(e => e.nombre.includes('Inicio-') || e.nombre.includes('Fin-'));
    const eventosEspeciales = resultado.eventos.filter(e => e.nombre === 'Inicio' || e.nombre === 'Fin');
    
    const posiciones = {};
    const espacioHorizontal = (ancho - 2 * margen) / (eventosActividades.length > 1 ? eventosActividades.length - 1 : 1);
    
    eventosActividades.forEach((evento, index) => {
        posiciones[evento.nombre] = {
            x: margen + index * espacioHorizontal,
            y: alto / 2 - 50
        };
    });
    
    // Posiciones para eventos especiales
    posiciones['Inicio'] = { x: margen, y: alto / 2 + 50 };
    posiciones['Fin'] = { x: ancho - margen, y: alto / 2 + 50 };
    
    // Definir marcador de flecha
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
    svg.appendChild(defs);
    
    // Dibujar actividades
    resultado.actividades.forEach(act => {
        const inicioEvento = `Inicio-${act.id}`;
        const finEvento = `Fin-${act.id}`;
        const inicio = posiciones[inicioEvento];
        const fin = posiciones[finEvento];
        
        if (inicio && fin) {
            // Línea de la actividad
            const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
            linea.setAttribute("x1", inicio.x);
            linea.setAttribute("y1", inicio.y);
            linea.setAttribute("x2", fin.x);
            linea.setAttribute("y2", fin.y);
            linea.setAttribute("stroke", act.esCritica ? "#dc3545" : "#6f42c1");
            linea.setAttribute("stroke-width", act.esCritica ? "3" : "2");
            linea.setAttribute("marker-end", "url(#arrowhead)");
            svg.appendChild(linea);
            
            // Texto de la actividad
            const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const midX = (inicio.x + fin.x) / 2;
            const midY = (inicio.y + fin.y) / 2 - 10;
            texto.setAttribute("x", midX);
            texto.setAttribute("y", midY);
            texto.setAttribute("text-anchor", "middle");
            texto.setAttribute("fill", act.esCritica ? "#dc3545" : "#6f42c1");
            texto.setAttribute("font-weight", "bold");
            texto.textContent = `${act.nombre} (${act.duracion})`;
            svg.appendChild(texto);
            
            // Texto de holgura
            if (!act.esCritica) {
                const textoHolgura = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textoHolgura.setAttribute("x", midX);
                textoHolgura.setAttribute("y", midY + 15);
                textoHolgura.setAttribute("text-anchor", "middle");
                textoHolgura.setAttribute("fill", "#6c757d");
                textoHolgura.setAttribute("font-size", "10");
                textoHolgura.textContent = `H: ${act.holgura}`;
                svg.appendChild(textoHolgura);
            }
        }
    });
    
    // Dibujar nodos (eventos)
    resultado.eventos.forEach(evento => {
        const pos = posiciones[evento.nombre];
        if (pos) {
            // Círculo del nodo
            const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circulo.setAttribute("cx", pos.x);
            circulo.setAttribute("cy", pos.y);
            circulo.setAttribute("r", radioNodo);
            circulo.setAttribute("fill", "#fff");
            circulo.setAttribute("stroke", evento.nombre === 'Inicio' || evento.nombre === 'Fin' ? "#20c997" : "#1e90ff");
            circulo.setAttribute("stroke-width", "3");
            svg.appendChild(circulo);
            
            // Nombre del evento
            const textoNombre = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoNombre.setAttribute("x", pos.x);
            textoNombre.setAttribute("y", pos.y - radioNodo - 5);
            textoNombre.setAttribute("text-anchor", "middle");
            textoNombre.setAttribute("fill", evento.nombre === 'Inicio' || evento.nombre === 'Fin' ? "#20c997" : "#1e90ff");
            textoNombre.setAttribute("font-weight", "bold");
            textoNombre.setAttribute("font-size", "12");
            
            let nombreMostrar = evento.nombre;
            if (evento.nombre === 'Inicio') nombreMostrar = 'Inicio';
            else if (evento.nombre === 'Fin') nombreMostrar = 'Fin';
            else if (evento.nombre.includes('Inicio-')) nombreMostrar = `I${evento.nombre.split('-')[1]}`;
            else if (evento.nombre.includes('Fin-')) nombreMostrar = `F${evento.nombre.split('-')[1]}`;
            
            textoNombre.textContent = nombreMostrar;
            svg.appendChild(textoNombre);
            
            // Tiempos del evento
            const textoTiempos = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoTiempos.setAttribute("x", pos.x);
            textoTiempos.setAttribute("y", pos.y + 4);
            textoTiempos.setAttribute("text-anchor", "middle");
            textoTiempos.setAttribute("fill", "#666");
            textoTiempos.setAttribute("font-size", "10");
            textoTiempos.textContent = `[${evento.tiempoTemprano},${evento.tiempoTardio}]`;
            svg.appendChild(textoTiempos);
        }
    });
    
    return svg.outerHTML;
}