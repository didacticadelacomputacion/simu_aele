Mila.Módulo({
  define:"Simu.Componentes",
  necesita:["$milascript/base"],
  usa:["$milascript/geometria","$milascript/svg"]
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
  this.CambiarUbicaciónA_(datosComponente.defineLaClave_('ubicación')
    ? datosComponente.ubicación
    : Mila.Geometria.puntoEn__(0,0)
  );
  this.CambiarSvgA_(Mila.Svg.nuevo({
    colorFondo: "#ddd",
    comandos:[
      Mila.Svg.nuevoComando('m',[0,0]),
      Mila.Svg.nuevoComando('h',[50]),
      Mila.Svg.nuevoComando('v',[50]),
      Mila.Svg.nuevoComando('h',[-50]),
      Mila.Svg.nuevoComando('z',[])
    ]
  }));
  this._partes = [];
};

Simu.Componentes._Componente.prototype.CambiarUbicaciónA_ = function(nuevaUbicación) {
  Mila.Contrato({
    Propósito: "Cambia la ubicación de este componente por la dada.",
    Parámetros: [
      [nuevaUbicación, Mila.Tipo.Punto]
    ]
  });
  this._ubicación = nuevaUbicación;
};

Simu.Componentes._Componente.prototype.CambiarSvgA_ = function(nuevoSvg) {
  Mila.Contrato({
    Propósito: "Cambia el svg de este componente por el dado.",
    Parámetros: [
      [nuevoSvg, Mila.Tipo.Svg]
    ]
  });
  this._svg = nuevoSvg;
};

Simu.Componentes._Componente.prototype.ubicación = function() {
  Mila.Contrato({
    Propósito: ["Describe la ubicación de este componente.", Mila.Tipo.Punto]
  });
  return this._ubicación;
};

Simu.Componentes._Componente.prototype.svg = function() {
  Mila.Contrato({
    Propósito: ["Describe el svg de este componente.", Mila.Tipo.Svg]
  });
  return this._partes.esVacia()
    ? this._svg
    : Mila.Svg.nuevo({hijos:this._partes.transformados(x => x.svg).cons(this._svg)})
  ;
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
    Propósito: ["Describe una nueva placa a partir de los datos dados.", Mila.Tipo.ComponentePlaca],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Placa();
  nuevo.Inicializar(datosComponente);
  const prefijoNombreArchivos = `${datosComponente.modelo}`;
  Mila.Svg.ExtraerDesdeArchivo_YLuego_(
    // Para usar la imagen completa (pero tarda un montón en dibujarla) borrar "_min".
    Simu.rutaImagen(`${prefijoNombreArchivos}_BASE_min.svg`),
    (svg) => nuevo.CambiarSvgA_(svg)
  );
  for (let i=0; i<5; i++) {
    nuevo._partes.push({svg:Mila.Svg.nuevo()});
    const j = i;
    Mila.Svg.ExtraerDesdeArchivo_YLuego_(
      Simu.rutaImagen(`${prefijoNombreArchivos}_pin${j}.svg`),
      (svg) => {
        nuevo._partes[j].svg = svg;
      }
    );
  }
  return nuevo;
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
    Propósito: ["Describe un nuevo pin a partir de los datos dados.", Mila.Tipo.ComponentePin],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Pin();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

// Led

Simu.Componentes.nuevoLed = function(datosComponente) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo led a partir de los datos dados.", Mila.Tipo.ComponenteLed],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Led();
  nuevo.Inicializar(datosComponente);
  return nuevo;
};

Simu.Componentes._Led = function Led() {};
Object.setPrototypeOf(Simu.Componentes._Led.prototype, Simu.Componentes._Componente.prototype);

Mila.Tipo.Registrar({
  nombre: "ComponenteLed",
  prototipo: Simu.Componentes._Led,
  subtipoDe: "Componente"
});

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
    Propósito: ["Describe un nuevo buzzer a partir de los datos dados.", Mila.Tipo.ComponenteBuzzer],
    Parámetros: [
      [datosComponente]
    ]
  });
  const nuevo = new Simu.Componentes._Buzzer();
  nuevo.Inicializar(datosComponente);
  return nuevo;
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
  return nuevo;
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