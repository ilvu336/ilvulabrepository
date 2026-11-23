
export function debounce(fn, delay = 300) {
    let timerId = null;

    return function debounced(...args) {
        if (timerId !== null) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(function () {
            timerId = null;
            fn(...args);
        }, delay);
    };
}
