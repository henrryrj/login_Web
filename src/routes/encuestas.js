const root = require('express').Router();
const pgAdmin = require('../database');
const dbFire = require('../firebase');
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const Pregunta = require('../models/pregunta');
const Seccion = require('../models/seccion');
const { Encuesta, EncuestaSinSeccion } = require('../models/encuesta');
const OpDeResp = require('../models/op_de_resp');
const Resultado = require('../models/resultado');
const Respuesta = require('../models/respuesta');
const { json } = require('express');

//listar encuestas
root.get('/A/listaDeEncuestas', async (req, res) => {
  const respuestica = await pgAdmin.query('SELECT* FROM modelo_encuesta');
  res.status(200).json(respuestica.rows);
});
root.get('/A/getEncuesta/:idABuscar', async (req, res) => {
  var encuesta = new Encuesta();
  const idABuscar = req.params.idABuscar;
  const consulta = await pgAdmin.query(
    'SELECT DISTINCT modelo_encuesta.* FROM modelo_encuesta, seccion,pregunta,op_de_respuesta WHERE (modelo_encuesta.id_encuesta = seccion.id_encuesta_s AND seccion.id_seccion = pregunta.id_seccion_p AND pregunta.id_pregunta = op_de_respuesta.id_pregunta_op_p AND pregunta.id_seccion_p = op_de_respuesta.id_seccion_op_p AND modelo_encuesta.id_encuesta = $1) OR (modelo_encuesta.id_encuesta = seccion.id_encuesta_s AND modelo_encuesta.id_encuesta =$1)',
    [idABuscar]
  );
  if (consulta.rows.length > 0) {
    const nodo = consulta.rows[0];
    encuesta.id_encuesta = nodo.id_encuesta;
    encuesta.nombre_e = nodo.nombre_e;
    encuesta.descripcion = nodo.descripcion;
    encuesta.cant_secciones = nodo.cant_secciones;
    encuesta.estado = nodo.estado;
    encuesta.seccion = await getSeccionesEncuesta(idABuscar);
    res.status(200).json(encuesta);
  } else {
    res.status(500).json({ message: 'La encuesta no existe.' });
  }
});
async function getSeccionesEncuesta(idABuscar) {
  var listaDeSeciones = [];
  const consulta = await pgAdmin.query(
    'SELECT DISTINCT seccion.id_seccion, seccion.nombre_s, seccion.cant_preguntas FROM modelo_encuesta, seccion,pregunta,op_de_respuesta WHERE (modelo_encuesta.id_encuesta = seccion.id_encuesta_s AND seccion.id_seccion = pregunta.id_seccion_p AND pregunta.id_pregunta = op_de_respuesta.id_pregunta_op_p AND pregunta.id_seccion_p = op_de_respuesta.id_seccion_op_p AND modelo_encuesta.id_encuesta = $1) OR (modelo_encuesta.id_encuesta = seccion.id_encuesta_s AND modelo_encuesta.id_encuesta =$1) order by seccion.id_seccion',
    [idABuscar]
  );
  if (consulta.rows.length > 0) {
    for (const nodo of consulta.rows) {
      var seccion = new Seccion(nodo.id_seccion, nodo.nombre_s, nodo.cant_preguntas, []);
      seccion.preguntas = await getListaPreguntasPorSeccion(idABuscar, seccion.id_seccion);
      if (listaDeSeciones.find((sec) => sec.id_seccion === seccion.id_seccion) == null) {
        listaDeSeciones.push(seccion);
      }
    }
  }
  return listaDeSeciones;
}
async function getListaPreguntasPorSeccion(idABuscar, idSeccion) {
  var listaDePreguntas = [];
  const consulta = await pgAdmin.query(
    'SELECT DISTINCT pregunta.id_pregunta, pregunta.nombre_p,tipo_pregunta.nombre_tp FROM modelo_encuesta, seccion,pregunta,tipo_pregunta, op_de_respuesta  WHERE (modelo_encuesta.id_encuesta = seccion.id_encuesta_S AND seccion.id_seccion = pregunta.id_seccion_p AND pregunta.id_tipo_pregunta = tipo_pregunta.id_tipo_pre AND pregunta.id_pregunta = op_de_respuesta.id_pregunta_op_p AND pregunta.id_seccion_p = op_de_respuesta.id_seccion_op_p AND modelo_encuesta.id_encuesta =$1 AND seccion.id_seccion = $2)',
    [idABuscar, idSeccion]
  );
  if (consulta.rows.length > 0) {
    for (const nodo of consulta.rows) {
      var pregunta = new Pregunta(nodo.id_pregunta, nodo.nombre_p, nodo.nombre_tp, nodo.nombre_tp, []);
      pregunta.op_de_resp = await getOpcionesDeRespuestaParaPregunta(idABuscar, pregunta.id_pregunta);
      if (listaDePreguntas.find((pre) => pre.id_pregunta === pregunta.id_pregunta) == null) {
        listaDePreguntas.push(pregunta);
      }
    }
  }
  return listaDePreguntas;
}
async function getOpcionesDeRespuestaParaPregunta(idABuscar, idDeLaPregunta) {
  var L1 = [];
  const consulta = await pgAdmin.query(
    'SELECT op_de_respuesta.nombre_op FROM modelo_encuesta, seccion,pregunta,op_de_respuesta WHERE modelo_encuesta.id_encuesta = seccion.id_encuesta_s AND seccion.id_seccion = pregunta.id_seccion_p AND  pregunta.id_pregunta = op_de_respuesta.id_pregunta_op_p AND pregunta.id_seccion_p = op_de_respuesta.id_seccion_op_p AND modelo_encuesta.id_encuesta = $1 AND pregunta.id_pregunta = $2',
    [idABuscar, idDeLaPregunta]
  );
  if (consulta.rows.length > 0) {
    for (const nodo of consulta.rows) {
      L1.push(nodo.nombre_op);
    }
  }
  return L1;
}
// peticiones a firebase, FALTA ARREGLAR ESTO
root.post('/B/disminuirAplicaciones/:idEncuesta', (req, res) => {
  const idEncuesta = req.params.idEncuesta;
  dbFire.ref('modelo_encuesta').child(idEncuesta).once('value').then((snapshot) => {
    if (snapshot.val() != null) {
      var nodo = snapshot.val();
      if (nodo.cant_aplicaciones > 0) {
        nodo.cant_aplicaciones = nodo.cant_aplicaciones - 1;
        dbFire.ref('modelo_encuesta').child(snapshot.key).set(nodo);
        res.status(200).json('ok');
      } else {
        nodo.estado = false;
        res.status(200).json('sin aplicaciones disponibles');
      }
    }
  });
})
root.get('/B/listaDeEncuestas', async (req, res) => {
  var listaDeEncuestas = [];
  dbFire.ref('modelo_encuesta').orderByValue().once('value').then((snapshot) => {
    console.log(snapshot.val());
    snapshot.forEach((nodo) => {
      let { nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado, } = nodo.val();
      if (cant_aplicaciones > 0 || estado) {
        var encuestaActual = new EncuestaSinSeccion({ id_encuesta: nodo.key, nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado });
        listaDeEncuestas.push(encuestaActual);
      }
    });
    res.status(200).json(listaDeEncuestas);
  });
});

