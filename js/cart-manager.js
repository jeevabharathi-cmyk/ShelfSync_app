(function () {
    const CART_KEY = 'shelfsync_cart_v1';

    window.CartManager = {
        getCart: function () {
            try {
                const cart = localStorage.getItem(CART_KEY);
                return cart ? JSON.parse(cart) : [];
            } catch (error) {
                console.error('Error reading cart from localStorage:', error);
                return [];
            }
        },

        saveCart: function (cart) {
            try {
                localStorage.setItem(CART_KEY, JSON.stringify(cart));
                // Dispatch event for other pages to update
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        },

        addToCart: function (book) {
            const cart = this.getCart();
            const existingItem = cart.find(item => item.title === book.title);

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push({
                    ...book,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
            }

            this.saveCart(cart);
            return cart;
        },

        removeFromCart: function (title) {
            let cart = this.getCart();
            cart = cart.filter(item => item.title !== title);
            this.saveCart(cart);
            return cart;
        },

        updateQuantity: function (title, quantity) {
            const cart = this.getCart();
            const item = cart.find(item => item.title === title);
            if (item) {
                item.quantity = Math.max(1, parseInt(quantity) || 1);
                this.saveCart(cart);
            }
            return cart;
        },

        clearCart: function () {
            localStorage.removeItem(CART_KEY);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            return [];
        },

        getCartTotal: function () {
            const cart = this.getCart();
            return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
        },

        getCartCount: function () {
            const cart = this.getCart();
            return cart.reduce((count, item) => count + (item.quantity || 1), 0);
        }
    };
})();
