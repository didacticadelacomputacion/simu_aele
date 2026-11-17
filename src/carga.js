Mila.Módulo({
  define:"Simu.Carga",
  necesita:["$milascript/base","simu"],
  usa:["$milascript/pantalla/todo","$milascript/audio","$milascript/geometria","componentes"]
});

Simu.Carga.estadoCarga = {
  pendientes:0,
  cola:[]
};

Simu.Carga.alTerminarDeCargar = function(función) {
  Mila.Contrato({
    Propósito: "Encolar la función dada para ejecutarse al finalizar la carga.",
    Parámetros: [
      [función, Mila.Tipo.Funcion]
    ]
  });
  if (Simu.Carga.estadoCarga.pendientes == 0) {
    función();
  } else {
    Simu.Carga.estadoCarga.cola.push(función);
  }
};

Simu.Carga.InformarInicioCarga = function() {
  Mila.Contrato({
    Propósito: "Informar el inicio de una carga."
  });
  Simu.Carga.estadoCarga.pendientes++;
};

Simu.Carga.InformarFinCarga = function() {
  Mila.Contrato({
    Propósito: "Informar el fin de una carga."
  });
  Simu.Carga.estadoCarga.pendientes--;
  if (Simu.Carga.estadoCarga.pendientes == 0) {
    Simu.Carga.estadoCarga.cola.conCadaUno(función => función());
    Simu.Carga.estadoCarga.cola = [];
  }
};

Simu.Carga.CargarArchivoSvg_YLuego_ = function(ruta, función) {
  Mila.Contrato({
    Propósito: "Declarar una carga para el archivo svg dado y ejecutar la función dada al terminar.",
    Parámetros: [
      [ruta, Mila.Tipo.Texto],
      [función, Mila.Tipo.Funcion]
    ]
  });
  Simu.Carga.InformarInicioCarga();
  Mila.Svg.ExtraerDesdeArchivo_YLuego_(
    Simu.rutaImagen(ruta),
    (dibujo) => {
      función(dibujo);
      Simu.Carga.InformarFinCarga();
    }
  );
};

Simu.Carga.CargarTamañoDeSvg_YLuego_ = function(ruta, función) {
  Mila.Contrato({
    Propósito: "Declarar una carga para leer el tamaño (ancho y alto del viewBox) del archivo svg dado y ejecutar la función dada, con ese tamaño, al terminar.",
    Parámetros: [
      [ruta, Mila.Tipo.Texto],
      [función, Mila.Tipo.Funcion]
    ]
  });
  Simu.Carga.InformarInicioCarga();
  Mila.Archivo.AbrirArchivo_YLuego_(
    Simu.rutaImagen(ruta),
    (resultado) => {
      if (!resultado.falló()) {
        const dom = (new DOMParser()).parseFromString(resultado.contenido, "image/svg+xml");
        const [, , ancho, alto] = dom.documentElement.getAttribute("viewBox").split(/\s+/).map(Number);
        función({ancho, alto});
      }
      Simu.Carga.InformarFinCarga();
    }
  );
};