Mila.Módulo({
  define: "Simu.InterfazMódulos",
  necesita: ["$milascript/base"],
  usa: ["componentes", "disenio", "cables", "carga"],
});


Simu.InterfazMódulos._tiposDeMóduloAgregables = [
  { clase: "LED", etiqueta: "Led" },
  { clase: "BUZZER", etiqueta: "Buzzer" },
 // { clase: "SERVO", etiqueta: "Servo" },
];


Simu.InterfazMódulos._lienzoSvg = null;
Simu.InterfazMódulos._mapaNodos = [];
Simu.InterfazMódulos._claveSeleccionada = null;
Simu.InterfazMódulos._rectSeleccion = null;
Simu.InterfazMódulos._iconoMover = null;
Simu.InterfazMódulos._arrastreIcono = null;
Simu.InterfazMódulos._menuContextual = null;
Simu.InterfazMódulos._cerrarMenuAlClickear = null;
Simu.InterfazMódulos._panelColor = null;
Simu.InterfazMódulos._pickerColor = null;


Simu.InterfazMódulos.Inicializar = function () {
  if (Simu.InterfazMódulos._lienzoSvg) {
    Simu.InterfazMódulos._lienzoSvg.removeEventListener(
      "click",
      Simu.InterfazMódulos._onClickLienzo_,
    );
    Simu.InterfazMódulos._lienzoSvg.removeEventListener(
      "contextmenu",
      Simu.InterfazMódulos._onContextMenu_,
    );
  }
  Simu.InterfazMódulos._OcultarMenuContextual_();
  Simu.InterfazMódulos._claveSeleccionada = null;
  Simu.InterfazMódulos._QuitarOverlaySelección_();


  Simu.InterfazMódulos._lienzoSvg = Simu.Diseño.escenario._lienzo._nodoHtml;
  Simu.InterfazMódulos._ReconstruirMapaDeNodos_();


  Simu.InterfazMódulos._lienzoSvg.addEventListener(
    "click",
    Simu.InterfazMódulos._onClickLienzo_,
  );
  Simu.InterfazMódulos._lienzoSvg.addEventListener(
    "contextmenu",
    Simu.InterfazMódulos._onContextMenu_,
  );
};


Simu.InterfazMódulos._ReconstruirMapaDeNodos_ = function () {
  const claves = Object.keys(Simu.Diseño.componentes);
  const contenido = Simu.Diseño.escenario._lienzo._contenido;
  Simu.InterfazMódulos._mapaNodos = claves
    .map((clave, i) => ({
      clave,
      nodo: contenido[i] ? contenido[i]._nodoHtml : null,
    }))
    .filter((entrada) => entrada.nodo);
};


Simu.InterfazMódulos._componenteBajoElCursor_ = function (clientX, clientY) {
  for (let i = Simu.InterfazMódulos._mapaNodos.length - 1; i >= 0; i--) {
    const { clave, nodo } = Simu.InterfazMódulos._mapaNodos[i];
    const rect = nodo.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return clave;
    }
  }
  return null;
};


Simu.InterfazMódulos._onClickLienzo_ = function (evento) {
  if (Simu.Cables._estadoDibujo !== null) return;
  if (Simu.Cables._pinBajoElCursor_(evento.clientX, evento.clientY)) return;
  if (Simu.Cables._cableBajoElCursor_(evento.clientX, evento.clientY)) return;


  const clave = Simu.InterfazMódulos._componenteBajoElCursor_(
    evento.clientX,
    evento.clientY,
  );
  if (clave) {
    Simu.InterfazMódulos._Seleccionar_(clave);
  } else {
    Simu.InterfazMódulos.Deseleccionar();
  }
};


Simu.InterfazMódulos._Seleccionar_ = function (clave) {
  if (Simu.InterfazMódulos._claveSeleccionada === clave) {
    Simu.InterfazMódulos.Deseleccionar();
    return;
  }
  Simu.InterfazMódulos._claveSeleccionada = clave;
  Simu.InterfazMódulos.ActualizarOverlay_();
};


