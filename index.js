// index.js - Código completo para manejar todos los métodos

// ===================== INICIALIZACIÓN Y MANEJO DE MÉTODOS ===================== //

document.addEventListener('DOMContentLoaded', function() {
  // Configurar el evento change para el selector de métodos
  document.getElementById('metodo').addEventListener('change', function() {
      const metodo = this.value;
      
      // Ocultar todos los contenedores
      document.getElementById('simplex-box').innerHTML = '';
      document.getElementById('grafico-box').innerHTML = '';
      document.getElementById('transporte-box').innerHTML = '';
      document.getElementById('asignacion-box').innerHTML = '';
      document.getElementById('cpm-box').innerHTML = '';
      
      // Limpiar resultados
      document.getElementById('resultado-box').innerHTML = 
          '<p>Selecciona un método y completa los datos.</p>';
      
      // Mostrar el contenedor seleccionado
      if (metodo === 'grafico') {
          mostrarFormularioGrafico();
      } else if (metodo === 'simplex') {
          mostrarFormularioSimplex();
      } else if (metodo === 'transporte') {
          mostrarFormularioTransporte();
      } else if (metodo === 'asignacion') {
          mostrarFormularioAsignacion();
      } else if (metodo === 'cpm') {
          mostrarFormularioCPM();
      }
  });
});

// ===================== MÉTODO GRÁFICO ===================== //

function mostrarFormularioGrafico() {
  const container = document.getElementById('grafico-box');
  container.innerHTML = `
      <div class="metodo-container">
          <h3>Método Gráfico</h3>
          <div class="advertencia">
              ⚠️ Solo funciona con 2 variables (x₁ y x₂)
          </div>
          
          <div class="grafico-form">
              <div class="input-group">
                  <label>Tipo de optimización:</label>
                  <select id="tipo-optimizacion-grafico">
                      <option value="maximizar">Maximizar</option>
                      <option value="minimizar" selected>Minimizar</option>
                  </select>
              </div>

              <div class="funcion-objetivo">
                  <h4>Función Objetivo</h4>
                  <div class="coeficientes">
                      <div class="coeficiente-input">
                          <span>Z =</span>
                          <input type="number" id="coef-x1" placeholder="Coef. x₁" value="3" step="0.1">
                          <span>x₁ +</span>
                          <input type="number" id="coef-x2" placeholder="Coef. x₂" value="2" step="0.1">
                          <span>x₂</span>
                      </div>
                  </div>
              </div>

              <div class="restricciones">
                  <h4>Restricciones</h4>
                  <div id="restricciones-grafico">
                      <div class="restriccion">
                          <input type="number" class="coef-rx1" placeholder="x₁" value="1" step="0.1">
                          <span>x₁ +</span>
                          <input type="number" class="coef-rx2" placeholder="x₂" value="1" step="0.1">
                          <span>x₂</span>
                          <select class="tipo-restriccion">
                              <option value="<=">&lt;=</option>
                              <option value=">=" selected>&gt;=</option>
                              <option value="=">=</option>
                          </select>
                          <input type="number" class="valor-restriccion" placeholder="Valor" value="4" step="0.1">
                          <button type="button" class="eliminar-restriccion" onclick="eliminarRestriccion(this)">✕</button>
                      </div>
                      <div class="restriccion">
                          <input type="number" class="coef-rx1" placeholder="x₁" value="2" step="0.1">
                          <span>x₁ +</span>
                          <input type="number" class="coef-rx2" placeholder="x₂" value="1" step="0.1">
                          <span>x₂</span>
                          <select class="tipo-restriccion">
                              <option value="<=">&lt;=</option>
                              <option value=">=" selected>&gt;=</option>
                              <option value="=">=</option>
                          </select>
                          <input type="number" class="valor-restriccion" placeholder="Valor" value="5" step="0.1">
                          <button type="button" class="eliminar-restriccion" onclick="eliminarRestriccion(this)">✕</button>
                      </div>
                  </div>
                  <button type="button" onclick="agregarRestriccionGrafico()" style="margin-top: 10px;">
                      + Agregar Restricción
                  </button>
              </div>

              <div class="no-negatividad">
                  <h4>Condiciones de no negatividad</h4>
                  <div class="variables">
                      <span>x₁ ≥ 0</span>
                      <span>x₂ ≥ 0</span>
                  </div>
              </div>

              <button onclick="calcularGrafico()" style="margin-top: 20px; padding: 15px; font-size: 1.1em; width: 100%;">
                  🎯 Calcular y Graficar
              </button>
          </div>
      </div>
  `;
}

