class Resultado {
    constructor({
        idEncuesta,
        nombreEncuesta,
        descripcion,
        cantAplicaciones,
        cantSecciones,
        preguntasTotales,
        fechaLimite,
        resultados,
    }){
        this.idEncuesta = idEncuesta;
        this.nombreEncuesta = nombreEncuesta;
        this.descripcion = descripcion;
        this.cantAplicaciones = cantAplicaciones;
        this.cantSecciones = cantSecciones;
        this.preguntasTotales = preguntasTotales;
        this.fechaLimite = fechaLimite;
        this.resultados = resultados;

    }
}
module.exports = Resultado;
