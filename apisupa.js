class Producto {
    constructor(nombre, precio, cantidadEnStock) {
        this.nombre = nombre;
        this.precio = precio;
        this.cantidadEnStock = cantidadEnStock;
    }
}


const url = 'https://iouclhdwsrnwpgisuptb.supabase.co/rest/v1/productos?select=*';
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWNsaGR3c3Jud3BnaXN1cHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDA1MzcsImV4cCI6MjA2OTkxNjUzN30.pSwYpr4YiqzBv2RLQbIqTPOzvO6kF52UQbMPoXSxCVc',
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWNsaGR3c3Jud3BnaXN1cHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDA1MzcsImV4cCI6MjA2OTkxNjUzN30.pSwYpr4YiqzBv2RLQbIqTPOzvO6kF52UQbMPoXSxCVc`
};

fetch(url, { headers })
    .then(response => response.json())
    .then(data => {
        console.log('Productos:', data);
        data.forEach((project) => {
        const projectId = project.id;
        const projectName = project.name;
        const projectImage = project.imagen;
        const projectTech = project.precio;
        const projectImgAlt = project.Description;

        // Crear elemento de columna
        const col = document.createElement('div');
        col.className = 'col-md-4';

        // Crear tarjeta
        const card = document.createElement('div');
        card.className = 'card h-100';

        // Cuerpo de la tarjeta
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Título
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = projectName;

        // imagen 
        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = projectImage;

        // Descripción
        const description = document.createElement('p');
        description.className = 'card-text';
        description.textContent = `Precio: $${projectTech}`;

        // Stock
        const stock = document.createElement('p');
        stock.className = 'card-text';
        stock.textContent = `Descripción: ${projectImgAlt}`;

        // Botón
        const button = document.createElement('button');
        button.className = 'btn btn-primary';
        button.textContent = 'Agrega al carrito';
        button.onclick = () => carrito.agregarProducto(project, 1);

        // Agregar elementos al cuerpo de la tarjeta
        cardBody.appendChild(title);
        cardBody.appendChild(description);
        cardBody.appendChild(stock);
        cardBody.appendChild(button);

        // Armar la tarjeta
        card.appendChild(cardBody);
        col.appendChild(card);

        // Agregar columna al contenedor de productos
        document.getElementById('productos').appendChild(col);
        });
    })
    .catch(error => {
        console.error('Error al obtener productos:', error);
});

// Generar productos dinámicamente
const productos = [
    new Producto('Producto 1', 100, 10, 'ruta/a/imagen1.jpg'),
    new Producto('Producto 2', 200, 5, 'ruta/a/imagen2.jpg'),
    new Producto('Producto 3', 150, 8, 'ruta/a/imagen3.jpg')
];

const productosContainer = document.getElementById('productos');

productos.forEach(data => {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const card = document.createElement('div');
    card.className = 'card h-100';

    const img = document.createElement('img');
    img.className = 'card-img-top';
    // Usa imagen por defecto si no está definida; reemplaza 'ruta/a/imagen_default.jpg' con la ruta real de tu imagen por defecto, por ejemplo: 'images/default.jpg'
    img.src = data.imagen ? data.imagen : 'images/default.jpg';
    img.alt = data.name;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = data.name;

    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = `Precio: ${data.precio}`;

    const stock = document.createElement('p');
    stock.className = 'card-text';
    stock.textContent = `Stock: ${data.cantidadEnStock}`;

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.textContent = 'Añadir al carrito';
    button.onclick = () => carrito.agregarProducto(producto, 1);

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(stock);
    cardBody.appendChild(button);

    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);

    productosContainer.appendChild(col);
});



