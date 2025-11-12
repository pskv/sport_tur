
// Компактные фильтры с выпадающими списками
document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('.competition-table tbody tr');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const visibleCountElem = document.getElementById('visibleCount');
    const totalCountElem = document.getElementById('totalCount');

    // Элементы фильтров
    const yearFilterBtn = document.getElementById('yearFilterBtn');
    const yearFilterContent = document.getElementById('yearFilterContent');
    const disciplineFilterBtn = document.getElementById('disciplineFilterBtn');
    const disciplineFilterContent = document.getElementById('disciplineFilterContent');
    const distanceFilterBtn = document.getElementById('distanceFilterBtn');
    const distanceFilterContent = document.getElementById('distanceFilterContent');

    // Текущие активные фильтры
    let activeFilters = {
        years: ['all'],
        disciplines: ['all'],
        distances: ['all']
    };

    // Инициализация счетчика
    totalCountElem.textContent = tableRows.length;
    
    // Динамическая инициализация фильтров
    initializeYearFilters();
    initializeDisciplineFilters();
    initializeDistanceFilters();
    
    // Получаем обновленные checkbox'ы после динамической инициализации
    const yearCheckboxes = yearFilterContent.querySelectorAll('input[type="checkbox"]');
    const disciplineCheckboxes = disciplineFilterContent.querySelectorAll('input[type="checkbox"]');
    const distanceCheckboxes = distanceFilterContent.querySelectorAll('input[type="checkbox"]');

    updateVisibleCount();

    // Функции динамической инициализации фильтров
    function initializeYearFilters() {
        const yearFilterContent = document.getElementById('yearFilterContent');
        
        // Очищаем существующие варианты (кроме "Все годы")
        const existingOptions = yearFilterContent.querySelectorAll('.filter-option:not(:first-child)');
        existingOptions.forEach(option => option.remove());
        
        // Собираем уникальные годы из данных таблицы
        const years = new Set();
        tableRows.forEach(row => {
            const year = row.getAttribute('data-year');
            if (year) years.add(year);
        });
        
        // Сортируем годы по убыванию
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        // Добавляем варианты в фильтр
        sortedYears.forEach(year => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `<input type="checkbox" value="${year}"> ${year}`;
            yearFilterContent.appendChild(label);
        });
    }

    function initializeDisciplineFilters() {
        const disciplineFilterContent = document.getElementById('disciplineFilterContent');
        const existingOptions = disciplineFilterContent.querySelectorAll('.filter-option:not(:first-child)');
        existingOptions.forEach(option => option.remove());
        
        const disciplines = new Set();
        tableRows.forEach(row => {
            const discipline = row.getAttribute('data-distance');
            if (discipline && discipline !== '-') {
                disciplines.add(discipline);
            }
        });
        
        disciplines.forEach(discipline => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            
            // Находим первую строку с этой дисциплиной чтобы взять иконку
            const exampleRow = Array.from(tableRows).find(row => 
                row.getAttribute('data-distance') === discipline
            );
            
            let iconHtml = '';
            if (exampleRow) {
                const typeCell = exampleRow.cells[2];
                iconHtml = typeCell.innerHTML;
            }
            
            label.innerHTML = `
                <input type="checkbox" value="${discipline}"> 
                ${iconHtml} ${discipline}
            `;
            disciplineFilterContent.appendChild(label);
        });
    }

    function initializeDistanceFilters() {
        const distanceFilterContent = document.getElementById('distanceFilterContent');
        const existingOptions = distanceFilterContent.querySelectorAll('.filter-option:not(:first-child)');
        existingOptions.forEach(option => option.remove());
        
        const distances = new Set();
        tableRows.forEach(row => {
            const distance = row.getAttribute('data-competition-type');
            if (distance && distance !== '-') {
                distances.add(distance);
            }
        });
        
        distances.forEach(distance => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            
            // Находим первую строку с этим типом дистанции чтобы взять иконку
            const exampleRow = Array.from(tableRows).find(row => 
                row.getAttribute('data-competition-type') === distance
            );
            
            let iconHtml = '';
            if (exampleRow) {
                const mapCell = exampleRow.cells[3];
                iconHtml = mapCell.innerHTML;
            }
            
            label.innerHTML = `
                <input type="checkbox" value="${distance}"> 
                ${iconHtml} ${distance}
            `;
            distanceFilterContent.appendChild(label);
        });
    }

    // Функция для умного позиционирования выпадающих списков
    function smartPositionDropdown(button, content) {
        if (window.innerWidth <= 768) {
            // На мобильных используем фиксированное позиционирование снизу
            content.classList.remove('upward');
            return;
        }

        // На десктопе проверяем, достаточно ли места снизу
        const buttonRect = button.getBoundingClientRect();
        const contentHeight = content.scrollHeight;
        const spaceBelow = window.innerHeight - buttonRect.bottom - 20; // 20px отступ
        
        if (spaceBelow < contentHeight && buttonRect.top > contentHeight) {
            // Если места снизу мало, но сверху достаточно - открываем вверх
            content.classList.add('upward');
        } else {
            // Иначе открываем вниз
            content.classList.remove('upward');
        }
    }

    // Функция определения дисциплины (для фильтрации строк)
    function getDisciplineType(row) {
        return row.getAttribute('data-distance');
    }

    // Функция определения длины дистанции (для фильтрации строк)
    function getDistanceLength(row) {
        return row.getAttribute('data-competition-type');
    }

    // Функция применения всех фильтров
    function applyFilters() {
        let visibleCount = 0;
        
        tableRows.forEach(row => {
            const rowYear = row.getAttribute('data-year');
            const rowDiscipline = getDisciplineType(row);
            const rowDistance = getDistanceLength(row);
            
            const yearMatch = activeFilters.years.includes('all') || activeFilters.years.includes(rowYear);
            const disciplineMatch = activeFilters.disciplines.includes('all') || activeFilters.disciplines.includes(rowDiscipline);
            const distanceMatch = activeFilters.distances.includes('all') || activeFilters.distances.includes(rowDistance);
            
            if (yearMatch && disciplineMatch && distanceMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        updateVisibleCount();
        updateFilterButtons();
        showEmptyMessage(visibleCount === 0);
    }

    // Функция обновления счетчика видимых строк
    function updateVisibleCount() {
        const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
        visibleCountElem.textContent = visibleRows.length;
    }

    // Функция показа/скрытия сообщения о пустой таблице
    function showEmptyMessage(show) {
        let emptyMessage = document.querySelector('.empty-table-message');
        
        if (!emptyMessage) {
            emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-table-message';
            emptyMessage.textContent = 'Соревнования не найдены. Попробуйте изменить фильтры.';
            document.querySelector('.table-container').appendChild(emptyMessage);
        }
        
        if (show) {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
        }
    }

    // Функция обновления текста кнопок фильтров
    function updateFilterButtons() {
        // Годы
        updateFilterButtonText(yearFilterBtn, 'Все годы', activeFilters.years, 'год', 'года', 'лет');
        
        // Дисциплины
        updateFilterButtonText(disciplineFilterBtn, 'Все дисциплины', activeFilters.disciplines, 'дисциплина', 'дисциплины', 'дисциплин');
        
        // Дистанции
        updateFilterButtonText(distanceFilterBtn, 'Все дистанции', activeFilters.distances, 'дистанция', 'дистанции', 'дистанций');
    }

    function updateFilterButtonText(button, defaultText, activeValues, singleText, fewText, manyText) {
        const filteredValues = activeValues.filter(v => v !== 'all');
        
        if (filteredValues.length === 0 || (filteredValues.length === 1 && filteredValues[0] === 'all')) {
            button.querySelector('span').textContent = defaultText;
            button.classList.remove('has-selection');
        } else if (filteredValues.length === 1) {
            button.querySelector('span').textContent = filteredValues[0];
            button.classList.add('has-selection');
        } else {
            let text;
            if (filteredValues.length === 1) {
                text = `1 ${singleText}`;
            } else if (filteredValues.length < 5) {
                text = `${filteredValues.length} ${fewText}`;
            } else {
                text = `${filteredValues.length} ${manyText}`;
            }
            button.querySelector('span').textContent = text;
            button.classList.add('has-selection');
        }
    }

    // Функция обработки выбора в checkbox'ах
    function handleCheckboxChange(checkboxes, filterType) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const value = this.value;
                
                if (value === 'all') {
                    // Если выбран "Все", снимаем остальные выборы
                    if (this.checked) {
                        checkboxes.forEach(cb => {
                            if (cb.value !== 'all') cb.checked = false;
                        });
                        activeFilters[filterType] = ['all'];
                    }
                } else {
                    // Если выбран конкретный элемент, снимаем "Все"
                    const allCheckbox = Array.from(checkboxes).find(cb => cb.value === 'all');
                    if (allCheckbox) {
                        allCheckbox.checked = false;
                    }
                    
                    // Обновляем массив активных фильтров
                    const currentValues = activeFilters[filterType].filter(v => v !== 'all');
                    
                    if (this.checked) {
                        currentValues.push(value);
                    } else {
                        const index = currentValues.indexOf(value);
                        if (index > -1) {
                            currentValues.splice(index, 1);
                        }
                    }
                    
                    activeFilters[filterType] = currentValues.length > 0 ? currentValues : ['all'];
                    
                    // Если сняли все галочки, автоматически выбираем "Все"
                    if (currentValues.length === 0) {
                        allCheckbox.checked = true;
                        activeFilters[filterType] = ['all'];
                    }
                }
                
                applyFilters();
            });
        });
    }

    // Инициализация обработчиков для checkbox'ов
    handleCheckboxChange(yearCheckboxes, 'years');
    handleCheckboxChange(disciplineCheckboxes, 'disciplines');
    handleCheckboxChange(distanceCheckboxes, 'distances');

    // Обработчики для открытия/закрытия выпадающих списков
    yearFilterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isShowing = yearFilterContent.classList.toggle('show');
        disciplineFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
        
        if (isShowing) {
            smartPositionDropdown(this, yearFilterContent);
        }
    });

    disciplineFilterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isShowing = disciplineFilterContent.classList.toggle('show');
        yearFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
        
        if (isShowing) {
            smartPositionDropdown(this, disciplineFilterContent);
        }
    });

    distanceFilterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isShowing = distanceFilterContent.classList.toggle('show');
        yearFilterContent.classList.remove('show');
        disciplineFilterContent.classList.remove('show');
        
        if (isShowing) {
            smartPositionDropdown(this, distanceFilterContent);
        }
    });

    // Закрытие выпадающих списков при клике вне их
    document.addEventListener('click', function() {
        yearFilterContent.classList.remove('show');
        disciplineFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
    });

    // Предотвращение закрытия при клике внутри выпадающего списка
    [yearFilterContent, disciplineFilterContent, distanceFilterContent].forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Добавьте обработчик изменения размера окна
    window.addEventListener('resize', function() {
        // Перепозиционируем открытые выпадающие списки
        if (yearFilterContent.classList.contains('show')) {
            smartPositionDropdown(yearFilterBtn, yearFilterContent);
        }
        if (disciplineFilterContent.classList.contains('show')) {
            smartPositionDropdown(disciplineFilterBtn, disciplineFilterContent);
        }
        if (distanceFilterContent.classList.contains('show')) {
            smartPositionDropdown(distanceFilterBtn, distanceFilterContent);
        }
    });

    // Сброс всех фильтров
    clearFiltersBtn.addEventListener('click', function() {
        // Сбрасываем все checkbox'ы
        yearCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        disciplineCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        distanceCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });

        // Сбрасываем фильтры
        activeFilters = {
            years: ['all'],
            disciplines: ['all'],
            distances: ['all']
        };
        
        applyFilters();
        
        // Закрываем все выпадающие списки
        yearFilterContent.classList.remove('show');
        disciplineFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
    });

    // Сортировка таблицы
    const table = document.getElementById('competitionTable');
    const headers = table.querySelectorAll('th[data-sort]');
    let currentSort = { column: 'date', direction: 'desc' };

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            const tbody = table.querySelector('tbody');
            const visibleRows = Array.from(tbody.querySelectorAll('tr:not([style*="display: none"])'));

            const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';

            visibleRows.sort((a, b) => {
                const aValue = a.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent.trim();
                const bValue = b.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent.trim();

                let comparison = 0;

                if (column === 'date') {
                    const aDate = parseInt(a.getAttribute('data-date'));
                    const bDate = parseInt(b.getAttribute('data-date'));
                    comparison = aDate - bDate;
                } else if (column === 'place') {
                    const aPlace = getPlaceValue(a);
                    const bPlace = getPlaceValue(b);
                    comparison = aPlace - bPlace;
                } else if (column === 'result') {
                    const aResult = getResultValue(a);
                    const bResult = getResultValue(b);
                    comparison = aResult - bResult;
                } else if (column === 'competition') {
                    comparison = aValue.localeCompare(bValue, 'ru');
                }

                return direction === 'asc' ? comparison : -comparison;
            });

            visibleRows.forEach(row => tbody.appendChild(row));
            currentSort = { column, direction };
            updateSortIcons(header, direction);
        });
    });

    function getColumnIndex(header) {
        return Array.from(header.parentNode.children).indexOf(header) + 1;
    }

    function getPlaceValue(row) {
        const placeCell = row.querySelector('td:nth-child(5)');
        if (!placeCell) return 999;

        const placeText = placeCell.textContent;
        const badge = placeCell.querySelector('.place-badge');
        const badgeText = badge ? badge.textContent : placeText;

        if (badgeText.includes('СН') || badgeText.includes('CH') || badgeText.includes('DNF')) return 999;
        const match = badgeText.match(/\d+/);
        return match ? parseInt(match[0]) : 998;
    }

    function getResultValue(row) {
        const resultCell = row.querySelector('td:nth-child(6)');
        if (!resultCell) return 999;

        const resultText = resultCell.textContent;
        if (resultText.includes('Снятие') || resultText.includes('DNF')) return 999;
        if (resultText.includes('-') || resultText === '') return 998;

        const match = resultText.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[0]) : 997;
    }

    function updateSortIcons(activeHeader, direction) {
        headers.forEach(header => {
            const icon = header.querySelector('i');
            if (header === activeHeader) {
                icon.className = direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    }

    // Инициализация - сортировка по дате (новые сверху) при загрузке
    const dateHeader = document.querySelector('th[data-sort="date"]');
    if (dateHeader) {
        dateHeader.click();
    }

    // Модальное окно
    const modal = document.getElementById('universalModal');
    const closeBtn = document.querySelector('.close');
    const athletesList = document.getElementById('modalAthletesList');
    const resultsList = document.getElementById('modalResultsList');

    const modalHeader = document.getElementById('modalHeader');
    const modalDiscipline = document.getElementById('modalDiscipline');
    const modalType = document.getElementById('modalType');
    const modalPlace = document.getElementById('modalPlace');

    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', function() {
            const eventName = this.cells[1].textContent;
            const date = this.cells[0].textContent;
            showModal(eventName, date, this);
        });
    });

    function showModal(eventName, date, row) {
        const athletesData = row.getAttribute('data-athletes');
        const distanceData = row.getAttribute('data-distance');
        const competitionType = row.getAttribute('data-competition-type');
        const resultsData = row.getAttribute('data-results');
		const eventType = row.getAttribute('data-event-type');
		const eventNameShort = row.getAttribute('data-event-name-short');
		const eventLocation = row.getAttribute('data-event-location');
		const eventDate = row.getAttribute('data-date');

        const placeCell = row.cells[4];

		let headerHTML = `<div class="event-status">${eventType}</div>`;
		if (eventNameShort && eventNameShort.trim() !== '') {
			headerHTML += `<div class="event-name">${eventNameShort}</div>`;
		}
		headerHTML += `<div class="event-location">${eventLocation}</div>`;
		headerHTML += `<div class="event-date">${formatDate(eventDate)}</div>`;
		
		modalHeader.innerHTML = headerHTML;

        modalDiscipline.textContent = distanceData && distanceData !== '-' ? distanceData : '—';
        modalType.textContent = competitionType && competitionType !== '-' ? competitionType : '—';
        modalPlace.innerHTML = getPlaceDisplay(placeCell);

        fillAthletesList(athletesData);
        fillResultsList(resultsData, row);

        modal.style.display = 'block';
    }

	function formatDate(dateString) {
		if (!dateString) return '';
		const year = dateString.substring(0, 4);
		const month = dateString.substring(4, 6);
		const day = dateString.substring(6, 8);
		return `${day}.${month}.${year}`;
	}

    function getPlaceDisplay(placeCell) {
        const badge = placeCell.querySelector('.place-badge');
        if (badge) {
            const badgeClass = badge.className.split(' ').find(cls => cls.startsWith('place-'));
            return `<span class="place-badge-modal ${badgeClass}">${badge.textContent}</span>`;
        }
        return placeCell.textContent;
    }

    function fillAthletesList(athletesData) {
        athletesList.innerHTML = '';
        try {
            const athletes = JSON.parse(athletesData);
            athletes.forEach((athlete) => {
                const li = document.createElement('li');
                li.textContent = athlete;
                athletesList.appendChild(li);
            });
        } catch (e) {
            const li = document.createElement('li');
            li.textContent = "Состав не указан";
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            athletesList.appendChild(li);
        }
    }

    function fillResultsList(resultsData, row) {
        resultsList.innerHTML = '';
        try {
            const results = JSON.parse(resultsData);
            const placeCell = row.cells[4];
            const athletePlace = parseInt(placeCell.textContent);
            const sortedResults = results.sort((a, b) => a.place - b.place);
            let resultsToShow = [];

            if (athletePlace <= 3) {
                resultsToShow = sortedResults.filter(result => result.place <= 3);
            } else {
                resultsToShow = sortedResults.filter(result => result.place <= 3 || result.place === athletePlace);
            }

            resultsToShow.forEach((result, index) => {
                if (athletePlace > 4 && result.place === athletePlace && index > 2) {
                    const ellipsis = document.createElement('li');
                    ellipsis.className = 'ellipsis';
                    ellipsis.textContent = '...';
                    resultsList.appendChild(ellipsis);
                }

                const li = document.createElement('li');
                li.className = result.place === athletePlace ? 'result-item athlete-result' : 'result-item';
                li.innerHTML = `
                    <span class="result-place">${result.place}</span>
                    <span class="result-name">${result.name}</span>
                    <span class="result-time">${result.time}</span>
                    <span class="result-gap">${result.gap}</span>
                `;
                resultsList.appendChild(li);
            });

        } catch (e) {
            const li = document.createElement('li');
            li.textContent = "Данные о результатах недоступны";
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            li.style.padding = '8px';
            li.style.textAlign = 'center';
            resultsList.appendChild(li);
        }
    }

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });

	function handleScroll() {
		const athleteNameHeader = document.getElementById('athleteNameHeader');
		const backButton = document.querySelector('.back-button');
		const backButtonText = backButton.querySelector('span');
		const scrollY = window.scrollY;
		
		if (scrollY > 100) {
			athleteNameHeader.classList.add('visible');
			backButtonText.style.maxWidth = '0';
			backButtonText.style.opacity = '0';
			backButton.style.paddingLeft = '8px';
			backButton.style.paddingRight = '8px';
		} else {
			athleteNameHeader.classList.remove('visible');
			backButtonText.style.maxWidth = '80px';
			backButtonText.style.opacity = '1';
			backButton.style.paddingLeft = '12px';
			backButton.style.paddingRight = '12px';
		}
	}

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Инициализация при загрузке
    applyFilters();

