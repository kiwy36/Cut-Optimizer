/**
 * ALGORITMO DE OPTIMIZACIÓN - VERSIÓN COMPLETA MEJORADA
 * Incluye rotación de piezas, control de eficiencia y soporte para algoritmo Shelf y Guillotine
 */

const Optimizer = {
    // Configuración del algoritmo MEJORADA
    config: {
        allowRotation: true, // ✅ Permitir rotar piezas
        sortingMethod: 'max-side-desc', // ✅ Ordenar por el lado más largo
        algorithm: 'shelf', // shelf o guillotine
        efficiencyThreshold: 0.85 // ✅ Buscar al menos 85% de eficiencia por placa
    },
    
    /**
     * Algoritmo principal de optimización (Shelf Algorithm Mejorado)
     */
    shelfAlgorithm: function(pieces, sheetWidth, sheetHeight, allowRotation = true) {
        console.log(`🔧 Ejecutando Shelf Algorithm mejorado para ${pieces.length} piezas...`);
        
        this.config.allowRotation = allowRotation;
        
        let piecesToPlace = pieces.map(piece => ({ 
            ...piece,
            rotated: false
        }));
        
        piecesToPlace = this.sortPieces(piecesToPlace);
        
        const sheets = [];
        let unplacedPieces = [];
        
        while (piecesToPlace.length > 0) {
            let currentSheet = this.createNewSheet(sheetWidth, sheetHeight);
            let currentY = 0;
            let currentX = 0;
            let currentRowHeight = 0;
            
            for (let i = 0; i < piecesToPlace.length; i++) {
                const piece = piecesToPlace[i];
                let placed = false;
                
                const placementOptions = [];
                
                // Opción 1: Orientación normal
                if (this.canPlacePiece(piece, currentX, currentY, currentRowHeight, sheetWidth, sheetHeight, false)) {
                    placementOptions.push({
                        piece: { ...piece, rotated: false },
                        fits: true
                    });
                }
                
                // Opción 2: Rotada (si está permitido)
                if (this.config.allowRotation && 
                    this.canPlacePiece(piece, currentX, currentY, currentRowHeight, sheetWidth, sheetHeight, true)) {
                    placementOptions.push({
                        piece: { 
                            ...piece, 
                            rotated: true,
                            placedWidth: piece.height,
                            placedHeight: piece.width
                        },
                        fits: true
                    });
                }
                
                // Elegir mejor orientación
                if (placementOptions.length > 0) {
                    const bestOption = this.chooseBestPlacement(placementOptions, currentRowHeight);
                    this.placePiece(currentSheet, bestOption.piece, currentX, currentY);
                    
                    currentX += bestOption.piece.rotated ? bestOption.piece.placedWidth : bestOption.piece.width;
                    currentRowHeight = Math.max(currentRowHeight, 
                        bestOption.piece.rotated ? bestOption.piece.placedHeight : bestOption.piece.height);
                    
                    piecesToPlace.splice(i, 1);
                    i--;
                    placed = true;
                }
                
                // Si no cabe, intentar nueva fila
                if (!placed && currentX > 0) {
                    currentY += currentRowHeight;
                    currentX = 0;
                    currentRowHeight = 0;
                    i--;
                }
            }
            
            // Evaluar eficiencia de la placa
            if (currentSheet.pieces.length > 0) {
                const efficiency = currentSheet.usedArea / (sheetWidth * sheetHeight);
                
                if (efficiency >= this.config.efficiencyThreshold || sheets.length === 0) {
                    sheets.push(currentSheet);
                } else {
                    console.log(`🔄 Placa descartada - Eficiencia baja: ${(efficiency * 100).toFixed(1)}%`);
                    piecesToPlace = [...piecesToPlace, ...currentSheet.pieces.map(p => ({
                        ...p,
                        rotated: false
                    }))];
                }
            } else {
                break;
            }
        }
        
        // Reportar piezas no colocadas
        if (piecesToPlace.length > 0) {
            unplacedPieces = piecesToPlace.map(piece => ({
                ...piece,
                reason: this.getUnplacedReason(piece, sheetWidth, sheetHeight)
            }));
        }
        
        console.log(`✅ Algoritmo completado: ${sheets.length} placas utilizadas`);
        if (unplacedPieces.length > 0) {
            console.warn(`⚠️ ${unplacedPieces.length} piezas no pudieron colocarse`);
        }
        
        return { sheets, unplacedPieces };
    },
    
    /**
     * ✅ NUEVO: Elige la mejor orientación disponible
     */
    chooseBestPlacement: function(placementOptions, currentRowHeight) {
        // Se puede mejorar con heurísticas; por ahora toma la primera opción válida
        return placementOptions[0];
    },
    
    /**
     * ✅ NUEVO: Describe por qué una pieza no pudo colocarse
     */
    getUnplacedReason: function(piece, sheetWidth, sheetHeight) {
        const fitsNormal = piece.width <= sheetWidth && piece.height <= sheetHeight;
        const fitsRotated = this.config.allowRotation && 
                           piece.height <= sheetWidth && piece.width <= sheetHeight;
        
        if (!fitsNormal && !fitsRotated) {
            return `Pieza demasiado grande (${piece.width}x${piece.height}mm) para la placa (${sheetWidth}x${sheetHeight}mm)`;
        } else {
            return `No se encontró espacio disponible en las placas`;
        }
    },
    
    /**
     * Verifica si una pieza puede colocarse (mejorado)
     */
    canPlacePiece: function(piece, x, y, rowHeight, sheetWidth, sheetHeight, rotated = false) {
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;
        
        if (x + pieceWidth > sheetWidth) return false;
        if (y + pieceHeight > sheetHeight) return false;
        
        return true;
    },
    
    /**
     * Ordena las piezas según el método configurado (mejorado)
     */
    sortPieces: function(pieces) {
        const method = this.config.sortingMethod;
        
        switch (method) {
            case 'max-side-desc':
                return pieces.sort((a, b) => 
                    Math.max(b.width, b.height) - Math.max(a.width, a.height));
                
            case 'area-desc':
                return pieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
                
            case 'width-desc':
                return pieces.sort((a, b) => b.width - a.width);
                
            case 'height-desc':
                return pieces.sort((a, b) => b.height - a.height);
                
            default:
                return pieces.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
        }
    },
    
    /**
     * Crea una nueva placa vacía
     */
    createNewSheet: function(width, height) {
        return {
            pieces: [],
            usedArea: 0,
            width,
            height,
            efficiency: 0
        };
    },
    
    /**
     * Coloca una pieza en una placa
     */
    placePiece: function(sheet, piece, x, y) {
        const placedPiece = {
            ...piece,
            x,
            y,
            placedWidth: piece.rotated ? piece.height : piece.width,
            placedHeight: piece.rotated ? piece.width : piece.height
        };
        
        sheet.pieces.push(placedPiece);
        sheet.usedArea += placedPiece.placedWidth * placedPiece.placedHeight;
        sheet.efficiency = (sheet.usedArea / (sheet.width * sheet.height)) * 100;
    },
    
    /**
     * Algoritmo Guillotine (versión básica original conservada)
     */
    guillotineAlgorithm: function(pieces, sheetWidth, sheetHeight) {
        console.log(`🔧 Ejecutando Guillotine Algorithm para ${pieces.length} piezas...`);
        
        const sheets = [];
        let piecesToPlace = this.sortPieces([...pieces]);
        
        while (piecesToPlace.length > 0) {
            const sheet = this.createNewSheet(sheetWidth, sheetHeight);
            const freeRects = [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }];
            
            for (let i = 0; i < piecesToPlace.length; i++) {
                const piece = piecesToPlace[i];
                let bestRectIndex = -1;
                
                for (let j = 0; j < freeRects.length; j++) {
                    const rect = freeRects[j];
                    if (piece.width <= rect.width && piece.height <= rect.height) {
                        bestRectIndex = j;
                        break;
                    }
                }
                
                if (bestRectIndex !== -1) {
                    const rect = freeRects[bestRectIndex];
                    this.placePiece(sheet, piece, rect.x, rect.y);
                    
                    freeRects.splice(bestRectIndex, 1);
                    
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
                    
                    piecesToPlace.splice(i, 1);
                    i--;
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
            totalSheets,
            totalArea,
            usedArea,
            wasteArea,
            efficiency
        };
    },
    
    /**
     * Configura opciones del algoritmo
     */
    setConfig: function(options) {
        this.config = { ...this.config, ...options };
        console.log('⚙️ Configuración del optimizador actualizada:', this.config);
    }
};
