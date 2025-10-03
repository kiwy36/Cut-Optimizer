/**
 * GESTOR DE PIEZAS
 * Maneja la creación, eliminación y gestión de piezas
 */

const PieceManager = {
    // Contador para IDs únicos de piezas
    currentPieceId: 0,
    
    // Almacenamiento de todas las piezas
    allPieces: [],
    
    /**
     * Inicializa el gestor de piezas
     */
    init: function() {
        console.log('📦 Inicializando PieceManager...');
        this.currentPieceId = 0;
        this.allPieces = [];
    },
    
    /**
     * Agrega una nueva pieza a la interfaz
     */
    addPiece: function() {
        const piecesContainer = document.getElementById('piecesContainer');
        const pieceId = this.currentPieceId++;
        
        // Crear elemento HTML para la pieza
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece-row';
        pieceDiv.innerHTML = this.getPieceHTML(pieceId);
        
        piecesContainer.appendChild(pieceDiv);
        
        // Configurar event listener para el botón de eliminar
        this.setupRemoveListener(pieceDiv, pieceId);
        
        console.log(`➕ Pieza ${pieceId} agregada`);
    },
    
    /**
     * Genera el HTML para una fila de pieza
     * @param {number} pieceId - ID único de la pieza
     * @returns {string} HTML de la pieza
     */
    getPieceHTML: function(pieceId) {
        return `
            <input type="number" class="piece-width" value="300" min="1" placeholder="Ancho">
            <input type="number" class="piece-height" value="200" min="1" placeholder="Alto">
            <input type="number" class="piece-quantity" value="1" min="1" placeholder="Cantidad">
            <input type="color" class="piece-color" value="${this.getRandomColor()}">
            <button class="remove-piece" data-id="${pieceId}" title="Eliminar pieza">✕</button>
        `;
    },
    
    /**
     * Configura el event listener para eliminar una pieza
     * @param {HTMLElement} pieceDiv - Elemento de la pieza
     * @param {number} pieceId - ID de la pieza
     */
    setupRemoveListener: function(pieceDiv, pieceId) {
        const removeBtn = pieceDiv.querySelector('.remove-piece');
        removeBtn.addEventListener('click', () => {
            this.removePiece(pieceDiv, pieceId);
        });
    },
    
    /**
     * Elimina una pieza de la interfaz
     * @param {HTMLElement} pieceDiv - Elemento de la pieza
     * @param {number} pieceId - ID de la pieza
     */
    removePiece: function(pieceDiv, pieceId) {
        const piecesContainer = document.getElementById('piecesContainer');
        
        // Solo permitir eliminar si hay más de una pieza
        if (piecesContainer.children.length > 1) {
            piecesContainer.removeChild(pieceDiv);
            console.log(`➖ Pieza ${pieceId} eliminada`);
        } else {
            console.warn('⚠️ No se puede eliminar la última pieza');
            alert('Debe haber al menos una pieza en la lista');
        }
    },
    
    /**
     * Obtiene todas las piezas configuradas en la interfaz
     * @returns {Array} Lista de objetos de pieza
     */
    getAllPieces: function() {
        this.allPieces = [];
        const pieceElements = document.querySelectorAll('#piecesContainer > .piece-row');
        
        pieceElements.forEach(element => {
            const width = parseInt(element.querySelector('.piece-width').value);
            const height = parseInt(element.querySelector('.piece-height').value);
            const quantity = parseInt(element.querySelector('.piece-quantity').value);
            const color = element.querySelector('.piece-color').value;
            
            // Validar pieza individual
            if (this.isValidPiece(width, height, quantity)) {
                // Crear múltiples instancias según la cantidad
                for (let i = 0; i < quantity; i++) {
                    this.allPieces.push({
                        id: `${this.allPieces.length}_${width}x${height}`,
                        width: width,
                        height: height,
                        color: color,
                        quantity: quantity
                    });
                }
            }
        });
        
        console.log(`📊 Total de piezas a cortar: ${this.allPieces.length}`);
        return this.allPieces;
    },
    
    /**
     * Valida si una pieza individual tiene datos válidos
     * @param {number} width - Ancho de la pieza
     * @param {number} height - Alto de la pieza
     * @param {number} quantity - Cantidad de piezas
     * @returns {boolean} True si la pieza es válida
     */
    isValidPiece: function(width, height, quantity) {
        if (isNaN(width) || width <= 0) {
            console.warn('⚠️ Ancho de pieza inválido:', width);
            return false;
        }
        
        if (isNaN(height) || height <= 0) {
            console.warn('⚠️ Alto de pieza inválido:', height);
            return false;
        }
        
        if (isNaN(quantity) || quantity <= 0) {
            console.warn('⚠️ Cantidad de pieza inválida:', quantity);
            return false;
        }
        
        return true;
    },
    
    /**
     * Genera un color hexadecimal aleatorio
     * @returns {string} Color en formato hexadecimal
     */
    getRandomColor: function() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
    
    /**
     * Reinicia el gestor de piezas al estado inicial
     */
    reset: function() {
        const piecesContainer = document.getElementById('piecesContainer');
        piecesContainer.innerHTML = '';
        this.currentPieceId = 0;
        this.allPieces = [];
        this.addPiece(); // Agregar una pieza por defecto
    },
    
    /**
     * Obtiene estadísticas de las piezas
     * @returns {Object} Estadísticas de las piezas
     */
    getStats: function() {
        const pieces = this.getAllPieces();
        const totalArea = pieces.reduce((sum, piece) => sum + (piece.width * piece.height), 0);
        
        return {
            totalPieces: pieces.length,
            totalArea: totalArea,
            uniqueSizes: new Set(pieces.map(p => `${p.width}x${p.height}`)).size
        };
    }
};