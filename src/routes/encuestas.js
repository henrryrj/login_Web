const root = require('express').Router();
const pgAdmin = require('../database');
const admin = require('firebase-admin');
var serviceAccount = require('../../encuestasapp-e3fc3-firebase-adminsdk-47zop-d135672a22.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://encuestasapp-e3fc3-default-rtdb.firebaseio.com/',
});

const dbFire = admin.database();

const Pregunta = require('../models/pregunta');
const Seccion = require('../models/seccion');
const { Encuesta, EncuestaSinSeccion } = require('../models/encuesta');
const OpDeResp = require('../models/op_de_resp');

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
root.get('/B/listaDeEncuestas', async (req, res) => {
  var listaDeEncuestas = [];
  dbFire.ref('modelo_encuesta').once('value').then((snapshot) => {
    // id_encueta, nombre_e, descripcion, cant_secciones, estado
    snapshot.forEach((nodo) => {
      let { nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado,} = nodo.val();
      var encuestaActual = new EncuestaSinSeccion({id_encuesta: nodo.key, nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado});
      listaDeEncuestas.push(encuestaActual);
    });
    res.status(200).json(listaDeEncuestas);
  });
});

root.get('/B/getEncuesta/:idABuscar', async (req, res) => {
  const idABuscar = req.params.idABuscar;
  var listaDeSecciones = [];
  var listaDePreguntas = [];
  dbFire.ref('modelo_encuesta').child(idABuscar).once('value').then((snapshot) => {
    if (snapshot != null) {
      const {  nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado, seccion } = snapshot.val();
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
      const encuesta = new Encuesta({nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado, seccion: listaDeSecciones});
      res.status(200).json(encuesta);
    } else {
      res.status(500).json({ message: 'La encuesta no existe.' });
    }
  });
});

root.get('/B/ExisteAplicacionEncuesta/:idAplicacion', async (req, res) => {
  const idAplicacion = req.params.idAplicacion;
  dbFire.ref('aplicacion_encuesta').once('value').then((snapshot) => {
    if (snapshot != null) {
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


module.exports = root;
