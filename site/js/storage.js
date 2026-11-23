// ============================================================
// Лабораторна робота №8 — збереження власних записів
// localStorage + сувора перевірка структури даних
// ============================================================

// Єдиний ключ сховища (версія v1 — для майбутніх міграцій)
const KEY = 'aetherislab:user-items:v1';

// Дозволені категорії власних записів (мають збігатися з <select>)
const ALLOWED_CATEGORIES = ['vacancy', 'channel', 'note'];

/**
 * Звичайний об'єкт (не масив, не null)
 */
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Назва: рядок, вихідна довжина <= 80, після trim — від 3 до 80
 */
function isValidTitle(value) {
    if (typeof value !== 'string' || value.length > 80) {
        return false;
    }

    const trimmed = value.trim();
    return trimmed.length >= 3 && trimmed.length <= 80;
}

/**
 * Опис: рядок, вихідна довжина <= 500, після trim — від 10 до 500
 */
function isValidDescription(value) {
    if (typeof value !== 'string' || value.length > 500) {
        return false;
    }

    const trimmed = value.trim();
    return trimmed.length >= 10 && trimmed.length <= 500;
}

/**
 * Сувора перевірка структури масиву записів користувача:
 * масив без дублікатів id; кожен елемент — об'єкт з валідними
 * id (рядок "user-..." довжиною > 5), title, description, category.
 *
 * @param {*} value перевірюване значення
 * @returns {boolean}
 */
export function isUserItems(value) {
    if (!Array.isArray(value)) {
        return false;
    }

    const seenIds = new Set();

    for (const item of value) {
        if (!isPlainObject(item)) {
            return false;
        }

        const { id, title, description, category } = item;

        if (typeof id !== 'string' || id.length <= 5 || !id.startsWith('user-')) {
            return false;
        }

        if (seenIds.has(id)) {
            return false;
        }
        seenIds.add(id);

        if (!isValidTitle(title)) {
            return false;
        }

        if (!isValidDescription(description)) {
            return false;
        }

        if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category)) {
            return false;
        }
    }

    return true;
}

/**
 * Читає записи з localStorage.
 * Порожнє сховище (null) → []. Биті/невалідні дані → Error("Некоректні записи").
 *
 * @returns {Array} масив записів
 * @throws {Error} "Некоректні записи"
 */
export function readUserItems() {
    const raw = localStorage.getItem(KEY);

    if (raw === null) {
        return [];
    }

    let parsed;

    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error('Некоректні записи');
    }

    if (!isUserItems(parsed)) {
        throw new Error('Некоректні записи');
    }

    return parsed;
}


export function writeUserItems(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
}
