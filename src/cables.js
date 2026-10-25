Mila.Módulo({
  define: "Simu.Cables",
  necesita: ["$milascript/base"],
  usa: ["componentes", "carga"],
});


Simu.Cables._estadoDibujo = null;


Simu.Cables._cables = [];


Simu.Cables._lienzoSvg = null;
Simu.Cables._overlay = null;
Simu.Cables._cableSeleccionado = null;
Simu.Cables._panelEdicion = null;


Simu.Cables.Inicializar = function () {
  if (Simu.Cables._lienzoSvg) {
    Simu.Cables._lienzoSvg.removeEventListener(
      "click",
      Simu.Cables._onClickLienzo_,
    );
    Simu.Cables._lienzoSvg.removeEventListener(
      "mousemove",
      Simu.Cables._onMouseMoveLienzo_,
    );
  }
  if (Simu.Cables._overlay && Simu.Cables._overlay.parentNode) {
    Simu.Cables._overlay.parentNode.removeChild(Simu.Cables._overlay);
  }


  Simu.Cables._estadoDibujo = null;
  Simu.Cables._cables = [];
  Simu.Cables._ocultarPanelEdicion_();
  Simu.Cables._cableSeleccionado = null;


  const lienzoSvg = Simu.Diseño.escenario._lienzo._nodoHtml;
  Simu.Cables._lienzoSvg = lienzoSvg;


  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
  overlay.setAttribute("id", "cables-overlay");
  overlay.setAttribute("pointer-events", "none");
  lienzoSvg.appendChild(overlay);
  Simu.Cables._overlay = overlay;


  lienzoSvg.addEventListener("click", Simu.Cables._onClickLienzo_);
  lienzoSvg.addEventListener("mousemove", Simu.Cables._onMouseMoveLienzo_);


  // Construir el mapa pin→nodo DOM cuando todos los SVGs estén cargados.
  // Si ya están todos cargados, alTerminarDeCargar lo ejecuta inmediatamente.
  Simu.Carga.alTerminarDeCargar(() => {
    Simu.Cables._construirMapaDePinesANodos_();
  });
};


// Mapea cada pin original a su nodo DOM usando un color probe.
// El escenario crea copias profundas de los dibujos; los nodos DOM están en esas
// copias. Pero el monkey-patching de CambiarEstilo_A_ propaga los cambios del
// original al DOM. Aprovechamos eso para encontrar el nodo de cada pin.
Simu.Cables._construirMapaDePinesANodos_ = function () {
  let idProbe = 0;


  for (const clave in Simu.Diseño.componentes) {
    const dato = Simu.Diseño.componentes[clave];
    if (!dato.componente || !dato.componente._pines) continue;


    for (const pinKey in dato.componente._pines) {
      const pin = dato.componente._pines[pinKey];
      if (!pin.dibujo) continue;


      const estilo = pin.dibujo.estilo();
      const tieneFill = "colorFondo" in estilo;
      const fillOriginal = tieneFill ? estilo.colorFondo : null;


      const colorProbe = `#ca${idProbe.toString(16).padStart(4, "0")}`;
      idProbe++;


      // Propaga al DOM vía monkey-patching (original → copia → dibujable → setAttribute)
      pin.dibujo.CambiarEstilo_A_("colorFondo", colorProbe);


      const nodo = Simu.Cables._lienzoSvg.querySelector(
        `[fill="${colorProbe}"]`,
      );


      if (nodo) {
        // Guardar el nodo con transform como referencia para hit-testing
        pin._nodoHtmlCable = nodo.closest("[transform]") || nodo;
        // Restaurar el fill en el DOM directamente
        if (tieneFill) {
          nodo.setAttribute("fill", fillOriginal);
        } else {
          nodo.removeAttribute("fill");
        }
      }


      // Restaurar el estilo del dibujo original (evita efectos en renders futuros)
      if (tieneFill) {
        estilo.colorFondo = fillOriginal;
      } else {
        delete estilo.colorFondo;
      }
    }
  }
};


// Cada SVG de pin tiene un fondo transparente del tamaño del componente completo
// y un pequeño marcador en la posición real del pin. Devuelve el rect del marcador.
Simu.Cables._rectMarcadorDePin_ = function (pin) {
  if (!pin._nodoHtmlCable) return null;
  const elementos = Array.from(pin._nodoHtmlCable.querySelectorAll("path"));
  let mejorRect = null;
  let mejorArea = Infinity;
  for (const el of elementos) {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (area > 0 && area < mejorArea) {
      mejorArea = area;
      mejorRect = r;
    }
  }
  return mejorRect;
};


