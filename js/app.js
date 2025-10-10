/**
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN - VERSIÓN MEJORADA
 * Cut Optimizer - Aplicación de optimización de cortes
 * Coordina todos los módulos y maneja la inicialización
 * 
 * 🎯 FUNCIÓN PRINCIPAL: Ser el "director de orquesta" que coordina todos los módulos
 * 📍 UBICACIÓN EN EL FLUJO: Último archivo cargado, depende de todos los demás
 */

// =============================================================================
// CONFIGURACIÓN Y ESTADO
// =============================================================================

// Variables globales de la aplicación
const App = {
    // Configuración inicial MEJORADA
    // ⚙️ ESTO NO ALTERA EL HTML: Son valores por defecto internos
    config: {
        defaultSheetWidth: 2440,    // Ancho por defecto de placa (2440mm = estándar)
        defaultSheetHeight: 1220,   // Alto por defecto de placa (1220mm = estándar)
        maxSheetsToDisplay: 10,     // Límite de placas a mostrar (para performance)
        allowRotation: true         // ✅ NUEVO: Permitir rotación de piezas
    },
    
    // Estado de la aplicación MEJORADO
    // 💾 ESTO NO ALTERA EL HTML DIRECTAMENTE: Es el estado interno en memoria
    state: {
        pieces: [],                 // Piezas procesadas
        sheets: [],                 // Placas resultantes
        isOptimizing: false,        // Previene dobles ejecuciones
        problematicPieces: []       // ✅ NUEVO: Piezas que no pudieron colocarse
    },
    
    // =============================================================================
    // INICIALIZACIÓN
    // =============================================================================
    
    /**
     * Inicializa la aplicación
     * 🚀 ESTE MÉTODO SÍ ALTERA EL HTML: Configura la interfaz inicial
     * 📍 SE EJECUTA: Una vez cuando la página carga completamente
     */
    init: function() {
        console.log('🚀 Inicializando Cut Optimizer...');
        
        // Inicializar módulos - NO altera HTML todavía
        PieceManager.init();
        Renderer.init();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Agregar primera pieza por defecto - SÍ altera HTML
        PieceManager.addPiece();
        
        console.log('✅ Aplicación inicializada correctamente');
    },
    
    /**
     * Configura todos los event listeners de la aplicación
     * 🔗 ESTE MÉTODO SÍ ALTERA COMPORTAMIENTO HTML
     */
    setupEventListeners: function() {
        // Botón para agregar piezas
        document.getElementById('addPiece').addEventListener('click', () => {
            PieceManager.addPiece();
        });
        
        // Botón de optimización
        document.getElementById('optimizeBtn').addEventListener('click', () => {
            this.handleOptimize();
        });
        
        // Enter en inputs numéricos también dispara optimización
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.type === 'number') {
                this.handleOptimize();
            }
        });
    },
    
    // =============================================================================
    // PROCESO PRINCIPAL DE OPTIMIZACIÓN
    // =============================================================================
    
    /**
     * Maneja el proceso de optimización - VERSIÓN MEJORADA
     * 🎯 ESTE ES EL MÉTODO MÁS IMPORTANTE: Orquesta todo el proceso
     */
    handleOptimize: function() {
        console.log('🔄 Iniciando proceso de optimización...');
        
        // Prevenir múltiples optimizaciones simultáneas
        if (this.state.isOptimizing) {
            console.warn('⚠️ Optimización ya en progreso');
            return;
        }
        
        this.state.isOptimizing = true;
        this.state.problematicPieces = []; // ✅ NUEVO: Resetear piezas problemáticas
        
        try {
            // 🔍 FASE 1: RECOLECCIÓN DE DATOS
            const sheetWidth = parseInt(document.getElementById('sheetWidth').value);
            const sheetHeight = parseInt(document.getElementById('sheetHeight').value);
            
            // 🔍 FASE 2: VALIDACIÓN
            if (!this.validateInputs(sheetWidth, sheetHeight)) {
                return;
            }
            
            // 🔍 FASE 3: OBTENER PIEZAS
            let pieces = PieceManager.getAllPieces();
            
            if (pieces.length === 0) {
                Renderer.showError('❌ Agrega al menos una pieza para optimizar');
                return;
            }
            
            // ✅ NUEVO: Filtrar piezas que no caben NI ROTADAS
            const filteredPieces = this.filterPiecesThatDontFit(pieces, sheetWidth, sheetHeight);
            
            if (filteredPieces.removedPieces.length > 0) {
                pieces = filteredPieces.validPieces;
                this.state.problematicPieces = filteredPieces.removedPieces;
                this.showRemovedPiecesWarning(filteredPieces.removedPieces);
            }
            
            // 🔧 FASE 4: PROCESAMIENTO - Ejecuta el algoritmo
            const optimizationResult = Optimizer.shelfAlgorithm(
                pieces, 
                sheetWidth, 
                sheetHeight, 
                this.config.allowRotation
            );
            
            this.state.sheets = optimizationResult.sheets;
            
            // ✅ NUEVO: Agregar piezas que no cupieron en ninguna placa
            if (optimizationResult.unplacedPieces && optimizationResult.unplacedPieces.length > 0) {
                this.state.problematicPieces = [
                    ...this.state.problematicPieces,
                    ...optimizationResult.unplacedPieces
                ];
            }
            
            // 🎨 FASE 5: VISUALIZACIÓN
            Renderer.displayResults(
                this.state.sheets, 
                sheetWidth, 
                sheetHeight, 
                this.state.problematicPieces
            );
            
            console.log(`✅ Optimización completada: ${this.state.sheets.length} placas utilizadas`);
            if (this.state.problematicPieces.length > 0) {
                console.warn(`⚠️ ${this.state.problematicPieces.length} piezas no pudieron colocarse`);
            }
            
        } catch (error) {
            console.error('❌ Error durante la optimización:', error);
            Renderer.showError('Error durante la optimización: ' + error.message);
        } finally {
            this.state.isOptimizing = false;
        }
    },
    
    // =============================================================================
    // MÉTODOS NUEVOS Y AUXILIARES
    // =============================================================================
    
    /**
     * ✅ NUEVO: Filtra piezas que no caben ni rotadas
     */
    filterPiecesThatDontFit: function(pieces, sheetWidth, sheetHeight) {
        const validPieces = [];
        const removedPieces = [];
        
        for (const piece of pieces) {
            const fitsNormal = piece.width <= sheetWidth && piece.height <= sheetHeight;
            const fitsRotated = piece.height <= sheetWidth && piece.width <= sheetHeight;
            
            if (fitsNormal || fitsRotated) {
                validPieces.push(piece);
            } else {
                removedPieces.push({
                    ...piece,
                    reason: `No cabe en la placa ni rotada (${piece.width}x${piece.height}mm vs placa ${sheetWidth}x${sheetHeight}mm)`
                });
            }
        }
        
        return { validPieces, removedPieces };
    },
    
    /**
     * ✅ NUEVO: Muestra advertencia sobre piezas removidas
     */
    showRemovedPiecesWarning: function(removedPieces) {
        let warningMessage = `⚠️ Se removieron ${removedPieces.length} piezas que no caben en la placa:\n`;
        
        removedPieces.forEach((piece, index) => {
            warningMessage += `\n${index + 1}. Pieza ${piece.width}x${piece.height}mm - ${piece.reason}`;
        });
        
        warningMessage += "\n\nSe optimizarán las piezas restantes.";
        
        alert(warningMessage); // 🚨 En el futuro puede reemplazarse por modal
    },
    
    // =============================================================================
    // VALIDACIÓN Y UTILIDADES
    // =============================================================================
    
    /**
     * Valida las entradas del usuario - VERSIÓN MEJORADA
     */
    validateInputs: function(sheetWidth, sheetHeight) {
        if (isNaN(sheetWidth) || sheetWidth <= 0) {
            Renderer.showError('❌ El ancho de la placa debe ser un número positivo');
            return false;
        }
        
        if (isNaN(sheetHeight) || sheetHeight <= 0) {
            Renderer.showError('❌ El alto de la placa debe ser un número positivo');
            return false;
        }
        
        // ✅ Validar rango de tamaño razonable
        if (sheetWidth < 100 || sheetHeight < 100) {
            Renderer.showError('❌ El tamaño mínimo de placa es 100x100mm');
            return false;
        }
        
        if (sheetWidth > 10000 || sheetHeight > 10000) {
            Renderer.showError('❌ El tamaño máximo de placa es 10000x10000mm');
            return false;
        }
        
        return true;
    },
    
    /**
     * Obtiene el estado actual de la aplicación
     */
    getState: function() {
        return { ...this.state };
    },
    
    /**
     * Reinicia la aplicación al estado inicial
     */
    reset: function() {
        this.state.pieces = [];
        this.state.sheets = [];
        this.state.isOptimizing = false;
        this.state.problematicPieces = [];
        
        PieceManager.reset();
        Renderer.clearResults();
        
        console.log('🔄 Aplicación reiniciada');
    }
};

// =============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    App.init(); // 🚀 Aquí empieza la magia
});

window.App = App; // 🔧 Disponible globalmente para debugging
