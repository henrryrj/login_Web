const root = require('express').Router();
const Pregunta = require('../models/pregunta');
const Seccion = require('../models/seccion');
const { Encuesta } = require('../models/encuesta');
const dbFire = require('../firebase');
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
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
const vaciarEncuesta = () => {
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
}



root.get('/listaEncuestas', (re, res) => {
    let encuestasActivas = [];
    dbFire.ref('modelo_encuesta').once('value').then((snapshot) => {
        const data = snapshot.val();
        res.render('encuestas/listaDeEncuestas', { encuestas: data });
    });
});


root.get('/editEncuesta/:idEncuesta', async (req, res) => {
    const idEncuestaAEditar = req.params.idEncuesta;
    var listaDeSecciones = [];
    var listaDePreguntas = [];
    const urlVeriAplicacion = `https://encuesta-login-web.herokuapp.com/API/encuestas/B/tieneAplicacion/${idEncuestaAEditar}`;
    var headers = { 'Content-Type': 'application/json' };
    var params = { method: 'GET', headers };
    var respVeri = await fetch(urlVeriAplicacion, params);
    var bool = await respVeri.json();
    console.log(bool);
    if (bool) {
        req.flash('error', 'La encuesta tiene apliaciones');
        res.redirect('/encuestas/listaEncuestas');
    } else {
        dbFire.ref('modelo_encuesta').child(idEncuestaAEditar).once('value').then((snapshot) => {
            let idEncuesta = snapshot.key;
            let estadoE = '';
            const { nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado, seccion } = snapshot.val();
            for (const keySeccion in seccion) {
                let idSeccion = parseInt(keySeccion) + 1;
                for (const keyPregunta in seccion[keySeccion].preguntas) {
                    const nodo = seccion[keySeccion].preguntas[keyPregunta];
                    const id_pregunta = parseInt(keyPregunta) + 1;
                    let preguntaActual = new Pregunta(id_pregunta, nodo.nombre_p, nodo.tipo, []);
                    for (const key in nodo.op_de_resp) {
                        preguntaActual.op_de_resp.push(nodo.op_de_resp[key]);
                    }
                    listaDePreguntas.push(preguntaActual);
                }
                var secActual = new Seccion(idSeccion, seccion[keySeccion].nombre_s, seccion[keySeccion].cant_preguntas, listaDePreguntas);
                listaDePreguntas = [];
                listaDeSecciones.push(secActual);
            }
            modeloEncuesta = new Encuesta({ id_encuesta: idEncuesta, nombre_e, descripcion, cant_aplicaciones, cant_secciones, createAt, fechaLimite, estado, seccion: listaDeSecciones });
            idSeccion = getCantSecciones();
            if (estado) {
                estadoE = "true";
            } else {
                estadoE = "false";
            }
            res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado: estadoE, secciones: modeloEncuesta.seccion });
        });
    }
});

const setEstado = (estadoE) => {
    if (estadoE === "true") {
        modeloEncuesta.estado = true;
    } else {
        modeloEncuesta.estado = false;
    }
}

root.get('/deleteEncuesta/:idEncuesta', async (req, res) => {
    const idEncuestaAEditar = req.params.idEncuesta;
    const urlVeriAplicacion = `https://encuesta-login-web.herokuapp.com/API/encuestas/B/tieneAplicacion/${idEncuestaAEditar}`;
    var headers = { 'Content-Type': 'application/json' };
    var params = { method: 'GET', headers };
    var respVeri = await fetch(urlVeriAplicacion, params);
    var bool = await respVeri.json();
    if (bool) {
        req.flash('error', 'No se puede eliminar la encuesta porque tiene apliaciones');
        res.redirect('/encuestas/listaEncuestas');
    } else {
        dbFire.ref('modelo_encuesta').child(idEncuestaAEditar).remove();
        req.flash('msg', 'La encuesta se ha eliminado');
        res.redirect('/encuestas/listaEncuestas');

    }
})
root.get('/newEncuesta', (req, res) => {
    vaciarEncuesta();
    res.render('encuestas/newEncuesta');
})
root.post('/getDatosEncuesta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, nombre_s, } = req.body;
    if (nombre_s === "" || nombre_s.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
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

root.post('/getDatosEditEncuestas', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, nombre_s } = req.body;
    console.log(req.body);
    if (nombre_s === "" || nombre_s.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
    if (errores.length > 0) {
        res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
    } else {
        modeloEncuesta.nombre_e = nombre_e;
        modeloEncuesta.descripcion = descripcion;
        modeloEncuesta.cant_aplicaciones = cant_aplicaciones;
        modeloEncuesta.fechaLimite = fechaLimite;
        modeloEncuesta.createAt = fecha();
        idSeccion = getCantSecciones() + 1;
        seccionActual = new Seccion(idSeccion, nombre_s, 0, []);
        modeloEncuesta.cant_secciones = idSeccion;
        modeloEncuesta.seccion.push(seccionActual);
        console.log(modeloEncuesta.id_encuesta);
        res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
    }
});

root.post('/save', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    if (nombre_e === "" || nombre_e.length == 0) errores.push({ text: "Ingrese un nombre de encuesta" });
    if (descripcion === "" || descripcion.length == 0) errores.push({ text: "Ingrese una descripcion a la encuesta" });
    if (cant_aplicaciones === "" || cant_aplicaciones < 0) errores.push({ text: "Ingrese la cant. de aplicaiones" });
    if (fechaLimite === "") errores.push({ text: "Ingrese la fecha limite" });
    if (modeloEncuesta.seccion.length == 0) errores.push({ text: "Debe a??adir una seccion" });
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
        dbFire.ref('modelo_encuesta').push(modeloEncuesta);
        req.flash('msg', 'Encuesta agregada correctamente');
        vaciarEncuesta();
        res.redirect('/encuestas/listaEncuestas');
    }
});

