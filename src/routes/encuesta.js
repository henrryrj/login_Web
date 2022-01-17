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
var listaDeOp = [];
root.get('/listaEncuestas',(re,res)=>{
    res.render('encuestas/listaDeEncuestas');
})
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
    seccionActual = new Seccion('', '', 0, []);
    listaDeOp = new Array();
    res.render('encuestas/newEncuesta');
})
root.post('/getDatosEncuesta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, nombre_s, } = req.body;
    if (nombre_s === "") errores.push({ text: "Ingrese un nombre a la seccion" });
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, nombre_s, secciones: modeloEncuesta.seccion });
    } else {
        modeloEncuesta.nombre_e = nombre_e;
        modeloEncuesta.descripcion = descripcion;
        modeloEncuesta.cant_aplicaciones = cant_aplicaciones;
        modeloEncuesta.fechaLimite = fechaLimite;
        modeloEncuesta.createAt = fecha();
        modeloEncuesta.estado = true;
        idSeccion = getCantSecciones() + 1;
        seccionActual = new Seccion(idSeccion, nombre_s, 0, []);
        modeloEncuesta.cant_secciones = idSeccion;
        modeloEncuesta.seccion.push(seccionActual);
        res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    }
});

root.post('/save', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    console.log(req.body);
    if (nombre_e === "" || nombre_e.length == 0) errores.push({ text: "Ingrese un nombre de encuesta" });
    if (descripcion === "" || descripcion.length == 0) errores.push({ text: "Ingrese una descripcion a la encuesta" });
    if (cant_aplicaciones === "" || cant_aplicaciones < 0) errores.push({ text: "Ingrese la cant. de aplicaiones" });
    if (fechaLimite === "") errores.push({ text: "Ingrese la fecha limite" });
    if (modeloEncuesta.seccion.length == 0) errores.push({ text: "Debe añadir una seccion" });
    if (seccionesSinPreguntas()) errores.push({ text: "Hay secciones sin preguntas, verifique..." });
    if (errores.length > 0) {
        console.log(errores);
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        modeloEncuesta.nombre_e = nombre_e;
        modeloEncuesta.descripcion = descripcion;
        modeloEncuesta.cant_aplicaciones = parseInt(cant_aplicaciones);
        modeloEncuesta.cant_secciones = parseInt(getCantSecciones());
        modeloEncuesta.createAt = fecha();
        modeloEncuesta.fechaLimite = fechaLimite;
        modeloEncuesta.estado = true;
        delete modeloEncuesta.id_encuesta;
        parsearEncuesta();
        dbFire.ref('modelo_encuesta').push(modeloEncuesta);
        res.render('encuestas/listaDeEncuestas');
    }
});
const parsearEncuesta = () => {
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        for (let j = 0; j < modeloEncuesta.seccion[i].cant_preguntas; j++) {
            console.log(modeloEncuesta.seccion[i].preguntas[j]);
            delete modeloEncuesta.seccion[i].preguntas[j].id_pregunta;
        }
        delete modeloEncuesta.seccion[i].id_seccion;
    }

}
const seccionesSinPreguntas = () => {
    if (modeloEncuesta.seccion.length > 0) {
        for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
            if (modeloEncuesta.seccion[i].cant_preguntas == 0) return true;
        }
    }
    return false;
}
root.post('/editSeccion/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idAEditar = req.params.idSeccion;
    const { editNombre_s } = req.body;
    const nombreAEditar = editNombre_s[idAEditar - 1];
    if (modeloEncuesta.seccion.length > 1) {
        if (nombreAEditar === "") errores.push({ text: "Ingrese un nombre a la seccion" });
    } else {
        if (editNombre_s === "") errores.push({ text: "Ingrese un nombre a la seccion" });
    }
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
            if (modeloEncuesta.seccion[i].id_seccion == idAEditar) {
                if (modeloEncuesta.seccion.length > 1) {
                    modeloEncuesta.seccion[i].nombre_s = nombreAEditar;
                } else {
                    modeloEncuesta.seccion[i].nombre_s = editNombre_s;
                }
                break;
            }
        }
        res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
    }
});

