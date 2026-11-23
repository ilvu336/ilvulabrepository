# AetherisLab — Telegram-бот для пошуку IT-вакансій

Лендінг проєкту для лабораторних робіт **№4–№8** з дисципліни «Веб-технології».
Виконано на **чистому HTML, SCSS і JavaScript (ES-модулі)** — без бібліотек (Vue/React),
без npm-залежностей і без серверного коду.

---

## Структура проєкту

```
site/
├── index.html                 # головна сторінка (семантична розмітка + контейнери під JS)
├── css/
│   ├── main.css               # стилі, синхронні з scss/main.scss (підключається в index.html)
│   └── styles.css             # архівний вихідник стилів (не підключається)
├── scss/
│   ├── _variables.scss        # змінні: кольори, відступи, точки переходу
│   ├── _mixins.scss           # міксини respond-from / focus-ring / card / section-title
│   └── main.scss              # головний файл стилів (@use)
├── js/
│   ├── main.js                # єдиний вхідний ES-модуль: ініціалізація сторінки
│   ├── api.js                 # ЛР №7: fetch + async/await + валідація каталогу
│   ├── catalog.js             # ЛР №7: чиста filterItems + renderItems (DOM)
│   ├── utils.js               # ЛР №7: debounce на замиканні
│   ├── storage.js             # ЛР №8: localStorage + сувора isUserItems
│   └── userItems.js           # ЛР №8: форма, CRUD власних записів
├── data/
│   └── items.json             # 9 записів каталогу (4 категорії)
├── images/                    # 9 локальних SVG-ілюстрацій каталогу
├── docs/                      # скриншоти (див. розділ «Скриншоти»)
├── image.png                  # логотип-аватар автора
└── image2.png                 # банер сайту
```

Напрямок залежностей: `main.js → api.js / catalog.js / utils.js / userItems.js → storage.js`.
Жоден модуль не імпортує `main.js`.

---

## Етап 1 — Лабораторна робота №4 (SCSS та адаптивний дизайн)

### Структура SCSS

| Файл | Призначення |
|---|---|
| `scss/_variables.scss` | **8+ змінних**: `$color-primary`, `$color-text`, `$color-surface`, `$space-md`, `$radius`, `$bp-mobile: 360px`, `$bp-tablet: 768px`, `$bp-desktop: 1280px` |
| `scss/_mixins.scss` | Параметризований міксін `respond-from($bp)` + `respond-until($bp)`, `focus-ring`, `card`, `section-title` |
| `scss/main.scss` | Головний файл: `@use 'variables' as *;` і `@use 'mixins' as *;` (сучасне правило `@use`) |

### Адаптивність (mobile-first)

| Ширина екрана | Сітки «Можливості» / «Вакансії» / «Мої вакансії» | Форми |
|---|---|---|
| **360px** (мобільний) | 1 колонка | 1 колонка |
| **768px** (планшет) | 2 колонки | 2 колонки |
| **1280px** (десктоп) | 3 колонки | 2 колонки |

- Базові стилі — для вузького екрана, розширення лише в `@media (min-width: ...)`.
- **Горизонтального скролу немає**: `overflow-x: hidden` на `body`, `min-width: 0` у грід-дітей, `max-width: 100%` у зображень.
- **Доступність**: глобальний `:focus-visible`, `aria-*` атрибути, `role="status"` для динамічних повідомлень. Анімацій і плавного скролу в проєкті немає — інтерфейс реагує миттєво.

### Збірка SCSS

Готовий `css/main.css` уже лежить у проєкті — сайт працює одразу. Після зміни SCSS:

```bash
sass scss/main.scss css/main.css --style=expanded
```

---

## Етап 2 — Лабораторна робота №5 (JavaScript, DOM та події)

`js/main.js` підключено як **ES-модуль** (модулі виконуються після парсингу HTML, тому `defer` не потрібен):

```html
<script type="module" src="js/main.js"></script>
```

Реалізовано на наявних елементах (`querySelector`, `addEventListener`, `classList`, `textContent`):

1. **«Показати більше / Приховати»** (секція «Переваги») — перемикає клас `is-hidden`,
   оновлює `aria-expanded` кнопки та її текст.
2. **Форма заявки** — перехоплює `submit`, викликає `preventDefault()`, валідує поля
   та показує повідомлення в `#form-status` (`role="status"`) без перезавантаження сторінки.