root.post('/saveEditEncuesta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, estado, fechaLimite } = req.body;
    if (nombre_e === "" || nombre_e.length == 0) errores.push({ text: "Ingrese un nombre de encuesta" });
    if (descripcion === "" || descripcion.length == 0) errores.push({ text: "Ingrese una descripcion a la encuesta" });
    if (cant_aplicaciones === "" || cant_aplicaciones < 0) errores.push({ text: "Ingrese la cant. de aplicaiones" });
    if (fechaLimite === "") errores.push({ text: "Ingrese la fecha limite" });
    if (modeloEncuesta.seccion.length == 0) errores.push({ text: "Debe a??adir una seccion" });
    if (seccionesSinPreguntas()) errores.push({ text: "Hay secciones sin preguntas, verifique..." });
    if (errores.length > 0) {
        console.log(errores);
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
    } else {
        modeloEncuesta.nombre_e = nombre_e;
        modeloEncuesta.descripcion = descripcion;
        modeloEncuesta.cant_aplicaciones = parseInt(cant_aplicaciones);
        modeloEncuesta.cant_secciones = parseInt(getCantSecciones());
        modeloEncuesta.createAt = fecha();
        modeloEncuesta.fechaLimite = fechaLimite;
        setEstado(estado);
        const id_encuesta = modeloEncuesta.id_encuesta;
        delete modeloEncuesta.id_encuesta;
        dbFire.ref('modelo_encuesta').child(id_encuesta).set(modeloEncuesta);
        req.flash('msg', 'Encuesta actualizada correctamente');
        vaciarEncuesta();
        res.redirect('/encuestas/listaEncuestas');
    }
});