Simu.Cables._centroPinEnSvg_ = function (componente, pinKey) {
  const pin = componente._pines[pinKey];
  if (!pin || !pin._nodoHtmlCable) return null;
  const marcador = Simu.Cables._rectMarcadorDePin_(pin);
  if (!marcador) return null;
  const svgRect = Simu.Cables._lienzoSvg.getBoundingClientRect();
  return {
    x: (marcador.left + marcador.right) / 2 - svgRect.left,
    y: (marcador.top + marcador.bottom) / 2 - svgRect.top,
  };
};


Simu.Cables._pinBajoElCursor_ = function (clientX, clientY) {
  const UMBRAL = 20;
  let mejorPin = null;
  let mejorDist = UMBRAL;
  for (const clave in Simu.Diseño.componentes) {
    const dato = Simu.Diseño.componentes[clave];
    if (!dato.componente || !dato.componente._pines) continue;
    for (const pinKey in dato.componente._pines) {
      const pin = dato.componente._pines[pinKey];
      if (!pin._nodoHtmlCable) continue;
      const marcador = Simu.Cables._rectMarcadorDePin_(pin);
      if (!marcador) continue;
      const cx = (marcador.left + marcador.right) / 2;
      const cy = (marcador.top + marcador.bottom) / 2;
      const d = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);
      if (d < mejorDist) {
        mejorDist = d;
        mejorPin = { componente: dato.componente, pinKey };
      }
    }
  }
  return mejorPin;
};


Simu.Cables._crearLinea_ = function (x1, y1, x2, y2, color, punteada) {
  const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
  linea.setAttribute("x1", x1);
  linea.setAttribute("y1", y1);
  linea.setAttribute("x2", x2);
  linea.setAttribute("y2", y2);
  linea.setAttribute("stroke", color);
  linea.setAttribute("stroke-width", "3");
  linea.setAttribute("stroke-linecap", "round");
  if (punteada) {
    linea.setAttribute("stroke-dasharray", "8 5");
  }
  Simu.Cables._overlay.appendChild(linea);
  return linea;
};


Simu.Cables._onClickLienzo_ = function (evento) {
  if (Simu.Cables._estadoDibujo === null) {
    const cableClickeado = Simu.Cables._cableBajoElCursor_(
      evento.clientX,
      evento.clientY,
    );
    if (cableClickeado) {
      Simu.Cables._seleccionarCable_(cableClickeado, evento);
      return;
    }


    const pin = Simu.Cables._pinBajoElCursor_(evento.clientX, evento.clientY);
    if (!pin) {
      Simu.Cables._deseleccionarCable_();
      return;
    }
    Simu.Cables._deseleccionarCable_();


    if (Simu.Cables._cableConectadoAPin_(pin.componente, pin.pinKey)) return;


    const centro = Simu.Cables._centroPinEnSvg_(pin.componente, pin.pinKey);
    if (!centro) return;
    const color = "#e74c3c";
    const linea = Simu.Cables._crearLinea_(
      centro.x,
      centro.y,
      centro.x,
      centro.y,
      color,
      true,
    );
    Simu.Cables._estadoDibujo = {
      componente: pin.componente,
      pinKey: pin.pinKey,
      linea,
      color,
    };
  } else {
    const pin = Simu.Cables._pinBajoElCursor_(evento.clientX, evento.clientY);
    const esMismoPin =
      pin &&
      pin.componente === Simu.Cables._estadoDibujo.componente &&
      pin.pinKey === Simu.Cables._estadoDibujo.pinKey;


    if (pin && !esMismoPin) {
      // No conectar si el pin destino ya tiene un cable
      if (Simu.Cables._cableConectadoAPin_(pin.componente, pin.pinKey)) return;


      const centro = Simu.Cables._centroPinEnSvg_(pin.componente, pin.pinKey);
      if (!centro) return;
      const linea = Simu.Cables._estadoDibujo.linea;
      linea.setAttribute("x2", centro.x);
      linea.setAttribute("y2", centro.y);
      linea.removeAttribute("stroke-dasharray");
      const nuevoCable = {
        color: Simu.Cables._estadoDibujo.color,
        pinA: {
          componente: Simu.Cables._estadoDibujo.componente,
          pinKey: Simu.Cables._estadoDibujo.pinKey,
        },
        pinB: { componente: pin.componente, pinKey: pin.pinKey },
        linea,
      };
      Simu.Cables._cables.push(nuevoCable);
      linea.setAttribute("pointer-events", "stroke");
      linea.addEventListener("click", (e) => {
        if (Simu.Cables._estadoDibujo !== null) return;
        Simu.Cables._seleccionarCable_(nuevoCable, e);
      });
      Simu.Cables._estadoDibujo = null;
    } else if (!pin) {
      Simu.Cables._overlay.removeChild(Simu.Cables._estadoDibujo.linea);
      Simu.Cables._estadoDibujo = null;
    }
  }
};