Simu.InterfazMódulos.Deseleccionar = function () {
  Simu.InterfazMódulos._claveSeleccionada = null;
  Simu.InterfazMódulos._QuitarOverlaySelección_();
};


Simu.InterfazMódulos.ActualizarOverlay_ = function () {
  if (!Simu.InterfazMódulos._claveSeleccionada) return;
  const entrada = Simu.InterfazMódulos._mapaNodos.find(
    (e) => e.clave === Simu.InterfazMódulos._claveSeleccionada,
  );
  if (!entrada) {
    Simu.InterfazMódulos.Deseleccionar();
    return;
  }


  const MARGEN = 6;
  const rect = entrada.nodo.getBoundingClientRect();


  if (!Simu.InterfazMódulos._rectSeleccion) {
    const rectSeleccion = document.createElement("div");
    rectSeleccion.style.cssText = [
      "position:fixed",
      "border:2px dashed #2d8cff",
      "border-radius:4px",
      "pointer-events:none",
      "z-index:900",
    ].join(";");
    document.body.appendChild(rectSeleccion);
    Simu.InterfazMódulos._rectSeleccion = rectSeleccion;
  }
  Simu.InterfazMódulos._rectSeleccion.style.left = `${rect.left - MARGEN}px`;
  Simu.InterfazMódulos._rectSeleccion.style.top = `${rect.top - MARGEN}px`;
  Simu.InterfazMódulos._rectSeleccion.style.width = `${rect.width + MARGEN * 2}px`;
  Simu.InterfazMódulos._rectSeleccion.style.height = `${rect.height + MARGEN * 2}px`;


  if (!Simu.InterfazMódulos._iconoMover) {
    const iconoMover = document.createElement("div");
    iconoMover.title = "Mover módulo";
    iconoMover.textContent = "⋮⋮";
    iconoMover.style.cssText = [
      "position:fixed",
      "width:22px",
      "height:22px",
      "line-height:22px",
      "text-align:center",
      "background:#2d8cff",
      "color:#fff",
      "border-radius:5px",
      "cursor:grab",
      "user-select:none",
      "z-index:901",
    ].join(";");
    document.body.appendChild(iconoMover);
    Simu.InterfazMódulos._iconoMover = iconoMover;
  }
  Simu.InterfazMódulos._iconoMover.style.left = `${rect.left - MARGEN - 11}px`;
  Simu.InterfazMódulos._iconoMover.style.top = `${rect.top - MARGEN - 11}px`;
  Simu.InterfazMódulos._iconoMover.onpointerdown =
    Simu.InterfazMódulos._onPointerDownIcono_;


  const datos =
    Simu.Diseño.componentes[Simu.InterfazMódulos._claveSeleccionada];
  if (datos && datos.clase === "LED") {
    Simu.InterfazMódulos._MostrarPanelColor_(datos.componente, rect, MARGEN);
  } else {
    Simu.InterfazMódulos._OcultarPanelColor_();
  }
};


Simu.InterfazMódulos._QuitarOverlaySelección_ = function () {
  if (
    Simu.InterfazMódulos._rectSeleccion &&
    Simu.InterfazMódulos._rectSeleccion.parentNode
  ) {
    Simu.InterfazMódulos._rectSeleccion.parentNode.removeChild(
      Simu.InterfazMódulos._rectSeleccion,
    );
  }
  Simu.InterfazMódulos._rectSeleccion = null;
  if (
    Simu.InterfazMódulos._iconoMover &&
    Simu.InterfazMódulos._iconoMover.parentNode
  ) {
    Simu.InterfazMódulos._iconoMover.parentNode.removeChild(
      Simu.InterfazMódulos._iconoMover,
    );
  }
  Simu.InterfazMódulos._iconoMover = null;
  Simu.InterfazMódulos._OcultarPanelColor_();
};


