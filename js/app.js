/**
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN
 * Cut Optimizer - Aplicación de optimización de cortes
 * Coordina todos los módulos y maneja la inicialización
 */

// Variables globales de la aplicación
const App = {
    // Configuración inicial
    config: {
        defaultSheetWidth: 2440,
        defaultSheetHeight: 1220,
        maxSheetsToDisplay: 10
    },
    
    // Estado de la aplicación
    state: {
        pieces: [],
        sheets: [],
        isOptimizing: false
    },
    
    /**
     * Inicializa la aplicación
     */
    init: function() {
        console.log('🚀 Inicializando Cut Optimizer...');
        
        // Inicializar módulos
        PieceManager.init();
        Renderer.init();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Agregar primera pieza por defecto
        PieceManager.addPiece();
        
        console.log('✅ Aplicación inicializada correctamente');
    },
    
    /**
     * Configura todos los event listeners de la aplicación
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
    
    /**
     * Maneja el proceso de optimización
     */
    handleOptimize: function() {
        console.log('🔄 Iniciando proceso de optimización...');
        
        // Prevenir múltiples optimizaciones simultáneas
        if (this.state.isOptimizing) {
            console.warn('⚠️ Optimización ya en progreso');
            return;
        }
        
        this.state.isOptimizing = true;
        
        try {
            // Obtener configuración de la placa
            const sheetWidth = parseInt(document.getElementById('sheetWidth').value);
            const sheetHeight = parseInt(document.getElementById('sheetHeight').value);
            
            // Validar entradas
            if (!this.validateInputs(sheetWidth, sheetHeight)) {
                return;
            }
            
            // Obtener piezas del manager
            const pieces = PieceManager.getAllPieces();
            
            if (pieces.length === 0) {
                Renderer.showError('❌ Agrega al menos una pieza para optimizar');
                return;
            }
            
            // Ejecutar algoritmo de optimización
            this.state.sheets = Optimizer.shelfAlgorithm(pieces, sheetWidth, sheetHeight);
            
            // Renderizar resultados
            Renderer.displayResults(this.state.sheets, sheetWidth, sheetHeight);
            
            console.log(`✅ Optimización completada: ${this.state.sheets.length} placas utilizadas`);
            
        } catch (error) {
            console.error('❌ Error durante la optimización:', error);
            Renderer.showError('Error durante la optimización: ' + error.message);
        } finally {
            this.state.isOptimizing = false;
        }
    },
    
    /**
     * Valida las entradas del usuario
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     * @returns {boolean} True si las entradas son válidas
     */
    validateInputs: function(sheetWidth, sheetHeight) {
        // Validar tamaño de placa
        if (isNaN(sheetWidth) || sheetWidth <= 0) {
            Renderer.showError('❌ El ancho de la placa debe ser un número positivo');
            return false;
        }
        
        if (isNaN(sheetHeight) || sheetHeight <= 0) {
            Renderer.showError('❌ El alto de la placa debe ser un número positivo');
            return false;
        }
        
        // Validar piezas individuales
        const pieces = PieceManager.getAllPieces();
        for (const piece of pieces) {
            if (piece.width > sheetWidth || piece.height > sheetHeight) {
                Renderer.showError(`❌ La pieza ${piece.width}x${piece.height}mm es más grande que la placa`);
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Obtiene el estado actual de la aplicación
     * @returns {Object} Estado de la aplicación
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
        
        PieceManager.reset();
        Renderer.clearResults();
        
        console.log('🔄 Aplicación reiniciada');
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

// Hacer App disponible globalmente para debugging
window.App = App;