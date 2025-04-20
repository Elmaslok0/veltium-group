/**
 * Script para validación de formularios en el cliente
 * Este archivo se incluirá en las páginas que contengan formularios
 */

document.addEventListener('DOMContentLoaded', function() {
    // Validación del formulario de solicitud
    const solicitudForm = document.getElementById('solicitudForm');
    if (solicitudForm) {
        solicitudForm.addEventListener('submit', function(e) {
            // Prevenir envío por defecto
            e.preventDefault();
            
            // Limpiar mensajes de error previos
            clearErrorMessages();
            
            // Validar campos
            const isValid = validateSolicitudForm();
            
            if (isValid) {
                // Si es válido, mostrar sección de documentos
                const documentosSection = document.getElementById('documentosSection');
                if (documentosSection) {
                    window.scrollTo(0, 0);
                    documentosSection.style.display = 'block';
                }
            }
        });
    }
    
    // Validación del formulario de documentos
    const documentosForm = document.getElementById('documentosForm');
    if (documentosForm) {
        documentosForm.addEventListener('submit', function(e) {
            // Prevenir envío por defecto
            e.preventDefault();
            
            // Limpiar mensajes de error previos
            clearErrorMessages();
            
            // Validar archivos
            const isValid = validateDocumentosForm();
            
            if (isValid) {
                // Si es válido, mostrar confirmación
                const confirmacionSection = document.getElementById('confirmacionSection');
                if (confirmacionSection) {
                    window.scrollTo(0, 0);
                    documentosSection.style.display = 'none';
                    confirmacionSection.style.display = 'block';
                    
                    // En un entorno real, aquí se enviarían los datos al servidor
                    // mediante una petición AJAX o similar
                }
            }
        });
    }
    
    // Mostrar/ocultar campo "Otro destino del crédito"
    const destinoCredito = document.getElementById('destinoCredito');
    const otroDestinoRow = document.getElementById('otroDestinoRow');
    const otroDestino = document.getElementById('otroDestino');
    
    if (destinoCredito && otroDestinoRow && otroDestino) {
        destinoCredito.addEventListener('change', function() {
            if (this.value === 'otro') {
                otroDestinoRow.style.display = 'block';
                otroDestino.required = true;
            } else {
                otroDestinoRow.style.display = 'none';
                otroDestino.required = false;
            }
        });
    }
    
    // Actualizar etiquetas de archivos seleccionados
    const fileInputs = document.querySelectorAll('.file-upload-input');
    
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            const label = document.getElementById(this.id + 'Label');
            if (this.files.length > 0) {
                label.textContent = this.files[0].name;
                
                // Validar el archivo seleccionado
                validateFile(this);
            } else {
                label.textContent = 'Seleccionar archivo';
            }
        });
    });
});

// Función para validar el formulario de solicitud
function validateSolicitudForm() {
    let isValid = true;
    
    // Validar datos de la empresa
    isValid = validateField('razonSocial', 'La razón social es obligatoria') && isValid;
    isValid = validateRFC('rfc', 'El RFC no es válido') && isValid;
    isValid = validateField('giro', 'El giro de la empresa es obligatorio') && isValid;
    isValid = validateNumber('antiguedad', 'La antigüedad debe ser al menos de 1 año', 1) && isValid;
    isValid = validateField('direccion', 'La dirección fiscal es obligatoria') && isValid;
    isValid = validateCP('codigoPostal', 'El código postal no es válido') && isValid;
    isValid = validateField('ciudad', 'La ciudad es obligatoria') && isValid;
    isValid = validateField('estado', 'El estado es obligatorio') && isValid;
    isValid = validatePhone('telefono', 'El teléfono no es válido') && isValid;
    isValid = validateEmail('email', 'El correo electrónico no es válido') && isValid;
    
    // Validar datos del representante legal
    isValid = validateField('nombreRepresentante', 'El nombre del representante legal es obligatorio') && isValid;
    isValid = validateRFC('rfcRepresentante', 'El RFC del representante legal no es válido') && isValid;
    isValid = validatePhone('telefonoRepresentante', 'El teléfono del representante legal no es válido') && isValid;
    isValid = validateEmail('emailRepresentante', 'El correo electrónico del representante legal no es válido') && isValid;
    
    // Validar datos del crédito
    isValid = validateField('tipoCredito', 'Debe seleccionar un tipo de crédito') && isValid;
    isValid = validateMontoCredito('montoSolicitado', 'El monto solicitado debe estar entre $300,000 y $30,000,000 MXN') && isValid;
    isValid = validateField('plazo', 'Debe seleccionar un plazo') && isValid;
    isValid = validateField('destinoCredito', 'Debe seleccionar el destino del crédito') && isValid;
    
    // Validar campo "Otro destino" si es necesario
    const destinoCredito = document.getElementById('destinoCredito');
    if (destinoCredito && destinoCredito.value === 'otro') {
        isValid = validateField('otroDestino', 'Debe especificar el destino del crédito') && isValid;
    }
    
    isValid = validateField('descripcionProyecto', 'La descripción del proyecto es obligatoria') && isValid;
    
    // Validar que la antigüedad sea suficiente para el tipo de crédito
    const antiguedad = document.getElementById('antiguedad');
    const tipoCredito = document.getElementById('tipoCredito');
    
    if (antiguedad && tipoCredito && antiguedad.value && tipoCredito.value) {
        const antiguedadNum = parseInt(antiguedad.value);
        let minAntiguedad = 1;
        
        if (tipoCredito.value === 'pymes' || tipoCredito.value === 'activos') {
            minAntiguedad = 2;
        }
        
        if (antiguedadNum < minAntiguedad) {
            showError(antiguedad, `Para el tipo de crédito seleccionado, la empresa debe tener al menos ${minAntiguedad} años de antigüedad`);
            isValid = false;
        }
    }
    
    return isValid;
}

