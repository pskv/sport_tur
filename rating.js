document.addEventListener('DOMContentLoaded', function() {
    // Элементы карточки описания
    const infoCard = document.getElementById('infoCard');
    const infoCardHeader = document.getElementById('infoCardHeader');
    const toggleBtn = document.getElementById('toggleBtn');
    const toggleIcon = toggleBtn ? toggleBtn.querySelector('i') : null;

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
    if (infoCardHeader && toggleBtn) {
        infoCardHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCard();
        });

        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCard();
        });

        // Закрытие карточки при клике вне её области
        document.addEventListener('click', function(e) {
            if (!infoCard.contains(e.target) && infoCard.classList.contains('expanded')) {
                infoCard.classList.remove('expanded');
                infoCard.classList.add('collapsed');
                toggleIcon.className = 'fas fa-chevron-down';
            }
        });
    }

    // Переключение между рейтингами
    const tabs = document.querySelectorAll('.rating-tab');
    const contents = document.querySelectorAll('.rating-content');
    
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                
                // Убираем активный класс у всех вкладок
                tabs.forEach(t => t.classList.remove('active'));
                // Добавляем активный класс текущей вкладке
                this.classList.add('active');
                
                // Скрываем все контенты
                contents.forEach(content => content.classList.remove('active'));
                // Показываем целевой контент
                const targetContent = document.getElementById(target + 'Content');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Инициализация подсказок для таблицы
    function initTableTooltips() {
        const tableElements = document.querySelectorAll('.rating-table [data-tooltip], .rating-table [data-url]');
        
        if (tableElements.length === 0) return;
        
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
    
    // Сохранение выбранной вкладки в URL
    function updateUrlTab(tab) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url);
    }
    
    // Восстановление вкладки из URL при загрузке
    function restoreTabFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        
        if (tab) {
            const tabElement = document.querySelector(`.rating-tab[data-target="${tab}"]`);
            if (tabElement) {
                tabElement.click();
                return;
            }
        }
        
        const firstTab = document.querySelector('.rating-tab');
        if (firstTab) {
            firstTab.click();
        }
    }
    
    // Модифицируем обработчик клика по вкладкам
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                updateUrlTab(target);
            });
        });
        
        // Восстанавливаем вкладку при загрузке
        restoreTabFromUrl();
    }
    
    // Функция для автоматической проверки необходимости переноса вкладок
    function checkTabsOverflow() {
        const tabsContainer = document.getElementById('ratingTabs');
        if (!tabsContainer) return;
        
        const tabs = tabsContainer.querySelectorAll('.rating-tab');
        if (tabs.length === 0) return;
        
        // Проверяем, помещаются ли все вкладки в одну строку
        let totalWidth = 0;
        const containerPadding = 8; // padding контейнера
        const gapWidth = 4; // gap между вкладками
        
        tabs.forEach(tab => {
            const style = window.getComputedStyle(tab);
            const marginLeft = parseFloat(style.marginLeft) || 0;
            const marginRight = parseFloat(style.marginRight) || 0;
            totalWidth += tab.offsetWidth + marginLeft + marginRight;
        });
        
        // Добавляем gap между вкладками
        totalWidth += (tabs.length - 1) * gapWidth;
        
        const containerWidth = tabsContainer.offsetWidth - containerPadding * 2;
        
        // Автоматически переключаем на многострочный режим при нехватке места
        if (totalWidth > containerWidth) {
            if (!tabsContainer.classList.contains('auto-wrap')) {
                tabsContainer.classList.add('auto-wrap');
            }
        }
    }
    
    // Проверка при загрузке и изменении размера окна
    window.addEventListener('load', function() {
        checkTabsOverflow();
    });
    
    window.addEventListener('resize', function() {
        checkTabsOverflow();
    });
    
    // Также проверяем после небольшой задержки для полной загрузки контента
    setTimeout(checkTabsOverflow, 100);
});