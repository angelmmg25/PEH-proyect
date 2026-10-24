
document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    /* ==========================================================
       PEH — INICIO DE SESIÓN Y REGISTRO
       INDEX.JS V3 — MULTIUSUARIO
       ========================================================== */

    const formularioInicioSesion =
        document.getElementById('formularioInicioSesion');

    const formularioRegistro =
        document.getElementById('formularioRegistro');

    const botonInvitado =
        document.getElementById('botonInvitado');

    const botonMostrarRegistro =
        document.getElementById('botonMostrarRegistro');

    const botonMostrarInicio =
        document.getElementById('botonMostrarInicio');

    const tarjetaAcceso =
        document.getElementById('tarjetaAcceso');

    const contenedorTarjeta =
        document.getElementById('contenedorTarjeta');


    /* ==========================================================
       1. CAMBIO ENTRE LOGIN Y REGISTRO
       ========================================================== */

    const mostrarRegistro = () => {
        formularioInicioSesion?.setAttribute('inert', '');
        formularioRegistro?.removeAttribute('inert');

        tarjetaAcceso?.classList.add('girada');
        contenedorTarjeta?.classList.add('modo-registro');

        setTimeout(() => {
            document.getElementById('nombreRegistro')?.focus();
        }, 380);
    };

    const mostrarInicioSesion = () => {
        formularioRegistro?.setAttribute('inert', '');
        formularioInicioSesion?.removeAttribute('inert');

        tarjetaAcceso?.classList.remove('girada');
        contenedorTarjeta?.classList.remove('modo-registro');

        setTimeout(() => {
            document.getElementById('correo')?.focus();
        }, 380);
    };

    botonMostrarRegistro?.addEventListener(
        'click',
        mostrarRegistro
    );

    botonMostrarInicio?.addEventListener(
        'click',
        mostrarInicioSesion
    );


    /* ==========================================================
       2. ACCESO COMO INVITADO
       ========================================================== */

    botonInvitado?.addEventListener('click', () => {
        if (!window.PEH?.sesion) {
            alert('No se pudo iniciar el modo invitado.');
            return;
        }

        const idInvitado =
            PEH.leer('peh_invitado_id', null) ||
            PEH.id('INV');

        PEH.escribir('peh_invitado_id', idInvitado);

        const guardado = PEH.sesion.iniciar({
            id: idInvitado,
            nombre: 'Invitado',
            correo: '',
            invitado: true
        });

        if (guardado) {
            window.location.href = 'principal.html';
        } else {
            alert('No se pudo iniciar el modo invitado.');
        }
    });


    /* ==========================================================
       3. EXPRESIONES DE VALIDACIÓN
       ========================================================== */

    const expresionCorreo =
        /^[^\s@]+@(?:gmail\.com|duoc\.cl|profesor\.uc\.cl)$/i;

    const expresionNombre =
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

    const expresionUsuario =
        /^[A-Za-z0-9_]{4,16}$/;

    const expresionContrasena =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;


    /* ==========================================================
       4. FUNCIONES GENERALES DE VALIDACIÓN
       ========================================================== */

    const obtenerGrupo = (campo) =>
        campo?.closest('.grupo-campo');

    const mostrarError = (campo, idError, mensaje) => {
        const grupo = obtenerGrupo(campo);
        const elementoError = document.getElementById(idError);

        grupo?.classList.remove('campo-valido');
        grupo?.classList.add('campo-error');

        campo?.setAttribute('aria-invalid', 'true');

        if (elementoError) {
            elementoError.textContent = mensaje;
        }

        return false;
    };

    const mostrarValido = (campo, idError) => {
        const grupo = obtenerGrupo(campo);
        const elementoError = document.getElementById(idError);

        grupo?.classList.remove('campo-error');
        grupo?.classList.add('campo-valido');

        campo?.setAttribute('aria-invalid', 'false');

        if (elementoError) {
            elementoError.textContent = '';
        }

        return true;
    };

    const limpiarEstado = (campo, idError) => {
        const grupo = obtenerGrupo(campo);
        const elementoError = document.getElementById(idError);

        grupo?.classList.remove('campo-error', 'campo-valido');
        campo?.removeAttribute('aria-invalid');

        if (elementoError) {
            elementoError.textContent = '';
        }
    };

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


    /* ==========================================================
       5. VALIDACIONES DEL INICIO DE SESIÓN
       ========================================================== */

    const validarCorreoInicio = () => {
        const campo = document.getElementById('correo');
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
        const campo = document.getElementById('contrasena');
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

    document.getElementById('correo')?.addEventListener(
        'input',
        validarCorreoInicio
    );

    document.getElementById('contrasena')?.addEventListener(
        'input',
        validarContrasenaInicio
    );


    /* ==========================================================
       6. ENVÍO DEL INICIO DE SESIÓN
       ========================================================== */

    formularioInicioSesion?.addEventListener(
        'submit',
        async (evento) => {
            evento.preventDefault();

            const correoValido = validarCorreoInicio();
            const contrasenaValida = validarContrasenaInicio();

            if (!correoValido || !contrasenaValida) {
                return;
            }

            const campoCorreo =
                document.getElementById('correo');

            const campoContrasena =
                document.getElementById('contrasena');

            const botonEnviar =
                formularioInicioSesion.querySelector(
                    'button[type="submit"]'
                );

            if (!window.PEH?.cuentas?.iniciarSesion) {
                alert(
                    'No se pudo cargar el sistema de cuentas de PEH.'
                );
                return;
            }

            if (botonEnviar) {
                botonEnviar.disabled = true;
            }

            try {
                const resultado =
                    await PEH.cuentas.iniciarSesion(
                        campoCorreo.value.trim(),
                        campoContrasena.value
                    );

                if (!resultado.ok) {
                    mostrarError(
                        campoContrasena,
                        'errorContrasenaInicio',
                        resultado.mensaje ||
                        'Correo o contraseña incorrectos.'
                    );
                    return;
                }

                window.location.href = PEH.admin.esAdmin() ? 'desarrollador.html' : 'principal.html';

            } catch (error) {
                console.error(
                    '[PEH] Error al iniciar sesión:',
                    error
                );

                mostrarError(
                    campoContrasena,
                    'errorContrasenaInicio',
                    'Ocurrió un problema al iniciar sesión.'
                );

            } finally {
                if (botonEnviar) {
                    botonEnviar.disabled = false;
                }
            }
        }
    );


    /* ==========================================================
       7. VALIDACIONES DEL REGISTRO
       ========================================================== */

    const validarNombreRegistro = () => {
        const campo =
            document.getElementById('nombreRegistro');

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
            document.getElementById('apellidoRegistro');

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
            document.getElementById('usuarioRegistro');

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
            document.getElementById('correoRegistro');

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
            document.getElementById(
                'fechaNacimientoRegistro'
            );

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
            document.getElementById('contrasenaRegistro');

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
            document.getElementById(
                'confirmarContrasenaRegistro'
            )?.value
        ) {
            validarConfirmacionRegistro();
        }

        return resultado;
    };

    const validarConfirmacionRegistro = () => {
        const campo =
            document.getElementById(
                'confirmarContrasenaRegistro'
            );

        const contrasena =
            document.getElementById(
                'contrasenaRegistro'
            )?.value || '';

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

    const validarTerminosRegistro = () => {
        const campo =
            document.getElementById('terminosRegistro');

        if (!campo) return false;

        const grupo = obtenerGrupo(campo);

        const elementoError =
            document.getElementById(
                'errorTerminosRegistro'
            );

        if (!campo.checked) {
            grupo?.classList.add('campo-error');

            if (elementoError) {
                elementoError.textContent =
                    'Debes aceptar el compromiso de participación responsable.';
            }

            return false;
        }

        grupo?.classList.remove('campo-error');

        if (elementoError) {
            elementoError.textContent = '';
        }

        return true;
    };


    /* ==========================================================
       8. EVENTOS DE VALIDACIÓN DEL REGISTRO
       ========================================================== */

    const validacionesRegistro = [
        ['nombreRegistro', validarNombreRegistro],
        ['apellidoRegistro', validarApellidoRegistro],
        ['usuarioRegistro', validarUsuarioRegistro],
        ['correoRegistro', validarCorreoRegistro],
        [
            'fechaNacimientoRegistro',
            validarFechaNacimientoRegistro
        ],
        ['contrasenaRegistro', validarContrasenaRegistro],
        [
            'confirmarContrasenaRegistro',
            validarConfirmacionRegistro
        ]
    ];

    validacionesRegistro.forEach(
        ([idCampo, funcionValidacion]) => {
            const campo = document.getElementById(idCampo);

            const evento =
                campo?.type === 'date'
                    ? 'change'
                    : 'input';

            campo?.addEventListener(
                evento,
                funcionValidacion
            );

            campo?.addEventListener(
                'blur',
                funcionValidacion
            );
        }
    );

    document.getElementById('terminosRegistro')
        ?.addEventListener(
            'change',
            validarTerminosRegistro
        );


    /* ==========================================================
       9. ENVÍO DEL REGISTRO — CUENTAS PEH
       ========================================================== */

    formularioRegistro?.addEventListener(
        'submit',
        async (evento) => {
            evento.preventDefault();

            const resultados =
                validacionesRegistro.map(
                    ([, validar]) => validar()
                );

            resultados.push(
                validarTerminosRegistro()
            );

            const registroValido =
                resultados.every(Boolean);

            const mensajeRegistro =
                document.getElementById('mensajeRegistro');

            const mostrarMensajeRegistro = (mensaje, tipo) => {
                if (!mensajeRegistro) return;

                mensajeRegistro.textContent = mensaje;
                mensajeRegistro.className =
                    `mensaje-formulario ${tipo}`;
            };

            if (!registroValido) {
                mostrarMensajeRegistro(
                    'Revisa los campos marcados antes de crear tu cuenta.',
                    'error'
                );

                formularioRegistro
                    .querySelector('.campo-error input')
                    ?.focus();

                return;
            }

            if (!window.PEH?.cuentas?.registrar) {
                mostrarMensajeRegistro(
                    'No se pudo cargar el sistema de cuentas de PEH.',
                    'error'
                );
                return;
            }

            const obtenerValor = (id) =>
                document.getElementById(id)?.value || '';

            const datosRegistro = {
                nombre:
                    obtenerValor('nombreRegistro').trim(),

                apellido:
                    obtenerValor('apellidoRegistro').trim(),

                usuario:
                    obtenerValor('usuarioRegistro').trim(),

                correo:
                    obtenerValor('correoRegistro').trim(),

                fechaNacimiento:
                    obtenerValor('fechaNacimientoRegistro'),

                contrasena:
                    obtenerValor('contrasenaRegistro')
            };

            const botonEnviar =
                formularioRegistro.querySelector(
                    'button[type="submit"]'
                );

            if (botonEnviar) {
                botonEnviar.disabled = true;
            }

            try {
                mostrarMensajeRegistro(
                    'Estamos creando tu cuenta...',
                    'info'
                );

                const resultado =
                    await PEH.cuentas.registrar(
                        datosRegistro
                    );

                if (!resultado.ok) {
                    mostrarMensajeRegistro(
                        resultado.mensaje ||
                        'No se pudo crear la cuenta.',
                        'error'
                    );
                    return;
                }

                mostrarMensajeRegistro(
                    '¡Bienvenido a PEH! Tu cuenta fue creada correctamente.',
                    'exito'
                );

                setTimeout(() => {
                    const correoInicio =
                        document.getElementById('correo');

                    if (correoInicio) {
                        correoInicio.value =
                            datosRegistro.correo;

                        limpiarEstado(
                            correoInicio,
                            'errorCorreoInicio'
                        );
                    }

                    formularioRegistro.reset();

                    validacionesRegistro.forEach(
                        ([idCampo]) => {
                            const campo =
                                document.getElementById(
                                    idCampo
                                );

                            const idError = campo
                                ?.getAttribute(
                                    'aria-describedby'
                                )
                                ?.split(' ')
                                .find(id =>
                                    id.startsWith('error')
                                );

                            if (campo && idError) {
                                limpiarEstado(
                                    campo,
                                    idError
                                );
                            }
                        }
                    );

                    const terminos =
                        document.getElementById(
                            'terminosRegistro'
                        );

                    const errorTerminos =
                        document.getElementById(
                            'errorTerminosRegistro'
                        );

                    if (errorTerminos) {
                        errorTerminos.textContent = '';
                    }

                    obtenerGrupo(terminos)
                        ?.classList.remove(
                            'campo-error'
                        );

                    if (mensajeRegistro) {
                        mensajeRegistro.textContent = '';
                        mensajeRegistro.className =
                            'mensaje-formulario';
                    }

                    mostrarInicioSesion();

                }, 900);

            } catch (error) {
                console.error(
                    '[PEH] Error al registrar:',
                    error
                );

                mostrarMensajeRegistro(
                    'Ocurrió un problema al crear tu cuenta.',
                    'error'
                );

            } finally {
                if (botonEnviar) {
                    botonEnviar.disabled = false;
                }
            }
        }
    );

});
