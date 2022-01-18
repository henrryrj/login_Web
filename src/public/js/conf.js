
//DE AQUI VIENE LA FUNCIONALIDAD DEL MODAL
var ListaDeopDeResp = [];
var idOPcion = 0;
function cambiarAction(idAEditar) {
    document.formPrincipal.action = `/encuestas/editSeccion/${idAEditar}`;
    document.formPrincipal.submit();
}
function cambiarAccionDelete(idAEditar) {
    document.formPrincipal.action = `/encuestas/delSeccion/${idAEditar}`;
    document.formPrincipal.submit();
}

function cambiarAccionEncuesta(idAEditar) {
    document.formPrincipal.action = `/encuestas/editSeccionEncuesta/${idAEditar}`;
    document.formPrincipal.submit();
}
function cambiarAccionDeletePregunta(idSeccion,idPregunta) {
    document.formPrincipal.action = `/encuestas/delPregunta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}
function cambiarAccionDeletePreguntaEncuesta(idSeccion,idPregunta) {
    document.formPrincipal.action = `/encuestas/delPreguntaEncuesta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}


function cambiarAccionDeleteEncuesta(idAEditar) {
    document.formPrincipal.action = `/encuestas/delSeccionEncuesta/${idAEditar}`;
    document.formPrincipal.submit();
}

function enviarCambiosPregunta(idSeccion, idPregunta) {
    document.formPrincipal.action = `/encuestas/editPregunta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}
function enviarCambiosPreguntaEncuesta(idSeccion, idPregunta) {
    document.formPrincipal.action = `/encuestas/editPreguntaEncuesta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}
function enviarPregunta(idSeccion) {
    document.formPrincipal.action = `/encuestas/getDatosPregunta/${idSeccion}`;
    document.formPrincipal.submit();
}
function enviarPreguntaEncuesta(idSeccion) {
    document.formPrincipal.action = `/encuestas/getDatosPreguntaEncuesta/${idSeccion}`;
    document.formPrincipal.submit();
}

function enviarOpcion(idSeccion) {
    document.formPrincipal.action = `/encuestas/addOpcion/${idSeccion}`;
    document.formPrincipal.submit();
}
function enviarOpcionEncuesta(idSeccion) {
    document.formPrincipal.action = `/encuestas/addOpcionEncuesta/${idSeccion}`;
    document.formPrincipal.submit();
}
function enviarOpcion2(idSeccion, idPregunta) {
    document.formPrincipal.action = `/encuestas/addOpcion2/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}
function enviarOpcion2Encuesta(idSeccion, idPregunta) {
    document.formPrincipal.action = `/encuestas/addOpcion2Encuesta/${idSeccion}/${idPregunta}`;
    document.formPrincipal.submit();
}

function delOpcion(idSeccion) {
    document.formPrincipal.action = `/encuestas/delOpcion/${idSeccion}`;
    document.formPrincipal.submit();
}
function delUnaOpcion(idSeccion, valor) {
    document.formPrincipal.action = `/encuestas/delUnaOpcion/${idSeccion}/${valor}`;
    document.formPrincipal.submit();
}
function delUnaOpcion2(idSeccion, idPregunta, valor) {
    document.formPrincipal.action = `/encuestas/delUnaOpcion/${idSeccion}/${idPregunta}/${valor}`;
    document.formPrincipal.submit();
}
function delUnaOpcion3(idSeccion, idPregunta, valor) {
    document.formPrincipal.action = `/encuestas/delUnaOpcion2/${idSeccion}/${idPregunta}/${valor}`;
    document.formPrincipal.submit();
}
function save() {
    document.formPrincipal.action = `/encuestas/save`;
    document.formPrincipal.submit();
}function saveEditEncuesta() {
    document.formPrincipal.action = `/encuestas/saveEditEncuesta`;
    document.formPrincipal.submit();
}
const cambiarTipo = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    resetRespuestas(idSeccion);
    ocultarBoton(idSeccion);
    ListaDeopDeResp = [];
    idOPcion = 0;
    if (selectTipo === 'abierta') {
        const newDiv = document.createElement("div");
        const textArea = document.createElement("textarea");
        textArea.name = "respuestas";
        textArea.className = "form-control";
        textArea.disabled = true;
        newDiv.appendChild(textArea);
        respuestasDiv.appendChild(newDiv);
        console.log('text area pa');

    }
}
const cambiarTipo2 = (idSeccion, idPregunta) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}-${idPregunta}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}-${idPregunta}`);
    ListaDeopDeResp = [];
    idOPcion = 0;
    ocultarBoton2(idSeccion, idPregunta);
    if (selectTipo === 'abierta') resetRespuestas2(idSeccion, idPregunta);
}

