
const ALLOWED_CATEGORIES = ['backend', 'frontend', 'qa', 'devops'];


function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}


function isLocalImagePath(value) {
    if (!isNonEmptyString(value)) {
        return false;
    }

    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
    const isProtocolRelative = value.startsWith('//');

    return !hasScheme && !isProtocolRelative;
}


function validateItem(item, index) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        throw new Error(`Некоректний запис №${index + 1}: очікується об'єкт.`);
    }

    const { id, title, category, description, image } = item;

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`Некоректний запис №${index + 1}: id має бути позитивним цілим числом.`);
    }

    if (!isNonEmptyString(title)) {
        throw new Error(`Некоректний запис №${index + 1}: поле title має бути непорожнім рядком.`);
    }

    if (!isNonEmptyString(description)) {
        throw new Error(`Некоректний запис №${index + 1}: поле description має бути непорожнім рядком.`);
    }

    if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category)) {
        throw new Error(`Некоректний запис №${index + 1}: недопустима категорія «${category}».`);
    }

    if (!isLocalImagePath(image)) {
        throw new Error(`Некоректний запис №${index + 1}: image має бути локальним шляхом (напр. images/item.svg).`);
    }

    return id;
}


function validateItems(data) {
    if (!Array.isArray(data)) {
        throw new Error('Некоректні дані каталогу: очікується масив записів.');
    }

    const seenIds = new Set();

    data.forEach(function (item, index) {
        const id = validateItem(item, index);

        if (seenIds.has(id)) {
            throw new Error(`Дубль id = ${id} у каталозі (запис №${index + 1}).`);
        }

        seenIds.add(id);
    });

    return data;
}


export async function loadItems() {
    const url = new URL('../data/items.json', import.meta.url);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Не вдалося завантажити каталог: HTTP ${response.status}`);
    }

    const data = await response.json();

    return validateItems(data);
}