Simu.InterfazMódulos._MostrarPanelColor_ = function (componente, rect, margen) {
  if (!Simu.InterfazMódulos._panelColor) {
    const panel = document.createElement("div");
    panel.style.cssText = [
      "position:fixed",
      "background:#2d2d2d",
      "border:1px solid #555",
      "border-radius:8px",
      "padding:6px 8px",
      "display:flex",
      "align-items:center",
      "box-shadow:0 4px 12px rgba(0,0,0,0.5)",
      "z-index:901",
    ].join(";");


    const picker = document.createElement("input");
    picker.type = "color";
    picker.title = "Color del led";
    picker.style.cssText =
      "width:28px;height:24px;border:none;background:none;cursor:pointer;padding:0";
    picker.addEventListener("click", (e) => e.stopPropagation());
    panel.appendChild(picker);


    document.body.appendChild(panel);
    Simu.InterfazMódulos._panelColor = panel;
    Simu.InterfazMódulos._pickerColor = picker;
  }


  Simu.InterfazMódulos._pickerColor.value = componente.color();
  Simu.InterfazMódulos._pickerColor.oninput = function () {
    componente.CambiarColorA_(Simu.InterfazMódulos._pickerColor.value);
  };


  Simu.InterfazMódulos._panelColor.style.left = `${rect.right + margen + 6}px`;
  Simu.InterfazMódulos._panelColor.style.top = `${rect.top - margen}px`;
};


Simu.InterfazMódulos._OcultarPanelColor_ = function () {
  if (
    Simu.InterfazMódulos._panelColor &&
    Simu.InterfazMódulos._panelColor.parentNode
  ) {
    Simu.InterfazMódulos._panelColor.parentNode.removeChild(
      Simu.InterfazMódulos._panelColor,
    );
  }
  Simu.InterfazMódulos._panelColor = null;
  Simu.InterfazMódulos._pickerColor = null;
};


Simu.InterfazMódulos._onPointerDownIcono_ = function (evento) {
  evento.preventDefault();
  evento.stopPropagation();
  const clave = Simu.InterfazMódulos._claveSeleccionada;
  if (!clave) return;
  Simu.InterfazMódulos._arrastreIcono = {
    componente: Simu.Diseño.componentes[clave].componente,
    clientXInicial: evento.clientX,
    clientYInicial: evento.clientY,
    zoom: Simu.Diseño.escenario.cámara().zoom(),
  };
  Simu.InterfazMódulos._arrastreIcono.xInicial =
    Simu.InterfazMódulos._arrastreIcono.componente.posiciónEnX();
  Simu.InterfazMódulos._arrastreIcono.yInicial =
    Simu.InterfazMódulos._arrastreIcono.componente.posiciónEnY();
  document.addEventListener(
    "pointermove",
    Simu.InterfazMódulos._onPointerMoveIcono_,
  );
  document.addEventListener(
    "pointerup",
    Simu.InterfazMódulos._onPointerUpIcono_,
  );
};


Simu.InterfazMódulos._onPointerMoveIcono_ = function (evento) {
  const arrastre = Simu.InterfazMódulos._arrastreIcono;
  if (!arrastre) return;
  const dx = ((evento.clientX - arrastre.clientXInicial) * 100) / arrastre.zoom;
  const dy = ((evento.clientY - arrastre.clientYInicial) * 100) / arrastre.zoom;
  arrastre.componente.CambiarPosiciónXA_(Math.round(arrastre.xInicial + dx));
  arrastre.componente.CambiarPosiciónYA_(Math.round(arrastre.yInicial + dy));
  Simu.Cables.ActualizarPosicionesCables_();
  Simu.InterfazMódulos.ActualizarOverlay_();
};


Simu.InterfazMódulos._onPointerUpIcono_ = function () {
  Simu.InterfazMódulos._arrastreIcono = null;
  document.removeEventListener(
    "pointermove",
    Simu.InterfazMódulos._onPointerMoveIcono_,
  );
  document.removeEventListener(
    "pointerup",
    Simu.InterfazMódulos._onPointerUpIcono_,
  );
};


Simu.InterfazMódulos._onContextMenu_ = function (evento) {
  evento.preventDefault();
  Simu.InterfazMódulos._MostrarMenuContextual_(evento.clientX, evento.clientY);
};


