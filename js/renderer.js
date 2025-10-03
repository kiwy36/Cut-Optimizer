/**
 * RENDERIZADOR DE RESULTADOS
 * Maneja la visualización de resultados y la interfaz de usuario
 */

const Renderer = {
    // Configuración de visualización
    config: {
        maxSheetsToDisplay: 10,
        sheetVisualizationScale: 500 // Ancho máximo en píxeles para visualización
    },
    
    /**
     * Inicializa el renderizador
     */
    init: function() {
        console.log('🎨 Inicializando Renderer...');
        // Inicialización futura de componentes visuales
    },
    
    /**
     * Muestra los resultados de la optimización
     * @param {Array} sheets - Lista de placas optimizadas
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     */
    displayResults: function(sheets, sheetWidth, sheetHeight) {
        console.log('📊 Renderizando resultados...');
        
        this.clearResults();
        
        if (!sheets || sheets.length === 0) {
            this.showNoResults();
            return;
        }
        
        // Calcular y mostrar estadísticas
        this.displayStatistics(sheets, sheetWidth, sheetHeight);
        
        // Mostrar visualización de placas
        this.displaySheets(sheets, sheetWidth, sheetHeight);
    },
    
    /**
     * Muestra las estadísticas de la optimización
     * @param {Array} sheets - Lista de placas optimizadas
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     */
    displayStatistics: function(sheets, sheetWidth, sheetHeight) {
        const resultsContainer = document.getElementById('resultsContainer');
        const stats = Optimizer.calculateStats(sheets);
        
        const efficiencyClass = this.getEfficiencyClass(stats.efficiency);
        
        resultsContainer.innerHTML = `
            <div class="results-summary">
                <h3>Resumen de optimización</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span>Placas utilizadas:</span>
                        <span class="stat-value">${stats.totalSheets}</span>
                    </div>
                    <div class="stat-item">
                        <span>Área total:</span>
                        <span class="stat-value">${stats.totalArea.toLocaleString()} mm²</span>
                    </div>
                    <div class="stat-item">
                        <span>Área utilizada:</span>
                        <span class="stat-value">${stats.usedArea.toLocaleString()} mm²</span>
                    </div>
                    <div class="stat-item">
                        <span>Desperdicio:</span>
                        <span class="stat-value">${stats.wasteArea.toLocaleString()} mm²</span>
                    </div>
                    <div class="stat-item">
                        <span>Eficiencia:</span>
                        <span class="stat-value ${efficiencyClass}">${stats.efficiency.toFixed(2)}%</span>
                    </div>
                    <div class="stat-item">
                        <span>Total piezas:</span>
                        <span class="stat-value">${sheets.reduce((sum, sheet) => sum + sheet.pieces.length, 0)}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Determina la clase CSS para la eficiencia
     * @param {number} efficiency - Porcentaje de eficiencia
     * @returns {string} Clase CSS
     */
    getEfficiencyClass: function(efficiency) {
        if (efficiency >= 85) return 'efficiency-high';
        if (efficiency >= 70) return 'efficiency-medium';
        return 'efficiency-low';
    },
    
    /**
     * Muestra la visualización de las placas optimizadas
     * @param {Array} sheets - Lista de placas optimizadas
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     */
    displaySheets: function(sheets, sheetWidth, sheetHeight) {
        const sheetsContainer = document.getElementById('sheetsContainer');
        
        // Limitar el número de placas a mostrar para rendimiento
        const sheetsToDisplay = sheets.slice(0, this.config.maxSheetsToDisplay);
        
        sheetsToDisplay.forEach((sheet, index) => {
            const sheetElement = this.createSheetElement(sheet, index, sheetWidth, sheetHeight);
            sheetsContainer.appendChild(sheetElement);
        });
        
        // Mostrar advertencia si hay más placas no mostradas
        if (sheets.length > this.config.maxSheetsToDisplay) {
            const warningElement = document.createElement('div');
            warningElement.className = 'text-center text-yellow-600 mt-4';
            warningElement.textContent = `... y ${sheets.length - this.config.maxSheetsToDisplay} placas más`;
            sheetsContainer.appendChild(warningElement);
        }
        
        console.log(`📋 Mostrando ${sheetsToDisplay.length} de ${sheets.length} placas`);
    },
    
    /**
     * Crea el elemento HTML para una placa
     * @param {Object} sheet - Datos de la placa
     * @param {number} index - Índice de la placa
     * @param {number} sheetWidth - Ancho real de la placa
     * @param {number} sheetHeight - Alto real de la placa
     * @returns {HTMLElement} Elemento de la placa
     */
    createSheetElement: function(sheet, index, sheetWidth, sheetHeight) {
        const sheetDiv = document.createElement('div');
        sheetDiv.className = 'sheet-card';
        
        const scale = this.config.sheetVisualizationScale / sheetWidth;
        const displayHeight = sheetHeight * scale;
        
        sheetDiv.innerHTML = `
            <div class="sheet-title">
                Placa ${index + 1} - Eficiencia: ${sheet.efficiency.toFixed(1)}%
            </div>
            <div class="sheet-visualization sheet" 
                 style="width: ${this.config.sheetVisualizationScale}px; height: ${displayHeight}px;">
                <!-- Las piezas se agregarán aquí dinámicamente -->
            </div>
        `;
        
        // Agregar piezas a la visualización
        this.addPiecesToSheet(sheetDiv.querySelector('.sheet-visualization'), sheet, scale);
        
        return sheetDiv;
    },
    
    /**
     * Agrega las piezas a la visualización de una placa
     * @param {HTMLElement} sheetElement - Elemento de la placa
     * @param {Object} sheet - Datos de la placa
     * @param {number} scale - Escala de visualización
     */
    addPiecesToSheet: function(sheetElement, sheet, scale) {
        sheet.pieces.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece';
            
            // Calcular dimensiones y posición escaladas
            const scaledWidth = piece.width * scale;
            const scaledHeight = piece.height * scale;
            const scaledX = piece.x * scale;
            const scaledY = piece.y * scale;
            
            pieceElement.style.width = `${scaledWidth}px`;
            pieceElement.style.height = `${scaledHeight}px`;
            pieceElement.style.left = `${scaledX}px`;
            pieceElement.style.top = `${scaledY}px`;
            pieceElement.style.backgroundColor = piece.color;
            
            // Tooltip con información de la pieza
            pieceElement.title = `${piece.width} × ${piece.height} mm`;
            
            // Etiqueta dentro de la pieza (si es suficientemente grande)
            if (scaledWidth > 40 && scaledHeight > 20) {
                pieceElement.innerHTML = `
                    <div style="font-size: ${Math.max(8, scaledWidth * 0.05)}px; 
                               color: ${this.getContrastColor(piece.color)};
                               text-align: center;">
                        ${piece.width}×${piece.height}
                    </div>
                `;
            }
            
            sheetElement.appendChild(pieceElement);
        });
    },
    
    /**
     * Calcula el color de contraste para texto sobre un fondo
     * @param {string} hexColor - Color de fondo en hexadecimal
     * @returns {string} 'black' o 'white'
     */
    getContrastColor: function(hexColor) {
        // Convertir hex a RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calcular luminosidad
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? 'black' : 'white';
    },
    
    /**
     * Limpia los resultados anteriores
     */
    clearResults: function() {
        document.getElementById('resultsContainer').innerHTML = '';
        document.getElementById('sheetsContainer').innerHTML = '';
    },
    
    /**
     * Muestra mensaje cuando no hay resultados
     */
    showNoResults: function() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No se encontraron resultados para mostrar.</p>
                <p>Verifica que las piezas sean más pequeñas que la placa.</p>
            </div>
        `;
    },
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError: function(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-700 font-semibold">${message}</div>
            </div>
        `;
        
        // Limpiar después de 5 segundos
        setTimeout(() => {
            if (resultsContainer.innerHTML.includes('text-red-700')) {
                this.clearResults();
            }
        }, 5000);
    },
    
    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess: function(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        const originalContent = resultsContainer.innerHTML;
        
        resultsContainer.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div class="text-green-700 font-semibold">${message}</div>
            </div>
            ${originalContent}
        `;
        
        // Remover después de 3 segundos
        setTimeout(() => {
            const alert = resultsContainer.querySelector('.bg-green-50');
            if (alert) {
                alert.remove();
            }
        }, 3000);
    },
    
    /**
     * Configura las opciones de visualización
     * @param {Object} options - Opciones de configuración
     */
    setConfig: function(options) {
        this.config = { ...this.config, ...options };
        console.log('🎨 Configuración del renderizador actualizada:', this.config);
    }
};