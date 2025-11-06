// ===================== MÉTODO PRINCIPAL ====================== //

document.addEventListener("DOMContentLoaded", () => {
  const metodoSelect = document.getElementById("metodo");
  const resultadoBox = document.getElementById("resultado-box");
  const transporteBox = document.getElementById("transporte-box");
  const simplexBox = document.getElementById("simplex-box");
  const graficoBox = document.getElementById("grafico-box");
  const asignacionBox = document.getElementById("asignacion-box");
  const cpmBox = document.getElementById("cpm-box");

  // Detecta cambio de método
  metodoSelect.addEventListener("change", () => {
    const metodo = metodoSelect.value;
    resultadoBox.innerHTML = "<p>Selecciona un método y completa los datos.</p>";
    transporteBox.innerHTML = "";
    simplexBox.innerHTML = "";
    graficoBox.innerHTML = "";
    asignacionBox.innerHTML = "";
    cpmBox.innerHTML = "";

    if (metodo === "transporte") {
      mostrarInterfazTransporte();
    } else if (metodo === "simplex") {
      mostrarInterfazSimplex();
    } else if (metodo === "grafico") {
      mostrarInterfazGrafico();
    } else if (metodo === "asignacion") {
      mostrarInterfazAsignacion();
    } else if (metodo === "cpm") {
      mostrarInterfazCPM();
    } else {
      resultadoBox.innerHTML = "<p>Selecciona un método de optimización.</p>";
    }
  });

  // ===================== INTERFAZ SIMPLEX ====================== //
  function mostrarInterfazSimplex() {
    simplexBox.innerHTML = `
      <div class="metodo-container">
        <h3>📈 Método Simplex</h3>
        <div class="simplex-inputs">
          <div class="input-group">
            <label for="tipo-optimizacion">Tipo de optimización:</label>
            <select id="tipo-optimizacion">
              <option value="maximizar">Maximizar</option>
              <option value="minimizar">Minimizar</option>
            </select>
          </div>

          <div class="input-group">
            <label for="num-variables">Número de variables:</label>
            <input type="number" id="num-variables" min="2" max="4" value="2">
          </div>

          <div class="input-group">
            <label for="num-restricciones">Número de restricciones:</label>
            <input type="number" id="num-restricciones" min="1" max="6" value="2">
          </div>

          <button type="button" id="generar-campos-simplex">Generar Campos</button>
        </div>

        <div id="simplex-campos" style="margin-top: 20px;"></div>
        <button type="button" id="calcular-simplex" style="margin-top: 15px;">🚀 Calcular Simplex</button>
      </div>
    `;

    // Generar campos iniciales
    setTimeout(() => {
      generarCamposSimplex();
    }, 100);

    // Event listeners
    document.getElementById("generar-campos-simplex").addEventListener("click", generarCamposSimplex);
    document.getElementById("calcular-simplex").addEventListener("click", calcularSimplex);
  }

  function generarCamposSimplex() {
    const numVariables = parseInt(document.getElementById("num-variables").value);
    const numRestricciones = parseInt(document.getElementById("num-restricciones").value);

    let html = '<div class="simplex-form">';

    // Función objetivo
    html += '<div class="funcion-objetivo">';
    html += '<h4>Función Objetivo</h4>';
    html += '<div class="coeficientes">';
    html += '<span>Z = </span>';
    for (let i = 0; i < numVariables; i++) {
      html += `
        <div class="coeficiente-input">
          <input type="number" id="coef-x${i+1}" placeholder="0" step="any" value="${i === 0 ? 3 : 2}">
          <span>x${i+1}</span>
          ${i < numVariables - 1 ? '<span>+</span>' : ''}
        </div>
      `;
    }
    html += '</div></div>';

    // Restricciones
    html += '<div class="restricciones">';
    html += '<h4>Restricciones</h4>';
    for (let r = 0; r < numRestricciones; r++) {
      html += `<div class="restriccion">`;
      for (let i = 0; i < numVariables; i++) {
        html += `
          <div class="coeficiente-input">
            <input type="number" id="rest-${r}-x${i+1}" placeholder="0" step="any" value="${r === 0 ? (i === 0 ? 1 : 1) : (i === 0 ? 2 : 1)}">
            <span>x${i+1}</span>
            ${i < numVariables - 1 ? '<span>+</span>' : ''}
          </div>
        `;
      }
      html += `
        <select id="rest-${r}-tipo">
          <option value="<=" ${r < 2 ? 'selected' : ''}>≤</option>
          <option value="=">=</option>
          <option value=">=">≥</option>
        </select>
        <input type="number" id="rest-${r}-valor" placeholder="0" step="any" value="${r === 0 ? 4 : 5}">
      </div>`;
    }
    html += '</div>';

    // No negatividad
    html += '<div class="no-negatividad">';
    html += '<h4>Condiciones de no negatividad</h4>';
    html += '<div class="variables">';
    for (let i = 0; i < numVariables; i++) {
      html += `<span>x${i+1} ≥ 0</span>${i < numVariables - 1 ? ', ' : ''}`;
    }
    html += '</div></div>';

    html += '</div>';
    document.getElementById("simplex-campos").innerHTML = html;
  }

  function calcularSimplex() {
    const tipoOptimizacion = document.getElementById("tipo-optimizacion").value;
    const numVariables = parseInt(document.getElementById("num-variables").value);
    const numRestricciones = parseInt(document.getElementById("num-restricciones").value);

    // Obtener coeficientes de la función objetivo
    const objetivo = [];
    for (let i = 0; i < numVariables; i++) {
      const input = document.getElementById(`coef-x${i+1}`);
      const valor = input ? parseFloat(input.value) || 0 : 0;
      objetivo.push(valor);
    }

    // Obtener restricciones
    const restricciones = [];
    for (let r = 0; r < numRestricciones; r++) {
      const restriccion = {
        coeficientes: [],
        tipo: document.getElementById(`rest-${r}-tipo`).value,
        valor: parseFloat(document.getElementById(`rest-${r}-valor`).value) || 0
      };

      for (let i = 0; i < numVariables; i++) {
        const input = document.getElementById(`rest-${r}-x${i+1}`);
        const valor = input ? parseFloat(input.value) || 0 : 0;
        restriccion.coeficientes.push(valor);
      }
      restricciones.push(restriccion);
    }

    try {
      const resultado = resolverSimplex(objetivo, restricciones, tipoOptimizacion);
      mostrarResultadoSimplex(resultado);
    } catch (error) {
      resultadoBox.innerHTML = `<div class="error"><p>❌ Error: ${error.message}</p></div>`;
    }
  }

  function mostrarResultadoSimplex(resultado) {
    let html = `<div class="resultado-simplex">
      <h3>📊 Resultado del Método Simplex</h3>`;
    
    if (resultado.solucionOptima) {
      html += `<div class="solucion-optima">
        <p><strong>✅ Solución Óptima Encontrada</strong></p>
        <p><strong>Valor Óptimo:</strong> Z = ${resultado.valorOptimo.toFixed(4)}</p>
        <p><strong>Variables:</strong></p>
        <ul>`;
      
      resultado.variables.forEach((valor, index) => {
        html += `<li>x${index + 1} = ${valor.toFixed(4)}</li>`;
      });
      
      html += `</ul>`;
      
      if (resultado.mensaje) {
        html += `<p><em>${resultado.mensaje}</em></p>`;
      }
      
      html += `</div>`;
    } else {
      html += `<div class="no-solucion">
        <p><strong>❌ No se encontró solución óptima</strong></p>
        <p>${resultado.mensaje || "El problema puede ser no factible o no acotado"}</p>
      </div>`;
    }

    html += `</div>`;
    resultadoBox.innerHTML = html;
  }

  // ===================== INTERFAZ GRÁFICO ====================== //
  function mostrarInterfazGrafico() {
    graficoBox.innerHTML = `
      <div class="metodo-container">
        <h3>📊 Método Gráfico</h3>
        <p class="advertencia">⚠️ Solo funciona con 2 variables (x₁ y x₂)</p>
        
        <div class="grafico-inputs">
          <div class="input-group">
            <label for="tipo-optimizacion-grafico">Tipo de optimización:</label>
            <select id="tipo-optimizacion-grafico">
              <option value="maximizar">Maximizar</option>
              <option value="minimizar">Minimizar</option>
            </select>
          </div>

          <div class="input-group">
            <label for="num-restricciones-grafico">Número de restricciones:</label>
            <input type="number" id="num-restricciones-grafico" min="1" max="6" value="2">
          </div>

          <button type="button" id="generar-campos-grafico">Generar Campos</button>
        </div>

        <div id="grafico-campos" style="margin-top: 20px;"></div>
        <button type="button" id="calcular-grafico" style="margin-top: 15px;">🚀 Calcular y Graficar</button>
      </div>
    `;

    // Generar campos iniciales
    setTimeout(() => {
      generarCamposGrafico();
    }, 100);

    // Event listeners
    document.getElementById("generar-campos-grafico").addEventListener("click", generarCamposGrafico);
    document.getElementById("calcular-grafico").addEventListener("click", calcularGrafico);
  }

  function generarCamposGrafico() {
    const numRestricciones = parseInt(document.getElementById("num-restricciones-grafico").value);

    let html = '<div class="grafico-form">';

    // Función objetivo (siempre 2 variables)
    html += '<div class="funcion-objetivo">';
    html += '<h4>Función Objetivo</h4>';
    html += '<div class="coeficientes">';
    html += '<span>Z = </span>';
    html += `
      <div class="coeficiente-input">
        <input type="number" id="coef-g-x1" placeholder="0" step="any" value="3">
        <span>x₁</span>
        <span>+</span>
      </div>
      <div class="coeficiente-input">
        <input type="number" id="coef-g-x2" placeholder="0" step="any" value="2">
        <span>x₂</span>
      </div>
    `;
    html += '</div></div>';

    // Restricciones
    html += '<div class="restricciones">';
    html += '<h4>Restricciones</h4>';
    for (let r = 0; r < numRestricciones; r++) {
      html += `<div class="restriccion">`;
      html += `
        <div class="coeficiente-input">
          <input type="number" id="rest-g-${r}-x1" placeholder="0" step="any" value="${r === 0 ? 1 : 2}">
          <span>x₁</span>
          <span>+</span>
        </div>
        <div class="coeficiente-input">
          <input type="number" id="rest-g-${r}-x2" placeholder="0" step="any" value="${r === 0 ? 1 : 1}">
          <span>x₂</span>
        </div>
      `;
      html += `
        <select id="rest-g-${r}-tipo">
          <option value="<=" ${r < 2 ? 'selected' : ''}>≤</option>
          <option value=">=">≥</option>
          <option value="=">=</option>
        </select>
        <input type="number" id="rest-g-${r}-valor" placeholder="0" step="any" value="${r === 0 ? 4 : 5}">
      </div>`;
    }
    html += '</div>';

    // No negatividad (siempre para 2 variables)
    html += '<div class="no-negatividad">';
    html += '<h4>Condiciones de no negatividad</h4>';
    html += '<div class="variables">';
    html += '<span>x₁ ≥ 0, x₂ ≥ 0</span>';
    html += '</div></div>';

    html += '</div>';
    document.getElementById("grafico-campos").innerHTML = html;
  }

  function calcularGrafico() {
    const tipoOptimizacion = document.getElementById("tipo-optimizacion-grafico").value;
    const numRestricciones = parseInt(document.getElementById("num-restricciones-grafico").value);

    // Obtener coeficientes de la función objetivo (siempre 2 variables)
    const objetivo = [
        parseFloat(document.getElementById("coef-g-x1").value) || 0,
        parseFloat(document.getElementById("coef-g-x2").value) || 0
    ];

    // Obtener restricciones
    const restricciones = [];
    for (let r = 0; r < numRestricciones; r++) {
      const restriccion = {
        coeficientes: [
            parseFloat(document.getElementById(`rest-g-${r}-x1`).value) || 0,
            parseFloat(document.getElementById(`rest-g-${r}-x2`).value) || 0
        ],
        tipo: document.getElementById(`rest-g-${r}-tipo`).value,
        valor: parseFloat(document.getElementById(`rest-g-${r}-valor`).value) || 0
      };
      restricciones.push(restriccion);
    }

    try {
        const resultado = resolverGrafico(objetivo, restricciones, tipoOptimizacion);
        mostrarResultadoGrafico(resultado);
    } catch (error) {
        resultadoBox.innerHTML = `<div class="error"><p>❌ Error: ${error.message}</p></div>`;
    }
  }

  function mostrarResultadoGrafico(resultado) {
    let html = `<div class="resultado-grafico">
      <h3>📊 Resultado del Método Gráfico</h3>`;
    
    if (resultado.solucionOptima) {
        html += `<div class="solucion-optima">
          <p><strong>✅ Solución Óptima Encontrada</strong></p>
          <p><strong>Valor Óptimo:</strong> Z = ${resultado.valorOptimo.toFixed(4)}</p>
          <p><strong>Variables:</strong> x₁ = ${resultado.variables[0].toFixed(4)}, x₂ = ${resultado.variables[1].toFixed(4)}</p>
        </div>`;
        
        // Gráfico
        html += `<div class="grafico-container">
          <h4>Representación Gráfica</h4>
          <div id="grafico-svg-container"></div>
        </div>`;
        
        // Puntos factibles evaluados
        html += `<div class="puntos-factibles">
          <h4>Puntos Factibles Evaluados</h4>
          <div class="tabla-puntos">
            <table>
              <tr><th>Punto</th><th>x₁</th><th>x₂</th><th>Valor Z</th></tr>`;
        
        resultado.valores.forEach((item, index) => {
            const esOptimo = item.punto[0] === resultado.variables[0] && item.punto[1] === resultado.variables[1];
            html += `<tr ${esOptimo ? 'class="fila-optima"' : ''}>
              <td>P${index + 1}</td>
              <td>${item.punto[0].toFixed(2)}</td>
              <td>${item.punto[1].toFixed(2)}</td>
              <td><strong>${item.valor.toFixed(2)}</strong></td>
            </tr>`;
        });
        
        html += `</table></div></div>`;
        
    } else {
        html += `<div class="no-solucion">
          <p><strong>❌ No se encontró solución óptima</strong></p>
          <p>${resultado.mensaje}</p>
        </div>`;
    }

    html += `</div>`;
    resultadoBox.innerHTML = html;
    
    // Dibujar el gráfico si hay solución
    if (resultado.solucionOptima) {
        setTimeout(() => {
            dibujarGrafico(resultado, "grafico-svg-container");
        }, 100);
    }
  }

  // ===================== INTERFAZ TRANSPORTE ====================== //
  function mostrarInterfazTransporte() {
    transporteBox.innerHTML = `
      <div class="metodo-container">
        <h3>🚚 Método de Transporte</h3>
        
        <div class="transporte-config">
          <div class="input-group">
            <label for="tipo-transporte">Selecciona método:</label>
            <select id="tipo-transporte">
              <option value="">-- Elegir --</option>
              <option value="esquina">Esquina Noroeste</option>
              <option value="costo">Costo Mínimo</option>
              <option value="vogel">Vogel</option>
            </select>
          </div>

          <div class="input-group">
            <label for="filas">Número de orígenes:</label>
            <input type="number" id="filas" min="1" max="6" value="3">
          </div>

          <div class="input-group">
            <label for="columnas">Número de destinos:</label>
            <input type="number" id="columnas" min="1" max="6" value="3">
          </div>

          <button type="button" id="crear-tabla-transporte">🧮 Crear tabla de costos</button>
        </div>

        <div id="tabla-container" style="margin-top: 20px;"></div>
        <button type="button" id="calcular-transporte">🚀 Calcular Transporte</button>
      </div>
    `;

    // Event listeners
    document.getElementById("crear-tabla-transporte").addEventListener("click", crearTablaTransporte);
    document.getElementById("calcular-transporte").addEventListener("click", calcularTransporte);

    // Crear tabla inicial
    setTimeout(() => {
      crearTablaTransporte();
    }, 100);
  }

  let tablaCostos, ofertaInputs, demandaInputs;

  function crearTablaTransporte() {
    const filas = parseInt(document.getElementById("filas").value);
    const columnas = parseInt(document.getElementById("columnas").value);

    if (filas < 1 || columnas < 1) {
      alert("Ingresa valores válidos.");
      return;
    }

    let html = `<div class="tabla-transporte">
      <table>
        <tr><th></th>`;
    
    for (let j = 0; j < columnas; j++) {
      html += `<th>Destino ${j + 1}</th>`;
    }
    html += `<th>Oferta</th></tr>`;

    for (let i = 0; i < filas; i++) {
      html += `<tr><th>Origen ${i + 1}</th>`;
      for (let j = 0; j < columnas; j++) {
        html += `<td><input type="number" min="0" class="costo" data-i="${i}" data-j="${j}" value="${Math.floor(Math.random() * 10) + 1}"></td>`;
      }
      html += `<td><input type="number" min="0" class="oferta" data-i="${i}" value="${Math.floor(Math.random() * 20) + 10}"></td></tr>`;
    }

    html += `<tr><th>Demanda</th>`;
    for (let j = 0; j < columnas; j++) {
      html += `<td><input type="number" min="0" class="demanda" data-j="${j}" value="${Math.floor(Math.random() * 15) + 5}"></td>`;
    }
    html += `<td></td></tr></table></div>`;

    document.getElementById("tabla-container").innerHTML = html;

    tablaCostos = document.querySelectorAll(".costo");
    ofertaInputs = document.querySelectorAll(".oferta");
    demandaInputs = document.querySelectorAll(".demanda");
  }

  function calcularTransporte() {
    const metodo = document.getElementById("tipo-transporte").value;
    if (!metodo) {
      resultadoBox.innerHTML = "<div class='error'><p>⚠️ Selecciona un método de transporte.</p></div>";
      return;
    }

    if (!tablaCostos || tablaCostos.length === 0) {
      resultadoBox.innerHTML = "<div class='error'><p>⚠️ Primero crea la tabla de costos.</p></div>";
      return;
    }

    const filas = parseInt(document.getElementById("filas").value);
    const columnas = parseInt(document.getElementById("columnas").value);

    const costos = Array.from({ length: filas }, () => Array(columnas).fill(0));
    tablaCostos.forEach(input => {
      const i = parseInt(input.dataset.i);
      const j = parseInt(input.dataset.j);
      costos[i][j] = parseFloat(input.value) || 0;
    });

    const oferta = Array.from(ofertaInputs).map(inp => parseFloat(inp.value) || 0);
    const demanda = Array.from(demandaInputs).map(inp => parseFloat(inp.value) || 0);

    try {
      const { asignacion, costoTotal } = resolverTransporte(metodo, costos, oferta, demanda);

      resultadoBox.innerHTML = `
        <div class="resultado-transporte">
          <h3>📊 Resultado del método ${metodo.toUpperCase()}</h3>
          <p><strong>Costo total:</strong> ${costoTotal}</p>
          ${mostrarTabla(asignacion, costos)}
        </div>
      `;
    } catch (error) {
      resultadoBox.innerHTML = `<div class="error"><p>❌ Error en transporte: ${error.message}</p></div>`;
    }
  }

  // ===================== INTERFAZ ASIGNACIÓN ====================== //
  function mostrarInterfazAsignacion() {
    asignacionBox.innerHTML = `
      <div class="metodo-container">
        <h3>👥 Método de Asignación</h3>
        <p class="info">Asigna personas a tareas de manera óptima (Método Húngaro)</p>
        
        <div class="asignacion-inputs">
          <div class="input-group">
            <label for="tipo-asignacion">Tipo de problema:</label>
            <select id="tipo-asignacion">
              <option value="minimizar">Minimizar Costo</option>
              <option value="maximizar">Maximizar Beneficio</option>
            </select>
          </div>

          <div class="input-group">
            <label for="tamano-matriz">Tamaño de la matriz (n x n):</label>
            <input type="number" id="tamano-matriz" min="2" max="8" value="3">
          </div>

          <button type="button" id="generar-matriz-asignacion">Generar Matriz de Costos</button>
        </div>

        <div id="matriz-container" style="margin-top: 20px;"></div>
        <button type="button" id="calcular-asignacion" style="margin-top: 15px;">🚀 Calcular Asignación Óptima</button>
      </div>
    `;

    // Generar matriz inicial
    setTimeout(() => {
      generarMatrizAsignacion();
    }, 100);

    // Event listeners
    document.getElementById("generar-matriz-asignacion").addEventListener("click", generarMatrizAsignacion);
    document.getElementById("calcular-asignacion").addEventListener("click", calcularAsignacion);
  }

  function generarMatrizAsignacion() {
    const n = parseInt(document.getElementById("tamano-matriz").value);

    if (n < 2) {
      alert("El tamaño debe ser al menos 2x2");
      return;
    }

    let html = `<div class="matriz-asignacion">
        <h4>Matriz de Costos/Beneficios</h4>
        <p class="instrucciones">Ingresa los costos/beneficios de asignar cada persona a cada tarea</p>
        <table>
            <tr>
                <th></th>`;
    
    // Encabezados de columnas
    for (let j = 0; j < n; j++) {
      html += `<th>Tarea ${j + 1}</th>`;
    }
    html += `</tr>`;
    
    // Filas con inputs
    for (let i = 0; i < n; i++) {
      html += `<tr><th>Persona ${i + 1}</th>`;
      for (let j = 0; j < n; j++) {
        html += `<td>
            <input type="number" class="costo-asignacion" data-i="${i}" data-j="${j}" 
                   value="${Math.floor(Math.random() * 20) + 1}" min="0" step="any">
        </td>`;
      }
      html += `</tr>`;
    }
    
    html += `</table></div>`;
    document.getElementById("matriz-container").innerHTML = html;
  }

  function calcularAsignacion() {
    const tipoProblema = document.getElementById("tipo-asignacion").value;
    const n = parseInt(document.getElementById("tamano-matriz").value);
    
    const inputs = document.querySelectorAll(".costo-asignacion");
    if (inputs.length === 0) {
      resultadoBox.innerHTML = "<div class='error'><p>⚠️ Primero genera la matriz de costos.</p></div>";
      return;
    }

    // Construir matriz de costos
    const costos = Array.from({ length: n }, () => Array(n).fill(0));
    inputs.forEach(input => {
      const i = parseInt(input.dataset.i);
      const j = parseInt(input.dataset.j);
      costos[i][j] = parseFloat(input.value) || 0;
    });

    try {
      const resultado = resolverAsignacion(costos, tipoProblema);
      mostrarResultadoAsignacion(resultado, costos);
    } catch (error) {
      resultadoBox.innerHTML = `<div class="error"><p>❌ Error: ${error.message}</p></div>`;
    }
  }

  function mostrarResultadoAsignacion(resultado, costos) {
    let html = `<div class="resultado-asignacion">
        <h3>📊 Resultado del Método de Asignación</h3>`;
    
    if (resultado.solucionOptima) {
      html += `<div class="solucion-optima">
          <p><strong>✅ Asignación Óptima Encontrada</strong></p>
          <p><strong>${resultado.tipoProblema === 'minimizar' ? 'Costo Total Mínimo' : 'Beneficio Total Máximo'}:</strong> ${resultado.costoTotal.toFixed(2)}</p>
          
          <div class="detalle-asignacion">
              <h4>Detalle de la Asignación:</h4>
              <table class="tabla-detalle">
                  <tr>
                      <th>Persona</th>
                      <th>Tarea</th>
                      <th>${resultado.tipoProblema === 'minimizar' ? 'Costo' : 'Beneficio'}</th>
                  </tr>`;
      
      resultado.asignacion.forEach(asig => {
        html += `<tr>
            <td>Persona ${asig.persona}</td>
            <td>Tarea ${asig.tarea}</td>
            <td><strong>${asig.costo.toFixed(2)}</strong></td>
        </tr>`;
      });
      
      html += `</table></div>`;
      
      // Mostrar matriz con asignaciones resaltadas
      html += `<div class="matriz-resultado">
          <h4>Matriz con Asignación Óptima</h4>
          ${mostrarTablaAsignacion(resultado.asignacion, costos)}
      </div>`;
      
    } else {
      html += `<div class="no-solucion">
          <p><strong>❌ No se encontró solución óptima</strong></p>
          <p>${resultado.mensaje}</p>
      </div>`;
    }

    html += `</div>`;
    resultadoBox.innerHTML = html;
  }

  // ===================== INTERFAZ CPM ====================== //
  function mostrarInterfazCPM() {
    cpmBox.innerHTML = `
      <div class="metodo-container">
        <h3>📊 Método CPM (Ruta Crítica)</h3>
        <p class="info">Calcula la ruta crítica usando actividades, duración y predecesores</p>
        
        <div class="cpm-inputs">
          <div class="input-group">
            <label for="num-actividades">Número de actividades:</label>
            <input type="number" id="num-actividades" min="1" max="15" value="5">
          </div>

          <button type="button" id="generar-actividades">Generar Actividades</button>
        </div>

        <div id="actividades-container" style="margin-top: 20px;"></div>
        <button type="button" id="calcular-cpm" style="margin-top: 15px;">🚀 Calcular Ruta Crítica</button>
      </div>
    `;

    // Generar actividades iniciales
    setTimeout(() => {
      generarActividadesCPM();
    }, 100);

    // Event listeners
    document.getElementById("generar-actividades").addEventListener("click", generarActividadesCPM);
    document.getElementById("calcular-cpm").addEventListener("click", calcularCPM);
  }

  function generarActividadesCPM() {
    const numActividades = parseInt(document.getElementById("num-actividades").value);

    if (numActividades < 1) {
      alert("Debe haber al menos una actividad");
      return;
    }

    let html = `<div class="actividades-cpm">
        <h4>Actividades del Proyecto</h4>
        <p class="instrucciones">Define las actividades con nombre, duración y predecesores (separados por coma)</p>
        <table>
            <tr>
                <th>#</th>
                <th>Nombre Actividad</th>
                <th>Duración</th>
                <th>Predecesores</th>
            </tr>`;
    
    // Ejemplo predefinido para facilitar pruebas
    const ejemplos = [
        { nombre: "A", duracion: 3, predecesor: "" },
        { nombre: "B", duracion: 4, predecesor: "A" },
        { nombre: "C", duracion: 5, predecesor: "A" },
        { nombre: "D", duracion: 2, predecesor: "B" },
        { nombre: "E", duracion: 6, predecesor: "C, D" }
    ];
    
    for (let i = 0; i < numActividades; i++) {
        const ejemplo = ejemplos[i] || { 
            nombre: `Act${String.fromCharCode(65 + i)}`, 
            duracion: Math.floor(Math.random() * 5) + 1, 
            predecesor: "" 
        };
        
        html += `<tr>
            <td><strong>${i + 1}</strong></td>
            <td>
                <input type="text" class="nombre-actividad" data-index="${i}" 
                       value="${ejemplo.nombre}" placeholder="Ej: Diseño">
            </td>
            <td>
                <input type="number" class="duracion-actividad" data-index="${i}" 
                       value="${ejemplo.duracion}" min="1" step="1" placeholder="Días">
            </td>
            <td>
                <input type="text" class="predecesor-actividad" data-index="${i}" 
                       value="${ejemplo.predecesor}" placeholder="Ej: A, B">
                <small style="display:block; color:#666; font-size:0.8em;">Separar por comas</small>
            </td>
        </tr>`;
    }
    
    html += `</table></div>`;
    document.getElementById("actividades-container").innerHTML = html;
  }

  function calcularCPM() {
    const numActividades = parseInt(document.getElementById("num-actividades").value);
    
    const nombres = document.querySelectorAll(".nombre-actividad");
    const duraciones = document.querySelectorAll(".duracion-actividad");
    const predecesores = document.querySelectorAll(".predecesor-actividad");
    
    if (nombres.length === 0) {
      resultadoBox.innerHTML = "<div class='error'><p>⚠️ Primero genera las actividades.</p></div>";
      return;
    }

    // Construir array de actividades
    const actividades = [];
    for (let i = 0; i < numActividades; i++) {
        const nombre = nombres[i]?.value?.trim();
        const duracion = parseFloat(duraciones[i]?.value);
        const predecesor = predecesores[i]?.value?.trim() || '';
        
        if (!nombre || isNaN(duracion) || duracion <= 0) {
            resultadoBox.innerHTML = `<div class="error"><p>❌ Error en la actividad ${i+1}: Complete nombre y duración correctamente.</p></div>`;
            return;
        }
        
        // Verificar que los predecesores existan
        if (predecesor) {
            const predecesoresLista = predecesor.split(',').map(p => p.trim()).filter(p => p !== '');
            for (const pred of predecesoresLista) {
                if (!actividades.find(a => a.nombre === pred) && !Array.from(nombres).some(n => n.value === pred)) {
                    resultadoBox.innerHTML = `<div class="error"><p>❌ Error: El predecesor "${pred}" no existe como actividad.</p></div>`;
                    return;
                }
            }
        }
        
        actividades.push({
            nombre: nombre,
            duracion: duracion,
            predecesor: predecesor
        });
    }

    try {
        const resultado = resolverCPM(actividades);
        mostrarResultadoCPM(resultado);
    } catch (error) {
        resultadoBox.innerHTML = `<div class="error"><p>❌ Error: ${error.message}</p></div>`;
    }
  }

  function mostrarResultadoCPM(resultado) {
    let html = `<div class="resultado-cpm">
        <h3>📊 Resultado del Método CPM</h3>`;
    
    if (resultado.exito) {
        html += `<div class="solucion-optima">
            <p><strong>✅ Análisis CPM Completado</strong></p>
            <p><strong>Duración Total del Proyecto:</strong> ${resultado.duracionTotal} unidades de tiempo</p>
            <p><strong>Ruta Crítica:</strong> ${resultado.rutaCritica.map(a => a.nombre).join(' → ')}</p>
            <p><strong>Actividades Críticas:</strong> ${resultado.rutaCritica.length}</p>
        </div>`;
        
        // Gráfico del proyecto
        html += `<div class="grafo-container">
            <h4>Diagrama de Red del Proyecto</h4>
            <div id="grafo-cpm-container"></div>
            <p class="leyenda-grafo">
                <span style="color:#dc3545">● Líneas rojas</span> = Actividades críticas | 
                <span style="color:#6f42c1">● Líneas azules</span> = Actividades no críticas
            </p>
        </div>`;
        
        // Tabla de actividades
        html += `<div class="tabla-actividades">
            <h4>Análisis de Tiempos y Holguras</h4>
            <table class="tabla-detalle-cpm">
                <tr>
                    <th>Actividad</th>
                    <th>Duración</th>
                    <th>Predecesores</th>
                    <th>T. Temprano Inicio</th>
                    <th>T. Temprano Fin</th>
                    <th>T. Tardío Inicio</th>
                    <th>T. Tardío Fin</th>
                    <th>Holgura</th>
                    <th>¿Crítica?</th>
                </tr>`;
        
        resultado.actividades.forEach(act => {
            html += `<tr class="${act.esCritica ? 'fila-critica' : ''}">
                <td><strong>${act.nombre}</strong></td>
                <td>${act.duracion}</td>
                <td>${act.predecesor || 'Ninguno'}</td>
                <td>${act.tiempoTempranoInicio}</td>
                <td>${act.tiempoTempranoFin}</td>
                <td>${act.tiempoTardioInicio}</td>
                <td>${act.tiempoTardioFin}</td>
                <td>${act.holgura}</td>
                <td class="${act.esCritica ? 'critica' : 'no-critica'}">
                    ${act.esCritica ? '✅ CRÍTICA' : 'No crítica'}
                </td>
            </tr>`;
        });
        
        html += `</table></div>`;
        
    } else {
        html += `<div class="no-solucion">
            <p><strong>❌ Error en el análisis CPM</strong></p>
            <p>${resultado.mensaje}</p>
        </div>`;
    }

    html += `</div>`;
    resultadoBox.innerHTML = html;
    
    // Generar el grafo si hay solución
    if (resultado.exito) {
        setTimeout(() => {
            const grafoHTML = generarGrafoCPM(resultado);
            document.getElementById("grafo-cpm-container").innerHTML = grafoHTML;
        }, 100);
    }
  }
});