3. **Кнопки «Додати в обране»** в картках каталогу — делегування подій на контейнері,
   перемикають `aria-pressed` і текст кнопки; працюють після будь-якого перерендеру.

---

## Етап 3 — Лабораторна робота №6 (динамічний DOM, масиви, фільтрація)

Каталог вакансій формується динамічно. Секція `#vacancies` містить лише елементи керування:

```html
<input type="search" id="vacancy-search" ...>
<select id="vacancy-category"> ... <option value="all">Усі</option> ... </select>
<p id="results-count" role="status">Знайдено: 0</p>
<div class="vacancies-grid" id="item-grid"></div>
<p class="vacancies-empty" id="empty-message" role="status" hidden>Нічого не знайдено...</p>
```

Фільтрація враховує пошук **і** категорію; лічильник оновлюється, порожній стан
показується/ховається. У ЛР №7 цю ж логіку перенесено в модулі й `data/items.json`
(див. нижче) — замість `innerHTML` картки створюються через `document.createElement`.

---

## Етап 4 — Лабораторна робота №7 (ES-модулі, `fetch`, `async/await`, замикання)

### Тема й мета

Модульна архітектура каталогу: дані винесено в `data/items.json`, завантаження — через
`fetch` з `async/await`, фільтрація — чистою функцією, пошук — через `debounce` на замиканні.

### Модулі

| Модуль | Що робить |
|---|---|
| `js/api.js` | `loadItems()`: `new URL('../data/items.json', import.meta.url)` → `fetch` → перевірка `response.ok` → `response.json()` → `Array.isArray` → валідація кожного запису |
| `js/catalog.js` | Чиста `filterItems(items, query, category)` + `renderItems(items, grid, count, empty)` |
| `js/utils.js` | `debounce(fn, delay = 300)` на замиканні |
| `js/main.js` | DOM-елементи, `updateView()`, `init()` зі станами завантаження, реєстрація слухачів **один раз** |

### Приклад запису `data/items.json`

```json
{
  "id": 1,
  "title": "Middle Node.js Developer",
  "category": "backend",
  "description": "Розробка REST API для фінтех-сервісу: Node.js, PostgreSQL, Docker. Досвід від 2 років.",
  "image": "images/backend-nodejs.svg"
}
```

Вимоги до даних (перевіряються в `api.js`, порушення → `Error`):

- `id` — унікальне позитивне ціле число;
- `title`, `description` — непорожні рядки;
- `category` — одне з `backend`, `frontend`, `qa`, `devops` (збігається з `<select>`);
- `image` — **локальний** шлях відносно `index.html`; зовнішні URL (`http://`, `https://`, `//cdn...`) і `data:`-URI відхиляються.

Порожній масив `[]` — валідний результат (каталог просто порожній).

### `async/await` і `fetch`

```js
export async function loadItems() {
    const url = new URL('../data/items.json', import.meta.url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Не вдалося завантажити каталог: HTTP ${response.status}`);
    }

    const data = await response.json();
    return validateItems(data);
}
```

`response.ok` дорівнює `false` для статусів 4xx/5xx — без цієї перевірки `response.json()`
намагався б розпарсити сторінку помилки сервера.

### Чиста `filterItems` проти `renderItems`

- `filterItems(items, query, category)` — **чиста функція**: не мутує масив і його об'єкти,
  не читає DOM, повертає новий масив через `.filter()`. Легко тестувати й повторно використовувати.
- `renderItems(items, grid, count, empty)` — **ефектна (side effects)**: створює картки через
  `document.createElement`, заповнює тексти через `.textContent` (жодного `innerHTML` для даних —
  захист від XSS), збирає `DocumentFragment`, викликає `grid.replaceChildren(fragment)`,
  оновлює `count.textContent = \`Знайдено: ${items.length}\`` і `empty.hidden`.

Розділення дає змогу змінити подання (наприклад, іншу сітку) без змін логіки фільтрації.

### `debounce` через замикання

```js
export function debounce(fn, delay = 300) {
    let timerId = null;

    return function debounced(...args) {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            timerId = null;
            fn(...args);
        }, delay);
    };
}
```

`timerId` живе в замиканні й не доступний ззовні. Кожен новий виклик скидає попередній
таймер, тому `updateView()` виконується лише після паузи в наборі (300 мс). Debounced-версія
створюється **один раз** при реєстрації слухача, а не всередині обробника.

### Стани завантаження та повтор

`init()` має `try / catch / finally`:

