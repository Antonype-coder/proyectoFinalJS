const URL_API = 'https://fakestoreapi.com/products';
let productos = [];
const contenedorProductos = document.getElementById('contenedor-productos');

async function obtenerProductos() {
    try {
        const respuesta = await fetch(URL_API);
        productos = await respuesta.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
}

function mostrarValoracion(valoracion) {
    const estrellas = Math.round(valoracion.rate);
    let htmlEstrellas = '';
    
    for (let i = 1; i <= 5; i++) {
        htmlEstrellas += `<i class="bi ${i <= estrellas ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}"></i>`;
    }
    
    return htmlEstrellas;
}

function mostrarProductos(productosAMostrar) {
    contenedorProductos.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const tarjetaProducto = document.createElement('div');
        tarjetaProducto.className = 'col-md-4 mb-4';
        tarjetaProducto.innerHTML = `
            <div class="card h-100">
                <img src="${producto.image}" class="card-img-top imagen-producto" alt="${producto.title}">
                <div class="card-body">
                    <h5 class="card-title">${producto.title}</h5>
                    <div class="d-flex align-items-center mb-2">
                        ${mostrarValoracion(producto.rating)}
                        <small class="text-muted ms-2">(${producto.rating.count})</small>
                    </div>
                    <p class="card-text">${producto.description.substring(0, 60)}...</p>
                    <p class="fw-bold">$${producto.price.toFixed(2)}</p>
                </div>
            </div>
        `;
        contenedorProductos.appendChild(tarjetaProducto);
    });
}

document.addEventListener('DOMContentLoaded', obtenerProductos);