const root = require('express').Router();
const Pregunta = require('../models/pregunta');
const Seccion = require('../models/seccion');
const { Encuesta } = require('../models/encuesta');
const dbFire = require('../firebase');



var modeloEncuesta = new Encuesta(
    {
        id_encuesta: '',
        nombre_e: '',
        descripcion: '',
        cant_aplicaciones: 0,
        cant_secciones: 0,
        createAt: '',
        estado: false,
        fechaLimite: '',
        seccion: []
    }
);
var seccionActual = new Seccion();
var idSeccion = 0;
var idPre = 0;
var listaDeOp = new Array();
root.get('/newEncuesta', (req, res) => {
    modeloEncuesta = new Encuesta({
        id_encuesta: '',
        nombre_e: '',
        descripcion: '',
        cant_aplicaciones: 0,
        cant_secciones: 0,
        createAt: '',
        estado: false,
        fechaLimite: '',
        seccion: []
    });
    idSeccion = 0;
    idPre = 0;
    seccionActual = new Seccion('', '', '', []);
    listaDeOp = new Array();
    res.render('encuestas/newEncuesta');
})
root.post('/getDatosEncuesta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, cant_seccion, fechaLimite, nombre_s, cant_preguntas } = req.body;
/*     if (nombre_e === "") errores.push({ text: "Ingrese un nombre de encuesta" });
    if (descripcion === "") errores.push({ text: "Ingrese una descripcion a la encuesta" });
    if (cant_aplicaciones === "") errores.push({ text: "Ingrese la cant. de aplicaiones" });
    if (isNaN(cant_aplicaciones)) errores.push({ text: "cant. de apli. no valido (debe ser num.)" });
    if (cant_seccion === "") errores.push({ text: "Ingrese la cant. de secciones" });
    if (isNaN(cant_seccion)) errores.push({ text: "cant. de seccion no valido (debe ser num.)" });
    if (fechaLimite === "") errores.push({ text: "Ingrese la fecha limite" }); */
    if (nombre_s === "") errores.push({ text: "Ingrese un nombre a la seccion" });
    if (cant_preguntas === "") errores.push({ text: "Ingrese la cant. de preguntas" });
    if (isNaN(cant_preguntas)) errores.push({ text: "Cant. de preguntas no valido (debe ser num.)" });
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, cant_seccion, fechaLimite, nombre_s, cant_preguntas, secciones: modeloEncuesta.seccion });
    } else {
        modeloEncuesta.nombre_e = nombre_e;
        modeloEncuesta.descripcion = descripcion;
        modeloEncuesta.cant_aplicaciones = cant_aplicaciones;
        modeloEncuesta.cant_secciones = cant_seccion;
        modeloEncuesta.fechaLimite = fechaLimite;
        modeloEncuesta.createAt = fecha();
        modeloEncuesta.estado = true;
        idSeccion = idSeccion + 1;
        seccionActual = new Seccion(idSeccion, nombre_s, cant_preguntas, []);
        modeloEncuesta.seccion.push(seccionActual);
        res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, cant_seccion, fechaLimite, secciones: modeloEncuesta.seccion });
    }
});

root.post('/save', (req, res) => {
    const { nombre_e, descripcion, cant_aplicaciones, cant_seccion, fechaLimite, nombre_s, cant_preguntas } = req.body;
    modeloEncuesta.nombre_e = nombre_e;
    modeloEncuesta.descripcion = descripcion;
    modeloEncuesta.cant_aplicaciones = cant_aplicaciones;
    modeloEncuesta.cant_secciones = cant_seccion;
    modeloEncuesta.fechaLimite = fechaLimite;
    modeloEncuesta.createAt = fecha();
    modeloEncuesta.estado = true;
    delete modeloEncuesta.id_encuesta;
    dbFire.ref('modelo_encuesta').push(modeloEncuesta);
    res.render('index')
})
root.post('/editSeccion/:idSeccion', (req, res) => {
    const errores = [];
    const idAEditar = req.params.idSeccion;
    const { editNombre_s, editCant_preguntas } = req.body;
    const nombreAEditar = editNombre_s[idAEditar - 1];
    const cantAEditar = editCant_preguntas[idAEditar - 1];
    if (modeloEncuesta.seccion.length > 1) {
        if (nombreAEditar === "") errores.push({ text: "Ingrese un nombre a la seccion" });
        if (cantAEditar === "") errores.push({ text: "Ingrese la cant. de preguntas" });
        if (isNaN(cantAEditar)) errores.push({ text: "Cant. de preguntas no valido (debe ser num.)" });
    } else {
        if (editNombre_s === "") errores.push({ text: "Ingrese un nombre a la seccion" });
        if (editCant_preguntas === "") errores.push({ text: "Ingrese la cant. de preguntas" });
        if (isNaN(editCant_preguntas)) errores.push({ text: "Cant. de preguntas no valido (debe ser num.)" });
    }
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, secciones: modeloEncuesta.seccion });
    } else {
        for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
            if (modeloEncuesta.seccion[i].id_seccion == idAEditar) {
                if (modeloEncuesta.seccion.length > 1) {
                    modeloEncuesta.seccion[i].nombre_s = nombreAEditar;
                    modeloEncuesta.seccion[i].cant_preguntas = cantAEditar;
                } else {
                    modeloEncuesta.seccion[i].nombre_s = editNombre_s;
                    modeloEncuesta.seccion[i].cant_preguntas = editCant_preguntas;
                }
                break;
            }
        }
        res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
    }
});

