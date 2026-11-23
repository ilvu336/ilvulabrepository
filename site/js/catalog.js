
export function filterItems(items, query, category) {
    const normalizedQuery = String(query).trim().toLowerCase();

    return items.filter(function (item) {
        const searchable = `${item.title} ${item.description}`.toLowerCase();

        const matchesQuery = normalizedQuery === '' || searchable.includes(normalizedQuery);
        const matchesCategory = category === 'all' || item.category === category;

        return matchesQuery && matchesCategory;
    });
}


function createCard(item) {
    const card = document.createElement('article');
    card.className = 'vacancy-card';
    card.dataset.id = String(item.id);

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = `Ілюстрація до вакансії «${item.title}»`;
    image.loading = 'lazy';

    const category = document.createElement('span');
    category.className = 'vacancy-category';
    category.textContent = item.category.toUpperCase();

    const title = document.createElement('h3');
    title.textContent = item.title;

    const description = document.createElement('p');
    description.textContent = item.description;

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = 'favorite-btn';
    favoriteButton.setAttribute('aria-pressed', 'false');
    favoriteButton.textContent = 'Додати в обране';

    card.append(image, category, title, description, favoriteButton);

    return card;
}


export function renderItems(items, grid, count, empty) {
    const fragment = document.createDocumentFragment();

    items.forEach(function (item) {
        fragment.appendChild(createCard(item));
    });

    grid.replaceChildren(fragment);

    count.textContent = `Знайдено: ${items.length}`;
    empty.hidden = items.length !== 0;
}
