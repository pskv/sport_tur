
document.addEventListener('DOMContentLoaded', function() {
    // Элементы карточки описания
    const infoCard = document.getElementById('infoCard');
    const infoCardHeader = document.getElementById('infoCardHeader');
    const toggleBtn = document.getElementById('toggleBtn');
    const toggleIcon = toggleBtn.querySelector('i');

    // Переключение карточки описания
    function toggleCard() {
        if (infoCard.classList.contains('collapsed')) {
            infoCard.classList.remove('collapsed');
            infoCard.classList.add('expanded');
            toggleIcon.className = 'fas fa-chevron-up';
        } else {
            infoCard.classList.remove('expanded');
            infoCard.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }

    // Обработчики для карточки описания
    infoCardHeader.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCard();
    });

    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Закрытие карточки при клике вне её области
    document.addEventListener('click', function(e) {
        if (!infoCard.contains(e.target) && infoCard.classList.contains('expanded')) {
            infoCard.classList.remove('expanded');
            infoCard.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        }
    });

    // Инициализация подсказок для таблицы
    function initTableTooltips() {
        const tableElements = document.querySelectorAll('.rating-table [data-tooltip], .rating-table [data-url]');
        let tooltip = document.querySelector('.tooltip');
        
        // Создание элемента подсказки
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }

        let isTooltipVisible = false;
        let currentElement = null;

        // Функция показа подсказки
        function showTooltip(element, text) {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top - 20;
            
            tooltip.textContent = text;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            tooltip.classList.add('visible');
            isTooltipVisible = true;
            currentElement = element;
        }

        // Функция скрытия подсказки
        function hideTooltip() {
            tooltip.classList.remove('visible');
            isTooltipVisible = false;
            currentElement = null;
        }

        // Обработчик клика для элементов
        function handleElementClick(e) {
            e.stopPropagation();
            
            // Проверяем, есть ли ссылка
            const url = this.getAttribute('data-url');
            if (url) {
                // Переходим по ссылке
                window.location.href = url;
                return;
            }
            
            // Если ссылки нет, проверяем есть ли подсказка
            const tooltipText = this.getAttribute('data-tooltip');
            if (tooltipText) {
                if (isTooltipVisible && currentElement === this) {
                    hideTooltip();
                } else {
                    hideTooltip();
                    showTooltip(this, tooltipText);
                }
                return;
            }
            
            // Если ни ссылки ни подсказки - ничего не делаем
        }

        // Добавление обработчиков для всех элементов
        tableElements.forEach(element => {
            element.addEventListener('click', handleElementClick);
        });

        // Скрытие подсказки при клике вне элементов
        document.addEventListener('click', function(e) {
            if (isTooltipVisible && !e.target.closest('[data-tooltip]')) {
                hideTooltip();
            }
        });

        // Скрытие подсказки при скролле и изменении размера окна
        window.addEventListener('scroll', hideTooltip);
        window.addEventListener('resize', hideTooltip);
    }

    // Запуск инициализации подсказок
    initTableTooltips();

    // Функция для обработки прокрутки и показа заголовка
    function handleScroll() {
        const ratingNameHeader = document.querySelector('.rating-name-header');
        const backButton = document.querySelector('.back-button');
        
        // Проверяем, что элементы существуют
        if (!ratingNameHeader || !backButton) return;
        
        const backButtonText = backButton.querySelector('span');
        const scrollY = window.scrollY;
        
        // Показываем название рейтинга когда прокрутка больше 100px
        if (scrollY > 100) {
            ratingNameHeader.classList.add('visible');
            backButtonText.style.maxWidth = '0';
            backButtonText.style.opacity = '0';
        } else {
            ratingNameHeader.classList.remove('visible');
            backButtonText.style.maxWidth = '80px';
            backButtonText.style.opacity = '1';
        }
        
        backButton.style.paddingLeft = '12px';
        backButton.style.paddingRight = '12px';
    }

    // Добавляем обработчик события прокрутки
    window.addEventListener('scroll', handleScroll);

    // Вызываем сразу для начального состояния
    handleScroll();
});
