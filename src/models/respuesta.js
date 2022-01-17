class Respuesta{
    constructor({idPregunta,tipoPregunta,nombreP, cantResp,nombreOpcion}){
        this.idPregunta = idPregunta;
        this.tipoPregunta = tipoPregunta;
        this.nombreP = nombreP;
        this.cantResp = cantResp;
        this.nombreOpcion = nombreOpcion;
    }
}
module.exports = Respuesta;

/* "idPregunta": "1",
"tipo": "simpre",
"nombre_p":"¿Cuando el zoom?", */