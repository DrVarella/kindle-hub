// Sistema de Pop-ups Horários de Pontos (Caminho, Sulco, Forja)
// Exibe um ponto aleatório a cada hora entre 7h e 22h

(function() {
    'use strict';

    const START_HOUR = 7;  // 7h
    const END_HOUR = 22;   // 22h
    const STORAGE_KEY = 'pointsPopupState';

    let currentPoint = null;
    let popupElement = null;

    // Criar o CSS do pop-up
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #points-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            #points-popup-content {
                background: white;
                border: 3px solid #000;
                max-width: 700px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                padding: 20px;
            }

            #points-popup-header {
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 15px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
            }

            #points-popup-book {
                font-size: 16px;
                color: #666;
                margin-bottom: 10px;
            }

            #points-popup-text {
                font-size: 18px;
                line-height: 1.6;
                margin-bottom: 20px;
            }

            #points-popup-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .points-popup-btn {
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border: 2px solid #000;
                background: #fff;
                cursor: pointer;
            }

            .points-popup-btn:hover {
                background: #f0f0f0;
            }
        `;
        document.head.appendChild(style);
    }

    // Criar o elemento HTML do pop-up
    function createPopupElement() {
        const overlay = document.createElement('div');
        overlay.id = 'points-popup-overlay';
        overlay.innerHTML = `
            <div id="points-popup-content">
                <div id="points-popup-header">Ponto de Meditação</div>
                <div id="points-popup-book"></div>
                <div id="points-popup-text"></div>
                <div id="points-popup-buttons">
                    <button class="points-popup-btn" onclick="window.PointsPopup.close()">Fechar</button>
                    <button class="points-popup-btn" onclick="window.PointsPopup.markAsDone()">Já Rezei</button>
                </div>
            </div>
        `;
        return overlay;
    }

    // Buscar ponto aleatório da API
    async function fetchRandomPoint() {
        try {
            const response = await fetch('/api/escriva/random-point');
            if (!response.ok) {
                throw new Error('Erro na API');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar ponto:', error);
            return null;
        }
    }

    // Obter o livro em português
    function getBookName(bookType) {
        const books = {
            'camino': 'Caminho',
            'surco': 'Sulco',
            'forja': 'Forja'
        };
        return books[bookType] || bookType;
    }

    // Limpar texto (remover tags HTML)
    function cleanText(text) {
        if (!text) return '';
        // Remover tags HTML
        return text.replace(/<[^>]*>/g, '').trim();
    }

    // Exibir o pop-up
    function showPopup(point) {
        if (!point) return;

        currentPoint = point;

        // Criar pop-up se não existir
        if (!popupElement) {
            popupElement = createPopupElement();
            document.body.appendChild(popupElement);
        }

        // Preencher conteúdo
        const bookName = getBookName(point.book_type);
        document.getElementById('points-popup-book').textContent =
            `${bookName} ${point.number}`;
        document.getElementById('points-popup-text').textContent = cleanText(point.text);

        // Mostrar
        popupElement.style.display = 'flex';

        // Salvar no estado
        saveState({
            lastShown: new Date().toISOString(),
            currentHour: new Date().getHours(),
            pointId: point.id
        });
    }

    // Fechar o pop-up
    function closePopup() {
        if (popupElement) {
            popupElement.style.display = 'none';
        }
    }

    // Marcar como rezado
    function markAsDone() {
        console.log('✅ Ponto marcado como rezado:', currentPoint?.number);
        closePopup();

        // Atualizar estado para não mostrar novamente nesta hora
        const state = loadState();
        state.done = true;
        saveState(state);
    }

    // Salvar estado no localStorage
    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Erro ao salvar estado:', error);
        }
    }

    // Carregar estado do localStorage
    function loadState() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
            return {};
        }
    }

    // Verificar se deve mostrar o pop-up
    function shouldShowPopup() {
        const now = new Date();
        const currentHour = now.getHours();

        // Verificar horário ativo (7h às 22h)
        if (currentHour < START_HOUR || currentHour >= END_HOUR) {
            return false;
        }

        const state = loadState();

        // Verificar se já mostrou nesta hora
        if (state.currentHour === currentHour && state.done) {
            return false;
        }

        // Se mudou de hora, pode mostrar
        if (state.currentHour !== currentHour) {
            return true;
        }

        // Se nunca mostrou, mostrar
        if (!state.lastShown) {
            return true;
        }

        return false;
    }

    // Verificar e mostrar pop-up se necessário
    async function checkAndShow() {
        if (shouldShowPopup()) {
            const point = await fetchRandomPoint();
            if (point) {
                showPopup(point);
            }
        }
    }

    // Inicializar
    function init() {
        injectStyles();

        // Verificar imediatamente
        checkAndShow();

        // Verificar a cada minuto
        setInterval(checkAndShow, 60000); // 1 minuto
    }

    // Expor API global
    window.PointsPopup = {
        close: closePopup,
        markAsDone: markAsDone,
        show: checkAndShow
    };

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
