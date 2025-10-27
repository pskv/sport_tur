
        // Фильтрация по годам и сортировка таблицы
document.addEventListener('DOMContentLoaded', function() {
    const yearButtons = document.querySelectorAll('.year-btn');
    const tableRows = document.querySelectorAll('.competition-table tbody tr');

    // Фильтрация по годам
    yearButtons.forEach(button => {
        button.addEventListener('click', function() {
            const year = this.getAttribute('data-year');

            // Активируем кнопку
            yearButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Показываем/скрываем строки таблицы
            tableRows.forEach(row => {
                if (year === 'all' || row.getAttribute('data-year') === year) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // Сортировка таблицы - только для колонок с data-sort
    const table = document.getElementById('competitionTable');
    const headers = table.querySelectorAll('th[data-sort]');
    let currentSort = { column: 'date', direction: 'desc' };

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr:not([style*="display: none"])'));

            // Определяем направление сортировки
            const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';

            // Сортируем строки
            rows.sort((a, b) => {
                const aValue = a.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent.trim();
                const bValue = b.querySelector(`td:nth-child(${getColumnIndex(header)})`).textContent.trim();

                let comparison = 0;

                if (column === 'date') {
                    // Сортируем по числовому атрибуту data-date
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

            // Обновляем таблицу
            rows.forEach(row => tbody.appendChild(row));

            // Обновляем текущую сортировку
            currentSort = { column, direction };

            // Обновляем иконки сортировки
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

    // Обработчик для кликабельных строк
    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', function() {
            const eventName = this.cells[1].textContent;
            const date = this.cells[0].textContent;
            showModal(eventName, date, this);
        });
    });

    function showModal(eventName, date, row) {
        // Получаем данные из строки таблицы
        const athletesData = row.getAttribute('data-athletes');
        const distanceData = row.getAttribute('data-distance');
        const competitionType = row.getAttribute('data-competition-type');
        const resultsData = row.getAttribute('data-results');
		
		const eventType = row.getAttribute('data-event-type');
		const eventNameShort = row.getAttribute('data-event-name-short');
		const eventLocation = row.getAttribute('data-event-location');
		const eventDate = row.getAttribute('data-date');

        // Получаем данные из ячеек
        const placeCell = row.cells[4];

		// Заполняем шапке
		let headerHTML = `<div class="event-status">${eventType}</div>`;
		if (eventNameShort && eventNameShort.trim() !== '') {
			headerHTML += `<div class="event-name">${eventNameShort}</div>`;
		}
		headerHTML += `<div class="event-location">${eventLocation}</div>`;
		headerHTML += `<div class="event-date">${formatDate(eventDate)}</div>`;
		
		modalHeader.innerHTML = headerHTML;

        // Заполняем информационные строки
        modalDiscipline.textContent = distanceData && distanceData !== '-' ? distanceData : '—';
        modalType.textContent = competitionType && competitionType !== '-' ? competitionType : '—';
        modalPlace.innerHTML = getPlaceDisplay(placeCell);

        // Заполняем состав
        fillAthletesList(athletesData);

        // Заполняем результаты
        fillResultsList(resultsData, row);

        modal.style.display = 'block';
    }

    // Вспомогательные функции
	function formatDate(dateString) {
		if (!dateString) return '';
		
		// dateString в формате YYYYMMDD (например "20240705")
		const year = dateString.substring(0, 4);
		const month = dateString.substring(4, 6);
		const day = dateString.substring(6, 8);
		
		return `${day}.${month}.${year}`; // Возвращаем в формате DD.MM.YY
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

        // Получаем место спортсмена из таблицы (пятый столбец)
        const placeCell = row.cells[4];
        const athletePlace = parseInt(placeCell.textContent);

        // Сортируем результаты по месту
        const sortedResults = results.sort((a, b) => a.place - b.place);

        // Определяем, какие результаты показывать
        let resultsToShow = [];

        if (athletePlace <= 3) {
            // Если спортсмен в топ-3, показываем первые 3 места
            resultsToShow = sortedResults.filter(result => result.place <= 3);
        } else {
            // Если спортсмен не в топ-3, показываем первые 3 места + результат спортсмена
            resultsToShow = sortedResults.filter(result => result.place <= 3 || result.place === athletePlace);
        }

        // Отображаем результаты
        resultsToShow.forEach((result, index) => {
            // Добавляем троеточие перед результатом спортсмена, если он не в топ-4
            if (athletePlace > 4 && result.place === athletePlace && index > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'ellipsis';
                ellipsis.textContent = '...';
                resultsList.appendChild(ellipsis);
            }

            const li = document.createElement('li');
            // Сравниваем место из данных с местом из таблицы
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

    // Закрытие модального окна
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
});