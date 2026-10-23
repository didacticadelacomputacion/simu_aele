Mila.Módulo({
  define:"Simu.Componentes",
  necesita:["$milascript/base"],
  usa:["$milascript/geometria","$milascript/svg","$milascript/dibujo","carga"]
});

// Componente genérico (superclase de todos los componentes)

Simu.Componentes._Componente = function Componente() {};

Mila.Tipo.Registrar({
  nombre: "Componente",
  prototipo: Simu.Componentes._Componente
});

Simu.Componentes.nuevo = function(datosComponente) {
  Mila.Contrato({
    Propósito: [
      "Describe un nuevo componente a partir de los datos dados",
      Mila.Tipo.Componente
    ],
    Parámetros: [
      [datosComponente]
    ]
  });
  switch (datosComponente.clase) {
    case "BOARD":
      return Simu.Componentes.nuevaPlaca(datosComponente);
    case "PIN":
      return Simu.Componentes.nuevoPin(datosComponente);
    case "LED":
      return Simu.Componentes.nuevoLed(datosComponente);
    case "BUZZER":
      return Simu.Componentes.nuevoBuzzer(datosComponente);
    case "SERVO":
      return Simu.Componentes.nuevoServo(datosComponente);
    case "LED_MATRIX":
      return Simu.Componentes.nuevaMatrizLed(datosComponente);
    case "ULTRASONIC":
      return Simu.Componentes.nuevoSonar(datosComponente);
    case "LDR":
      return Simu.Componentes.nuevoLdr(datosComponente);
    case "MONITOR":
      return Simu.Componentes.nuevoMonitor(datosComponente);
  }
};

Simu.Componentes._Componente.prototype.Inicializar = function(datosComponente) {
  Mila.Contrato({
    Propósito: "Inicializa este componente.",
    Parámetros: [
      [datosComponente]
    ]
  });
  this.CambiarPosiciónXA_(datosComponente.defineLaClave_('ubicación')
    ? datosComponente.ubicación.x
    : 0
  );
  this.CambiarPosiciónYA_(datosComponente.defineLaClave_('ubicación')
    ? datosComponente.ubicación.y
    : 0
  );
  this.CambiarDibujoBaseA_(Mila.Dibujo.deRutaSvg_([
    Mila.Svg.nuevoComando('m',[0,0]),
    Mila.Svg.nuevoComando('h',[50]),
    Mila.Svg.nuevoComando('v',[50]),
    Mila.Svg.nuevoComando('h',[-50]),
    Mila.Svg.nuevoComando('z',[])
  ], {colorFondo: "#ddd"}));
};

Simu.Componentes._Componente.prototype.CambiarPosiciónXA_ = function(nuevaPosiciónX) {
  Mila.Contrato({
    Propósito: "Cambiar la posición x de este componente por la dada.",
    Parámetros: [
      [nuevaPosiciónX, Mila.Tipo.Numero]
    ]
  });
  this._posiciónX = nuevaPosiciónX;
};

Simu.Componentes._Componente.prototype.CambiarPosiciónYA_ = function(nuevaPosiciónY) {
  Mila.Contrato({
    Propósito: "Cambiar la posición y de este componente por la dada.",
    Parámetros: [
      [nuevaPosiciónY, Mila.Tipo.Numero]
    ]
  });
  this._posiciónY = nuevaPosiciónY;
};

Simu.Componentes._Componente.prototype.CambiarDibujoBaseA_ = function(nuevoDibujo) {
  Mila.Contrato({
    Propósito: "Cambiar el dibujo de este componente por el dado.",
    Parámetros: [
      [nuevoDibujo, Mila.Tipo.Dibujo]
    ]
  });
  this._dibujoBase = nuevoDibujo;
};

Simu.Componentes._Componente.prototype.ubicación = function() {
  Mila.Contrato({
    Propósito: ["Describir la ubicación de este componente.", Mila.Tipo.Punto]
  });
  return Mila.Geometria.puntoEn__(this._posiciónX, this._posiciónY);
};

Simu.Componentes._Componente.prototype.posiciónEnX = function() {
  Mila.Contrato({
    Propósito: ["Describir la posición x de este componente.", Mila.Tipo.Numero]
  });
  return this._posiciónX;
};