root.get('/B/getEncuesta/:idABuscar', async (req, res) => {
  const idABuscar = req.params.idABuscar;
  var listaDeSecciones = [];
  var listaDePreguntas = [];
  dbFire.ref('modelo_encuesta').child(idABuscar).once('value').then((snapshot) => {
    if (snapshot.val() != null) {
      let idEncuesta = snapshot.key;
      const { nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado, seccion } = snapshot.val();
      for (const keySeccion in seccion) {
        for (const keyPregunta in seccion[keySeccion].preguntas) {
          const nodo = seccion[keySeccion].preguntas[keyPregunta];
          const id_pregunta = keySeccion + keyPregunta;
          let preguntaActual = new Pregunta(id_pregunta, nodo.nombre_p, nodo.tipo, []);
          for (const key in nodo.op_de_resp) {
            const idOpResp = id_pregunta + key;
            var opDeRespActual = new OpDeResp(idOpResp, nodo.op_de_resp[key]);
            preguntaActual.op_de_resp.push(opDeRespActual);
          }
          listaDePreguntas.push(preguntaActual);
        }
        var secActual = new Seccion(keySeccion, seccion[keySeccion].nombre_s, seccion[keySeccion].cant_preguntas, listaDePreguntas);
        listaDePreguntas = [];
        listaDeSecciones.push(secActual);
      }
      const encuesta = new Encuesta({ id_encuesta: idEncuesta, nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado, seccion: listaDeSecciones });
      res.status(200).json(encuesta);
    } else {
      res.status(443).json({ Error: 'La encuesta no existe.' });
    }
  });
});
const sacarTodasLasPreguntas = (seccion) => {
  var l1 = [];
  for (let i = 0; i < seccion.length; i++) {
    for (let j = 0; j < seccion[i].preguntas.length; j++) {
      var pActual = seccion[i].preguntas[j];
      l1.push(pActual);
    }
  }
  return l1;
}
const cargarCantidades = (lista) => {
  let cant = 0;
  var l1 = [];
  for (let i = 0; i < lista.length; i++) {
    l1.push(cant);
  }
  return l1;
}
root.get('/B/getResultadosEncuesta/:idABuscar', async (req, res) => {
  const idABuscar = req.params.idABuscar;
  const urlUnaEncuesta = `https://encuesta-login-web.herokuapp.com/API/encuestas/B/getEncuesta/${idABuscar}`;
  const urlVeriAplicacion = `https://encuesta-login-web.herokuapp.com/API/encuestas/B/tieneAplicacion/${idABuscar}`;
  var headers = { 'Content-Type': 'application/json' };
  var params = { method: 'GET', headers };

  var respVeri = await fetch(urlVeriAplicacion, params);
  var bool = await respVeri.json();
  console.log(bool);
  if (bool) {
    var resp = await fetch(urlUnaEncuesta, params);
    var encuestaAnalizar = await resp.json();
    const { nombre_e, descripcion, cant_secciones, fechaLimite, seccion } = encuestaAnalizar;
    var resultado = new Resultado(
      {
        idEncuesta: idABuscar,
        nombreEncuesta: nombre_e,
        descripcion: descripcion,
        cantAplicaciones: 0,
        cantSecciones: cant_secciones,
        preguntasTotales: 0,
        fechaLimite: fechaLimite,
        resultados: []
      });
    let preguntasTotales = sacarTodasLasPreguntas(seccion);
    resultado.preguntasTotales = preguntasTotales.length;

    dbFire.ref('aplicacion_encuesta').once('value').then((snapshot) => {
      if (snapshot.val() != null) {
        snapshot.forEach((appActual) => {
          const { id_encuesta } = appActual.val();
          if (id_encuesta === resultado.idEncuesta) resultado.cantAplicaciones += 1;
        });
        for (let i = 0; i < preguntasTotales.length; i++) {
          let tipoP = preguntasTotales[i].tipo;
          if (tipoP !== 'abierta') {
            console.log(`++++++pregunta: ${tipoP}++++++++`);
            let resp = new Respuesta({
              idPregunta: preguntasTotales[i].id_pregunta,
              tipoPregunta: tipoP,
              nombreP: preguntasTotales[i].nombre_p,
              cantResp: cargarCantidades(preguntasTotales[i].op_de_resp),
              nombreOpcion: preguntasTotales[i].op_de_resp,
            });
            console.log('OBJETO RESPUESTA:')
            console.log(`cantidades: => ${resp.cantResp}\nopciones  : => ${JSON.stringify(resp.nombreOpcion)}\n\n`);
            for (let j = 0; j < preguntasTotales[i].op_de_resp.length; j++) {
              let opcionAnalizar = preguntasTotales[i].op_de_resp[j];
              console.log(`OPCION ACTUAL: => ${opcionAnalizar.id_resp} : ${opcionAnalizar.nombre_resp}`);
              //RECORRIENDO LAS APLICACIONES
              snapshot.forEach((appActual) => {
                const { id_encuesta, id, respDePreguntas } = appActual.val();
                if (id_encuesta === idABuscar) {
                  console.log(appActual.key);
                  while (respDePreguntas.length > 0) {
                    console.log('+++++OPCION SELECIONADA+++++');
                    if (respDePreguntas[0].tipoPregunta !== 'abierta') {
                      let opSelecionada = respDePreguntas[0].opcions;
                      console.log(opSelecionada);
                      while (opSelecionada.length > 0) {
                        let opSelecionadaActual = opSelecionada[0];
                        console.log('**********OPCION_ACTUAL************')
                        console.log(opSelecionadaActual);
                        if (opcionAnalizar.id_resp === opSelecionadaActual.id_resp) {
                          let pos = resp.nombreOpcion.findIndex(opSelecionadaActual => opSelecionadaActual.id_resp === opcionAnalizar.id_resp);
                          console.log(`POSICION: ${pos}`);
                          resp.cantResp[pos] = resp.cantResp[pos] + 1;
                        }
                        opSelecionada.shift();
                      }
                    }
                    respDePreguntas.shift();
                  }
                  console.log(`RESPUESTAS RESTANTES ${respDePreguntas.length}`);
                  console.log(respDePreguntas);
                }
              });
              console.log('\n');
              console.log(resp);
            }
            resultado.resultados.push(resp);
          }
          if (tipoP === 'abierta') {
            let resp = new Respuesta({
              idPregunta: preguntasTotales[i].id_pregunta,
              tipoPregunta: tipoP,
              nombreP: preguntasTotales[i].nombre_p,
              cantResp: [],
              nombreOpcion: [],
            });
            resultado.resultados.push(resp);
            console.log('++++++PREGUNTA SIN ESTADISTICA+++++');
          }
          console.log('++++++RESULTADO DE LA PREGUNTA ++++++');
          console.log(`cantidades: => ${resp.cantResp}\nopciones  : => ${JSON.stringify(resp.nombreOpcion)}`);
          console.log('JSON RESULTADO');
        }
        console.log(resultado.resultados);
        res.status(201).json(resultado);
      } else {
        res.status(403).json({ Error: 'No hay aplicaciones de encuesta' });

      }
    });
  } else {
    res.status(403).json({ Error: 'ID invalido' });
  }
});