root.get('/delSeccion/:idSeccion', (req, res) => {
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idAEliminar = req.params.idSeccion;
    var newSeccion = modeloEncuesta.seccion.filter((seccionActal) => {
        return seccionActal.id_seccion !== parseInt(idAEliminar, 10);
    });
    modeloEncuesta.seccion = newSeccion;
    res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
})

//PREGUNTAS DE LAS ENCUESTAS
root.post('/addOpcion/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const { opDeResp } = req.body;
    if (opDeResp === "" || opDeResp.length == 0) errores.push({ text: "Ingrese la opcion" });
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        if (modeloEncuesta.seccion.length == 1) {
            if (getCantPreguntas(idSeccion) == 0) {
                listaDeOp.push(opDeResp);
            } else {
                listaDeOp.push(opDeResp[idSeccion - 1]);
            }
        } else {
            listaDeOp.push(opDeResp[idSeccion - 1]);
            console.log(opDeResp[idSeccion - 1]);
        }
    }
});

root.post('/addOpcion2/:idSeccion/:idPregunta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const { idSeccion, idPregunta } = req.params;
    const { opDeResp, opActual } = req.body;
    if (opDeResp[opDeResp.length - 1] === "" || opDeResp[opDeResp.length - 1].length == 0) errores.push({ text: "Ingrese la opcion" });
    if (errores.length > 0) {
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        let opcionesPregunta = getOpDeResp(parseInt(idSeccion), parseInt(idPregunta));
        let datoInicial = opcionesPregunta[opcionesPregunta.length - 1];
        let posicion = (getCantSecciones() + preguntasTotalesHastaLaSeccion(parseInt(idSeccion)) + parseInt(idPregunta));
        console.log(`ENCONTRANDO POS: ${posicion}`);
        var newDato = opActual[opActual.indexOf(datoInicial) + 1]
        console.log(newDato);
        if (modeloEncuesta.seccion.length > 0) {
            if (opcionesPregunta.length > 0) {
                listaDeOp.push(newDato);
                setOpDeResp(parseInt(idSeccion), parseInt(idPregunta), newDato);
            } else {
                listaDeOp.push(opActual[opActual.length - 1]);
                if (idSeccion != modeloEncuesta.seccion.length || idPregunta != getCantPreguntas(modeloEncuesta.seccion.length)) {
                    console.log('NO ESTAMOS EN LA FINAL');
                    console.log(opActual[opActual.indexOf(opDeResp[posicion - 1])]);
                    console.log(opDeResp);
                    console.log(posicion);
                    console.log(opDeResp[posicion - 1]);
                    setOpDeResp(parseInt(idSeccion), parseInt(idPregunta), opActual[opActual.indexOf(opDeResp[posicion - 1])]);
                } else {
                    console.log('ESTAMOS EN LA FINAL');
                    setOpDeResp(parseInt(idSeccion), parseInt(idPregunta), opActual[opActual.length - 1]);
                }
            }
        }
        console.log('**********LISTA GLOBAL********');
        console.log(listaDeOp);
        console.log('**********LISTA ACTUALIZADA********');
        console.log(getOpDeResp(parseInt(idSeccion), parseInt(idPregunta)));
    }
});

