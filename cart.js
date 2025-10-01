// Database name and version
const DB_NAME = 'millysaintessence_db';
const DB_VERSION = 1;

// Define object store names
const CART_STORE = 'cart';
const USERS_STORE = 'users';

let db;

// Function to open the IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = event => {
            console.error('Database error: ' + event.target.errorCode);
            reject('Database error');
        };

        request.onupgradeneeded = event => {
            db = event.target.result;
            // Create object stores
            if (!db.objectStoreNames.contains(CART_STORE)) {
                db.createObjectStore(CART_STORE, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(USERS_STORE)) {
                db.createObjectStore(USERS_STORE, { keyPath: 'email' });
            }
        };

        request.onsuccess = event => {
            db = event.target.result;
            resolve(db);
        };
    });
}

// Function to add an item to the cart
function addToCart(name, price) {
    if (!db) {
        openDatabase().then(() => addToCart(name, price));
        return;
    }

    const transaction = db.transaction([CART_STORE], 'readwrite');
    const store = transaction.objectStore(CART_STORE);
    const item = { name: name, price: price };
    store.add(item);

    transaction.oncomplete = () => {
        alert(`${name} added to cart!`);
        updateCartCount();
    };

    transaction.onerror = event => {
        console.error('Error adding to cart:', event.target.error);
    };
}

// Function to update the cart count badge
function updateCartCount() {
    if (!db) {
        openDatabase().then(updateCartCount);
        return;
    }

    const transaction = db.transaction([CART_STORE], 'readonly');
    const store = transaction.objectStore(CART_STORE);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
        const count = countRequest.result;
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.textContent = count;
        }
    };
}

// Function to clear the entire cart
function clearCart() {
    if (!db) {
        openDatabase().then(clearCart);
        return;
    }

    const transaction = db.transaction([CART_STORE], 'readwrite');
    const store = transaction.objectStore(CART_STORE);
    store.clear();

    transaction.oncomplete = () => {
        console.log('Cart cleared successfully.');
        location.reload();
    };

    transaction.onerror = event => {
        console.error('Error clearing cart:', event.target.error);
    };
}

// Open the database when the page loads
document.addEventListener('DOMContentLoaded', () => {
    openDatabase().then(() => {
        console.log('Database opened successfully');
        updateCartCount();
    }).catch(error => {
        console.error('Failed to open database:', error);
    });
});