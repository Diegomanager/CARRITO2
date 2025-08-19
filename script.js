import { createClient } from 'npm:@supabase/supabase-js@2'



async function getCarrito() {
  const { data, error } = await supabase
    .from('carritos')
    .select('*')
    .eq('id', CARRITO_ID)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.productos : [];
}

async function setCarrito(productos) {
  // UPSERT: inserta o actualiza el carrito
  const { error } = await supabase
    .from('carritos')
    .upsert([{ id: CARRITO_ID, productos }]);
  if (error) throw error;
}

async function cargarProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

function renderizarProductos(productos, carrito) {
  const container = document.querySelector('.cards-container');
  container.innerHTML = '';
  productos.forEach(producto => {
    const enCarrito = carrito.find(p => p.id === producto.id);
    const stockDisponible = producto.stock - (enCarrito ? enCarrito.cantidad : 0);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio.toFixed(2)}</p>
      <button class="btn-agregar" data-id="${producto.id}" 
        ${stockDisponible <= 0 ? 'disabled' : ''}>
        ${stockDisponible <= 0 ? 'Sin stock' : 'Añadir al carrito'}
      </button>
      ${stockDisponible <= 0 ? '' : `<small>Disponibles: ${stockDisponible}</small>`}
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.id;
      await agregarProductoAlCarrito(productId);
    });
  });
}

async function agregarProductoAlCarrito(productId) {
  // Obtener productos y carrito actualizados
  const [productos, carrito] = await Promise.all([cargarProductos(), getCarrito()]);
  const producto = productos.find(p => p.id === productId);
  if (!producto) return;

  const enCarrito = carrito.find(p => p.id === productId);
  const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
  if (producto.stock - cantidadEnCarrito <= 0) {
    alert(`No hay suficiente stock de ${producto.nombre}`);
    return;
  }

  // Actualizar carrito en Supabase
  let nuevoCarrito;
  if (enCarrito) {
    enCarrito.cantidad += 1;
    nuevoCarrito = carrito;
  } else {
    nuevoCarrito = [...carrito, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }];
  }
  await setCarrito(nuevoCarrito);
  actualizarCarrito(nuevoCarrito);
  renderizarProductos(productos, nuevoCarrito);
}

function calcularTotal(carrito) {
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function actualizarCarrito(carrito) {
  document.getElementById('total-carrito').textContent = 
    `$${calcularTotal(carrito).toFixed(2)}`;
}

async function finalizarCompra() {
  const carrito = await getCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  try {
    // Registrar la compra
    const { error } = await supabase
      .from('compras')
      .insert([{
        productos: carrito,
        total: calcularTotal(carrito),
        fecha: new Date().toISOString()
      }]);
    if (error) throw error;

    // Actualizar stock en la base de datos
    const productos = await cargarProductos();
    const updates = carrito.map(item => {
      const producto = productos.find(p => p.id === item.id);
      return supabase
        .from('productos')
        .update({ stock: producto.stock - item.cantidad })
        .eq('id', item.id);
    });
    await Promise.all(updates);

    // Limpiar carrito
    await setCarrito([]);
    actualizarCarrito([]);
    const productosActualizados = await cargarProductos();
    renderizarProductos(productosActualizados, []);
    alert('¡Compra realizada con éxito!');
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    alert('Ocurrió un error al procesar tu compra. Por favor intenta nuevamente.');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('.carrito').addEventListener('click', finalizarCompra);
  const [productos, carrito] = await Promise.all([cargarProductos(), getCarrito()]);
  renderizarProductos(productos, carrito);
  actualizarCarrito(carrito);
});