Simu.InterfazMódulos._MostrarMenuContextual_ = function (clientX, clientY) {
  Simu.InterfazMódulos._OcultarMenuContextual_();


  const menu = document.createElement("div");
  menu.style.cssText = [
    "position:fixed",
    `left:${clientX}px`,
    `top:${clientY}px`,
    "background:#2d2d2d",
    "border:1px solid #555",
    "border-radius:8px",
    "padding:6px 0",
    "min-width:170px",
    "box-shadow:0 4px 12px rgba(0,0,0,0.5)",
    "z-index:1000",
  ].join(";");


  for (const tipo of Simu.InterfazMódulos._tiposDeMóduloAgregables) {
    const opción = document.createElement("div");
    opción.textContent = tipo.etiqueta;
    opción.style.cssText =
      "padding:6px 14px;color:#eee;cursor:pointer;font:14px sans-serif";
    opción.addEventListener("mouseenter", () => {
      opción.style.background = "#444";
    });
    opción.addEventListener("mouseleave", () => {
      opción.style.background = "transparent";
    });
    opción.addEventListener("click", (e) => {
      e.stopPropagation();
      Simu.InterfazMódulos._OcultarMenuContextual_();
      Simu.InterfazMódulos._AgregarComponente_(tipo.clase);
    });
    menu.appendChild(opción);
  }


  document.body.appendChild(menu);
  Simu.InterfazMódulos._menuContextual = menu;


  Simu.InterfazMódulos._cerrarMenuAlClickear = function (e) {
    if (!menu.contains(e.target)) {
      Simu.InterfazMódulos._OcultarMenuContextual_();
    }
  };
  setTimeout(() => {
    document.addEventListener(
      "click",
      Simu.InterfazMódulos._cerrarMenuAlClickear,
    );
    document.addEventListener(
      "contextmenu",
      Simu.InterfazMódulos._cerrarMenuAlClickear,
    );
  }, 0);
};


Simu.InterfazMódulos._OcultarMenuContextual_ = function () {
  if (
    Simu.InterfazMódulos._menuContextual &&
    Simu.InterfazMódulos._menuContextual.parentNode
  ) {
    Simu.InterfazMódulos._menuContextual.parentNode.removeChild(
      Simu.InterfazMódulos._menuContextual,
    );
  }
  Simu.InterfazMódulos._menuContextual = null;
  if (Simu.InterfazMódulos._cerrarMenuAlClickear) {
    document.removeEventListener(
      "click",
      Simu.InterfazMódulos._cerrarMenuAlClickear,
    );
    document.removeEventListener(
      "contextmenu",
      Simu.InterfazMódulos._cerrarMenuAlClickear,
    );
    Simu.InterfazMódulos._cerrarMenuAlClickear = null;
  }
};


Simu.InterfazMódulos._NuevaClaveParaClase_ = function (clase) {
  let contador = 1;
  let clave;
  do {
    clave = `${clase}_${contador}`;
    contador++;
  } while (clave in Simu.Diseño.componentes);
  return clave;
};


Simu.InterfazMódulos._AgregarComponente_ = function (clase) {
  const clave = Simu.InterfazMódulos._NuevaClaveParaClase_(clase);
  const datos = { clase, ubicación: Mila.Geometria.puntoEn__(0, 0) };
  const componente = Simu.Componentes.nuevo(datos);
  datos.componente = componente;
  delete datos.ubicación;
  Simu.Diseño.componentes[clave] = datos;


  Simu.Carga.alTerminarDeCargar(function () {
    Simu.InterfazMódulos._PlasmarComponenteNuevo_(componente);
    Simu.Cables._construirMapaDePinesANodos_();
    Simu.InterfazMódulos._ReconstruirMapaDeNodos_();
    Simu.InterfazMódulos._Seleccionar_(clave);
  });
};


Simu.InterfazMódulos._PlasmarComponenteNuevo_ = function (componente) {
  const escenario = Simu.Diseño.escenario;
  const elementoEscenario = Mila.Pantalla._nuevoElementoEscenario(
    componente,
    escenario,
  );
  escenario._contenido.push(elementoEscenario);
  const dibujable = Mila.Pantalla._dibujableParaDibujo_(
    elementoEscenario.dibujo(),
  );
  escenario._lienzo._contenido.push(dibujable);
  dibujable.PlasmarEnHtml(escenario._lienzo._nodoHtml);
};