Simu.Cables._onMouseMoveLienzo_ = function (evento) {
  if (Simu.Cables._estadoDibujo === null) return;
  const svgRect = Simu.Cables._lienzoSvg.getBoundingClientRect();
  Simu.Cables._estadoDibujo.linea.setAttribute(
    "x2",
    evento.clientX - svgRect.left,
  );
  Simu.Cables._estadoDibujo.linea.setAttribute(
    "y2",
    evento.clientY - svgRect.top,
  );
};


Simu.Cables._seleccionarCable_ = function (cable, eventoClick) {
  eventoClick.stopPropagation();
  if (Simu.Cables._cableSeleccionado === cable) {
    Simu.Cables._deseleccionarCable_();
    return;
  }
  Simu.Cables._deseleccionarCable_();
  Simu.Cables._cableSeleccionado = cable;


  Simu.Cables._mostrarPanelEdicion_(
    cable,
    eventoClick.clientX,
    eventoClick.clientY,
  );
};


Simu.Cables._deseleccionarCable_ = function () {
  const cable = Simu.Cables._cableSeleccionado;
  if (!cable) return;


  Simu.Cables._ocultarPanelEdicion_();
  Simu.Cables._cableSeleccionado = null;
};


Simu.Cables._mostrarPanelEdicion_ = function (cable, clientX, clientY) {
  Simu.Cables._ocultarPanelEdicion_();
  const panel = document.createElement("div");
  const top = Math.max(10, clientY - 55);
  const left = Math.max(10, clientX - 115);
  panel.style.cssText = [
    "position:fixed",
    `left:${left}px`,
    `top:${top}px`,
    "background:#2d2d2d",
    "border:1px solid #555",
    "border-radius:8px",
    "padding:8px 10px",
    "display:flex",
    "gap:6px",
    "align-items:center",
    "box-shadow:0 4px 12px rgba(0,0,0,0.5)",
    "z-index:1000",
  ].join(";");


  const picker = document.createElement("input");
  picker.title = "Seleccionar color del cable";
  picker.type = "color";
  picker.value = cable.color;
  picker.style.cssText =
    "width:36px;height:28px;border:none;background:none;cursor:pointer;padding:0";
  picker.addEventListener("click", (e) => e.stopPropagation());
  picker.addEventListener("input", (e) => {
    cable.color = picker.value;
    cable.linea.setAttribute("stroke", picker.value);
  });
  picker.addEventListener("change", (e) => {
    cable.color = picker.value;
    cable.linea.setAttribute("stroke", picker.value);
  });
  panel.appendChild(picker);


  const separator = document.createElement("div");
  separator.style.cssText =
    "width:1px;height:20px;background:#555;margin:0 2px";
  panel.appendChild(separator);


  const botonEliminar = document.createElement("div");
  botonEliminar.title = "Eliminar cable";
  botonEliminar.style.cssText =
    "color:#e74c3c;font-size:14px;cursor:pointer;padding:0 4px;font-weight:bold";
  const iconoDel = document.createElement("span");
  iconoDel.textContent = "✕";
  iconoDel.style.pointerEvents = "none";
  botonEliminar.appendChild(iconoDel);
  botonEliminar.addEventListener("click", (e) => {
    e.stopPropagation();
    Simu.Cables._eliminarCable_(cable);
  });
  panel.appendChild(botonEliminar);


  document.body.appendChild(panel);
  Simu.Cables._panelEdicion = panel;
};


Simu.Cables._ocultarPanelEdicion_ = function () {
  if (Simu.Cables._panelEdicion && Simu.Cables._panelEdicion.parentNode) {
    Simu.Cables._panelEdicion.parentNode.removeChild(Simu.Cables._panelEdicion);
  }
  Simu.Cables._panelEdicion = null;
};


