
//DE AQUI VIENE LA FUNCIONALIDAD DEL MODAL
// var listaDePreguntas = [];
var opDeResp = [];
function cambiarAction(idAEditar) {
    document.formPrincipal.action = `/encuestas/editSeccion/${idAEditar}`;
    document.formPrincipal.submit();
}
function enviarCambiosPregunta(idSeccion,idPregunta) {
    document.formPrincipal.action = `/encuestas/editPregunta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}
function enviarPregunta(idSeccion) {
    document.formPrincipal.action = `/encuestas/getDatosPregunta/${idSeccion}`;
    document.formPrincipal.submit();
}
function enviarOpcion(idSeccion) {
    document.formPrincipal.action = `/encuestas/addOpcion/${idSeccion}`;
    document.formPrincipal.submit();
}
function enviarOpcion2(idSeccion) {
    document.formPrincipal.action = `/encuestas/addOpcion2/${idSeccion}`;
    document.formPrincipal.submit();
}
function delOpcion(idSeccion) {
    document.formPrincipal.action = `/encuestas/delOpcion/${idSeccion}`;
    document.formPrincipal.submit();
}
function save(){
    document.formPrincipal.action = `/encuestas/save`;
    document.formPrincipal.submit();
}
const cambiarTipo = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);

    console.log(selectTipo);
    console.log('cambiar tipo');
    resetRespuestas(idSeccion);
    ocultarBoton(idSeccion);
    opDeResp = [];
    if (selectTipo === 'abierta') {
        const newDiv = document.createElement("div");
        const textArea = document.createElement("textarea");
        textArea.name = "respuestas";
        textArea.className = "form-control";
        newDiv.appendChild(textArea);
        respuestasDiv.appendChild(newDiv);
        console.log('text area pa');

    }
}


const resetRespuestas = (idSeccion) => {
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    document.getElementById(`nombreOption-id-${idSeccion}`).value = "";
    respuestasDiv.innerHTML = "";
    delOpcion(idSeccion);

}
const ocultarBoton = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}`);
    let addButton = document.getElementById(`addButton-${idSeccion}`);
    if (selectTipo === 'abierta') {
        console.log('estamos entrando en la pregunta!');
        nombreOpcion.hidden = true;
        addButton.hidden = true;
    } else {
        nombreOpcion.hidden = false;
        addButton.hidden = false;
    }
}

const addOption = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    if (selectTipo == 'cerrada') {
        const newDiv = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.name = "respuestas";
        input.type = "radio";
        input.className = "flex-column"
        label.innerHTML = ` ${nombreOpcion}`;
        newDiv.appendChild(input);
        newDiv.appendChild(label);
        respuestasDiv.appendChild(newDiv);
        opDeResp.push(nombreOpcion);
        enviarOpcion(idSeccion);
    }
    if (selectTipo == 'multiple') {
        const newDiv = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.name = "respuestas";
        input.type = "checkbox";
        input.className = "flex-column"
        label.innerHTML = `${nombreOpcion}`;
        newDiv.appendChild(input);
        newDiv.appendChild(label);
        respuestasDiv.appendChild(newDiv);
        opDeResp.push(nombreOpcion);
        enviarOpcion(idSeccion);
    }
    console.log(opDeResp);
}
const addOption2 = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    if (selectTipo == 'cerrada') {
        const newDiv = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.name = "respuestas";
        input.type = "radio";
        input.className = "flex-column"
        label.innerHTML = ` ${nombreOpcion}`;
        newDiv.appendChild(input);
        newDiv.appendChild(label);
        respuestasDiv.appendChild(newDiv);
        opDeResp.push(nombreOpcion);
        enviarOpcion2(idSeccion);
    }
    if (selectTipo == 'multiple') {
        const newDiv = document.createElement("div");
        const input = document.createElement("input");
        const label = document.createElement("label");
        input.name = "respuestas";
        input.type = "checkbox";
        input.className = "flex-column"
        label.innerHTML = `${nombreOpcion}`;
        newDiv.appendChild(input);
        newDiv.appendChild(label);
        respuestasDiv.appendChild(newDiv);
        opDeResp.push(nombreOpcion);
        enviarOpcion2(idSeccion);
    }
    console.log(opDeResp);
}

const guardarPregunta = (idSeccion) => {
    let nombre_p = document.getElementById(`nombrePregunta-${idSeccion}`).value;
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    const pregunta = {
        "id_pregunta": '',
        "nombre_p": nombre_p,
        "tipo": selectTipo,
        "L1": opDeResp
    }

}