Simu.Componentes._Componente.prototype.posiciónEnY = function() {
  Mila.Contrato({
    Propósito: ["Describir la posición Y de este componente.", Mila.Tipo.Numero]
  });
  return this._posiciónY;
};

Simu.Componentes._Componente.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este componente.", Mila.Tipo.Dibujo]
  });
  /* Esta función debería reemplazarla cada subtipo de módulo para devolver un dibujo que sea un grupo entre el dibujo base y
      todas sus partes móviles */
  return this._dibujoBase;
};

// Placa

Simu.Componentes._Placa = function Placa() {};
Object.setPrototypeOf(Simu.Componentes._Placa.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponentePlaca",
  prototipo: Simu.Componentes._Placa,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevaPlaca = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describir una nueva placa a partir de los datos dados.", Mila.Tipo.ComponentePlaca],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Placa();
  nuevo.Inicializar(datosComponente);
  nuevo._modelo = 'modelo' in datosComponente ? datosComponente.modelo : "UNO_R3";
  const prefijoNombreArchivos = `${nuevo._modelo}`;
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_BASE.svg`,
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (const id of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,'A0','A1','A2','A3','A4','A5']) {
    nuevo._pines[`pin_${id}`] = {};
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_pin_${id}.svg`,
      (dibujo) => {
        nuevo._pines[`pin_${id}`].dibujo = dibujo;
      }
    );
  }
  // nuevo._led = ...
  return nuevo;
};

Simu.Componentes._Placa.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de esta placa.", Mila.Tipo.Dibujo]
  });
  return Mila.Dibujo.deGrupo_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase)/*.snoc(this._led.dibujo)*/, {escala:0.5});
};

// Pin

Simu.Componentes._Pin = function Pin() {};
Object.setPrototypeOf(Simu.Componentes._Pin.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponentePin",
  prototipo: Simu.Componentes._Pin,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoPin = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describir un nuevo pin a partir de los datos dados.", Mila.Tipo.ComponentePin],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Pin();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

// Led

Simu.Componentes._Led = function Led() {};
Object.setPrototypeOf(Simu.Componentes._Led.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteLed",
  prototipo: Simu.Componentes._Led,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoLed = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describir un nuevo led a partir de los datos dados.", Mila.Tipo.ComponenteLed],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Led();
  nuevo.Inicializar(datosComponente);
  nuevo._tamaño = 'tamaño' in datosComponente ? datosComponente.tamaño : 10;
  const prefijoNombreArchivos = `LED_${nuevo._tamaño}mm`;
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_BASE.svg`,
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (let i of ['positivo', 'negativo']) {
    nuevo._pines[`pin_${i}`] = {};
    const j = i;
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_pin_${j}.svg`,
      (dibujo) => {
        // TODO: Agregar evento de clic a 'dibujo'.
        nuevo._pines[`pin_${j}`].dibujo = dibujo;
      }
    );
  }
  nuevo._cristal = {};
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_Cristal.svg`,
    (dibujo) => {
      nuevo._cristal.dibujo = dibujo;
      nuevo.CambiarColorA_('color' in datosComponente ? datosComponente.color : "#fff");
    }
  );
  nuevo._brillo = {};
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_Brillo.svg`,
    (dibujo) => {
      nuevo._brillo.dibujo = dibujo;
      nuevo._brillo.capa = dibujo._grupo[0]._grupo[1];
      nuevo._brillo.gradiente = Simu.Componentes._NuevoGradienteDeBrillo_();
      nuevo._brillo.capa.CambiarEstilo_A_('colorFondo', `url(#${nuevo._brillo.gradiente.id})`);
      nuevo.EstablecerValorEn_("LOW", "BINARIA");
      nuevo.CambiarColorA_('color' in datosComponente ? datosComponente.color : "#fff");
    }
  );
  // ¿ nuevo._rayos = ... ?
  return nuevo;
};


Simu.Componentes._contadorGradientesDeBrillo = 0;

Simu.Componentes._DefsDeGradientesDeBrillo_ = function() {
  if(!Simu.Componentes._defsDeGradientesDeBrillo) {
    const svgOculto = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOculto.setAttribute("width", "0");
    svgOculto.setAttribute("height", "0");
    svgOculto.style.position = "absolute";
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgOculto.appendChild(defs);
    document.body.appendChild(svgOculto);
    Simu.Componentes._defsDeGradientesDeBrillo = defs;
  }
  return Simu.Componentes._defsDeGradientesDeBrillo;
}

