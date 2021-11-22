class Pregunta{
    constructor(id_pregunta, nombre_p, tipo,L1){
        this.id_pregunta = id_pregunta;
        this.nombre_p = nombre_p;
        this.tipo = tipo;
        this.op_de_resp = L1;
    }
}
module.exports = Pregunta;