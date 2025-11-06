// ===================== MÉTODOS DE TRANSPORTE ====================== //

function resolverTransporte(metodo, costos, oferta, demanda) {
  switch (metodo) {
    case "esquina":
      return metodoEsquinaNoroeste(costos, oferta, demanda);
    case "costo":
      return metodoCostoMinimo(costos, oferta, demanda);
    case "vogel":
      return metodoVogel(costos, oferta, demanda);
    default:
      throw new Error("Método de transporte no reconocido.");
  }
}

// ===================== FUNCIÓN PARA BALANCEAR ====================== //
function balancearProblema(costos, oferta, demanda) {
  let totalOferta = oferta.reduce((a, b) => a + b, 0);
  let totalDemanda = demanda.reduce((a, b) => a + b, 0);

  let balanceado = true;

  if (totalOferta > totalDemanda) {
    // Agregar columna imaginaria (demanda ficticia)
    balanceado = false;
    demanda.push(totalOferta - totalDemanda);
    for (let i = 0; i < costos.length; i++) {
      costos[i].push(0); // costo 0 para demanda ficticia
    }
  } else if (totalDemanda > totalOferta) {
    // Agregar fila imaginaria (oferta ficticia)
    balanceado = false;
    oferta.push(totalDemanda - totalOferta);
    let nuevaFila = Array(demanda.length).fill(0);
    costos.push(nuevaFila);
  }

  return { costos, oferta, demanda, balanceado };
}

// ===================== MÉTODO ESQUINA NOROESTE ====================== //
function metodoEsquinaNoroeste(costos, oferta, demanda) {
  ({ costos, oferta, demanda } = balancearProblema(costos, oferta, demanda));

  let m = oferta.length;
  let n = demanda.length;
  let asignacion = Array.from({ length: m }, () => Array(n).fill(0));
  let costoTotal = 0;
  let i = 0, j = 0;

  let ofertaRest = [...oferta];
  let demandaRest = [...demanda];

  while (i < m && j < n) {
    let cantidad = Math.min(ofertaRest[i], demandaRest[j]);
    asignacion[i][j] = cantidad;
    costoTotal += cantidad * costos[i][j];
    ofertaRest[i] -= cantidad;
    demandaRest[j] -= cantidad;
    if (ofertaRest[i] === 0) i++;
    if (demandaRest[j] === 0) j++;
  }

  return { asignacion, costoTotal, costos };
}

// ===================== MÉTODO COSTO MÍNIMO ====================== //
function metodoCostoMinimo(costos, oferta, demanda) {
  ({ costos, oferta, demanda } = balancearProblema(costos, oferta, demanda));

  let m = oferta.length;
  let n = demanda.length;
  let asignacion = Array.from({ length: m }, () => Array(n).fill(0));
  let costoTotal = 0;
  let ofertaRest = [...oferta];
  let demandaRest = [...demanda];
  let celdas = [];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      celdas.push({ i, j, costo: costos[i][j] });
    }
  }

  celdas.sort((a, b) => a.costo - b.costo);

  for (const celda of celdas) {
    const { i, j } = celda;
    if (ofertaRest[i] > 0 && demandaRest[j] > 0) {
      let cantidad = Math.min(ofertaRest[i], demandaRest[j]);
      asignacion[i][j] = cantidad;
      costoTotal += cantidad * costos[i][j];
      ofertaRest[i] -= cantidad;
      demandaRest[j] -= cantidad;
    }
  }

  return { asignacion, costoTotal, costos };
}

// ===================== MÉTODO VOGEL ====================== //
function metodoVogel(costos, oferta, demanda) {
  ({ costos, oferta, demanda } = balancearProblema(costos, oferta, demanda));

  let m = oferta.length;
  let n = demanda.length;
  let asignacion = Array.from({ length: m }, () => Array(n).fill(0));
  let costoTotal = 0;
  let ofertaRest = [...oferta];
  let demandaRest = [...demanda];
  let filasActivas = Array(m).fill(true);
  let columnasActivas = Array(n).fill(true);

  function penalizacionFila(i) {
    let activos = costos[i]
      .map((c, j) => (columnasActivas[j] ? c : Infinity))
      .sort((a, b) => a - b);
    return activos[1] - activos[0];
  }

  function penalizacionColumna(j) {
    let activos = costos
      .map((fila, i) => (filasActivas[i] ? fila[j] : Infinity))
      .sort((a, b) => a - b);
    return activos[1] - activos[0];
  }

  while (filasActivas.some(Boolean) && columnasActivas.some(Boolean)) {
    let penalizaciones = [];

    for (let i = 0; i < m; i++)
      if (filasActivas[i]) penalizaciones.push({ tipo: "fila", index: i, valor: penalizacionFila(i) });

    for (let j = 0; j < n; j++)
      if (columnasActivas[j]) penalizaciones.push({ tipo: "columna", index: j, valor: penalizacionColumna(j) });

    if (penalizaciones.length === 0) break;

    penalizaciones.sort((a, b) => b.valor - a.valor);
    let seleccion = penalizaciones[0];

    let iSel, jSel;
    if (seleccion.tipo === "fila") {
      iSel = seleccion.index;
      let minCosto = Infinity;
      for (let j = 0; j < n; j++) {
        if (columnasActivas[j] && costos[iSel][j] < minCosto) {
          minCosto = costos[iSel][j];
          jSel = j;
        }
      }
    } else {
      jSel = seleccion.index;
      let minCosto = Infinity;
      for (let i = 0; i < m; i++) {
        if (filasActivas[i] && costos[i][jSel] < minCosto) {
          minCosto = costos[i][jSel];
          iSel = i;
        }
      }
    }

    let cantidad = Math.min(ofertaRest[iSel], demandaRest[jSel]);
    asignacion[iSel][jSel] = cantidad;
    costoTotal += cantidad * costos[iSel][jSel];
    ofertaRest[iSel] -= cantidad;
    demandaRest[jSel] -= cantidad;
    if (ofertaRest[iSel] === 0) filasActivas[iSel] = false;
    if (demandaRest[jSel] === 0) columnasActivas[jSel] = false;
  }

  return { asignacion, costoTotal, costos };
}

// ===================== MOSTRAR TABLA ====================== //
function mostrarTabla(asignacion, costos) {
  let html = "<div class='tabla-resultado'><table>";
  html += "<tr><th></th>";
  for (let j = 0; j < costos[0].length; j++) html += `<th>D${j + 1}</th>`;
  html += "</tr>";

  for (let i = 0; i < costos.length; i++) {
    html += `<tr><th>O${i + 1}</th>`;
    for (let j = 0; j < costos[0].length; j++) {
      const x = asignacion[i][j];
      html += `<td>${x > 0 ? `${x} <br><small>(${costos[i][j]})</small>` : costos[i][j]}</td>`;
    }
    html += "</tr>";
  }

  html += "</table></div>";
  return html;
}