Simu.Componentes._NuevoGradienteDeBrillo_ = function() {
  const id = `brillo-led-${Simu.Componentes._contadorGradientesDeBrillo++}`;
  const gradiente = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
  gradiente.setAttribute("id", id);
  gradiente.setAttribute("gradientUnits", "userSpaceOnUse");
  gradiente.setAttribute("cx", "50");
  gradiente.setAttribute("cy", "36.384487");
  gradiente.setAttribute("r", "56.565");
  const paradaCentro = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaCentro.setAttribute("offset", "0%");
  paradaCentro.setAttribute("stop-opacity", "1");
  const paradaMedia = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaMedia.setAttribute("offset", "18%");
  paradaMedia.setAttribute("stop-opacity", "0.85");
  const paradaFinDelBrillo = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaFinDelBrillo.setAttribute("offset", "65%");
  paradaFinDelBrillo.setAttribute("stop-opacity", "0");
  const paradaBorde = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaBorde.setAttribute("offset", "100%");
  paradaBorde.setAttribute("stop-opacity", "0");
  gradiente.append(paradaCentro, paradaMedia, paradaFinDelBrillo, paradaBorde);
  Simu.Componentes._DefsDeGradientesDeBrillo_().appendChild(gradiente);
  return {id, paradaCentro, paradaMedia, paradaFinDelBrillo, paradaBorde};
};



Simu.Componentes._Led.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este LED.", Mila.Tipo.Dibujo]
  });
  return Mila.Dibujo.deGrupo_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase).concatenadaCon_([this._cristal.dibujo, this._brillo.dibujo]));
};

Simu.Componentes._Led.prototype.CambiarColorA_ = function(nuevoColor) {
  Mila.Contrato({
    Propósito: "Cambiar el color de este LED por el dado.",
    Parámetros: [
      [nuevoColor, Mila.Tipo.Texto] // ¿Color?
    ]
  });
  this._color = nuevoColor;
  if('dibujo' in this._cristal){
    this._cristal.dibujo._grupo[0]._grupo[1].CambiarEstilo_A_('colorFondo', nuevoColor);
    this._cristal.dibujo._grupo[0]._grupo[2].CambiarEstilo_A_('colorFondo', nuevoColor);
  }
  if('gradiente' in this._brillo) {
    this._brillo.gradiente.paradaCentro.setAttribute("stop-color", nuevoColor);
    this._brillo.gradiente.paradaMedia.setAttribute("stop-color", nuevoColor);
    this._brillo.gradiente.paradaFinDelBrillo.setAttribute("stop-color", nuevoColor);
    this._brillo.gradiente.paradaBorde.setAttribute("stop-color", nuevoColor);
  }
};

Simu.Componentes._Led.prototype.color = function() {
  return this._color;
};

Simu.Componentes._Led.prototype.EstablecerValorEn_ = function(valor, intensidad) {
  Mila.Contrato({
    Propósito: "Encender o apagar el brillo de este LED según el valor y la intensidad dados.",
    Parámetros: [
      [valor, Mila.Tipo.O[Mila.Tipo.Texto, Mila.Tipo.Numero]],
      [intensidad, Mila.Tipo.Texto]
    ]
  });
  let opacidad;
  if (intensidad == "BINARIA") {
    opacidad = (valor == "HIGH") ? 1 : 0;
  } else if (intensidad == "PORCENTAJE") {
    opacidad = valor / 100;
  } else /* RAW */ {
    opacidad = valor / 255;
  }
  this._brillo.capa.CambiarEstilo_A_('opacidadFondo', opacidad);
};


Simu.Componentes._Led.prototype.Reiniciar = function() {
  Mila.Contrato({
    Propósito: "Devolver este LED a su estado apagado."
  });
  this.EstablecerValorEn_("LOW", "BINARIA");
};

// Buzzer