Simu.Cables._eliminarCable_ = function (cable) {
  if (cable.linea && cable.linea.parentNode) {
    cable.linea.parentNode.removeChild(cable.linea);
  }


  Simu.Cables._cables = Simu.Cables._cables.filter((c) => c !== cable);
  if (Simu.Cables._cableSeleccionado === cable) {
    Simu.Cables._ocultarPanelEdicion_();
    Simu.Cables._cableSeleccionado = null;
  }
};


Simu.Cables._cableConectadoAPin_ = function (componente, pinKey) {
  for (const cable of Simu.Cables._cables) {
    if (
      (cable.pinA.componente === componente && cable.pinA.pinKey === pinKey) ||
      (cable.pinB.componente === componente && cable.pinB.pinKey === pinKey)
    ) {
      return cable;
    }
  }
  return null;
};


Simu.Cables._cableBajoElCursor_ = function (clientX, clientY) {
  const UMBRAL = 8;
  const svgRect = Simu.Cables._lienzoSvg.getBoundingClientRect();
  const px = clientX - svgRect.left;
  const py = clientY - svgRect.top;
  let mejorCable = null;
  let mejorDist = UMBRAL;
  for (const cable of Simu.Cables._cables) {
    const x1 = parseFloat(cable.linea.getAttribute("x1"));
    const y1 = parseFloat(cable.linea.getAttribute("y1"));
    const x2 = parseFloat(cable.linea.getAttribute("x2"));
    const y2 = parseFloat(cable.linea.getAttribute("y2"));
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    const d = Math.sqrt((px - x1 - t * dx) ** 2 + (py - y1 - t * dy) ** 2);
    if (d < mejorDist) {
      mejorDist = d;
      mejorCable = cable;
    }
  }
  return mejorCable;
};


Simu.Cables.ActualizarPosicionesCables_ = function () {
  if (!Simu.Cables._lienzoSvg) return;
  const svgRect = Simu.Cables._lienzoSvg.getBoundingClientRect();


  for (const cable of Simu.Cables._cables) {
    const pinA = cable.pinA.componente._pines[cable.pinA.pinKey];
    const pinB = cable.pinB.componente._pines[cable.pinB.pinKey];
    if (!pinA || !pinB) continue;
    const mA = Simu.Cables._rectMarcadorDePin_(pinA);
    const mB = Simu.Cables._rectMarcadorDePin_(pinB);
    if (!mA || !mB) continue;
    const x1 = (mA.left + mA.right) / 2 - svgRect.left;
    const y1 = (mA.top + mA.bottom) / 2 - svgRect.top;
    const x2 = (mB.left + mB.right) / 2 - svgRect.left;
    const y2 = (mB.top + mB.bottom) / 2 - svgRect.top;
    cable.linea.setAttribute("x1", x1);
    cable.linea.setAttribute("y1", y1);
    cable.linea.setAttribute("x2", x2);
    cable.linea.setAttribute("y2", y2);
  }
  Simu.Cables._ocultarPanelEdicion_();


  if (Simu.Cables._estadoDibujo !== null) {
    const pinA =
      Simu.Cables._estadoDibujo.componente._pines[
        Simu.Cables._estadoDibujo.pinKey
      ];
    if (pinA) {
      const mA = Simu.Cables._rectMarcadorDePin_(pinA);
      if (mA) {
        Simu.Cables._estadoDibujo.linea.setAttribute(
          "x1",
          (mA.left + mA.right) / 2 - svgRect.left,
        );
        Simu.Cables._estadoDibujo.linea.setAttribute(
          "y1",
          (mA.top + mA.bottom) / 2 - svgRect.top,
        );
      }
    }
  }
};

Simu.Cables.conexionesPlaca_ = function(placa) {
  Mila.Contrato({
    Propósito: [
      "Describir la lista de pares pin-componente que están conectados a la placa dada.",
      Mila.Tipo.ListaDe_(Mila.Tipo.RegistroCon_({
        pin:Mila.Tipo.Texto,
        componente:Mila.Tipo.Componente
      }))
    ],
    Parámetros:[
      [placa, Mila.Tipo.ComponentePlaca]
    ]
  });
  return Simu.Cables._cables.fold(
    ((x, rec) => rec.concatenadaCon_(
      x.pinA.componente == placa
        ? [{pin:x.pinA.pinKey, componente:x.pinB.componente}]
        : (
          x.pinB.componente == placa
            ? [{pin:x.pinB.pinKey, componente:x.pinA.componente}]
            : []
        )
    )),
    []
  );
};