root.post('/delUnaOpcion/:idSeccion/:valor', (req, res) => {
    const idSeccion = req.params.idSeccion;
    const valorAEliminar = req.params.valor;
    console.log('VALOR A ELIMINAR: ', valorAEliminar);
    if (modeloEncuesta.seccion.length == 1) {
        if (getCantPreguntas(idSeccion) == 0) {
            let newRespuestas1 = listaDeOp.filter((nombreActual) => {
                return nombreActual !== valorAEliminar;
            });
            console.log('NUEVAS OPCIONES');
            listaDeOp = newRespuestas1;
            console.log(listaDeOp);
        } else {
            let newRespuestas = listaDeOp.filter((nombreActual) => {
                return nombreActual !== valorAEliminar;
            });
            console.log('NUEVAS OPCIONES');
            listaDeOp = newRespuestas;
            console.log(listaDeOp);
        }
    } else {
        let newRespuestas2 = listaDeOp.filter((nodo) => {
            console.log(nodo);
            return nodo !== valorAEliminar;

        });
        console.log('NUEVAS OPCIONES2');
        listaDeOp = newRespuestas2;
        console.log(listaDeOp);
    }
});
root.post('/delUnaOpcion/:idSeccion/:idPregunta/:valor', (req, res) => {
    const { idSeccion, idPregunta, valor } = req.params;
    deleteOpDeResp(idSeccion, idPregunta, valor);
}
);
root.post('/getDatosPregunta/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const { nombre_p, tipo } = req.body;
    if (nombre_p === "") errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (errores.length > 0) {
        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        idPre = getCantPreguntas(idSeccion) + 1;
        if (modeloEncuesta.seccion.length == 1) {
            if (getCantPreguntas(idSeccion) == 0) {
                let preguntaA = new Pregunta(idPre, nombre_p, tipo, listaDeOp);
                addpregunta(idSeccion, preguntaA);
            } else {
                let preguntaB = new Pregunta(idPre, nombre_p[idSeccion - 1], tipo[idSeccion - 1], listaDeOp);
                addpregunta(idSeccion, preguntaB);
            }
        } else {
            let preguntaC = new Pregunta(idPre, nombre_p[idSeccion - 1], tipo[idSeccion - 1], listaDeOp);
            addpregunta(idSeccion, preguntaC);
        }
        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    }
});

root.post('/editPregunta/:idSeccion/:idPregunta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    const { nombre_p, tipo, opActual } = req.body;
    let opcionesPregunta = getOpDeResp(parseInt(idSeccion), parseInt(idPregunta));
    let total = opDeRespHastaMi(parseInt(idSeccion), parseInt(idPregunta));
    let listaFinal = [];
    let posicion = (getCantSecciones() + preguntasTotalesHastaLaSeccion(parseInt(idSeccion)) + parseInt(idPregunta));
    const newNombre = nombre_p[posicion - 1];
    const newTipo = tipo[posicion - 1];
    if (newTipo === "") errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (existeCampoVacio(opActual)) errores.push({ text: "No puede ingresar campos vacios" });
    if (errores.length > 0) {
        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        if (opcionesPregunta.length == 1) {
            console.log('********** VIENDO QUE PASA CON UN INPUTS **********');
            console.log(opActual);
            let pos = preguntasTotalesHastaLaSeccion(parseInt(idSeccion)) + parseInt(idPregunta);
            console.log(pos);
            if (pos == 1) {
                listaFinal.push(opActual);
            } else {
                listaFinal.push(opActual[pos - 1]);
            }
        } else {
            console.log('********** VIENDO QUE PASA CON LOS INPUTS **********');
            console.log(opActual);
            if (idSeccion === '1' && idPregunta === '1') {
                if (newTipo != 'abierta') {
                    listaFinal = opActual.slice(0, (0 + opcionesPregunta.length));
                } else {
                    listaFinal = new Array();
                }
            } else {
                listaFinal = opActual.slice(total, (total + opcionesPregunta.length));
            }
        }
        console.log(`LISTA_FINAL: ${listaFinal}`);
        setPregunta(parseInt(idSeccion), parseInt(idPregunta), newNombre, newTipo, listaFinal);

        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });

    }
});
const existeCampoVacio = (listOpciones) => {
    var b = false;
    if (listOpciones.length > 0) {
        for (let i = 0; i < listOpciones.length; i++) {
            let nodo = listOpciones[i];
            if (nodo.length == 0) {
                b = true;
            }
        }
    } else {
        listOpciones.length == 0 ? b = true : b = false;
    }
    return b;
}