root.post('/editSeccion/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idAEditar = req.params.idSeccion;
    const { editNombre_s } = req.body;
    const nombreAEditar = editNombre_s[idAEditar - 1];
    console.log(req.body);
    if (modeloEncuesta.seccion.length > 1) {
        if (nombreAEditar === "" || nombreAEditar.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
    } else {
        if (editNombre_s === "" || nombreAEditar.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
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
        res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    }
});
root.post('/editSeccionEncuesta/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    const idAEditar = req.params.idSeccion;
    const { editNombre_s } = req.body;
    const nombreAEditar = editNombre_s[idAEditar - 1];
    if (modeloEncuesta.seccion.length > 1) {
        if (nombreAEditar === "" || nombreAEditar.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
    } else {
        if (editNombre_s === "" || nombreAEditar.length == 0) errores.push({ text: "Ingrese un nombre a la seccion" });
    }
    if (errores.length > 0) {
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
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
        res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
    }
});

root.post('/delSeccion/:idSeccion', (req, res) => {
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idAEliminar = req.params.idSeccion;
    console.log('eliminando una seccion');
    console.log(req.body);
    var newSeccion = modeloEncuesta.seccion.filter((seccionActal) => {
        return seccionActal.id_seccion !== parseInt(idAEliminar, 10);
    });
    modeloEncuesta.seccion = newSeccion;
    res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
})
root.post('/delSeccionEncuesta/:idSeccion', (req, res) => {
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    console.log('eliminando una seccion');
    console.log(req.body);
    const idAEliminar = req.params.idSeccion;
    var newSeccion = modeloEncuesta.seccion.filter((seccionActal) => {
        return seccionActal.id_seccion !== parseInt(idAEliminar, 10);
    });
    modeloEncuesta.seccion = newSeccion;
    res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
})

root.get('/verEncuesta/:idEncuesta', (req, res) => {
    const idEncuesta = req.params.idEncuesta;
    dbFire.ref('modelo_encuesta').child(idEncuesta).once('value').then((snapshot) => {
        const data = snapshot.val();
        res.render('encuestas/verEncuesta', { encuesta: data });
    });
})


//PREGUNTAS DE LAS ENCUESTAS
root.post('/addOpcion/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const { opDeResp } = req.body;
    if (opDeResp[idSeccion - 1] === "" || opDeResp[idSeccion - 1].length == 0) errores.push({ text: "Ingrese la opcion" });
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
root.post('/addOpcionEncuesta/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    const idSeccion = req.params.idSeccion;
    const { opDeResp } = req.body;
    if (opDeResp[idSeccion - 1] === "" || opDeResp[idSeccion - 1].length == 0) errores.push({ text: "Ingrese la opcion" });
    if (errores.length > 0) {
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
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
root.post('/addOpcion2Encuesta/:idSeccion/:idPregunta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    const { idSeccion, idPregunta } = req.params;
    const { opDeResp, opActual } = req.body;
    if (opDeResp[opDeResp.length - 1] === "" || opDeResp[opDeResp.length - 1].length == 0) errores.push({ text: "Ingrese la opcion" });
    if (errores.length > 0) {
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
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
root.post('/delUnaOpcion2/:idSeccion/:idPregunta/:valor', (req, res) => {
    const { idSeccion, idPregunta, valor } = req.params;
    deleteOpDeResp(idSeccion, idPregunta, valor);
});

root.post('/getDatosPregunta/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const { nombre_p, tipo } = req.body;
    if (nombre_p[idSeccion - 1] === "" || nombre_p[idSeccion - 1].length == 0) errores.push({ text: "Ingrese el nombre de la pregunta" });
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
root.post('/getDatosPreguntaEncuesta/:idSeccion', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    const idSeccion = req.params.idSeccion;
    const { nombre_p, tipo } = req.body;
    if (nombre_p[idSeccion - 1] === "" || nombre_p[idSeccion - 1].length == 0) errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (errores.length > 0) {
        listaDeOp = new Array();
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
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
        res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
    }
});



root.post('/editPregunta/:idSeccion/:idPregunta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
    const idSeccion = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    const { nombre_p, tipo, opActual } = req.body;
    console.log('viene un error');
    console.log(req.body);
    let listaFinal = [];
    let opcionesPregunta = getOpDeResp(parseInt(idSeccion), parseInt(idPregunta));
    let total = opDeRespHastaMi(parseInt(idSeccion), parseInt(idPregunta));
    let posicion = (getCantSecciones() + preguntasTotalesHastaLaSeccion(parseInt(idSeccion)) + parseInt(idPregunta));
    const newNombre = nombre_p[posicion - 1];
    const newTipo = tipo[posicion - 1];
    if (newNombre === "" || newNombre.length == 0) errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (existeCampoVacio(opActual) || opActual === "" || opActual.length == 0) errores.push({ text: "No puede ingresar campos vacios" });
    if (errores.length > 0) {
        listaDeOp = new Array();
        res.render('encuestas/newEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
    } else {
        if (newTipo != 'abierta') {
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
            }else{
                listaFinal = new Array();
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
root.post('/editPreguntaEncuesta/:idSeccion/:idPregunta', (req, res) => {
    const errores = [];
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
    const idSeccion = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    const { nombre_p, tipo, opActual } = req.body;
    let opcionesPregunta = getOpDeResp(parseInt(idSeccion), parseInt(idPregunta));
    let total = opDeRespHastaMi(parseInt(idSeccion), parseInt(idPregunta));
    let listaFinal = [];
    let posicion = (getCantSecciones() + preguntasTotalesHastaLaSeccion(parseInt(idSeccion)) + parseInt(idPregunta));
    const newNombre = nombre_p[posicion - 1];
    const newTipo = tipo[posicion - 1];
    if (newNombre === "" || newNombre.length == 0) errores.push({ text: "Ingrese el nombre de la pregunta" });
    if (existeCampoVacio(opActual) || opActual === "" || opActual.length == 0) errores.push({ text: "No puede ingresar campos vacios" });
    if (errores.length > 0) {
        listaDeOp = new Array();
        res.render('encuestas/editEncuesta', { errores, nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
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
        res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });

    }
});



root.post('/delPregunta/:idSeccion/:idPregunta', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite } = req.body;
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
    res.render('encuestas/newEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, secciones: modeloEncuesta.seccion });
});
root.post('/delPreguntaEncuesta/:idSeccion/:idPregunta', (req, res) => {
    const idAEliminar = req.params.idSeccion;
    const idPregunta = req.params.idPregunta;
    const { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado } = req.body;
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
    res.render('encuestas/editEncuesta', { nombre_e, descripcion, cant_aplicaciones, fechaLimite, estado, secciones: modeloEncuesta.seccion });
});
root.post('/delOpcion/:idSeccion', () => listaDeOp = new Array());

const existeCampoVacio = (listOpciones) => {
    var b = false;
    if (listOpciones.length > 0) {
        for (let i = 0; i < listOpciones.length; i++) {
            let nodo = listOpciones[i];
            if (nodo.length == 0) {
                b = true;
            }
        }
    }
    return b;
}
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
function fecha() {
    var fechaActual = new Date();
    var dia = fechaActual.getDate();
    var mes = fechaActual.getMonth() + 1;
    var year = fechaActual.getFullYear();
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${year}-${mes}-${dia}`;
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
