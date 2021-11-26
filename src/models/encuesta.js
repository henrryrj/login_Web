class Encuesta{

    constructor(id_encuesta, nombre_e,descripcion, cant_secciones,estado,seccion){
        this.id_encuesta = id_encuesta;
        this.nombre_e = nombre_e;
        this.descripcion = descripcion;
        this.cant_secciones = cant_secciones;
        this.estado = estado
        this.seccion = seccion;
    }
}
class EncuestaSinSeccion{
    constructor(id_encuesta, nombre_e,descripcion, cant_secciones, estado){
        this.id_encuesta = id_encuesta;
        this.nombre_e = nombre_e;
        this.descripcion = descripcion;
        this.cant_secciones = cant_secciones;
        this.estado = estado;
    }
}
module.exports = {Encuesta, EncuestaSinSeccion};