root.get('/delPregunta/:idSeccion/:idPregunta', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        if (modeloEncuesta.seccion[i].id_seccion == idAEliminar) {
            var newPreguntas = modeloEncuesta.seccion[i].preguntas.filter((preguntaActual) => {
                return preguntaActual.id_pregunta !== parseInt(idPregunta, 10);
            });
            modeloEncuesta.seccion[i].preguntas = newPreguntas;
            modeloEncuesta.seccion[i].cant_preguntas = modeloEncuesta.seccion[i].preguntas.length;
            break;
        }
    }
    res.render('encuestas/newEncuesta', { secciones: modeloEncuesta.seccion });
})
root.post('/delOpcion/:idSeccion', () => listaDeOp = new Array());


function fecha() {
    var fechaActual = new Date();
    var dia = fechaActual.getDate();
    var mes = fechaActual.getMonth() + 1;
    var año = fechaActual.getFullYear();
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${dia}-${mes}-${año}`;
}
function addpregunta(idABuscar, pregunta) {
    for (let i = 0; i < modeloEncuesta.seccion.length; i++) {
        if (modeloEncuesta.seccion[i].id_seccion == idABuscar) {
            modeloEncuesta.seccion[i].preguntas.push(pregunta);
            modeloEncuesta.seccion[i].cant_preguntas = modeloEncuesta.seccion[i].preguntas.length;
            break;
        }
    }

}
function setPregunta(idSeccion, idPregunta, newNombre, newTipo, newOp) {
    if (modeloEncuesta.seccion[idSeccion - 1].preguntas.length > 0) {
        if (modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].id_pregunta == idPregunta) {
            modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].nombre_p = newNombre;
            modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].tipo = newTipo;
            modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].op_de_resp = newOp;
        }
    }
}

function getOpDeResp(idSeccion, idPregunta) {
    if (modeloEncuesta.seccion[idSeccion - 1].preguntas.length > 0) {
        for (let i = 0; i < modeloEncuesta.seccion[idSeccion - 1].preguntas.length; i++) {
            if (modeloEncuesta.seccion[idSeccion - 1].preguntas[i].id_pregunta == idPregunta) {
                return modeloEncuesta.seccion[idSeccion - 1].preguntas[i].op_de_resp;
            }
        }
    }
}
function setOpDeResp(idSeccion, idPregunta, valor) {
    if (modeloEncuesta.seccion[idSeccion - 1].preguntas.length > 0) {
        if (modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].id_pregunta == idPregunta) {
            modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].op_de_resp.push(valor);
        }
    }
}
function deleteOpDeResp(idSeccion, idPregunta, valor) {
    if (modeloEncuesta.seccion[idSeccion - 1].preguntas.length > 0) {
        if (modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].id_pregunta == idPregunta) {
            let newRespuestas2 = modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].op_de_resp.filter((nodo) => {
                return nodo !== valor;
            });
            modeloEncuesta.seccion[idSeccion - 1].preguntas[idPregunta - 1].op_de_resp = newRespuestas2;
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
const getCantSecciones = () => modeloEncuesta.seccion.length;
const preguntasTotalesHastaLaSeccion = (idSeccion) => {
    let suma = 0;
    for (let i = 1; i < idSeccion; i++) {
        suma = suma + modeloEncuesta.seccion[i - 1].cant_preguntas;
    }
    return suma;
}
const opDeRespHastaMi = (idSeccion, idPregunta) => {
    let total = 0;
    let total2 = 0;
    for (let i = 1; i <= idSeccion; i++) {
        for (let j = 1; j <= modeloEncuesta.seccion[i - 1].cant_preguntas; j++) {
            total2 = total2 + modeloEncuesta.seccion[i - 1].preguntas[j - 1].op_de_resp.length;
            let idPreguntaActual = modeloEncuesta.seccion[i - 1].preguntas[j - 1].id_pregunta;
            if (idSeccion != modeloEncuesta.seccion[i - 1].id_seccion || idPregunta != idPreguntaActual) {
                total = total + modeloEncuesta.seccion[i - 1].preguntas[j - 1].op_de_resp.length;
            }
        }
    }
    console.log(`TOTAL_OP: ${total}`);
    console.log(`TOTAL_OP2: ${total2}`);
    return total;
}
module.exports = root;