// Función para validar el formulario de documentos
function validateDocumentosForm() {
    let isValid = true;
    
    // Validar documentos requeridos
    const requiredDocs = [
        'ine', 'actaConstitutiva', 'situacionFiscal', 'comprobanteDomicilio',
        'estadoCuenta1', 'estadoCuenta2', 'estadoCuenta3', 'estadoCuenta4', 'estadoCuenta5', 'estadoCuenta6'
    ];
    
    requiredDocs.forEach(function(docId) {
        const docInput = document.getElementById(docId);
        if (docInput && (!docInput.files || docInput.files.length === 0)) {
            showError(docInput, 'Este documento es obligatorio');
            isValid = false;
        }
    });
    
    // Validar términos y condiciones
    const terminosCheck = document.getElementById('terminosCondiciones');
    if (terminosCheck && !terminosCheck.checked) {
        showError(terminosCheck, 'Debe aceptar los términos y condiciones');
        isValid = false;
    }
    
    return isValid;
}

// Función para validar un archivo
function validateFile(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
        showError(fileInput, 'Debe seleccionar un archivo');
        return false;
    }
    
    const file = fileInput.files[0];
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Validar tamaño
    if (file.size > maxSizeBytes) {
        showError(fileInput, `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`);
        return false;
    }
    
    // Validar tipo
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
        showError(fileInput, 'Formato de archivo no válido. Solo se permiten archivos PDF, JPG o PNG');
        return false;
    }
    
    return true;
}

// Funciones auxiliares de validación

function validateField(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field || !field.value.trim()) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validateEmail(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!pattern.test(field.value)) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validatePhone(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const tel = field.value.replace(/[\s\-\(\)]/g, '');
    const pattern = /^(\+?52)?\d{10}$/;
    
    if (!pattern.test(tel)) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validateRFC(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const pattern = /^([A-ZÑ&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/;
    
    if (!pattern.test(field.value)) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validateCP(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const pattern = /^\d{5}$/;
    
    if (!pattern.test(field.value)) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validateNumber(id, errorMsg, min = null, max = null) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const value = parseInt(field.value);
    
    if (isNaN(value) || (min !== null && value < min) || (max !== null && value > max)) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

function validateMontoCredito(id, errorMsg) {
    const field = document.getElementById(id);
    if (!field) return false;
    
    const value = parseFloat(field.value);
    
    if (isNaN(value) || value < 300000 || value > 30000000) {
        showError(field, errorMsg);
        return false;
    }
    return true;
}

// Función para mostrar mensaje de error
function showError(field, message) {
    if (!field) return;
    
    // Crear elemento de error si no existe
    let errorElement = field.parentNode.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.classList.add('is-invalid');
    field.style.borderColor = '#dc3545';
}

// Función para limpiar mensajes de error
function clearErrorMessages() {
    // Eliminar todos los mensajes de error
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(function(element) {
        element.remove();
    });
    
    // Eliminar clases de error de los campos
    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(function(field) {
        field.classList.remove('is-invalid');
        field.style.borderColor = '';
    });
}