- **перед запитом** — поля пошуку й категорії заблоковано, `retry-load` і `load-error` приховано,
  `#load-status` показує «Завантаження…», `#item-grid` отримує `aria-busy="true"`, сітка й лічильник очищуються;
- **успіх** — `items = await loadItems()`, `updateView()`, `loaded = true`;
- **помилка** — `items = []`, зрозуміле повідомлення в `#load-error` (`role="alert"`), показ кнопки
  «Спробувати ще раз», `console.error(error)`;
- **`finally`** — очищення статусу, `aria-busy="false"`, поля розблоковуються лише при `loaded === true`
  (`disabled = !loaded`), кнопка повтору вмикається.

Слухачі (`input` → debounce, `change` → `updateView`, `click` на повтор → `init`) реєструються
**один раз поза `init()`**. Повторна спроба не скидає значення пошуку й категорії.

---

## Етап 5 — Лабораторна робота №8 (форма, CRUD, `localStorage`)

### Секція «Мої вакансії»

Форма `#user-item-form` (не вкладена в іншу форму) містить:

| Елемент | Вимоги |
|---|---|
| `#user-title` (`name="title"`) | `required`, `minlength="3"`, `maxlength="80"` |
| `#user-category` (`name="category"`) | `required`, порожній `value=""` за замовчуванням, категорії: `vacancy` — Вакансія, `channel` — Канал моніторингу, `note` — Нотатка |
| `#user-description` (`name="description"`) | `required`, `minlength="10"`, `maxlength="500"` |
| Кнопка | `<button type="submit">Додати</button>` |
| Статус | `<p id="user-message" role="status">` |
| Список | `<div id="user-list">`, порожній стан `#user-empty` |

### Схема запису користувача

```json
{
  "id": "user-550e8400-e29b-41d4-a716-446655440000",
  "title": "Моя вакансія",
  "category": "vacancy",
  "description": "Короткий опис від 10 до 500 символів."
}
```

`id` генерується як `user-${crypto.randomUUID()}`.

### Ключ `localStorage`

```
aetherislab:user-items:v1
```

### `js/storage.js`

- `isUserItems(value)` — сувора перевірка: масив без дублікатів `id`; кожен елемент — звичайний
  об'єкт з `id` (рядок `user-...` довжиною > 5), `title` (після `trim` 3–80, вихідна довжина ≤ 80),
  `description` (після `trim` 10–500, вихідна довжина ≤ 500) і `category` зі списку.
- `readUserItems()` — `null` → `[]`; `JSON.parse` + `isUserItems`; невалідні дані → `Error("Некоректні записи")`.
- `writeUserItems(items)` — `localStorage.setItem(KEY, JSON.stringify(items))`.

### `js/userItems.js` (CRUD)

- **Create** — `submit`: `preventDefault()` → `form.reportValidity()` → `FormData` → `trim` і перевірка
  довжин/категорії → запис з `crypto.randomUUID()` → `commit([...userItems, record])` →
  `form.reset()` і фокус на поле назви.
- **Read** — `renderUserItems()` створює картки через `createElement`; назва, підпис категорії
  та опис виводяться через `.textContent`, тому текст на кшталт `<b>Мій рецепт</b>` показується буквально.
- **Delete** — делегований `click` на `#user-list`: `event.target.closest('[data-delete-id]')`,
  фільтрація масиву, `commit(...)`.

`commit(nextItems)` оновлює масив, рендерить список і пробує `writeUserItems()`:

- успіх → `true` і повідомлення «Запис додано й збережено.» / «Запис видалено й зміни збережено.»;
- помилка сховища (наприклад, переповнення або заборона) → `false`, попередження, що зміни
  лише в пам'яті, і `console.error`.

### Сценарії відновлення та помилок

1. **Порожнє сховище** — `getItem` → `null` → `[]`, показується `#user-empty`.
2. **Коректні дані** — проходять `isUserItems`, список відновлюється після перезавантаження.
3. **Пошкоджений JSON або невалідна структура** — `readUserItems()` кидає `Error`, `initUserItems()`
   ловить його, показує повідомлення й **не перезаписує** сховище одразу (дані можна відновити вручну).
4. **Помилка запису** — список оновлюється в пам'яті, користувач бачить попередження.

Ініціалізація ЛР №8 викликається з `main.js` **незалежно** від мережевого `init()`:
помилка завантаження `items.json` не ламає власні записи, і навпаки.

