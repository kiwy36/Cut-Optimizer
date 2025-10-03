/**
 * ALGORITMO DE OPTIMIZACIÓN
 * Contiene los algoritmos para organizar piezas en placas
 */

const Optimizer = {
    // Configuración del algoritmo
    config: {
        allowRotation: false,
        sortingMethod: 'area-desc', // 'area-desc', 'width-desc', 'height-desc'
        algorithm: 'shelf' // 'shelf', 'guillotine'
    },
    
    /**
     * Algoritmo principal de optimización (Shelf Algorithm)
     * Organiza piezas en filas (estantes) dentro de las placas
     * @param {Array} pieces - Lista de piezas a organizar
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     * @returns {Array} Lista de placas con piezas organizadas
     */
    shelfAlgorithm: function(pieces, sheetWidth, sheetHeight) {
        console.log(`🔧 Ejecutando Shelf Algorithm para ${pieces.length} piezas...`);
        
        // Crear copia de las piezas para no modificar el original
        let piecesToPlace = pieces.map(piece => ({ ...piece }));
        
        // Ordenar piezas según el método configurado
        piecesToPlace = this.sortPieces(piecesToPlace);
        
        const sheets = [];
        let currentSheet = this.createNewSheet(sheetWidth, sheetHeight);
        
        let currentY = 0;      // Posición Y actual en la placa
        let currentX = 0;      // Posición X actual en la fila actual
        let currentRowHeight = 0; // Alto de la fila actual
        
        for (const piece of piecesToPlace) {
            let placed = false;
            
            // Intentar colocar la pieza en la posición actual
            if (this.canPlacePiece(piece, currentX, currentY, currentRowHeight, sheetWidth, sheetHeight)) {
                this.placePiece(currentSheet, piece, currentX, currentY);
                currentX += piece.width;
                currentRowHeight = Math.max(currentRowHeight, piece.height);
                placed = true;
            }
            
            // Si no cabe en la posición actual, intentar nueva fila
            if (!placed) {
                currentY += currentRowHeight;
                currentX = 0;
                currentRowHeight = 0;
                
                // Verificar si cabe en la nueva fila
                if (this.canPlacePiece(piece, currentX, currentY, currentRowHeight, sheetWidth, sheetHeight)) {
                    this.placePiece(currentSheet, piece, currentX, currentY);
                    currentX += piece.width;
                    currentRowHeight = Math.max(currentRowHeight, piece.height);
                    placed = true;
                }
            }
            
            // Si no cabe en la placa actual, usar nueva placa
            if (!placed) {
                sheets.push(currentSheet);
                currentSheet = this.createNewSheet(sheetWidth, sheetHeight);
                currentY = 0;
                currentX = 0;
                currentRowHeight = 0;
                
                // Colocar pieza en la nueva placa
                this.placePiece(currentSheet, piece, currentX, currentY);
                currentX += piece.width;
                currentRowHeight = Math.max(currentRowHeight, piece.height);
            }
        }
        
        // Agregar la última placa si tiene piezas
        if (currentSheet.pieces.length > 0) {
            sheets.push(currentSheet);
        }
        
        console.log(`✅ Algoritmo completado: ${sheets.length} placas utilizadas`);
        return sheets;
    },
    
    /**
     * Ordena las piezas según el método configurado
     * @param {Array} pieces - Lista de piezas a ordenar
     * @returns {Array} Piezas ordenadas
     */
    sortPieces: function(pieces) {
        const method = this.config.sortingMethod;
        
        switch (method) {
            case 'area-desc':
                return pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
                
            case 'width-desc':
                return pieces.sort((a, b) => b.width - a.width);
                
            case 'height-desc':
                return pieces.sort((a, b) => b.height - a.height);
                
            default:
                return pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
        }
    },
    
    /**
     * Crea una nueva placa vacía
     * @param {number} width - Ancho de la placa
     * @param {number} height - Alto de la placa
     * @returns {Object} Objeto de placa
     */
    createNewSheet: function(width, height) {
        return {
            pieces: [],
            usedArea: 0,
            width: width,
            height: height,
            efficiency: 0
        };
    },
    
    /**
     * Verifica si una pieza puede colocarse en una posición específica
     * @param {Object} piece - Pieza a colocar
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} rowHeight - Alto de la fila actual
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     * @returns {boolean} True si la pieza puede colocarse
     */
    canPlacePiece: function(piece, x, y, rowHeight, sheetWidth, sheetHeight) {
        // Verificar límites de la placa
        if (x + piece.width > sheetWidth) {
            return false;
        }
        
        if (y + piece.height > sheetHeight) {
            return false;
        }
        
        // Para el algoritmo shelf, solo verificamos el espacio vertical disponible
        // Las colisiones horizontales se manejan con el currentX
        return true;
    },
    
    /**
     * Coloca una pieza en una placa
     * @param {Object} sheet - Placa donde colocar la pieza
     * @param {Object} piece - Pieza a colocar
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    placePiece: function(sheet, piece, x, y) {
        const placedPiece = {
            ...piece,
            x: x,
            y: y
        };
        
        sheet.pieces.push(placedPiece);
        sheet.usedArea += piece.width * piece.height;
        
        // Calcular eficiencia actualizada
        sheet.efficiency = (sheet.usedArea / (sheet.width * sheet.height)) * 100;
    },
    
    /**
     * Algoritmo Guillotine (implementación básica)
     * Divide el espacio disponible después de cada colocación
     * @param {Array} pieces - Lista de piezas a organizar
     * @param {number} sheetWidth - Ancho de la placa
     * @param {number} sheetHeight - Alto de la placa
     * @returns {Array} Lista de placas con piezas organizadas
     */
    guillotineAlgorithm: function(pieces, sheetWidth, sheetHeight) {
        console.log(`🔧 Ejecutando Guillotine Algorithm para ${pieces.length} piezas...`);
        
        // Esta es una implementación simplificada
        // Una implementación completa sería más compleja
        
        const sheets = [];
        let piecesToPlace = this.sortPieces([...pieces]);
        
        while (piecesToPlace.length > 0) {
            const sheet = this.createNewSheet(sheetWidth, sheetHeight);
            const freeRects = [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }];
            
            for (let i = 0; i < piecesToPlace.length; i++) {
                const piece = piecesToPlace[i];
                let bestRectIndex = -1;
                
                // Buscar el mejor rectángulo libre para esta pieza
                for (let j = 0; j < freeRects.length; j++) {
                    const rect = freeRects[j];
                    
                    if (piece.width <= rect.width && piece.height <= rect.height) {
                        bestRectIndex = j;
                        break;
                    }
                }
                
                if (bestRectIndex !== -1) {
                    const rect = freeRects[bestRectIndex];
                    
                    // Colocar pieza
                    this.placePiece(sheet, piece, rect.x, rect.y);
                    
                    // Dividir el rectángulo libre (estrategia simple)
                    freeRects.splice(bestRectIndex, 1);
                    
                    // Agregar nuevos rectángulos libres
                    if (rect.width > piece.width) {
                        freeRects.push({
                            x: rect.x + piece.width,
                            y: rect.y,
                            width: rect.width - piece.width,
                            height: piece.height
                        });
                    }
                    
                    if (rect.height > piece.height) {
                        freeRects.push({
                            x: rect.x,
                            y: rect.y + piece.height,
                            width: rect.width,
                            height: rect.height - piece.height
                        });
                    }
                    
                    // Remover pieza colocada
                    piecesToPlace.splice(i, 1);
                    i--; // Ajustar índice después de remover
                }
            }
            
            if (sheet.pieces.length > 0) {
                sheets.push(sheet);
            }
        }
        
        console.log(`✅ Guillotine Algorithm completado: ${sheets.length} placas utilizadas`);
        return sheets;
    },
    
    /**
     * Calcula estadísticas generales de la optimización
     * @param {Array} sheets - Lista de placas optimizadas
     * @returns {Object} Estadísticas de la optimización
     */
    calculateStats: function(sheets) {
        if (sheets.length === 0) {
            return {
                totalSheets: 0,
                totalArea: 0,
                usedArea: 0,
                wasteArea: 0,
                efficiency: 0
            };
        }
        
        const totalSheets = sheets.length;
        const totalArea = sheets.reduce((sum, sheet) => sum + (sheet.width * sheet.height), 0);
        const usedArea = sheets.reduce((sum, sheet) => sum + sheet.usedArea, 0);
        const wasteArea = totalArea - usedArea;
        const efficiency = (usedArea / totalArea) * 100;
        
        return {
            totalSheets: totalSheets,
            totalArea: totalArea,
            usedArea: usedArea,
            wasteArea: wasteArea,
            efficiency: efficiency
        };
    },
    
    /**
     * Configura las opciones del algoritmo
     * @param {Object} options - Opciones de configuración
     */
    setConfig: function(options) {
        this.config = { ...this.config, ...options };
        console.log('⚙️ Configuración del optimizador actualizada:', this.config);
    }
};