const delOpDeRep = (idSeccion) => document.getElementById(`nombreOption-id-${idSeccion}`).value = "";
const delOpDeRep2 = (idSeccion, idPregunta) => document.getElementById(`nombreOption-id-${idSeccion}-${idPregunta}`).value = "";

const resetRespuestas = (idSeccion) => {
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    document.getElementById(`nombreOption-id-${idSeccion}`).value = "";
    respuestasDiv.innerHTML = "";
    delOpcion(idSeccion);

}
const resetRespuestas2 = (idSeccion, idPregunta) => {
    document.getElementById(`respuestas-id-${idSeccion}-${idPregunta}`).innerHTML = "";
    document.getElementById(`nombreOption-id-${idSeccion}-${idPregunta}`).value = "";
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
const ocultarBoton2 = (idSeccion, idPregunta) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}-${idPregunta}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}-${idPregunta}`);
    let addButton = document.getElementById(`addButton-${idSeccion}-${idPregunta}`);
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
    if (selectTipo == 'simple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("label");
        const btnDelOp = document.createElement("button");

        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.type = "button";
        btnDelOp.innerHTML = "Del Op";
        idOPcion = ListaDeopDeResp.length + 1;
        btnDelOp.id = `btnDelOp-${idOPcion}`;
        lista.id = `lista-${idOPcion}`;
        ListaDeopDeResp.push(btnDelOp.id);

        inputTipo.type = "radio";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text";
        inputOpcion.className = "form-control";
        inputOpcion.name = "opActual";
        inputOpcion.innerHTML = `${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion(idSeccion, inputOpcion.innerHTML);
        });


        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion(idSeccion);
    }
    if (selectTipo == 'multiple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const btnDelOp = document.createElement("a");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("label");
        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.innerHTML = "Del Op"
        idOPcion = ListaDeopDeResp.length + 1;
        btnDelOp.id = `btnDelOp-${idOPcion}`;
        lista.id = `btnDelOp-${idOPcion}`;


        inputTipo.type = "checkbox";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text"
        inputOpcion.className = "form-control input-sm"
        inputOpcion.id = ListaDeopDeResp.length + 1;
        inputOpcion.name = "opActual";
        inputOpcion.innerHTML = ` ${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion(idSeccion, inputOpcion.innerHTML);

        });
        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion(idSeccion);

    }
    console.log(ListaDeopDeResp);
    delOpDeRep(idSeccion);
}
const addOptionEncuesta = (idSeccion) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}`);
    if (selectTipo == 'simple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("label");
        const btnDelOp = document.createElement("button");

        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.type = "button";
        btnDelOp.innerHTML = "Del Op";
        idOPcion = ListaDeopDeResp.length + 1;
        btnDelOp.id = `btnDelOp-${idOPcion}`;
        lista.id = `lista-${idOPcion}`;
        ListaDeopDeResp.push(btnDelOp.id);

        inputTipo.type = "radio";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text";
        inputOpcion.className = "form-control";
        inputOpcion.name = "opActual";
        inputOpcion.innerHTML = `${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion(idSeccion, inputOpcion.innerHTML);
        });


        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcionEncuesta(idSeccion);
    }
    if (selectTipo == 'multiple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const btnDelOp = document.createElement("a");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("label");
        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.innerHTML = "Del Op"
        idOPcion = ListaDeopDeResp.length + 1;
        btnDelOp.id = `btnDelOp-${idOPcion}`;
        lista.id = `btnDelOp-${idOPcion}`;


        inputTipo.type = "checkbox";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text"
        inputOpcion.className = "form-control input-sm"
        inputOpcion.id = ListaDeopDeResp.length + 1;
        inputOpcion.name = "opActual";
        inputOpcion.innerHTML = ` ${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion(idSeccion, inputOpcion.innerHTML);

        });
        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcionEncuesta(idSeccion);

    }
    console.log(ListaDeopDeResp);
    delOpDeRep(idSeccion);
}