root.get('/delSeccion/:idSeccion', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    var newSeccion = modeloEncuesta.seccion.filter((seccionActal) => {
        return seccionActal.id_seccion !== parseInt(idAEliminar, 10);
    });
    modeloEncuesta.seccion = newSeccion;
    res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
})

//PREGUNTAS DE LAS ENCUESTAS
root.post('/getDatosPregunta/:idSeccion', (req, res) => {
    const errores = [];
    const idSeccion = req.params.idSeccion;
    const { nombre_p, tipo } = req.body;
    const nombreAGuardar = nombre_p[idSeccion - 1];
    const tipoAGuardar = tipo[idSeccion - 1];
    idPre = getCantPreguntas(idSeccion) + 1;

    if (nombre_p === "") errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (nombreAGuardar === "") errores.push({ text: "Ingrese el nombre de la pregunta" });
  /*   if (listaDeOp.length == 0 && tipo != "abierta") errores.push({ text: "debe añadir opciones de resp" }); */
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, secciones: modeloEncuesta.seccion });
    } else {
        if (modeloEncuesta.seccion.length > 1) {
            let preguntaA = new Pregunta(idPre, nombreAGuardar, tipoAGuardar, listaDeOp);
            addpregunta(idSeccion, preguntaA);
        } else {
            let preguntaB = new Pregunta(idPre, nombre_p, tipo, listaDeOp);
            addpregunta(idSeccion, preguntaB);
        }
        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
    }


});

root.post('/editPregunta/:idSeccion/:idPregunta', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    console.log(req.body);
    res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
});

root.get('/delPregunta/:idSeccion/:idPregunta', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        if (modeloEncuesta.seccion[i].id_seccion == idAEliminar) {
            var newPreguntas = modeloEncuesta.seccion[i].preguntas.filter((preguntaActual) => {
                return preguntaActual.id_pregunta !== parseInt(idPregunta, 10);
            });
            modeloEncuesta.seccion[i].preguntas = newPreguntas;
            break;
        }
    }
    res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
})

root.post('/addOpcion/:idSeccion', (req, res) => {
    const idSeccion = req.params.idSeccion;
    const { opDeResp } = req.body;
    const opAGuardar = opDeResp[idSeccion - 1];
    if (opDeResp === "") res.status(500).json('error');
    if (modeloEncuesta.seccion.length > 1) {
        listaDeOp.push(opAGuardar);
    } else {
        listaDeOp.push(opDeResp);
    }
});
root.post('/addOpcion2/:idSeccion', (req, res) => {
    const idSeccion = req.params.idSeccion;
    const { opDeResp } = req.body;
    if (opDeResp === "") res.status(500).json('error');
    listaDeOp.push(opDeResp);

});

root.post('/delOpcion/:idSeccion', () => listaDeOp = new Array());

root.get('/listaDePreguntas/:idSeccion', (req, res) => {
    const idSec = req.params.idSeccion;
    res.render('secciones/listaDePreguntas', { sec: idSec, preguntas: modeloEncuesta.seccion[idSec - 1].preguntas });
})
function fecha() {
    var fechaActual = new Date();
    var dia = fechaActual.getDate();
    var mes = fechaActual.getMonth() + 1;
    var año = fechaActual.getFullYear();
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${dia} - ${mes} - ${año}`;
}
function addpregunta(idABuscar, pregunta) {
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        if (modeloEncuesta.seccion[i].id_seccion == idABuscar) {
            modeloEncuesta.seccion[i].preguntas.push(pregunta);
            break;
        }
    }

}
function getCantPreguntas(idSec) {
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        if (modeloEncuesta.seccion[i].id_seccion == idSec) {
            return modeloEncuesta.seccion[i].preguntas.length;
        }
    }
}
function veriPreguntas() {
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        for (let j = 0; j < modeloEncuesta.seccion[i].preguntas.length; j++) {
            let pregunta = modeloEncuesta.seccion[i].preguntas[j];
            if (pregunta.length == 0) return true;
        }
    }
    return false;
}

module.exports = root;
