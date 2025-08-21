class Producto {
    constructor(nombre, precio, cantidadEnStock) {
        this.nombre = nombre;
        this.precio = precio;
        this.cantidadEnStock = cantidadEnStock;
    }
}

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
        cardBody.appendChild(img);
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