const editOpciones = (idSeccion, idPregunta) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}-${idPregunta}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}-${idPregunta}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}-${idPregunta}`);
    if (selectTipo == 'simple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("input");
        const btnDelOp = document.createElement("button");

        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.type = "button";
        btnDelOp.innerHTML = "Del Op";
        btnDelOp.id = `btnDelOp-${idSeccion}-${idPregunta}`;
        lista.id = `lista-${idSeccion}-${idPregunta}`;



        ListaDeopDeResp.push(btnDelOp.id);

        inputTipo.type = "radio";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text";
        inputOpcion.className = "form-control";
        inputOpcion.name = `opActual`;
        inputOpcion.value = `${nombreOpcion}`;

        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion3(idSeccion, idPregunta, inputOpcion.value);
        });


        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== ""){
            respuestasDiv.appendChild(lista);
        } /* else{
            alert('ingrese un nombre a la opcion');
        } */
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion2(idSeccion, idPregunta);
    }
    if (selectTipo == 'multiple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const btnDelOp = document.createElement("a");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("input");
        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.innerHTML = "Del Op"
        btnDelOp.id = `btnDelOp-${idSeccion}-${idPregunta}`;
        lista.id = `lista-${idSeccion}-${idPregunta}`;
        inputTipo.type = "checkbox";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text"
        inputOpcion.className = "form-control input-sm"
        inputOpcion.id = ListaDeopDeResp.length + 1;
        inputOpcion.name = "opActual";
        inputOpcion.value = ` ${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion3(idSeccion, idPregunta, inputOpcion.value);

        });
        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion2(idSeccion,idPregunta);
    }
    console.log(ListaDeopDeResp);
    delOpDeRep2(idSeccion, idPregunta);
}

const editOpcionesEncuesta = (idSeccion, idPregunta) => {
    let selectTipo = document.getElementById(`select-tipo-${idSeccion}-${idPregunta}`).value;
    let nombreOpcion = document.getElementById(`nombreOption-id-${idSeccion}-${idPregunta}`).value;
    let respuestasDiv = document.getElementById(`respuestas-id-${idSeccion}-${idPregunta}`);
    if (selectTipo == 'simple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("input");
        const btnDelOp = document.createElement("button");

        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.type = "button";
        btnDelOp.innerHTML = "Del Op";
        btnDelOp.id = `btnDelOp-${idSeccion}-${idPregunta}`;
        lista.id = `lista-${idSeccion}-${idPregunta}`;



        ListaDeopDeResp.push(btnDelOp.id);

        inputTipo.type = "radio";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text";
        inputOpcion.className = "form-control";
        inputOpcion.name = `opActual`;
        inputOpcion.value = `${nombreOpcion}`;

        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion3(idSeccion, idPregunta, inputOpcion.value);
        });


        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== ""){
            respuestasDiv.appendChild(lista);
        } /* else{
            alert('ingrese un nombre a la opcion');
        } */
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion2Encuesta(idSeccion, idPregunta);
    }
    if (selectTipo == 'multiple') {
        const lista = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        const btnDelOp = document.createElement("a");
        const inputTipo = document.createElement("input");
        const inputOpcion = document.createElement("input");
        //ESTILOS
        lista.className = "d-flex flex-nowrap bd-highlight";
        col1.className = "order-1 p-2 bd-highlight";
        col2.className = "order-2 p-2 bd-highlight";
        col3.className = "order-3 p-2 bd-highlight";
        btnDelOp.className = "btn btn-danger";
        btnDelOp.innerHTML = "Del Op"
        btnDelOp.id = `btnDelOp-${idSeccion}-${idPregunta}`;
        lista.id = `lista-${idSeccion}-${idPregunta}`;
        inputTipo.type = "checkbox";
        inputTipo.className = "form-check-input"
        inputTipo.disabled = true;

        inputOpcion.type = "text"
        inputOpcion.className = "form-control input-sm"
        inputOpcion.id = ListaDeopDeResp.length + 1;
        inputOpcion.name = "opActual";
        inputOpcion.value = ` ${nombreOpcion}`;
        btnDelOp.addEventListener('click', () => {
            document.getElementById(lista.id).remove();
            delUnaOpcion3(idSeccion, idPregunta, inputOpcion.value);

        });
        lista.appendChild(col1);
        lista.appendChild(col2);
        lista.append(col3);
        col1.appendChild(inputTipo);
        col2.appendChild(inputOpcion);
        col3.appendChild(btnDelOp);
        if(nombreOpcion !== "") respuestasDiv.appendChild(lista);
        ListaDeopDeResp.push(nombreOpcion);
        enviarOpcion2Encuesta(idSeccion,idPregunta);
    }
    console.log(ListaDeopDeResp);
    delOpDeRep2(idSeccion, idPregunta);
}

function del(idSeccion, idPregunta, idDIv, dato) {
    console.log(idSeccion, idPregunta, idDIv, dato);
    document.getElementById(idDIv).remove();
    delUnaOpcion2(idSeccion, idPregunta, dato);
}




