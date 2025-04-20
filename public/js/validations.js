/**
 * Utilidades de validación para formularios del sitio web de Veltium Group
 */

// Validar formato de RFC mexicano
const validarRFC = (rfc) => {
    // Patrón para validar un RFC
    // Persona moral: 12 caracteres
    // Persona física: 13 caracteres
    const pattern = /^([A-ZÑ&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/;
    
    if (!pattern.test(rfc)) {
        return false;
    }
    
    return true;
};

// Validar formato de correo electrónico
const validarEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return pattern.test(email);
};

// Validar formato de teléfono mexicano
const validarTelefono = (telefono) => {
    // Eliminar espacios, guiones y paréntesis
    const tel = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que sea un número de 10 dígitos
    const pattern = /^(\+?52)?\d{10}$/;
    return pattern.test(tel);
};

// Validar código postal mexicano
const validarCodigoPostal = (cp) => {
    const pattern = /^\d{5}$/;
    return pattern.test(cp);
};

// Validar que el monto esté dentro del rango permitido
const validarMonto = (monto) => {
    const montoNum = parseFloat(monto);
    return montoNum >= 300000 && montoNum <= 30000000;
};

// Validar que la antigüedad sea suficiente según el tipo de crédito
const validarAntiguedad = (antiguedad, tipoCredito) => {
    const antiguedadNum = parseInt(antiguedad);
    
    switch (tipoCredito) {
        case 'simple':
            return antiguedadNum >= 1;
        case 'pymes':
        case 'activos':
            return antiguedadNum >= 2;
        default:
            return antiguedadNum >= 1;
    }
};

// Validar tamaño y tipo de archivo
const validarArchivo = (file, maxSizeMB = 5) => {
    if (!file) {
        return { valido: false, mensaje: 'No se ha seleccionado ningún archivo.' };
    }
    
    // Validar tamaño (en bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { 
            valido: false, 
            mensaje: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB.` 
        };
    }
    
    // Validar tipo de archivo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!tiposPermitidos.includes(file.type) && 
        !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
        return { 
            valido: false, 
            mensaje: 'Formato de archivo no válido. Solo se permiten archivos PDF, JPG o PNG.' 
        };
    }
    
    return { valido: true, mensaje: 'Archivo válido.' };
};

// Validar formulario de solicitud completo
const validarFormularioSolicitud = (datos) => {
    const errores = {};
    
    // Validar datos de la empresa
    if (!datos.razonSocial || datos.razonSocial.trim() === '') {
        errores.razonSocial = 'La razón social es obligatoria.';
    }
    
    if (!datos.rfc || !validarRFC(datos.rfc)) {
        errores.rfc = 'El RFC no es válido.';
    }
    
    if (!datos.giro || datos.giro.trim() === '') {
        errores.giro = 'El giro de la empresa es obligatorio.';
    }
    
    if (!datos.antiguedad || parseInt(datos.antiguedad) < 1) {
        errores.antiguedad = 'La antigüedad debe ser al menos de 1 año.';
    }
    
    if (!datos.direccion || datos.direccion.trim() === '') {
        errores.direccion = 'La dirección fiscal es obligatoria.';
    }
    
    if (!datos.codigoPostal || !validarCodigoPostal(datos.codigoPostal)) {
        errores.codigoPostal = 'El código postal no es válido.';
    }
    
    if (!datos.ciudad || datos.ciudad.trim() === '') {
        errores.ciudad = 'La ciudad es obligatoria.';
    }
    
    if (!datos.estado || datos.estado.trim() === '') {
        errores.estado = 'El estado es obligatorio.';
    }
    
    if (!datos.telefono || !validarTelefono(datos.telefono)) {
        errores.telefono = 'El teléfono no es válido.';
    }
    
    if (!datos.email || !validarEmail(datos.email)) {
        errores.email = 'El correo electrónico no es válido.';
    }
    
    // Validar datos del representante legal
    if (!datos.nombreRepresentante || datos.nombreRepresentante.trim() === '') {
        errores.nombreRepresentante = 'El nombre del representante legal es obligatorio.';
    }
    
    if (!datos.rfcRepresentante || !validarRFC(datos.rfcRepresentante)) {
        errores.rfcRepresentante = 'El RFC del representante legal no es válido.';
    }
    
    if (!datos.telefonoRepresentante || !validarTelefono(datos.telefonoRepresentante)) {
        errores.telefonoRepresentante = 'El teléfono del representante legal no es válido.';
    }
    
    if (!datos.emailRepresentante || !validarEmail(datos.emailRepresentante)) {
        errores.emailRepresentante = 'El correo electrónico del representante legal no es válido.';
    }
    
    // Validar datos del crédito
    if (!datos.tipoCredito || datos.tipoCredito.trim() === '') {
        errores.tipoCredito = 'Debe seleccionar un tipo de crédito.';
    }
    
    if (!datos.montoSolicitado || !validarMonto(datos.montoSolicitado)) {
        errores.montoSolicitado = 'El monto solicitado debe estar entre $300,000 y $30,000,000 MXN.';
    }
    
    if (!datos.plazo || datos.plazo.trim() === '') {
        errores.plazo = 'Debe seleccionar un plazo.';
    }
    
    if (!datos.destinoCredito || datos.destinoCredito.trim() === '') {
        errores.destinoCredito = 'Debe seleccionar el destino del crédito.';
    }
    
    if (datos.destinoCredito === 'otro' && (!datos.otroDestino || datos.otroDestino.trim() === '')) {
        errores.otroDestino = 'Debe especificar el destino del crédito.';
    }
    
    if (!datos.descripcionProyecto || datos.descripcionProyecto.trim() === '') {
        errores.descripcionProyecto = 'La descripción del proyecto es obligatoria.';
    }
    
    // Validar que la antigüedad sea suficiente para el tipo de crédito
    if (datos.antiguedad && datos.tipoCredito && 
        !validarAntiguedad(datos.antiguedad, datos.tipoCredito)) {
        errores.antiguedad = `Para el tipo de crédito seleccionado, la empresa debe tener al menos ${
            datos.tipoCredito === 'simple' ? '1' : '2'
        } años de antigüedad.`;
    }
    
    return {
        esValido: Object.keys(errores).length === 0,
        errores
    };
};

// Exportar todas las funciones de validación
module.exports = {
    validarRFC,
    validarEmail,
    validarTelefono,
    validarCodigoPostal,
    validarMonto,
    validarAntiguedad,
    validarArchivo,
    validarFormularioSolicitud
};
