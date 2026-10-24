// Reglas y mensajes del index.js original; funciones puras sin modificar el DOM.
export const camposInicio = ["correo", "contrasena"];
export const camposRegistro = ["nombreRegistro", "apellidoRegistro", "usuarioRegistro", "correoRegistro", "fechaNacimientoRegistro", "contrasenaRegistro", "confirmarContrasenaRegistro", "terminosRegistro"];
export function validarAcceso(id, valores) {
 const campos = Object.fromEntries([...camposInicio, ...camposRegistro].map(id => [id, {value: valores[id] || ""}]));
 const mostrarError = (_campo, _id, mensaje) => mensaje;
 const mostrarValido = () => "";
    const expresionCorreo =
        /^[^\s@]+@(?:gmail\.com|duoc\.cl|profesor\.uc\.cl)$/i;

    const expresionNombre =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

    const expresionUsuario =
        /^[A-Za-z0-9_]{4,16}$/;

    const expresionContrasena =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;


    const contarLetras = (texto) => {
        const letras = texto.match(
            /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g
        );

        return letras ? letras.length : 0;
    };
    const calcularEdad = (fechaTexto) => {
        if (!fechaTexto) return -1;

        const nacimiento = new Date(
            `${fechaTexto}T00:00:00`
        );

        const hoy = new Date();

        if (
            Number.isNaN(nacimiento.getTime()) ||
            nacimiento > hoy
        ) {
            return -1;
        }

        let edad =
            hoy.getFullYear() - nacimiento.getFullYear();

        const diferenciaMes =
            hoy.getMonth() - nacimiento.getMonth();

        if (
            diferenciaMes < 0 ||
            (
                diferenciaMes === 0 &&
                hoy.getDate() < nacimiento.getDate()
            )
        ) {
            edad--;
        }

        return edad;
    };
    const validarCorreoInicio = () => {
        const campo = campos["correo"];
        if (!campo) return false;

        const valor = campo.value.trim();

        if (!valor) {
            return mostrarError(
                campo,
                'errorCorreoInicio',
                'Ingresa tu correo electrónico.'
            );
        }

        if (!expresionCorreo.test(valor)) {
            return mostrarError(
                campo,
                'errorCorreoInicio',
                'Usa un correo de gmail.com, duoc.cl o profesor.uc.cl.'
            );
        }

        return mostrarValido(campo, 'errorCorreoInicio');
    };
    const validarContrasenaInicio = () => {
        const campo = campos["contrasena"];
        if (!campo) return false;

        if (!campo.value) {
            return mostrarError(
                campo,
                'errorContrasenaInicio',
                'Ingresa tu contraseña.'
            );
        }

        if (campo.value.length < 4) {
            return mostrarError(
                campo,
                'errorContrasenaInicio',
                'La contraseña debe tener al menos 4 caracteres.'
            );
        }

        return mostrarValido(
            campo,
            'errorContrasenaInicio'
        );
    };
    const validarNombreRegistro = () => {
        const campo =
            campos["nombreRegistro"];

        if (!campo) return false;

        const valor = campo.value.trim();

        if (!valor) {
            return mostrarError(
                campo,
                'errorNombreRegistro',
                'El nombre es obligatorio.'
            );
        }

        if (!expresionNombre.test(valor)) {
            return mostrarError(
                campo,
                'errorNombreRegistro',
                'El nombre solo puede contener letras, espacios, apóstrofes o guiones.'
            );
        }

        if (contarLetras(valor) < 2) {
            return mostrarError(
                campo,
                'errorNombreRegistro',
                'El nombre debe contener como mínimo 2 letras.'
            );
        }

        return mostrarValido(
            campo,
            'errorNombreRegistro'
        );
    };
    const validarApellidoRegistro = () => {
        const campo =
            campos["apellidoRegistro"];

        if (!campo) return false;

        const valor = campo.value.trim();

        if (!valor) {
            return mostrarError(
                campo,
                'errorApellidoRegistro',
                'El apellido es obligatorio.'
            );
        }

        if (!expresionNombre.test(valor)) {
            return mostrarError(
                campo,
                'errorApellidoRegistro',
                'El apellido solo puede contener letras, espacios, apóstrofes o guiones.'
            );
        }

        if (contarLetras(valor) < 2) {
            return mostrarError(
                campo,
                'errorApellidoRegistro',
                'El apellido debe contener como mínimo 2 letras.'
            );
        }

        return mostrarValido(
            campo,
            'errorApellidoRegistro'
        );
    };
    const validarUsuarioRegistro = () => {
        const campo =
            campos["usuarioRegistro"];

        if (!campo) return false;

        const valor = campo.value.trim();

        if (!valor) {
            return mostrarError(
                campo,
                'errorUsuarioRegistro',
                'El nombre de usuario es obligatorio.'
            );
        }

        if (!expresionUsuario.test(valor)) {
            return mostrarError(
                campo,
                'errorUsuarioRegistro',
                'Usa entre 4 y 16 caracteres: letras, números o guion bajo.'
            );
        }

        return mostrarValido(
            campo,
            'errorUsuarioRegistro'
        );
    };
    const validarCorreoRegistro = () => {
        const campo =
            campos["correoRegistro"];

        if (!campo) return false;

        const valor = campo.value.trim();

        if (!valor) {
            return mostrarError(
                campo,
                'errorCorreoRegistro',
                'El correo electrónico es obligatorio.'
            );
        }

        if (!expresionCorreo.test(valor)) {
            return mostrarError(
                campo,
                'errorCorreoRegistro',
                'Usa un correo de gmail.com, duoc.cl o profesor.uc.cl.'
            );
        }

        return mostrarValido(
            campo,
            'errorCorreoRegistro'
        );
    };
    const validarFechaNacimientoRegistro = () => {
        const campo =
            campos["fechaNacimientoRegistro"];

        if (!campo) return false;

        const valor = campo.value;

        if (!valor) {
            return mostrarError(
                campo,
                'errorFechaNacimientoRegistro',
                'Selecciona tu fecha de nacimiento.'
            );
        }

        const edad = calcularEdad(valor);

        if (edad < 0) {
            return mostrarError(
                campo,
                'errorFechaNacimientoRegistro',
                'La fecha de nacimiento no es válida.'
            );
        }

        if (edad < 13) {
            return mostrarError(
                campo,
                'errorFechaNacimientoRegistro',
                'Debes tener mínimo 13 años para registrarte.'
            );
        }

        return mostrarValido(
            campo,
            'errorFechaNacimientoRegistro'
        );
    };
    const validarContrasenaRegistro = () => {
        const campo =
            campos["contrasenaRegistro"];

        if (!campo) return false;

        const valor = campo.value;

        if (!valor) {
            return mostrarError(
                campo,
                'errorContrasenaRegistro',
                'La contraseña es obligatoria.'
            );
        }

        if (!expresionContrasena.test(valor)) {
            return mostrarError(
                campo,
                'errorContrasenaRegistro',
                'Debe tener 8 caracteres o más e incluir mayúscula, minúscula, número y carácter especial.'
            );
        }

        const resultado = mostrarValido(
            campo,
            'errorContrasenaRegistro'
        );

        if (
            campos["confirmarContrasenaRegistro"]?.value
        ) {
            validarConfirmacionRegistro();
        }

        return resultado;
    };
    const validarConfirmacionRegistro = () => {
        const campo =
            campos["confirmarContrasenaRegistro"];

        const contrasena =
            campos["contrasenaRegistro"]?.value || '';

        if (!campo) return false;

        if (!campo.value) {
            return mostrarError(
                campo,
                'errorConfirmarContrasenaRegistro',
                'Repite tu contraseña.'
            );
        }

        if (campo.value !== contrasena) {
            return mostrarError(
                campo,
                'errorConfirmarContrasenaRegistro',
                'Las contraseñas no coinciden.'
            );
        }

        return mostrarValido(
            campo,
            'errorConfirmarContrasenaRegistro'
        );
    };
 const validadores = {correo:validarCorreoInicio, contrasena:validarContrasenaInicio, nombreRegistro:validarNombreRegistro, apellidoRegistro:validarApellidoRegistro, usuarioRegistro:validarUsuarioRegistro, correoRegistro:validarCorreoRegistro, fechaNacimientoRegistro:validarFechaNacimientoRegistro, contrasenaRegistro:validarContrasenaRegistro, confirmarContrasenaRegistro:validarConfirmacionRegistro};
 if(id === "terminosRegistro") return valores[id] ? "" : "Debes aceptar el compromiso de participación responsable.";
 return validadores[id]();
}