root.get('/B/ExisteAplicacionEncuesta/:idAplicacion', async (req, res) => {
  const idAplicacion = req.params.idAplicacion;
  dbFire.ref('aplicacion_encuesta').once('value').then((snapshot) => {
    if (snapshot.val() != null) {
      for (const key in snapshot.val()) {
        const nodo = snapshot.val()[key];
        if (nodo.createAt == idAplicacion) {
          res.status(200).json(true);
          return;
        }
      }
      res.status(500).json(false);
    } else {
      res.status(500).json(false);
    }
  });
});

root.get('/B/tieneAplicacion/:idAplicacion', async (req, res) => {
  const idAplicacion = req.params.idAplicacion;
  dbFire.ref('aplicacion_encuesta').once('value').then((snapshot) => {
    if (snapshot.val() != null) {
      for (const key in snapshot.val()) {
        const nodo = snapshot.val()[key];
        console.log(nodo);
        if (nodo.id_encuesta == idAplicacion) {
          res.status(200).json(true);
          return;
        }
      }
      res.status(500).json(false);
    } else {
      res.status(500).json(false);
    }
  });
});
root.get('/B/encuestaValida/:idEncuesta', async (req, res) => {
  const idEncuesta = req.params.idEncuesta;
  dbFire.ref('modelo_encuesta').child(idEncuesta).once('value').then((snapshot) => {
    console.log(snapshot.val());
    if (snapshot.val() != null) {
      let { cant_aplicaciones } = snapshot.val();
      console.log(cant_aplicaciones);
      if (cant_aplicaciones > 0) {
        res.status(200).json(true);
      } else {
        res.status(433).json(false);
      }
    } else {
      res.status(500).json({ error: 'encuesta no existe' });
    }
  });
});


module.exports = root;
