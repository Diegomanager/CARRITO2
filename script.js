

import { createClient } from 'npm:@supabase/supabase-js@2'



// Configuración de Supabase
const supabaseUrl = 'https://iouclhdwsrnwpgisuptb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWNsaGR3c3Jud3BnaXN1cHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDA1MzcsImV4cCI6MjA2OTkxNjUzN30.pSwYpr4YiqzBv2RLQbIqTPOzvO6kF52UQbMPoXSxCVc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Clases para manejar productos y carrito
class Producto {
  constructor(id, nombre, precio, stock, imagen_url) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.imagen_url = imagen_url;
  }
}

class Carrito {
  constructor() {
    this.productos = [];
  }

  agregarProducto(producto, cantidad = 1) {
    const productoExistente = this.productos.find(p => p.producto.id === producto.id);
    
    if (productoExistente) {
      if (productoExistente.cantidad + cantidad > producto.stock) {
        alert(`No hay suficiente stock de ${producto.nombre}`);
        return false;
      }
      productoExistente.cantidad += cantidad;
    } else {
      if (cantidad > producto.stock) {
        alert(`No hay suficiente stock de ${producto.nombre}`);
        return false;
      }
      this.productos.push({ producto, cantidad });
    }
    
    producto.stock -= cantidad;
    return true;
  }

  calcularTotal() {
    return this.productos.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  }

  vaciarCarrito() {
    this.productos = [];
  }
}

const carrito = new Carrito();

// Funciones principales
async function cargarProductos() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    
    return data.map(p => new Producto(
      p.id,
      p.nombre,
      p.precio,
      p.stock,
      p.imagen_url
    ));
  } catch (error) {
    console.error('Error al cargar productos:', error);
    alert('Error al cargar los productos. Por favor recarga la página.');
    return [];
  }
}

function renderizarProductos(productos) {
  const container = document.querySelector('.cards-container');
  container.innerHTML = '';

  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio.toFixed(2)}</p>
      <button class="btn-agregar" data-id="${producto.id}" 
        ${producto.stock <= 0 ? 'disabled' : ''}>
        ${producto.stock <= 0 ? 'Sin stock' : 'Añadir al carrito'}
      </button>
      ${producto.stock <= 0 ? '' : `<small>Disponibles: ${producto.stock}</small>`}
    `;
    container.appendChild(card);
  });

  // Agregar eventos a los botones
  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.id;
      const producto = productos.find(p => p.id === productId);
      
      if (producto && carrito.agregarProducto(producto)) {
        actualizarCarrito();
        // Actualizar el stock mostrado
        const stockDisponible = producto.stock;
        btn.disabled = stockDisponible <= 0;
        if (btn.nextElementSibling) {
          btn.nextElementSibling.textContent = stockDisponible > 0 ? 
            `Disponibles: ${stockDisponible}` : '';
        }
      }
    });
  });
}

function actualizarCarrito() {
  document.getElementById('total-carrito').textContent = 
    `$${carrito.calcularTotal().toFixed(2)}`;
}

async function finalizarCompra() {
  if (carrito.productos.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  try {
    // Registrar la compra en Supabase
    const { data, error } = await supabase
      .from('compras')
      .insert([{
        productos: carrito.productos,
        total: carrito.calcularTotal(),
        fecha: new Date().toISOString()
      }]);

    if (error) throw error;

    // Actualizar stock en la base de datos
    const updates = carrito.productos.map(item => 
      supabase
        .from('productos')
        .update({ stock: item.producto.stock })
        .eq('id', item.producto.id)
    );

    await Promise.all(updates);

    // Mostrar resumen
    let resumen = '¡Compra realizada con éxito!\n\n';
    carrito.productos.forEach(item => {
      resumen += `${item.producto.nombre} x${item.cantidad} - $${(item.producto.precio * item.cantidad).toFixed(2)}\n`;
    });
    resumen += `\nTotal: $${carrito.calcularTotal().toFixed(2)}`;
    
    alert(resumen);
    carrito.vaciarCarrito();
    actualizarCarrito();
    
    // Recargar productos para actualizar stocks
    const productosActualizados = await cargarProductos();
    renderizarProductos(productosActualizados);
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    alert('Ocurrió un error al procesar tu compra. Por favor intenta nuevamente.');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Configurar evento del carrito
  document.querySelector('.carrito').addEventListener('click', finalizarCompra);

  // Cargar y mostrar productos
  const productos = await cargarProductos();
  renderizarProductos(productos);
});