function agregarRestriccionGrafico() {
  const container = document.getElementById('restricciones-grafico');
  const nuevaRestriccion = document.createElement('div');
  nuevaRestriccion.className = 'restriccion';
  nuevaRestriccion.innerHTML = `
      <input type="number" class="coef-rx1" placeholder="x₁" value="1" step="0.1">
      <span>x₁ +</span>
      <input type="number" class="coef-rx2" placeholder="x₂" value="1" step="0.1">
      <span>x₂</span>
      <select class="tipo-restriccion">
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
          <option value="=">=</option>
      </select>
      <input type="number" class="valor-restriccion" placeholder="Valor" value="0" step="0.1">
      <button type="button" class="eliminar-restriccion" onclick="eliminarRestriccion(this)">✕</button>
  `;
  container.appendChild(nuevaRestriccion);
}

function eliminarRestriccion(boton) {
  const restriccion = boton.parentElement;
  const totalRestricciones = document.querySelectorAll('.restriccion').length;
  
  if (totalRestricciones > 1) {
      restriccion.remove();
  } else {
      alert('Debe haber al menos una restricción');
  }
}

function calcularGrafico() {
  try {
      // Obtener datos del formulario
      const tipoOptimizacion = document.getElementById('tipo-optimizacion-grafico').value;
      const coefX1 = parseFloat(document.getElementById('coef-x1').value) || 0;
      const coefX2 = parseFloat(document.getElementById('coef-x2').value) || 0;
      
      // Validar coeficientes
      if (coefX1 === 0 && coefX2 === 0) {
          throw new Error('La función objetivo no puede tener ambos coeficientes en cero');
      }
      
      const objetivo = [coefX1, coefX2];
      
      // Obtener restricciones
      const restricciones = [];
      const elementosRestricciones = document.querySelectorAll('.restriccion');
      
      elementosRestricciones.forEach((elemento, index) => {
          const coefRx1 = parseFloat(elemento.querySelector('.coef-rx1').value) || 0;
          const coefRx2 = parseFloat(elemento.querySelector('.coef-rx2').value) || 0;
          const tipo = elemento.querySelector('.tipo-restriccion').value;
          const valor = parseFloat(elemento.querySelector('.valor-restriccion').value) || 0;
          
          // Validar que la restricción tenga al menos un coeficiente no cero
          if (coefRx1 === 0 && coefRx2 === 0) {
              throw new Error(`La restricción ${index + 1} debe tener al menos un coeficiente diferente de cero`);
          }
          
          restricciones.push({
              coeficientes: [coefRx1, coefRx2],
              tipo: tipo,
              valor: valor
          });
      });

      // Resolver usando el método gráfico
      const resultado = resolverGrafico(objetivo, restricciones, tipoOptimizacion);
      
      // Mostrar resultados
      mostrarResultadoGrafico(resultado);
      
  } catch (error) {
      document.getElementById('resultado-box').innerHTML = `
          <div class="error">
              <strong>Error:</strong> ${error.message}
          </div>
      `;
  }
}

