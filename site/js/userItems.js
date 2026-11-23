

import { readUserItems, writeUserItems } from './storage.js';

const CATEGORY_LABELS = {
    vacancy: 'Вакансія',
    channel: 'Канал моніторингу',
    note: 'Нотатка'
};


export function initUserItems() {
    const form = document.querySelector('#user-item-form');
    const list = document.querySelector('#user-list');
    const message = document.querySelector('#user-message');
    const empty = document.querySelector('#user-empty');
    const titleInput = document.querySelector('#user-title');

    if (!form || !list || !message || !empty || !titleInput) {
        return;
    }

    let userItems = [];


    try {
        userItems = readUserItems();
    } catch (error) {
        userItems = [];
        message.textContent = 'Не вдалося прочитати збережені записи: сховище містить некоректні дані.';
        console.error(error);
    }


    function showMessage(text) {
        message.textContent = text;
    }

 
    function createUserCard(item) {
        const card = document.createElement('article');
        card.className = 'user-item-card';

        const title = document.createElement('h3');
        title.textContent = item.title;

        const category = document.createElement('span');
        category.className = 'user-item-category';
        category.textContent = CATEGORY_LABELS[item.category] || item.category;

        const description = document.createElement('p');
        description.textContent = item.description;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-btn';
        deleteButton.setAttribute('data-delete-id', item.id);
        deleteButton.textContent = 'Видалити';

        card.append(category, title, description, deleteButton);

        return card;
    }


    function renderUserItems() {
        const fragment = document.createDocumentFragment();

        userItems.forEach(function (item) {
            fragment.appendChild(createUserCard(item));
        });

        list.replaceChildren(fragment);
        empty.hidden = userItems.length !== 0;
    }


    function commit(nextItems) {
        userItems = nextItems;
        renderUserItems();

        try {
            writeUserItems(userItems);
            return true;
        } catch (error) {
            showMessage('Зміни є лише в памʼяті: не вдалося зберегти у браузері, вони можуть не зберегтися після закриття сторінки.');
            console.error(error);
            return false;
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const title = String(formData.get('title') || '').trim();
        const description = String(formData.get('description') || '').trim();
        const category = String(formData.get('category') || '');

        if (title.length < 3 || title.length > 80) {
            showMessage('Назва має містити від 3 до 80 символів.');
            titleInput.focus();
            return;
        }

        if (description.length < 10 || description.length > 500) {
            showMessage('Опис має містити від 10 до 500 символів.');
            titleInput.focus();
            return;
        }

        if (!Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, category)) {
            showMessage('Оберіть категорію зі списку.');
            titleInput.focus();
            return;
        }

        const record = {
            id: `user-${crypto.randomUUID()}`,
            title: title,
            category: category,
            description: description
        };

        const saved = commit([...userItems, record]);

        if (saved) {
            showMessage('Запис додано й збережено.');
        }

        form.reset();
        titleInput.focus();
    });


    list.addEventListener('click', function (event) {
        const deleteButton = event.target.closest('[data-delete-id]');

        if (!deleteButton || !list.contains(deleteButton)) {
            return;
        }

        const id = deleteButton.getAttribute('data-delete-id');
        const nextItems = userItems.filter(function (item) {
            return item.id !== id;
        });

        const saved = commit(nextItems);

        if (saved) {
            showMessage('Запис видалено й зміни збережено.');
        }

        titleInput.focus();
    });

    renderUserItems();
}
