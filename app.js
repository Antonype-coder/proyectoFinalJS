const API_URL = 'https://fakestoreapi.com/products';
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let currentProductId = null;

const productsContainer = document.getElementById('products-container');
const cartCount = document.getElementById('cart-count');
const searchInput = document.getElementById('search-input');
const priceFilter = document.getElementById('price-filter');
const ratingFilter = document.getElementById('rating-filter');
const sortFilter = document.getElementById('sort-filter');
const categoryTitle = document.getElementById('category-title');
const resetFiltersBtn = document.getElementById('reset-filters');

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#4e73df' : '#e74a3b',
        className: 'toast-message',
    }).showToast();
}

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        products = await response.json();
        renderProducts(filterProducts());
    } catch (error) {
        console.error('Error al obtener productos:', error);
        showToast('Error al cargar los productos', 'error');
    }
}

function renderRating(rating) {
    const stars = Math.round(rating.rate);
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="bi ${i <= stars ? 'bi-star-fill' : 'bi-star'}"></i>`;
    }
    return starsHTML;
}

function filterProducts() {
    let filteredProducts = [...products];
    const searchTerm = searchInput.value.toLowerCase();
    const priceRange = priceFilter.value;
    const minRating = ratingFilter.value;
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.title.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm))
    }
    
    if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number);
        if (priceRange.endsWith('+')) {
            filteredProducts = filteredProducts.filter(p => p.price >= 500);
        } else {
            filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
        }
    }
    
    if (minRating !== 'all') {
        const min = parseFloat(minRating);
        filteredProducts = filteredProducts.filter(p => p.rating.rate >= min);
    }
    
    const sortOption = sortFilter.value;
    switch(sortOption) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    return filteredProducts;
}

function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">No se encontraron productos</h4>
                <button class="btn btn-outline-primary mt-3" id="reset-search">Reiniciar búsqueda</button>
            </div>
        `;
        
        document.getElementById('reset-search')?.addEventListener('click', () => {
            searchInput.value = '';
            currentCategory = 'all';
            priceFilter.value = 'all';
            ratingFilter.value = 'all';
            sortFilter.value = 'default';
            renderProducts(filterProducts());
            categoryTitle.innerHTML = '<i class="bi bi-grid"></i> Todos los productos';
        });
        
        return;
    }

    productsToRender.forEach(product => {
        const isInCart = cart.some(item => item.id === product.id);
        
        const productCard = document.createElement('div');
        productCard.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        productCard.innerHTML = `
            <div class="card product-card h-100">
                <span class="badge bg-light text-dark badge-category">${product.category}</span>
                <img src="${product.image}" class="card-img-top product-img" alt="${product.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <div class="d-flex align-items-center mb-2">
                        ${renderRating(product.rating)}
                        <small class="text-muted ms-2">(${product.rating.count})</small>
                    </div>
                    <p class="card-text text-muted">$${product.price.toFixed(2)}</p>
                    <div class="mt-auto d-grid gap-2">
                        <button class="btn btn-outline-primary view-details" data-id="${product.id}">
                            <i class="bi bi-eye"></i> Ver detalles
                        </button>
                        <button class="btn btn-${isInCart ? 'secondary' : 'primary'} add-to-cart" data-id="${product.id}">
                            ${isInCart ? '<i class="bi bi-check-circle"></i> En carrito' : '<i class="bi bi-cart-plus"></i> Agregar'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
    
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', showProductDetails);
    });
}

function showProductDetails(e) {
    const productId = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentProductId = productId;
    
    document.getElementById('productModalTitle').textContent = product.title;
    document.getElementById('productModalImage').src = product.image;
    document.getElementById('productModalImage').alt = product.title;
    document.getElementById('productModalDescription').textContent = product.description;
    document.getElementById('productModalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productModalCategory').textContent = product.category;
    document.getElementById('productModalRating').innerHTML = renderRating(product.rating);
    document.getElementById('productModalRatingCount').textContent = `(${product.rating.count} opiniones)`;
    
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        document.getElementById('productModalQuantity').value = cartItem.quantity;
    } else {
        document.getElementById('productModalQuantity').value = 1;
    }
    
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
}

function addToCart(e) {
    const productId = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showToast(`${product.title} agregado al carrito`);
}

function addToCartFromModal() {
    const quantity = parseInt(document.getElementById('productModalQuantity').value);
    const product = products.find(p => p.id === currentProductId);
    
    if (!product || quantity < 1) return;
    
    const existingItem = cart.find(item => item.id === currentProductId);
    
    if (existingItem) {
        existingItem.quantity = quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCart();
    showToast(existingItem ? 'Carrito actualizado' : 'Producto agregado al carrito');
    
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const productId = parseInt(button.dataset.id);
        const isInCart = cart.some(item => item.id === productId);
        
        button.className = `btn btn-${isInCart ? 'secondary' : 'primary'} add-to-cart`;
        button.innerHTML = isInCart 
            ? '<i class="bi bi-check-circle"></i> En carrito' 
            : '<i class="bi bi-cart-plus"></i> Agregar';
    });
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center py-4">Tu carrito está vacío</p>';
        document.getElementById('checkout-btn').disabled = true;
        cartTotal.textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'd-flex justify-content-between align-items-center mb-3 border-bottom pb-3';
        cartItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: contain;" class="me-3 rounded">
                <div>
                    <h6 class="mb-0">${item.title}</h6>
                    <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <h6 class="mb-0 me-3">$${(item.price * item.quantity).toFixed(2)}</h6>
                <button class="btn btn-outline-danger btn-sm remove-from-cart" data-id="${item.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-btn').disabled = false;

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            removeFromCart(parseInt(e.target.closest('button').dataset.id));
        });
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    renderCart();
    renderProducts(filterProducts());
    showToast('Producto eliminado del carrito');
}

function checkout() {
    cart = [];
    updateCart();
    renderCart();
    showToast('¡Compra finalizada con éxito!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCart();
    
    searchInput.addEventListener('input', () => {
        renderProducts(filterProducts());
    });
    
    priceFilter.addEventListener('change', () => {
        renderProducts(filterProducts());
    });
    
    ratingFilter.addEventListener('change', () => {
        renderProducts(filterProducts());
    });
    
    sortFilter.addEventListener('change', () => {
        renderProducts(filterProducts());
    });
    
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.category;
            renderProducts(filterProducts());
            
            if (currentCategory === 'all') {
                categoryTitle.innerHTML = '<i class="bi bi-grid"></i> Todos los productos';
            } else {
                const categoryName = e.target.textContent;
                categoryTitle.innerHTML = `<i class="bi bi-tag"></i> ${categoryName}`;
            }
        });
    });
    
    resetFiltersBtn.addEventListener('click', () => {
        currentCategory = 'all';
        searchInput.value = '';
        priceFilter.value = 'all';
        ratingFilter.value = 'all';
        sortFilter.value = 'default';
        renderProducts(filterProducts());
        categoryTitle.innerHTML = '<i class="bi bi-grid"></i> Todos los productos';
    });
    
    document.getElementById('cart-btn').addEventListener('click', () => {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });
    
    document.getElementById('checkout-btn').addEventListener('click', checkout);
    
    document.getElementById('addToCartModal').addEventListener('click', addToCartFromModal);
    
    document.getElementById('cartModal').addEventListener('shown.bs.modal', renderCart);
});