// === ПОИСК СПОРТСМЕНОВ В ШАПКЕ ===
const searchIcon = document.getElementById('searchIcon');
const searchExpanded = document.getElementById('searchExpanded');
const headerSearch = document.getElementById('headerSearch');
const searchResults = document.getElementById('searchResults');
const fixedHeader = document.querySelector('.fixed-header');

if (searchIcon && searchExpanded && headerSearch) {
    // Открытие поиска
    searchIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        fixedHeader.classList.add('search-active');
        searchExpanded.classList.add('active');
    
    // Очищаем предыдущие результаты и скрываем панель
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    headerSearch.value = ''; // Очищаем поле ввода
	
        setTimeout(() => {
            headerSearch.focus();
        }, 300);
    });

    // Закрытие поиска при клике вне
    document.addEventListener('click', function(e) {
        if (!searchExpanded.contains(e.target) && !searchIcon.contains(e.target)) {
            closeSearch();
        }
    });

    // Поиск при вводе
    headerSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Проверяем, загружены ли данные
        if (!window.athletesData || !Array.isArray(window.athletesData)) {
            console.warn('Данные спортсменов не загружены');
            searchResults.style.display = 'none';
            return;
        }
        
        // Фильтрация данных
        const filtered = window.athletesData.filter(athlete => 
            athlete.name.toLowerCase().includes(searchTerm) || 
            (athlete.region && athlete.region.toLowerCase().includes(searchTerm)) ||
            (athlete.rankText && athlete.rankText.toLowerCase().includes(searchTerm))
        );

        if (filtered.length > 0) {
            filtered.forEach(athlete => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div>
                        <div class="search-result-name">${athlete.name}</div>
                        <div class="search-result-region">${athlete.region || ''}</div>
                    </div>
                    <div class="search-result-rank">${athlete.rankText || athlete.rank || ''}</div>
                `;
                item.addEventListener('click', () => {
                    if (athlete.link) {
                        window.location.href = athlete.link;
                    }
                });
                searchResults.appendChild(item);
            });
            searchResults.style.display = 'block';
        } else {
            // Показать сообщение "Ничего не найдено"
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.innerHTML = `
                <div style="text-align: center; width: 100%; color: #666; font-style: italic;">
                    Спортсмены не найдены
                </div>
            `;
            searchResults.appendChild(noResults);
            searchResults.style.display = 'block';
        }
    });

    // Закрытие при нажатии Escape
    headerSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Функция закрытия поиска
    function closeSearch() {
        fixedHeader.classList.remove('search-active');
        searchExpanded.classList.remove('active');
        searchResults.style.display = 'none';
        headerSearch.value = '';
    }

    // Закрытие при прокрутке
    window.addEventListener('scroll', function() {
        if (searchExpanded.classList.contains('active')) {
            closeSearch();
        }
    });

    // Закрытие при изменении размера окна
    window.addEventListener('resize', function() {
        if (searchExpanded.classList.contains('active')) {
            closeSearch();
        }
    });
}


});