Simu.Componentes._Buzzer = function Buzzer() {};
Object.setPrototypeOf(Simu.Componentes._Buzzer.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteBuzzer",
  prototipo: Simu.Componentes._Buzzer,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoBuzzer = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describir un nuevo buzzer a partir de los datos dados.", Mila.Tipo.ComponenteBuzzer],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Buzzer();
  nuevo.Inicializar(datosComponente);
  const prefijoNombreArchivos = 'BUZZER';
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_BASE.svg`,
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (let i of ['positivo', 'negativo']) {
    nuevo._pines[`pin_${i}`] = {};
    const j = i;
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_pin_${j}.svg`,
      (dibujo) => {
        // TODO: Agregar evento de clic a 'dibujo'.
        nuevo._pines[`pin_${j}`].dibujo = dibujo;
      }
    );
  }
  // nuevo._ondasDeSonido = ...
  return nuevo;
};

Simu.Componentes._Buzzer.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este buzzer.", Mila.Tipo.Dibujo]
  });
  return Mila.Dibujo.deGrupo_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase)/*.snoc(this._ondasDeSonido.dibujo)*/);
};

// Servo

Simu.Componentes._Servo = function Servo() {};
Object.setPrototypeOf(Simu.Componentes._Servo.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteServo",
  prototipo: Simu.Componentes._Servo,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoServo = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo servo a partir de los datos dados.", Mila.Tipo.ComponenteServo],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Servo();
  nuevo.Inicializar(datosComponente);
  const prefijoNombreArchivos = 'SERVO';
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_BASE.svg`,
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pata = {};
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_${
      'tipoPata' in datosComponente ? datosComponente.tipoPata : 'pata1'
    }.svg`,
    (dibujo) => {
      // TODO: Pensar cómo hacer para que no haya que harcodear esto.
      dibujo.estilo().ejeDeRotaciónX = 95;
      dibujo.estilo().ejeDeRotaciónY = 95;
      nuevo._pata.dibujo = dibujo;
    }
  );
  nuevo._pines = {};
  for (let i of ['negativo', 'positivo', 'dato']) {
    nuevo._pines[`pin_${i}`] = {};
    const j = i;
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_pin_${j}.svg`,
      (dibujo) => {
        // TODO: Agregar evento de clic a 'dibujo'.
        nuevo._pines[`pin_${j}`].dibujo = dibujo;
      }
    );
  }
  return nuevo;
};

Simu.Componentes._Servo.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este servo.", Mila.Tipo.Dibujo]
  });
  return Mila.Dibujo.deGrupo_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase).snoc(this._pata.dibujo));
};

Simu.Componentes._Servo.prototype.RotarPataA_Grados = function(ángulo) {
  Mila.Contrato({
    Propósito: "Cambiar el ángulo de rotación de la pata de este servo por el dado.",
    Parámetros: [
      [ángulo, Mila.Tipo.Numero]
    ]
  });
  this._pata.dibujo.CambiarEstilo_A_('rotación', ángulo);
};

// Matriz de leds

Simu.Componentes._MatrizLed = function MatrizLed() {};
Object.setPrototypeOf(Simu.Componentes._MatrizLed.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteMatrizLed",
  prototipo: Simu.Componentes._MatrizLed,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevaMatrizLed = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe una nueva matriz led a partir de los datos dados.", Mila.Tipo.ComponenteMatrizLed],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._MatrizLed();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

// Sonar

Simu.Componentes._Sonar = function Sonar() {};
Object.setPrototypeOf(Simu.Componentes._Sonar.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteSonar",
  prototipo: Simu.Componentes._Sonar,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoSonar = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo sonar a partir de los datos dados.", Mila.Tipo.ComponenteSonar],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Sonar();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

// Sensor de luz

Simu.Componentes._Ldr = function Ldr() {};
Object.setPrototypeOf(Simu.Componentes._Ldr.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteLdr",
  prototipo: Simu.Componentes._Ldr,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoLdr = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo ldr a partir de los datos dados.", Mila.Tipo.ComponenteLdr],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Ldr();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

// Monitor

Simu.Componentes._Monitor = function Monitor() {};
Object.setPrototypeOf(Simu.Componentes._Monitor.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteMonitor",
  prototipo: Simu.Componentes._Monitor,
  subtipoDe: "Componente"
});

Simu.Componentes.nuevoMonitor = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo monitor a partir de los datos dados.", Mila.Tipo.ComponenteMonitor],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Monitor();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};