const bcrypt = require('bcryptjs');

class Usuario {
    constructor(id, name, telefono, email, genero, contraseña, direccion) {
        this.id = id;
        this.name = name;
        this.telefono = telefono;
        this.email = email;
        this.genero = genero;
        this.contraseña = contraseña;
        this.direccion = direccion;
    }
    insertarUsuario(lista) {
        if (lista.length> 0) {
            var usuarioAcual = new Usuario(
                lista[0].id,
                lista[0].name,
                lista[0].telefono,
                lista[0].email,
                lista[0].genero,
                lista[0].contraseña,
                lista[0].direccion
            );
        }
        return usuarioAcual;
    }
    async encriptarPass(passACifrar) {
        const salt = await bcrypt.genSalt(10);
         return bcrypt.hash(passACifrar, salt);
    }
    async desencriptarPass(passADesencriptar) {
        await bcrypt.compare(passADesencriptar.toString(), this.contraseña)
    }
}
module.exports = Usuario;