---

## Інструкція з запуску

**Потрібен локальний HTTP-сервер** — через `file://` браузер блокує ES-модулі та `fetch`.

```bash
# Python 3
python -m http.server 8000

# або Node.js
npx serve .
```

Відкрийте `http://localhost:8000`.

> `localhost` вважається безпечним контекстом, тому `crypto.randomUUID()` працює.

---

## Перевірка роботи

### ЛР №7

- [ ] Консоль без помилок; у Network видно `200` для `data/items.json` і для `images/*.svg`.
- [ ] Під час завантаження: «Завантаження…», `aria-busy="true"`, поля заблоковані.
- [ ] Каталог показує 9 карток, лічильник «Знайдено: 9».
- [ ] Пошук `React` → 1 картка; категорія `QA` → 2 картки; неіснуючий запит → порожній стан.
- [ ] Швидкий набір у пошуку не викликає перерендер на кожну літеру (debounce).
- [ ] «Додати в обране» перемикає `aria-pressed` і текст, стан зберігається після фільтрації/перерендеру.
- [ ] Перейменуйте `data/items.json` → перезавантажте: видно `#load-error`, кнопку повтору,
      поля заблоковані. Поверніть файл → «Спробувати ще раз» → каталог відновлено.

### ЛР №8

- [ ] Додавання запису: після «Додати» картка з'являється, повідомлення «Запис додано й збережено.», форма очищена.
- [ ] Перезавантаження сторінки: записи на місці (Application → Local Storage → `aetherislab:user-items:v1`).
- [ ] Видалення: картка зникає, повідомлення «Запис видалено й зміни збережено.», після перезавантаження її немає.
- [ ] Назва `<b>Тест</b>` відображається буквально, без жирного шрифту.
- [ ] Порожні/короткі поля блокуються (`reportValidity`), фокус повертається на поле назви.
- [ ] Введіть у сховище невалідний JSON → перезавантажте: повідомлення про пошкоджене сховище,
      дані не перезаписуються.

### Загальне

- [ ] Ширина 360px → 1 колонка, без горизонтального скролу; 768px → 2; 1280px → 3.
- [ ] Клавіша `Tab`: усі інтерактивні елементи мають видимий фокус.
- [ ] Анімацій і плавного скролу немає (переходи не використовуються).

---

## Скриншоти

Каталог `docs/` — для скриншотів звіту.

| Файл | Що знімати |
|---|---|
| `docs/screenshot-desktop-1280.png` | сторінка на 1280px — 3 колонки карток |
| `docs/screenshot-tablet-768.png` | сторінка на 768px — 2 колонки |
| `docs/screenshot-mobile-360.png` | сторінка на 360px — 1 колонка, без горизонтального скролу |
| `docs/screenshot-filter.png` | активний пошук і оновлений лічильник |
| `docs/screenshot-empty.png` | порожній стан «Нічого не знайдено» |
| `docs/screenshot-load-error.png` | стан помилки завантаження + кнопка «Спробувати ще раз» |
| `docs/screenshot-user-form.png` | форма «Мої вакансії» із заповненими полями |
| `docs/screenshot-user-list.png` | додані записи користувача |
| `docs/screenshot-localstorage.png` | DevTools → Application → Local Storage з ключем `aetherislab:user-items:v1` |
| `docs/screenshot-console.png` | консоль браузера без помилок |

> Як знімати: DevTools (F12) → Toggle Device Toolbar → вибрати ширину →
> `Ctrl+Shift+P` → «Capture full size screenshot».

---

## Технічні вимоги — виконано

- [x] Чистий HTML / SCSS / JavaScript, без сторонніх бібліотек
- [x] Семантична верстка, `label` для кожного поля, `aria-*` для динамічних станів
- [x] Mobile-first, точки переходу 768px і 1280px, база 360px
- [x] Немає горизонтального скролу на 360px, немає анімацій
- [x] Єдиний вхідний модуль `js/main.js`, решта модулів його не імпортують
- [x] `fetch` + `async/await` + `response.ok`, дані лише з `data/items.json`
- [x] Чиста `filterItems`, рендер без `innerHTML`, `DocumentFragment` + `replaceChildren`
- [x] `debounce` на замиканні, слухачі реєструються один раз
- [x] CRUD власних записів + `localStorage` із суворою валідацією
- [x] Консоль без помилок

---

© 2026 AetherisLab. Лабораторні роботи №4–№8.
