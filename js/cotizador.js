// ============================================
// COTIZADOR ESPACIAL ESTUDIO
// Precios actualizados 2026 (Brochure)
// ============================================

// Precios de DISENO por numero de espacios (Brochure 2026)
const PRECIOS_DISENO = {
    1: 2800000,
    2: 5200000,
    3: 7245000,
    4: 8940000,
    5: 9975000,
    6: 10500000,
    7: 12145000,
    8: 13040000,
    9: 13230000,
    10: 13650000
};

// Precios por tipo de espacio para MATERIALIZACION
const PRECIOS_MATERIALIZACION = {
    cocina: {
        estandar: 25000000,
        premium: 40000000,
        lujo: 60000000
    },
    bano: {
        estandar: 12000000,
        premium: 20000000,
        lujo: 35000000
    },
    sala: {
        estandar: 8000000,
        premium: 15000000,
        lujo: 25000000
    },
    comedor: {
        estandar: 6000000,
        premium: 12000000,
        lujo: 20000000
    },
    habitacion_principal: {
        estandar: 10000000,
        premium: 18000000,
        lujo: 30000000
    },
    habitacion_auxiliar: {
        estandar: 6000000,
        premium: 10000000,
        lujo: 18000000
    },
    habitacion_ninos: {
        estandar: 8000000,
        premium: 14000000,
        lujo: 22000000
    },
    estudio: {
        estandar: 7000000,
        premium: 12000000,
        lujo: 20000000
    },
    terraza: {
        estandar: 5000000,
        premium: 10000000,
        lujo: 18000000
    },
    especial: {
        estandar: 10000000,
        premium: 18000000,
        lujo: 30000000
    }
};

// Tipos de espacio disponibles
const TIPOS_ESPACIO = [
    { value: 'cocina', label: 'Cocina' },
    { value: 'bano', label: 'Bano' },
    { value: 'sala', label: 'Sala' },
    { value: 'comedor', label: 'Comedor' },
    { value: 'habitacion_principal', label: 'Habitacion Principal' },
    { value: 'habitacion_auxiliar', label: 'Habitacion Auxiliar' },
    { value: 'habitacion_ninos', label: 'Habitacion Ninos' },
    { value: 'estudio', label: 'Estudio/Oficina' },
    { value: 'terraza', label: 'Terraza/Balcon' },
    { value: 'especial', label: 'Espacio Especial' }
];

// Variacion para rangos (+/- 15%)
const VARIACION = 0.15;

let espacioCounter = 0;

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    agregarEspacio();
});

