class Encuesta{

    constructor({id_encuesta, nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado,seccion}){
        this.id_encuesta = id_encuesta;
        this.nombre_e = nombre_e;
        this.descripcion = descripcion;
        this.cant_aplicaciones = cant_aplicaciones;
        this.cant_secciones = cant_secciones;
        this.createAt = createAt;
        this.fechaLimite = fechaLimite;
        this.estado = estado
        this.seccion = seccion;
    }
}
class EncuestaSinSeccion{
    constructor({id_encuesta, nombre_e,descripcion, cant_aplicaciones, cant_secciones,createAt, fechaLimite, estado}){
        this.id_encuesta = id_encuesta;
        this.nombre_e = nombre_e;
        this.descripcion = descripcion;
        this.cant_aplicaciones = cant_aplicaciones;
        this.cant_secciones = cant_secciones;
        this.createAt = createAt;
        this.fechaLimite = fechaLimite;
        this.estado = estado
    }
}
module.exports = {Encuesta, EncuestaSinSeccion};