function mostrarResultadoGrafico(resultado) {
  const resultadoBox = document.getElementById('resultado-box');
  
  if (resultado.solucionOptima) {
      resultadoBox.innerHTML = `
          <div class="resultado-grafico">
              <div class="solucion-optima">
                  <h3>✅ Solución Óptima Encontrada</h3>
                  <p><strong>Valor óptimo:</strong> Z = ${resultado.valorOptimo.toFixed(4)}</p>
                  <p><strong>Punto óptimo:</strong> (${resultado.variables[0].toFixed(4)}, ${resultado.variables[1].toFixed(4)})</p>
                  <p><strong>Variables:</strong> x₁ = ${resultado.variables[0].toFixed(4)}, x₂ = ${resultado.variables[1].toFixed(4)}</p>
                  <p><strong>Tipo:</strong> ${resultado.tipoOptimizacion}</p>
              </div>
              
              <div class="grafico-container">
                  <h4>Gráfico de la Solución</h4>
                  <div id="grafico-resultado"></div>
              </div>
              
              <div class="puntos-factibles">
                  <h4>Puntos Factibles Evaluados</h4>
                  <div class="tabla-puntos">
                      <table>
                          <thead>
                              <tr>
                                  <th>Punto</th>
                                  <th>Coordenadas (x₁, x₂)</th>
                                  <th>Valor Z</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${resultado.valores.map((item, index) => `
                                  <tr class="${item.punto[0] === resultado.variables[0] && item.punto[1] === resultado.variables[1] ? 'fila-optima' : ''}">
                                      <td>P${index + 1}</td>
                                      <td>(${item.punto[0].toFixed(4)}, ${item.punto[1].toFixed(4)})</td>
                                      <td>${item.valor.toFixed(4)}</td>
                                  </tr>
                              `).join('')}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      `;
      
      // Dibujar el gráfico
      setTimeout(() => {
          dibujarGrafico(resultado, 'grafico-resultado');
      }, 100);
      
  } else {
      resultadoBox.innerHTML = `
          <div class="no-solucion">
              <h3>❌ No se encontró solución óptima</h3>
              <p><strong>Motivo:</strong> ${resultado.mensaje}</p>
              ${resultado.puntosFactibles && resultado.puntosFactibles.length > 0 ? `
                  <div class="puntos-factibles">
                      <h4>Puntos Factibles Encontrados</h4>
                      <div class="tabla-puntos">
                          <table>
                              <thead>
                                  <tr>
                                      <th>Punto</th>
                                      <th>Coordenadas (x₁, x₂)</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${resultado.puntosFactibles.map((punto, index) => `
                                      <tr>
                                          <td>P${index + 1}</td>
                                          <td>(${punto[0].toFixed(4)}, ${punto[1].toFixed(4)})</td>
                                      </tr>
                                  `).join('')}
                              </tbody>
                          </table>
                      </div>
                  </div>
              ` : ''}
          </div>
      `;
  }
}

// ===================== MÉTODO SIMPLEX (ESQUELETO) ===================== //

function mostrarFormularioSimplex() {
  const container = document.getElementById('simplex-box');
  container.innerHTML = `
      <div class="metodo-container">
          <h3>Método Simplex</h3>
          <p>Formulario para método Simplex (pendiente de implementar)</p>
      </div>
  `;
}

// ===================== MÉTODO DE TRANSPORTE (ESQUELETO) ===================== //

function mostrarFormularioTransporte() {
  const container = document.getElementById('transporte-box');
  container.innerHTML = `
      <div class="metodo-container">
          <h3>Método de Transporte</h3>
          <p>Formulario para método de Transporte (pendiente de implementar)</p>
      </div>
  `;
}

// ===================== MÉTODO DE ASIGNACIÓN (ESQUELETO) ===================== //

function mostrarFormularioAsignacion() {
  const container = document.getElementById('asignacion-box');
  container.innerHTML = `
      <div class="metodo-container">
          <h3>Método de Asignación</h3>
          <p>Formulario para método de Asignación (pendiente de implementar)</p>
      </div>
  `;
}

// ===================== MÉTODO CPM (ESQUELETO) ===================== //

function mostrarFormularioCPM() {
  const container = document.getElementById('cpm-box');
  container.innerHTML = `
      <div class="metodo-container">
          <h3>Método CPM</h3>
          <p>Formulario para método CPM (pendiente de implementar)</p>
      </div>
  `;
}

// ===================== FUNCIONES DE UTILIDAD ===================== //

function validarNumero(valor) {
  return !isNaN(valor) && isFinite(valor);
}

function mostrarError(mensaje) {
  document.getElementById('resultado-box').innerHTML = `
      <div class="error">
          <strong>Error:</strong> ${mensaje}
      </div>
  `;
}

function mostrarCargando() {
  document.getElementById('resultado-box').innerHTML = `
      <div style="text-align: center; padding: 20px;">
          <p>Calculando solución...</p>
      </div>
  `;
}