function agregarEspacio(tipo = '', metros = '') {
    espacioCounter++;
    const container = document.getElementById('espacios-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'espacio-row';
    row.id = `espacio-${espacioCounter}`;

    let optionsHtml = '<option value="">Selecciona el tipo...</option>';
    TIPOS_ESPACIO.forEach(t => {
        const selected = t.value === tipo ? 'selected' : '';
        optionsHtml += `<option value="${t.value}" ${selected}>${t.label}</option>`;
    });

    row.innerHTML = `
        <select name="tipo-espacio" required>
            ${optionsHtml}
        </select>
        <input type="number" name="metros-espacio" placeholder="m2" min="1" max="200" value="${metros}">
        <button type="button" class="btn-remove" onclick="eliminarEspacio(${espacioCounter})">x</button>
    `;

    container.appendChild(row);
}

function eliminarEspacio(id) {
    const row = document.getElementById(`espacio-${id}`);
    if (row) {
        row.remove();
    }

    // Asegurar que siempre haya al menos un espacio
    const container = document.getElementById('espacios-container');
    if (container && container.children.length === 0) {
        agregarEspacio();
    }
}

function formatCOP(num) {
    if (num >= 1000000) {
        const millones = num / 1000000;
        if (millones >= 100) {
            return '$' + millones.toFixed(0) + 'M';
        }
        return '$' + millones.toFixed(1).replace('.0', '') + 'M';
    }
    return '$' + new Intl.NumberFormat('es-CO').format(Math.round(num));
}

function getNombreEspacio(tipo) {
    const espacio = TIPOS_ESPACIO.find(t => t.value === tipo);
    return espacio ? espacio.label : tipo;
}

function calcularCotizacion() {
    // Validar datos de contacto
    const nombre = document.getElementById('lead-nombre').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const celular = document.getElementById('lead-celular').value.trim();

    if (!nombre) {
        alert('Por favor ingresa tu nombre.');
        document.getElementById('lead-nombre').focus();
        return;
    }

    if (!email || !email.includes('@')) {
        alert('Por favor ingresa un correo electronico valido.');
        document.getElementById('lead-email').focus();
        return;
    }

    if (!celular || celular.length < 7) {
        alert('Por favor ingresa tu numero de celular.');
        document.getElementById('lead-celular').focus();
        return;
    }

    // Obtener espacios
    const espaciosRows = document.querySelectorAll('.espacio-row');
    const espacios = [];

    espaciosRows.forEach(row => {
        const select = row.querySelector('select');
        const input = row.querySelector('input[type="number"]');
        if (select && input) {
            const tipo = select.value;
            const metros = parseFloat(input.value) || 0;

            if (tipo) {
                espacios.push({ tipo, metros });
            }
        }
    });

    if (espacios.length === 0) {
        alert('Por favor agrega al menos un espacio.');
        return;
    }

    // Obtener nivel de acabados
    const acabadosInput = document.querySelector('input[name="acabados"]:checked');
    const acabados = acabadosInput ? acabadosInput.value : 'estandar';

    // Calcular costo de MATERIALIZACION por espacio
    let costoMaterializacion = 0;
    const desglose = [];

    espacios.forEach(esp => {
        const precioBase = PRECIOS_MATERIALIZACION[esp.tipo]?.[acabados] || PRECIOS_MATERIALIZACION.especial[acabados];

        // Ajustar por metros si es diferente al promedio (15m2 promedio por espacio)
        const metrosPromedio = 15;
        let ajusteMetros = 1;
        if (esp.metros > 0) {
            ajusteMetros = 0.7 + (esp.metros / metrosPromedio) * 0.3;
            ajusteMetros = Math.max(0.5, Math.min(ajusteMetros, 2));
        }

        const costoEspacio = precioBase * ajusteMetros;
        costoMaterializacion += costoEspacio;

        desglose.push({
            nombre: getNombreEspacio(esp.tipo),
            metros: esp.metros,
            costo: costoEspacio
        });
    });

    // Calcular costo de DISENO (precios brochure 2026)
    const numEspacios = Math.min(espacios.length, 10);
    const costoDiseno = PRECIOS_DISENO[numEspacios] || PRECIOS_DISENO[10];

    // Total
    const costoTotal = costoMaterializacion + costoDiseno;
    const costoMin = Math.round(costoTotal * (1 - VARIACION));
    const costoMax = Math.round(costoTotal * (1 + VARIACION));

    // Actualizar UI
    document.getElementById('valor-min').textContent = formatCOP(costoMin);
    document.getElementById('valor-max').textContent = formatCOP(costoMax);
    document.getElementById('costo-diseno').textContent = formatCOP(costoDiseno);

    // Desglose de espacios
    const desgloseContainer = document.getElementById('desglose-espacios');
    desgloseContainer.innerHTML = '';
    desglose.forEach(item => {
        const metrosText = item.metros > 0 ? ` (${item.metros}m2)` : '';
        desgloseContainer.innerHTML += `
            <div class="breakdown-item">
                <span>${item.nombre}${metrosText}</span>
                <span>${formatCOP(item.costo)}</span>
            </div>
        `;
    });

    // Explicacion
    const acabadosText = acabados === 'estandar' ? 'estandar' : acabados === 'premium' ? 'premium' : 'de lujo';
    document.getElementById('resultado-explicacion').textContent =
        `${espacios.length} espacio${espacios.length > 1 ? 's' : ''} con acabados ${acabadosText}, incluyendo diseno y materializacion.`;

    // Log lead (para futuro webhook)
    console.log('Nuevo Lead Espacial:', {
        nombre, email, celular,
        espacios: desglose,
        acabados,
        estimadoMin: costoMin,
        estimadoMax: costoMax,
        costoDiseno,
        costoMaterializacion,
        fecha: new Date().toISOString()
    });

    // Ocultar formulario, mostrar resultados
    document.getElementById('cotizador-form').style.display = 'none';
    document.getElementById('cotizador-results').style.display = 'block';

    // Scroll suave hacia resultados
    document.getElementById('cotizador-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
