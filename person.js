// Компактные фильтры с выпадающими списками
document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('.competition-table tbody tr');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const visibleCountElem = document.getElementById('visibleCount');
    const totalCountElem = document.getElementById('totalCount');

    const yearFilterBtn = document.getElementById('yearFilterBtn');
    const yearFilterContent = document.getElementById('yearFilterContent');
    const disciplineFilterBtn = document.getElementById('disciplineFilterBtn');
    const disciplineFilterContent = document.getElementById('disciplineFilterContent');
    const distanceFilterBtn = document.getElementById('distanceFilterBtn');
    const distanceFilterContent = document.getElementById('distanceFilterContent');
    const ratingFilterBtn = document.getElementById('ratingFilterBtn');
    const ratingFilterContent = document.getElementById('ratingFilterContent');

    let activeFilters = {
        years: ['all'],
        disciplines: ['all'],
        distances: ['all'],
        ratings: ['Процент отставания']
    };

    if (!yearFilterBtn || !disciplineFilterBtn || !distanceFilterBtn || !tableRows.length) {
        if (totalCountElem) totalCountElem.textContent = tableRows.length;
        return;
    }

    totalCountElem.textContent = tableRows.length;
    
    initializeYearFilters();
    initializeDisciplineFilters();
    initializeDistanceFilters();
    initializeRatingFilters();
    
    const yearCheckboxes = yearFilterContent.querySelectorAll('input[type="checkbox"]');
    const disciplineCheckboxes = disciplineFilterContent.querySelectorAll('input[type="checkbox"]');
    const distanceCheckboxes = distanceFilterContent.querySelectorAll('input[type="checkbox"]');
    const ratingCheckboxes = ratingFilterContent.querySelectorAll('input[type="radio"]');

    updateVisibleCount();

    function initializeYearFilters() {
        try {
            const existingOptions = yearFilterContent.querySelectorAll('.filter-option:not(:first-child)');
            existingOptions.forEach(option => option.remove());
            
            const years = new Set();
            tableRows.forEach(row => {
                const year = row.getAttribute('data-year');
                if (year) years.add(year);
            });
            
            const sortedYears = Array.from(years).sort((a, b) => b - a);
            
            sortedYears.forEach(year => {
                const label = document.createElement('label');
                label.className = 'filter-option';
                label.innerHTML = `<input type="checkbox" value="${year}"> ${year}`;
                yearFilterContent.appendChild(label);
            });
        } catch (error) {
            console.error('Error initializing year filters:', error);
        }
    }

