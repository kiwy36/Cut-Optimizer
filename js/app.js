/**
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN
 * Cut Optimizer - Aplicación de optimización de cortes
 * Coordina todos los módulos y maneja la inicialización
 * 
 * 🎯 FUNCIÓN PRINCIPAL: Ser el "director de orquesta" que coordina todos los módulos
 * 📍 UBICACIÓN EN EL FLUJO: Último archivo cargado, depende de todos los demás
 */

// Variables globales de la aplicación
const App = {
    // Configuración inicial
    // ⚙️ ESTO NO ALTERA EL HTML: Son valores por defecto internos
    config: {
        defaultSheetWidth: 2440,    // Ancho por defecto de placa (2440mm = estándar)
        defaultSheetHeight: 1220,   // Alto por defecto de placa (1220mm = estándar)
        maxSheetsToDisplay: 10      // Límite de placas a mostrar (para performance)
    },
    
    // Estado de la aplicación
    // 💾 ESTO NO ALTERA EL HTML DIRECTAMENTE: Es el estado interno en memoria
    state: {
        pieces: [],      // Aquí se guardan las piezas después del procesamiento
        sheets: [],      // Aquí se guardan las placas optimizadas resultantes
        isOptimizing: false  // Bandera para prevenir dobles ejecuciones
    },
    
    /**
     * Inicializa la aplicación
     * 🚀 ESTE MÉTODO SÍ ALTERA EL HTML: Configura la interfaz inicial
     * 📍 SE EJECUTA: Una vez cuando la página carga completamente
     */
    init: function() {
        console.log('🚀 Inicializando Cut Optimizer...');
        
        // Inicializar módulos - NO altera HTML todavía, solo prepara
        PieceManager.init();  // Prepara el gestor de piezas
        Renderer.init();      // Prepara el renderizador (podría inicializar componentes visuales)
        
        // Configurar event listeners - SÍ altera comportamiento HTML
        this.setupEventListeners(); // Conecta botones con funciones
        
        // Agregar primera pieza por defecto - SÍ altera HTML
        PieceManager.addPiece(); // Inserta la primera fila de pieza en el formulario
        
        console.log('✅ Aplicación inicializada correctamente');
    },
    
    /**
     * Configura todos los event listeners de la aplicación
     * 🔗 ESTE MÉTODO SÍ ALTERA COMPORTAMIENTO HTML: Hace que los elementos respondan a eventos
     */
    setupEventListeners: function() {
        // Botón para agregar piezas
        // ✅ ALTERA COMPORTAMIENTO: Hace que el botón "+ Agregar pieza" funcione
        document.getElementById('addPiece').addEventListener('click', () => {
            PieceManager.addPiece(); // Delega la acción al módulo especializado
        });
        
        // Botón de optimización
        // ✅ ALTERA COMPORTAMIENTO: Hace que el botón "Optimizar Cortes" funcione
        document.getElementById('optimizeBtn').addEventListener('click', () => {
            this.handleOptimize(); // Este es el corazón de la aplicación
        });
        
        // Enter en inputs numéricos también dispara optimización
        // ✅ ALTERA COMPORTAMIENTO: Mejora UX permitiendo Enter para optimizar
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.type === 'number') {
                this.handleOptimize(); // Optimiza sin necesidad de hacer clic
            }
        });
    },
    
    /**
     * Maneja el proceso de optimización
     * 🎯 ESTE ES EL MÉTODO MÁS IMPORTANTE: Orquesta todo el proceso
     * ✅ SÍ ALTERA HTML: Cambia completamente el panel de resultados
     */
    handleOptimize: function() {
        console.log('🔄 Iniciando proceso de optimización...');
        
        // Prevenir múltiples optimizaciones simultáneas
        // 🛡️ ESTO NO ALTERA HTML: Es una protección interna
        if (this.state.isOptimizing) {
            console.warn('⚠️ Optimización ya en progreso');
            return; // Sale silenciosamente sin cambiar nada
        }
        
        this.state.isOptimizing = true; // Activa bandera de "trabajando"
        
        try {
            // 🔍 FASE 1: RECOLECCIÓN DE DATOS - Lee valores del HTML
            // ✅ ALTERA COMPORTAMIENTO: Lee inputs del usuario
            const sheetWidth = parseInt(document.getElementById('sheetWidth').value);
            const sheetHeight = parseInt(document.getElementById('sheetHeight').value);
            
            // 🔍 FASE 2: VALIDACIÓN - Verifica que los datos sean correctos
            // ✅ PUEDE ALTERAR HTML: Muestra mensajes de error si hay problemas
            if (!this.validateInputs(sheetWidth, sheetHeight)) {
                return; // Si hay errores, se muestran y se detiene el proceso
            }
            
            // 🔍 FASE 3: OBTENER PIEZAS - Recoge todas las piezas del formulario
            // ✅ INTERACTÚA CON HTML: Lee todas las filas de piezas
            const pieces = PieceManager.getAllPieces();
            
            // Validación adicional: hay piezas para procesar?
            if (pieces.length === 0) {
                Renderer.showError('❌ Agrega al menos una pieza para optimizar');
                return; // Muestra error y detiene proceso
            }
            
            // 🔧 FASE 4: PROCESAMIENTO - Ejecuta el algoritmo de optimización
            // 🧠 ESTO NO ALTERA HTML DIRECTAMENTE: Solo cálculos en memoria
            this.state.sheets = Optimizer.shelfAlgorithm(pieces, sheetWidth, sheetHeight);
            
            // 🎨 FASE 5: VISUALIZACIÓN - Muestra los resultados al usuario
            // ✅ SÍ ALTERA HTML DRAMÁTICAMENTE: Cambia completamente el panel derecho
            Renderer.displayResults(this.state.sheets, sheetWidth, sheetHeight);
            
            console.log(`✅ Optimización completada: ${this.state.sheets.length} placas utilizadas`);
            
        } catch (error) {
            // 🚨 FASE DE ERROR: Si algo sale mal en cualquier paso anterior
            console.error('❌ Error durante la optimización:', error);
            Renderer.showError('Error durante la optimización: ' + error.message);
            // ✅ ALTERA HTML: Muestra mensaje de error en el panel de resultados
        } finally {
            // 🔄 LIMPIEZA: Siempre se ejecuta, éxito o error
            this.state.isOptimizing = false; // Libera la bandera de "trabajando"
        }
    },
    
    /**
     * Valida las entradas del usuario
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     * @returns {boolean} True si las entradas son válidas
     * ✅ PUEDE ALTERAR HTML: Muestra mensajes de error cuando encuentra problemas
     */
    validateInputs: function(sheetWidth, sheetHeight) {
        // Validar tamaño de placa
        // 🚫 Si el ancho no es válido...
        if (isNaN(sheetWidth) || sheetWidth <= 0) {
            Renderer.showError('❌ El ancho de la placa debe ser un número positivo');
            return false; // Detiene el proceso y muestra error
        }
        
        // 🚫 Si el alto no es válido...
        if (isNaN(sheetHeight) || sheetHeight <= 0) {
            Renderer.showError('❌ El alto de la placa debe ser un número positivo');
            return false; // Detiene el proceso y muestra error
        }
        
        // Validar piezas individuales
        const pieces = PieceManager.getAllPieces();
        for (const piece of pieces) {
            // 🚫 Si alguna pieza es más grande que la placa...
            if (piece.width > sheetWidth || piece.height > sheetHeight) {
                Renderer.showError(`❌ La pieza ${piece.width}x${piece.height}mm es más grande que la placa`);
                return false; // Detiene el proceso y muestra error específico
            }
        }
        
        return true; // ✅ Todo está bien, puede continuar
    },
    
    /**
     * Obtiene el estado actual de la aplicación
     * @returns {Object} Estado de la aplicación
     * 🔍 ESTO NO ALTERA HTML: Solo lectura del estado interno
     * 🎯 ÚTIL PARA: Debugging o extensiones futuras
     */
    getState: function() {
        return { ...this.state }; // Devuelve copia para no modificar el original
    },
    
    /**
     * Reinicia la aplicación al estado inicial
     * 🔄 ESTE MÉTODO SÍ ALTERA HTML: Limpia formularios y resultados
     * 🎯 ÚTIL PARA: Botón "Nuevo proyecto" en el futuro
     */
    reset: function() {
        // Limpia el estado interno
        this.state.pieces = [];
        this.state.sheets = [];
        this.state.isOptimizing = false;
        
        // Limpia la interfaz delegando a los módulos especializados
        PieceManager.reset();    // Limpia todas las piezas del formulario
        Renderer.clearResults(); // Limpia el panel de resultados
        
        console.log('🔄 Aplicación reiniciada');
    }
};

// =============================================================================
// INICIALIZACIÓN AUTOMÁTICA - ESTO SÍ EJECUTA CÓDIGO QUE ALTERA EL HTML
// =============================================================================

/**
 * Inicializar la aplicación cuando el DOM esté listo
 * 🚀 ESTO SÍ ALTERA HTML: Ejecuta App.init() que configura toda la interfaz
 * 📍 SE EJECUTA: Automáticamente cuando el navegador termina de cargar la página
 */
document.addEventListener('DOMContentLoaded', function() {
    App.init(); // ¡Aquí es donde realmente comienza la magia!
});

/**
 * Hacer App disponible globalmente para debugging
 * 🔧 ESTO NO ALTERA HTML: Solo hace que App sea accesible desde la consola
 * 🎯 ÚTIL PARA: Desarrolladores que quieren probar cosas en la consola
 * Ejemplo: En consola escribir "App.getState()" para ver el estado actual
 */
window.App = App;