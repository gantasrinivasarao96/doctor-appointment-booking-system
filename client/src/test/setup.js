import "@testing-library/jest-dom/vitest";


// ======================================
// Deterministic Test Storage
// ======================================
const createStorage = () => {
  let store = {};

  return {
    getItem(key) {
      const normalizedKey = String(key);

      return Object.prototype.hasOwnProperty.call(
        store,
        normalizedKey
      )
        ? store[normalizedKey]
        : null;
    },

    setItem(key, value) {
      store[String(key)] =
        String(value);
    },

    removeItem(key) {
      delete store[String(key)];
    },

    clear() {
      store = {};
    },

    key(index) {
      return (
        Object.keys(store)[index] ??
        null
      );
    },

    get length() {
      return Object.keys(store).length;
    },
  };
};


Object.defineProperty(
  globalThis,
  "localStorage",
  {
    configurable: true,
    value: createStorage(),
  }
);
