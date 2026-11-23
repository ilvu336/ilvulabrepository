
import { loadItems } from './api.js';
import { filterItems, renderItems } from './catalog.js';
import { debounce } from './utils.js';
import { initUserItems } from './userItems.js';


function initAdvantagesToggle() {
    const toggleBtn = document.querySelector('#advantages-toggle');
    const extraBlock = document.querySelector('#advantages-extra');

    if (!toggleBtn || !extraBlock) {
        return;
    }

    toggleBtn.addEventListener('click', function () {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        const willExpand = !isExpanded;

        toggleBtn.setAttribute('aria-expanded', String(willExpand));
        extraBlock.classList.toggle('is-hidden', !willExpand);
        toggleBtn.textContent = willExpand ? 'Приховати' : 'Показати більше';
    });
}


function initRequestForm() {
    const form = document.querySelector('#request-form');
    const status = document.querySelector('#form-status');

    if (!form || !status) {
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const nameInput = form.querySelector('#name');
        const contactInput = form.querySelector('#contact');
        const stackInput = form.querySelector('#stack');

        const isValid =
            nameInput.value.trim().length >= 2 &&
            contactInput.value.trim() !== '' &&
            stackInput.value !== '';

        if (!isValid) {
            status.textContent = 'Будь ласка, заповніть обов’язкові поля коректно.';
            status.classList.remove('is-hidden');
            return;
        }

        status.textContent =
            'Дякуємо, ' + nameInput.value.trim() + '! Вашу заявку прийнято — ми напишемо вам у Telegram.';
        status.classList.remove('is-hidden');
        form.reset();
    });
}



const searchInput = document.querySelector('#vacancy-search');
const categorySelect = document.querySelector('#vacancy-category');
const grid = document.querySelector('#item-grid');
const resultsCount = document.querySelector('#results-count');
const emptyMessage = document.querySelector('#empty-message');
const statusMessage = document.querySelector('#load-status');
const errorMessage = document.querySelector('#load-error');
const retryButton = document.querySelector('#retry-load');


let items = [];


function updateView() {
    const filtered = filterItems(items, searchInput.value, categorySelect.value);
    renderItems(filtered, grid, resultsCount, emptyMessage);
}


async function init() {
    let loaded = false;

    searchInput.disabled = true;
    categorySelect.disabled = true;
    retryButton.disabled = true;
    retryButton.hidden = true;
    errorMessage.hidden = true;
    errorMessage.textContent = '';
    statusMessage.textContent = 'Завантаження…';
    grid.setAttribute('aria-busy', 'true');
    grid.replaceChildren();
    resultsCount.textContent = '';
    emptyMessage.hidden = true;

    try {
        items = await loadItems();
        updateView();
        loaded = true;
    } catch (error) {
        items = [];
        errorMessage.textContent = 'Не вдалося завантажити каталог вакансій. Спробуйте ще раз.';
        errorMessage.hidden = false;
        retryButton.hidden = false;
        console.error(error);
    } finally {
        statusMessage.textContent = '';
        grid.setAttribute('aria-busy', 'false');
        // Поля пошуку/категорії розблоковуються лише після успішного завантаження
        searchInput.disabled = !loaded;
        categorySelect.disabled = !loaded;
        retryButton.disabled = false;
    }
}



const debouncedUpdateView = debounce(updateView, 300);
searchInput.addEventListener('input', debouncedUpdateView);


categorySelect.addEventListener('change', updateView);


retryButton.addEventListener('click', init);


grid.addEventListener('click', function (event) {
    const favoriteButton = event.target.closest('.favorite-btn');

    if (!favoriteButton) {
        return;
    }

    const isActive = favoriteButton.classList.toggle('is-active');
    favoriteButton.setAttribute('aria-pressed', String(isActive));
    favoriteButton.textContent = isActive ? 'У обраному ✓' : 'Додати в обране';
});



initAdvantagesToggle();
initRequestForm();

init();

initUserItems();