function initializeDisciplineFilters() {
    try {
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
            
            const exampleRow = Array.from(tableRows).find(row => 
                row.getAttribute('data-distance') === discipline
            );
            
            let iconHtml = '';
            if (exampleRow) {
                const typeCell = exampleRow.cells[2];
                // Извлекаем только иконки без обертки .icons-group
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = typeCell.innerHTML;
                
                const iconsGroup = tempDiv.querySelector('.icons-group');
                if (iconsGroup) {
                    // Берем только HTML содержимое .icons-group (сами иконки)
                    iconHtml = iconsGroup.innerHTML;
                } else {
                    // Если нет .icons-group, берем весь HTML
                    iconHtml = typeCell.innerHTML;
                }
            }
            
            label.innerHTML = `
                <input type="checkbox" value="${discipline}"> 
                <span class="filter-icons" style="display: inline-flex; gap: 0; margin-right: 4px;">${iconHtml}</span> ${discipline}
            `;
            disciplineFilterContent.appendChild(label);
        });
    } catch (error) {
        console.error('Error initializing discipline filters:', error);
    }
}

    function initializeDistanceFilters() {
        try {
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
        } catch (error) {
            console.error('Error initializing distance filters:', error);
        }
    }

    function initializeRatingFilters() {
        try {
            const existingOptions = ratingFilterContent.querySelectorAll('.filter-option:not(:first-child)');
            existingOptions.forEach(option => option.remove());
            
            // Получаем справочник из глобальной переменной
			let ratingsDictionary = window.ratingsDictionary || {};
            
            const ratingTypes = new Set();
            tableRows.forEach(row => {
                const ratingsData = row.getAttribute('data-glicko_ratings');
                if (ratingsData && ratingsData !== '{}') {
                    try {
                        const ratings = JSON.parse(ratingsData);
                        Object.keys(ratings).forEach(key => ratingTypes.add(key));
                    } catch (e) {
                        console.error('Error parsing glicko ratings:', e);
                    }
                }
            });
            
            const sortedTypes = Array.from(ratingTypes).sort((a, b) => parseInt(a) - parseInt(b));

            sortedTypes.forEach(type => {
                const label = document.createElement('label');
                label.className = 'filter-option';
                const isChecked = activeFilters.ratings[0] === type;
                // Используем название из справочника или стандартное, если нет в справочнике
                const ratingName = ratingsDictionary[type] || `Рейтинг ${type}`;
                label.innerHTML = `<input type="radio" name="ratingType" value="${type}" ${isChecked ? 'checked' : ''}> ${ratingName}`;
                ratingFilterContent.appendChild(label);
            });
            
        } catch (error) {
            console.error('Error initializing rating filters:', error);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function smartPositionDropdown(button, content) {
        if (window.innerWidth <= 768) {
            content.classList.remove('upward');
            return;
        }

        const buttonRect = button.getBoundingClientRect();
        const contentHeight = content.scrollHeight;
        const spaceBelow = window.innerHeight - buttonRect.bottom - 20;
        
        if (spaceBelow < contentHeight && buttonRect.top > contentHeight) {
            content.classList.add('upward');
        } else {
            content.classList.remove('upward');
        }
    }

    function getDisciplineType(row) {
        return row.getAttribute('data-distance');
    }

    function getDistanceLength(row) {
        return row.getAttribute('data-competition-type');
    }

    function updateResultCellDisplay(row, displayType) {
        const resultCell = row.cells[5];
        
        if (displayType === 'Процент отставания') {
            const originalPercent = row.getAttribute('data-original-percent') || resultCell.textContent;
            resultCell.textContent = originalPercent;
            resultCell.innerHTML = originalPercent; // Сброс HTML
        } else {
            if (!row.hasAttribute('data-original-percent')) {
                row.setAttribute('data-original-percent', resultCell.textContent);
            }
            
            const ratingsData = row.getAttribute('data-glicko_ratings');
            if (ratingsData && ratingsData !== '{}') {
                try {
                    const ratings = JSON.parse(ratingsData);
                    const ratingInfo = ratings[displayType];
                    
                    if (ratingInfo) {
                        const beforeRating = ratingInfo.before || 0;
                        const diff = ratingInfo.diff || 0;
                        
                        // Форматирование с HTML для раскраски изменения
                        let displayHTML = beforeRating.toFixed(0);
                        if (diff !== 0) {
                            const sign = diff > 0 ? '+' : '';
                            const color = diff > 0 ? '#2e7d32' : (diff < 0 ? '#c62828' : '#666');
                            displayHTML += ` <span style="color: ${color}">${sign}${diff}</span>`;
                        } else {
                            displayHTML += ` <span style="color: #666">+0</span>`;
                        }
                        
                        resultCell.innerHTML = displayHTML;
                    } else {
                        resultCell.textContent = '-';
                        resultCell.innerHTML = '-';
                    }
                } catch (e) {
                    resultCell.textContent = '-';
                    resultCell.innerHTML = '-';
                }
            } else {
                resultCell.textContent = '-';
                resultCell.innerHTML = '-';
            }
        }
    }


function applyFilters() {
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const rowYear = row.getAttribute('data-year');
        const rowDiscipline = getDisciplineType(row);
        const rowDistance = getDistanceLength(row);
        const ratingsData = row.getAttribute('data-glicko_ratings');
        
        const yearMatch = activeFilters.years.includes('all') || activeFilters.years.includes(rowYear);
        const disciplineMatch = activeFilters.disciplines.includes('all') || activeFilters.disciplines.includes(rowDiscipline);
        const distanceMatch = activeFilters.distances.includes('all') || activeFilters.distances.includes(rowDistance);
        
        // Проверяем наличие рейтинга, если выбран не "Процент отставания"
        let ratingMatch = true;
        if (activeFilters.ratings[0] !== 'Процент отставания') {
            if (ratingsData && ratingsData !== '{}') {
                try {
                    const ratings = JSON.parse(ratingsData);
                    ratingMatch = ratings.hasOwnProperty(activeFilters.ratings[0]);
                } catch (e) {
                    ratingMatch = false;
                }
            } else {
                ratingMatch = false;
            }
        }
        
        updateResultCellDisplay(row, activeFilters.ratings[0]);
    
        if (yearMatch && disciplineMatch && distanceMatch && ratingMatch) {
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


    function updateVisibleCount() {
        const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
        visibleCountElem.textContent = visibleRows.length;
    }

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

    function updateFilterButtons() {
        updateFilterButtonText(yearFilterBtn, 'Все годы', activeFilters.years, 'год', 'года', 'лет');
        updateFilterButtonText(disciplineFilterBtn, 'Все дисциплины', activeFilters.disciplines, 'дисциплина', 'дисциплины', 'дисциплин');
        updateFilterButtonText(distanceFilterBtn, 'Все дистанции', activeFilters.distances, 'дистанция', 'дистанции', 'дистанций');
        updateRatingFilterButton(); // Отдельная функция для рейтингов
    }

    function updateRatingFilterButton() {
        const currentRating = activeFilters.ratings[0];
        if (currentRating === 'Процент отставания') {
            ratingFilterBtn.querySelector('span').textContent = 'Процент отставания';
            ratingFilterBtn.classList.remove('has-selection');
        } else {
            // Получаем справочник и используем название
            const ratingsDictionary = window.ratingsDictionary || {};
            const ratingName = ratingsDictionary[currentRating] || `Рейтинг ${currentRating}`;
            ratingFilterBtn.querySelector('span').textContent = ratingName;
            ratingFilterBtn.classList.add('has-selection');
        }
    }

    function updateFilterButtonText(button, defaultText, activeValues, singleText, fewText, manyText) {
        // Для рейтингов используем отдельную функцию
        if (button === ratingFilterBtn) {
            updateRatingFilterButton();
            return;
        }
        
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

function handleCheckboxChange(checkboxes, filterType) {
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const value = this.value;
            
            if (filterType === 'ratings') {
                // Для рейтингов - только один выбор (radio buttons)
                activeFilters[filterType] = [value];
                
                // Если выбран рейтинг (не "Процент отставания"), сбрасываем другие фильтры
                if (value !== 'Процент отставания') {
                    //activeFilters.years = ['all'];
                    activeFilters.disciplines = ['all'];
                    activeFilters.distances = ['all'];
                    
                    // Сбрасываем чекбоксы других фильтров
                    //yearCheckboxes.forEach(cb => {
                    //    cb.checked = cb.value === 'all';
                    //});
                    disciplineCheckboxes.forEach(cb => {
                        cb.checked = cb.value === 'all';
                    });
                    distanceCheckboxes.forEach(cb => {
                        cb.checked = cb.value === 'all';
                    });
                }
                
                // Обновляем текст кнопки
                updateRatingFilterButton();
                
                // Закрываем выпадающий список после выбора
                ratingFilterContent.classList.remove('show');
            } else {
                // Для остальных фильтров - множественный выбор (checkboxes)
                if (value === 'all') {
                    if (this.checked) {
                        checkboxes.forEach(cb => {
                            if (cb.value !== 'all') cb.checked = false;
                        });
                        activeFilters[filterType] = ['all'];
                    }
                } else {
                    const allCheckbox = Array.from(checkboxes).find(cb => cb.value === 'all');
                    if (allCheckbox) {
                        allCheckbox.checked = false;
                    }
                    
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
                    
                    if (currentValues.length === 0) {
                        allCheckbox.checked = true;
                        activeFilters[filterType] = ['all'];
                    }
                }
                
                // Сбрасываем фильтр рейтингов на "Процент отставания" при выборе других фильтров
                if (filterType !== 'ratings') {
                    activeFilters.ratings = ['Процент отставания'];
                    ratingCheckboxes.forEach(cb => {
                        cb.checked = cb.value === 'Процент отставания';
                    });
                    updateRatingFilterButton();
                }
            }
            
            applyFilters();
        });
    });
}

    handleCheckboxChange(yearCheckboxes, 'years');
    handleCheckboxChange(disciplineCheckboxes, 'disciplines');
    handleCheckboxChange(distanceCheckboxes, 'distances');
    handleCheckboxChange(ratingCheckboxes, 'ratings');

    function setupFilterToggle(button, content) {
        if (!button || !content) return;
        
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const isShowing = content.classList.toggle('show');
            
            [yearFilterContent, disciplineFilterContent, distanceFilterContent, ratingFilterContent].forEach(otherContent => {
                if (otherContent && otherContent !== content) otherContent.classList.remove('show');
            });
            
            if (isShowing) smartPositionDropdown(this, content);
        });
    }

    setupFilterToggle(yearFilterBtn, yearFilterContent);
    setupFilterToggle(disciplineFilterBtn, disciplineFilterContent);
    setupFilterToggle(distanceFilterBtn, distanceFilterContent);
    setupFilterToggle(ratingFilterBtn, ratingFilterContent);

    document.addEventListener('click', function() {
        yearFilterContent.classList.remove('show');
        disciplineFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
        ratingFilterContent.classList.remove('show');
    });

    [yearFilterContent, disciplineFilterContent, distanceFilterContent, ratingFilterContent].forEach(content => {
        if (content) {
            content.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });

    const handleResize = debounce(function() {
        if (yearFilterContent && yearFilterContent.classList.contains('show')) {
            smartPositionDropdown(yearFilterBtn, yearFilterContent);
        }
        if (disciplineFilterContent && disciplineFilterContent.classList.contains('show')) {
            smartPositionDropdown(disciplineFilterBtn, disciplineFilterContent);
        }
        if (distanceFilterContent && distanceFilterContent.classList.contains('show')) {
            smartPositionDropdown(distanceFilterBtn, distanceFilterContent);
        }
        if (ratingFilterContent && ratingFilterContent.classList.contains('show')) {
            smartPositionDropdown(ratingFilterBtn, ratingFilterContent);
        }
    }, 250);

    window.addEventListener('resize', handleResize);

    clearFiltersBtn.addEventListener('click', function() {
        yearCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        disciplineCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        distanceCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        ratingCheckboxes.forEach(cb => {
            cb.checked = cb.value === 'Процент отставания';
        });

        activeFilters = {
            years: ['all'],
            disciplines: ['all'],
            distances: ['all'],
            ratings: ['Процент отставания']
        };
        
        // Обновляем текст кнопки рейтинга при сбросе
        updateRatingFilterButton();
        
        applyFilters();
        
        yearFilterContent.classList.remove('show');
        disciplineFilterContent.classList.remove('show');
        distanceFilterContent.classList.remove('show');
        ratingFilterContent.classList.remove('show');
    });

    const table = document.getElementById('competitionTable');
    const headers = table.querySelectorAll('th[data-sort]');
    let currentSort = { column: 'date', direction: 'asc' };

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
        
        const isRatingMode = activeFilters.ratings[0] !== 'Процент отставания';
        
        if (isRatingMode) {
            if (resultText.includes('-')) return 998;
            const match = resultText.match(/(-?\d+)/);
            return match ? parseFloat(match[0]) : 997;
        } else {
            if (resultText.includes('Снятие') || resultText.includes('DNF')) return 999;
            if (resultText.includes('-') || resultText === '') return 998;
            const match = resultText.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[0]) : 997;
        }
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

    const dateHeader = document.querySelector('th[data-sort="date"]');
    if (dateHeader) {
        dateHeader.click();
    }

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

    applyFilters();

    const searchIcon = document.getElementById('searchIcon');
    const searchExpanded = document.getElementById('searchExpanded');
    const headerSearch = document.getElementById('headerSearch');
    const searchResults = document.getElementById('searchResults');
    const fixedHeader = document.querySelector('.fixed-header');

    let tempInput = document.getElementById('tempInput');
    if (!tempInput) {
        tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.id = 'tempInput';
        tempInput.className = 'hidden-input';
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-1000px';
        tempInput.style.top = '0';
        tempInput.style.width = '1px';
        tempInput.style.height = '1px';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
    }

    if (searchIcon && searchExpanded && headerSearch) {
        let searchActive = false;
        
        function openKeyboardForSearch() {
            headerSearch.value = '';
            headerSearch.placeholder = 'Введите имя спортсмена...';
            
            tempInput.focus();
            
            setTimeout(() => {
                headerSearch.focus();
                
                setTimeout(() => {
                    headerSearch.focus();
                    
                    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        headerSearch.click();
                        setTimeout(() => {
                            headerSearch.focus();
                        }, 10);
                    }
                }, 50);
            }, 30);
        }
        
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            searchActive = true;
            fixedHeader.classList.add('search-active');
            searchExpanded.classList.add('active');
            
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            
            openKeyboardForSearch();
        });

        function closeSearch() {
            searchActive = false;
            fixedHeader.classList.remove('search-active');
            searchExpanded.classList.remove('active');
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            headerSearch.value = '';
            headerSearch.blur();
        }

        document.addEventListener('click', function(e) {
            if (searchActive && !searchExpanded.contains(e.target) && !searchIcon.contains(e.target)) {
                closeSearch();
            }
        });

        headerSearch.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });

        headerSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (searchTerm.length < 3) {
                searchResults.style.display = 'none';
                return;
            }
            
            if (!window.athletesData || !Array.isArray(window.athletesData)) {
                searchResults.style.display = 'none';
                return;
            }
            
            const filtered = window.athletesData.filter(athlete => 
                athlete.name.toLowerCase().includes(searchTerm) || 
                (athlete.region && athlete.region.toLowerCase().includes(searchTerm)) ||
                (athlete.rank && athlete.rank.toLowerCase().includes(searchTerm))
            );
            
            if (filtered.length > 0) {
                filtered.forEach(athlete => {
                    const item = document.createElement(athlete.link ? 'a' : 'div');
                    item.className = 'search-result-item';
                    
                    if (athlete.link) {
                        item.href = athlete.link;
                        item.setAttribute('role', 'link');
                        item.setAttribute('aria-label', `Перейти к профилю ${athlete.name}`);
                    } else {
                        item.style.cursor = 'default';
                    }
                    
                    const birthYearInfo = athlete.birthYear ? `, ${athlete.birthYear}` : '';
                    const rankInfo = athlete.rank ? `<div class="search-result-rank">${athlete.rank}</div>` : '';
                    
                    item.innerHTML = `
                        <div class="search-result-main">
                            <div class="search-result-name">${athlete.name}${birthYearInfo}</div>
                            <div class="search-result-region">${athlete.region || ''}</div>
                        </div>
                        ${rankInfo}
                    `;
                    
                    if (!athlete.link) {
                        item.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    }
                    
                    item.addEventListener('touchend', function(e) {
                        if (athlete.link) {
                            e.preventDefault();
                            e.stopPropagation();
                            setTimeout(() => {
                                window.location.href = athlete.link;
                            }, 50);
                        }
                    });
                    
                    item.addEventListener('click', function(e) {
                        if (athlete.link) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = athlete.link;
                        }
                    });
                    
                    searchResults.appendChild(item);
                });
                searchResults.style.display = 'block';
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'search-result-item no-results';
                noResults.innerHTML = `
                    <div style="text-align: center; width: 100%; color: #666; font-style: italic;">
                        Спортсмены не найдены
                    </div>
                `;
                noResults.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                searchResults.appendChild(noResults);
                searchResults.style.display = 'block';
            }
        });
        
        headerSearch.addEventListener('touchstart', function(e) {
            if (!searchActive) {
                e.preventDefault();
                searchIcon.click();
            }
        });
    }
    
    // ============================================
    // ОБРАБОТКА КЛИКОВ ПО КАРТОЧКЕ "ЛУЧШИЕ РЕЗУЛЬТАТЫ"
    // ============================================
    
    // Функция для настройки кликабельности строк в карточке медалей
    function setupMedalCardClickHandlers() {
        const medalItems = document.querySelectorAll('.medal-stats .medal-item[data-result-id]');
        
        if (medalItems.length === 0) {
            return;
        }
        
        medalItems.forEach((medalItem) => {
            // Добавляем CSS класс для стилизации
            medalItem.classList.add('clickable-medal');
            
            // Обработчик клика
            medalItem.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const resultId = this.getAttribute('data-result-id');
                
                if (!resultId) {
                    return;
                }
                
                const tableRow = document.querySelector(`.competition-table tbody tr[data-result-id="${resultId}"]`);
                
                if (tableRow && tableRow.classList.contains('clickable-row')) {
                    const eventName = tableRow.cells[1].textContent;
                    const date = tableRow.cells[0].textContent;
                    showModal(eventName, date, tableRow);
                } else {
                    const medalEvent = this.querySelector('.medal-event').textContent;
                    alert(`Подробная информация для результата "${medalEvent}" недоступна`);
                }
            });
        });
    }
    
    // Настраиваем кликабельность строк в карточке медалей
    setupMedalCardClickHandlers();
    
});