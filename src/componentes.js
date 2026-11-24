Mila.Módulo({
  define:"Simu.Componentes",
  necesita:["$milascript/base"],
  usa:["$milascript/geometria","$milascript/svg","$milascript/dibujo","$milascript/audio","carga"]
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
  this.CambiarRotaciónA_(datosComponente.defineLaClave_('rotación')
    ? datosComponente.rotación
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
  return this._dibujoRotable_([this._dibujoBase]);
};


Simu.Componentes._Componente.prototype.CargarTamañoSvgDe_ = function(ruta) {
  Mila.Contrato({
    Propósito: "Leer el tamaño del archivo svg dado y guardarlo como el tamaño del svg de este componente.",
    Parámetros: [
      [ruta, Mila.Tipo.Texto]
    ]
  });
  Simu.Carga.CargarTamañoDeSvg_YLuego_(ruta, (tamaño) => {
    this._tamañoSvg = tamaño;
  });
};


Simu.Componentes._Componente.prototype.rotación = function() {
  Mila.Contrato({
    Propósito: ["Describir el ángulo en grados (entre 0 y 360, sentido horario) que está rotado este componente.", Mila.Tipo.Numero]
  });
  return this._rotación || 0;
};


Simu.Componentes._Componente.prototype.CambiarRotaciónA_ = function(grados) {
  Mila.Contrato({
    Propósito: "Rotar este componente sobre su centro hasta el ángulo dado (en grados, sentido horario).",
    Parámetros: [
      [grados, Mila.Tipo.Numero]
    ]
  });
  this._rotación = ((grados % 360) + 360) % 360;
  if (this._grupoRotable) {
    this._grupoRotable.CambiarRotaciónA_(this._rotación);
  }
};


Simu.Componentes._Componente.prototype._dibujoRotable_ = function(partes) {
  Mila.Contrato({
    Propósito: [
      "Describir el dibujo de este componente a partir de las partes dadas, de modo que se pueda rotar con CambiarRotaciónA_.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [partes, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)]
    ]
  });
  if (!this._grupoRotable) {
    const tamaño = this._tamañoSvg || {ancho:50, alto:50};
    this._grupoRotable = Mila.Dibujo.deGrupo_(partes, {
      rotación: this.rotación(),
      ejeDeRotaciónX: Math.round(tamaño.ancho / 2),
      ejeDeRotaciónY: Math.round(tamaño.alto / 2)
    });
  }
  return Mila.Dibujo.deGrupo_([this._grupoRotable]);
};

Simu.Componentes._Componente.prototype.CambiarPinesDeCorrienteA_ = function(pinesDeCorriente) {
  Mila.Contrato({
    Propósito: "Declarar qué pines de este componente necesitan estar conectados a la placa para que funcione: la tierra siempre y, \
      si el componente la necesita, también la alimentación.",
    Parámetros: [
      [pinesDeCorriente]
    ]
  });
  this._pinesDeCorriente = pinesDeCorriente;
};
Simu.Componentes._Componente.prototype.estáConectadoALaCorriente = function() {
  Mila.Contrato({
    Propósito: [
      "Indicar si este componente tiene conectados a la placa los pines que necesita para funcionar: solo GND (por ejemplo, un led) \
      o GND y VCC (por ejemplo, un sonar). Un componente que no declara pines de corriente siempre está conectado.",
      Mila.Tipo.Booleano
    ]
  });
  const pinesDeCorriente = this._pinesDeCorriente;
  if (!pinesDeCorriente) {
    return true;
  }
  const placa = Simu.Diseño.placaEnEscenario();
  if (!placa) {
    return false;
  }
  const conexiones = Simu.Cables.conexionesPlaca_(placa);
  const estáConectado = (pinDelComponente, pinesDeLaPlaca) => conexiones.some(
    c => c.componente === this && c.pinComponente === pinDelComponente && pinesDeLaPlaca.includes(c.pin)
  );
  return estáConectado(pinesDeCorriente.tierra, ['pin_Gnd0', 'pin_Gnd1', 'pin_Gnd2']) && (
    !pinesDeCorriente.alimentación ||
    estáConectado(pinesDeCorriente.alimentación, ['pin_5v', 'pin_3v'])
  );
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
  nuevo.CargarTamañoSvgDe_(`${nuevo._modelo}_BASE.svg`);
  const prefijoNombreArchivos = `${nuevo._modelo}`;
  Simu.Carga.CargarArchivoSvg_YLuego_(
    `${prefijoNombreArchivos}_BASE.svg`,
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (const id of [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,
    'A0','A1','A2','A3','A4','A5',
    'Scl','Sda','Aref','Ioref','Nc','Reset',
    'Gnd0','Gnd1','Gnd2','Vin','3v','5v'
  ]) {
    nuevo._pines[`pin_${id}`] = {};
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_pin_${id}.svg`,
      (dibujo) => {
        nuevo._pines[`pin_${id}`].dibujo = dibujo;
      }
    );
  }
  nuevo._leds = {};
  for (const id of [
    'On', 13, 'Tx', 'Rx'
  ]) {
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `${prefijoNombreArchivos}_Led${id}.svg`,
      (dibujo) => {
        nuevo._leds[id] = {dibujo};
      }
    );
  }
  return nuevo;
};

Simu.Componentes._Placa.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de esta placa.", Mila.Tipo.Dibujo]
  });
  return this._dibujoRotable_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), (this._leds.fold(
      (clave, valor, rec) => rec.cons(valor.dibujo), []
    ))
  ).cons(this._dibujoBase));
};

Simu.Componentes._Componente.prototype.esUnaPlaca = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es una placa.", Mila.Tipo.Booleano]
  });
  return false;
};

Simu.Componentes._Placa.prototype.esUnaPlaca = function() { return true; };

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

Simu.Componentes._Componente.prototype.esUnPin = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es un pin.", Mila.Tipo.Booleano]
  });
  return false;
};

Simu.Componentes._Pin.prototype.esUnPin = function() { return true; };

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
  nuevo.CambiarPinesDeCorrienteA_({tierra:'pin_negativo'});
  nuevo._tamaño = 'tamaño' in datosComponente ? datosComponente.tamaño : 10;
  nuevo.CargarTamañoSvgDe_(`LED_${nuevo._tamaño}mm_BASE.svg`);
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
      nuevo.CambiarColorA_('color' in datosComponente ? datosComponente.color : "#ffffff");
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
      nuevo.CambiarColorA_('color' in datosComponente ? datosComponente.color : "#ffffff");
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
  gradiente.setAttribute("cx", "51");
  gradiente.setAttribute("cy", "52");
  gradiente.setAttribute("r", "56.565");
  const paradaCentro = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaCentro.setAttribute("offset", "0%");
  paradaCentro.setAttribute("stop-opacity", "0.7");
  const paradaMedia = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaMedia.setAttribute("offset", "30%");
  paradaMedia.setAttribute("stop-opacity", "0.6");
  const paradaFinDelBrillo = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  paradaFinDelBrillo.setAttribute("offset", "70%");
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
  return this._dibujoRotable_(this._pines.fold(
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
  if (opacidad > 0 && !this.estáConectadoALaCorriente()) {
    opacidad = 0;
  }
  this._brillo.capa.CambiarEstilo_A_('opacidadFondo', opacidad);
  this._intensidadLuminica = opacidad;
};


Simu.Componentes._Led.prototype.intensidadLuminica = function() {
  Mila.Contrato({
    Propósito: [
      "Describir qué tan intensamente está iluminando este LED, entre 0 (apagado) y 1 (máxima intensidad).",
      Mila.Tipo.Numero
    ]
  });
  return this._intensidadLuminica || 0;
};

Simu.Componentes._Led.prototype.Reiniciar = function() {
  Mila.Contrato({
    Propósito: "Devolver este LED a su estado apagado."
  });
  this.EstablecerValorEn_("LOW", "BINARIA");
};

Simu.Componentes._Componente.prototype.esUnLed = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es un led.", Mila.Tipo.Booleano]
  });
  return false;
};

Simu.Componentes._Led.prototype.esUnLed = function() { return true; };

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
  nuevo.CambiarPinesDeCorrienteA_({tierra:'pin_negativo'});
  nuevo.CargarTamañoSvgDe_('BUZZER_BASE.svg');
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
  nuevo._canal = Mila.Audio.nuevoCanal();
  nuevo._canal.EstablecerVolumenEn_(20);
  return nuevo;
};

Simu.Componentes._Buzzer.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este buzzer.", Mila.Tipo.Dibujo]
  });
  return this._dibujoRotable_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase)/*.snoc(this._ondasDeSonido.dibujo)*/);
};

Simu.Componentes._Buzzer.prototype.TocarNota_ = function(nota) {
  Mila.Contrato({
    Propósito: "Reproducir la nota dada (recibida como texto) en este buzzer.",
    Parámetros: [
      [nota, Mila.Tipo.Texto]
    ]
  });
  if (!this.estáConectadoALaCorriente()) {
    this.Detener();
    return;
  }
  this._canal.Reproducir(nota);
};

Simu.Componentes._Buzzer.prototype.Detener = function() {
  Mila.Contrato({
    Propósito: "Detener el sonido de este buzzer."
  });
  this._canal.Detener();
};

Simu.Componentes._Buzzer.prototype.Reiniciar = function() {
  Mila.Contrato({
    Propósito: "Devolver este buzzer a su estado apagado."
  });
  this.Detener();
};

Simu.Componentes._Componente.prototype.esUnBuzzer = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es un buzzer.", Mila.Tipo.Booleano]
  });
  return false;
};

Simu.Componentes._Buzzer.prototype.esUnBuzzer = function() { return true; };

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
  nuevo.CambiarPinesDeCorrienteA_({tierra:'pin_negativo', alimentación:'pin_positivo'});
  nuevo.CargarTamañoSvgDe_('SERVO_BASE.svg');
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
  return this._dibujoRotable_(this._pines.fold(
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
  nuevo.CambiarPinesDeCorrienteA_({tierra:'pin_GND', alimentación:'pin_VCC'});
  nuevo.CargarTamañoSvgDe_('ULTRASONIC_BASE.svg');
  Simu.Carga.CargarArchivoSvg_YLuego_(
    "ULTRASONIC_BASE.svg",
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (let nombrePin of ['VCC', 'Trigger', 'Echo', 'GND']) {
    nuevo._pines[`pin_${nombrePin}`] = {};
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `ULTRASONIC_Pin${nombrePin}.svg`,
      (dibujo) => {
        nuevo._pines[`pin_${nombrePin}`].dibujo = dibujo;
      }
    );
  }
  return nuevo;
};


Simu.Componentes._Sonar.alcanceMáximoEnCm = 50;
Simu.Componentes._Sonar.semiaperturaEnGrados = 15;
Simu.Componentes._Sonar.anchoDelFrente = 160;
Simu.Componentes.unidadesPorCm = 46.6;


Simu.Componentes._Sonar.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este sonar.", Mila.Tipo.Dibujo]
  });
  return this._dibujoRotable_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase));
};


Simu.Componentes._Sonar.prototype.conoEnPantalla = function() {
  Mila.Contrato({
    Propósito: "Describir, en coordenadas de pantalla, el cono que cubre este sonar: sus cuatro esquinas (empieza plano en el frente del sensor y \
      llega hasta lo detectado, o hasta el alcance si no detecta nada), la distancia en pixeles desde el frente hasta lo más cercano \
      que hay dentro del cono y ese punto (null si no hay nada). Describe null si este sonar todavía no está en el escenario."
  });
  const nodo = Simu.Diseño.nodoHtmlDe_(this);
  if (!nodo) {
    return null;
  }
  const pixelesPorUnidad = Simu.Diseño.escenario.cámara().zoom() / 100;
  const rect = nodo.getBoundingClientRect();
  const centro = {x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2};
  const radianes = this.rotación() * Math.PI / 180;
  const dirección = {x: -Math.sin(radianes), y: Math.cos(radianes)};
  const lateral = {x: -dirección.y, y: dirección.x};
  const alFrente = this._tamañoSvg.alto / 2 * pixelesPorUnidad;
  const vértice = {x: centro.x + dirección.x * alFrente, y: centro.y + dirección.y * alFrente};
  const alcance = Simu.Componentes._Sonar.alcanceMáximoEnCm * Simu.Componentes.unidadesPorCm * pixelesPorUnidad;
  const mitadDelFrente = Simu.Componentes._Sonar.anchoDelFrente * pixelesPorUnidad / 2;
  const tangente = Math.tan(Simu.Componentes._Sonar.semiaperturaEnGrados * Math.PI / 180);
  const esquinasHasta = (largo) => [[0, -1], [largo, -1], [largo, 1], [0, 1]].map(([adelante, lado]) => {
    const mitad = mitadDelFrente + adelante * tangente;
    return {
      x: vértice.x + dirección.x * adelante + lateral.x * lado * mitad,
      y: vértice.y + dirección.y * adelante + lateral.y * lado * mitad
    };
  });
  const conoCompleto = esquinasHasta(alcance);
  let detectado = null;
  for (const r of Simu.Diseño.rectángulosEnPantallaDeLosDemásComponentes_(this)) {
    if (vértice.x > r.left && vértice.x < r.right && vértice.y > r.top && vértice.y < r.bottom) {
      continue;
    }
    const dentroDelCono = Simu.Componentes._recortarPolígonoConPolígono_(
      [{x: r.left, y: r.top}, {x: r.right, y: r.top}, {x: r.right, y: r.bottom}, {x: r.left, y: r.bottom}],
      conoCompleto
    );
    for (const punto of dentroDelCono) {
      const distancia = (punto.x - vértice.x) * dirección.x + (punto.y - vértice.y) * dirección.y;
      if (detectado === null || distancia < detectado.distancia) {
        detectado = {distancia, punto};
      }
    }
  }
  return {
    esquinas: esquinasHasta(detectado === null ? alcance : detectado.distancia),
    distanciaEnPixeles: detectado === null ? null : detectado.distancia,
    puntoDetectado: detectado === null ? null : detectado.punto
  };
};


Simu.Componentes._recortarPolígonoConPolígono_ = function(polígono, recortador) {
  Mila.Contrato({
    Propósito: "Describir el polígono que queda de recortar el polígono dado con el polígono convexo dado (Sutherland-Hodgman). \
      El recortador debe tener sus puntos en el orden del cono del sonar, que es el que deja su interior del lado positivo de cada arista.",
    Parámetros: [
      [polígono],
      [recortador]
    ]
  });
  let resultado = polígono;
  for (let i = 0; i < recortador.length && resultado.length > 0; i++) {
    const a = recortador[i];
    const b = recortador[(i + 1) % recortador.length];
    const lado = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    const entrada = resultado;
    resultado = [];
    entrada.forEach((p, j) => {
      const q = entrada[(j + 1) % entrada.length];
      const ladoP = lado(p);
      const ladoQ = lado(q);
      if (ladoP >= 0) {
        resultado.push(p);
      }
      if ((ladoP >= 0) !== (ladoQ >= 0)) {
        const t = ladoP / (ladoP - ladoQ);
        resultado.push({x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t});
      }
    });
  }
  return resultado;
};


Simu.Componentes._Sonar.prototype.distanciaEnCm = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la distancia en centímetros hasta lo más cercano que haya dentro del cono que cubre este sonar \
      (o el alcance máximo si no detecta nada).",
      Mila.Tipo.Numero
    ]
  });
  if (!this.estáConectadoALaCorriente()) {
    return 0;
  }
  const cono = this.conoEnPantalla();
  if (!cono || cono.distanciaEnPixeles === null) {
    return Simu.Componentes._Sonar.alcanceMáximoEnCm;
  }
  const pixelesPorCm = Simu.Componentes.unidadesPorCm * Simu.Diseño.escenario.cámara().zoom() / 100;
  const centímetros = Math.round(cono.distanciaEnPixeles / pixelesPorCm);
  return centímetros;
};


Simu.Componentes._Componente.prototype.esUnSonar = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es un sonar.", Mila.Tipo.Booleano]
  });
  return false;
};


Simu.Componentes._Sonar.prototype.esUnSonar = function() { return true; };

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
  nuevo.CambiarPinesDeCorrienteA_({tierra:'pin_GND', alimentación:'pin_VCC'});
  nuevo.CargarTamañoSvgDe_('LDR_BASE.svg');
  Simu.Carga.CargarArchivoSvg_YLuego_(
    "LDR_BASE.svg",
    (dibujo) => nuevo.CambiarDibujoBaseA_(dibujo)
  );
  nuevo._pines = {};
  for (let nombrePin of ['AO', 'DO', 'GND', 'VCC']) {
    nuevo._pines[`pin_${nombrePin}`] = {};
    Simu.Carga.CargarArchivoSvg_YLuego_(
      `LDR_Pin${nombrePin}.svg`,
      (dibujo) => {
        nuevo._pines[`pin_${nombrePin}`].dibujo = dibujo;
      }
    );
  }
  return nuevo;
};


Simu.Componentes._Ldr.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: ["Describir el dibujo de este ldr.", Mila.Tipo.Dibujo]
  });
  return this._dibujoRotable_(this._pines.fold(
    (clave, valor, rec) => rec.cons(valor.dibujo), []
  ).cons(this._dibujoBase));
};


Simu.Componentes._Componente.prototype.esUnLdr = function() {
  Mila.Contrato({
    Propósito: ["Indicar si este componente es un ldr.", Mila.Tipo.Booleano]
  });
  return false;
};


Simu.Componentes._Ldr.prototype.esUnLdr = function() { return true; };


Simu.Componentes._Ldr.prototype.nivelDeLuz = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el nivel de luz ambiente que detecta este ldr según qué tan cerca y encendidos estén los leds del escenario, entre 0 (oscuridad total) y 1 (máxima luz detectada).",
      Mila.Tipo.Numero
    ]
  });
  if (!this.estáConectadoALaCorriente()) {
    return 0;
  }
  const ALCANCE = 200;
  let nivel = 0;
  for (let claveModulo in Simu.Diseño.componentes) {
    const módulo = Simu.Diseño.componentes[claveModulo];
    if (módulo.defineLaClave_('componente') && módulo.componente.esUnLed()) {
      const otroLed = módulo.componente;
      const dx = otroLed.posiciónEnX() - this.posiciónEnX();
      const dy = otroLed.posiciónEnY() - this.posiciónEnY();
      const distancia = Math.sqrt(dx*dx + dy*dy);
      const aporte = otroLed.intensidadLuminica() * Math.max(0, 1 - distancia/ALCANCE);
      nivel = Math.max(nivel, aporte);
    }
  }
  return nivel;
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