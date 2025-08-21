import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 🔑 Conecta con tu proyecto Supabase
const supabase = createClient('https://TU-PROYECTO.supabase.co', 'TU-CLAVE-PUBLICA');

let currentUser = null;

// 🟢 Obtener usuario logueado
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (!user) {
    alert("Debes iniciar sesión para usar el carrito");
  }
  return user;
}

// 🟢 Obtener carrito del usuario
async function getCarrito() {
  if (!currentUser) return [];
  const { data, error } = await supabase
    .from('carritos')
    .select('productos')
    .eq('user_id', currentUser.id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.productos : [];
}

// 🟢 Guardar carrito en Supabase
async function setCarrito(productos) {
  if (!currentUser) return;
  const { error } = await supabase
    .from('carritos')
    .upsert([{ user_id: currentUser.id, productos }]);
  if (error) throw error;
}

// 🟢 Cargar productos desde la BD
async function cargarProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

// 🟢 Renderizar productos
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
      <button class="btn-agregar" data-id="${producto.id}" ${stockDisponible <= 0 ? 'disabled' : ''}>
        ${stockDisponible <= 0 ? 'Sin stock' : 'Añadir al carrito'}
      </button>
      ${stockDisponible > 0 ? `<small>Disponibles: ${stockDisponible}</small>` : ''}
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = parseInt(btn.dataset.id, 10);
      await agregarProductoAlCarrito(productId);
    });
  });
}

// 🟢 Renderizar carrito
function renderizarCarrito(carrito) {
  const contenedor = document.querySelector('.lista-carrito');
  contenedor.innerHTML = '';
  carrito.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    contenedor.appendChild(li);
  });
}

// 🟢 Agregar producto al carrito
async function agregarProductoAlCarrito(productId) {
  const [productos, carrito] = await Promise.all([cargarProductos(), getCarrito()]);
  const producto = productos.find(p => p.id === productId);
  if (!producto) return;

  const enCarrito = carrito.find(p => p.id === productId);
  const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;

  if (producto.stock - cantidadEnCarrito <= 0) {
    alert(`No hay suficiente stock de ${producto.nombre}`);
    return;
  }

  let nuevoCarrito;
  if (enCarrito) {
    enCarrito.cantidad += 1;
    nuevoCarrito = carrito;
  } else {
    nuevoCarrito = [...carrito, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }];
  }

  await setCarrito(nuevoCarrito);
  actualizarCarrito(nuevoCarrito);
  renderizarCarrito(nuevoCarrito);
  renderizarProductos(productos, nuevoCarrito);
}

// 🟢 Calcular total
function calcularTotal(carrito) {
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// 🟢 Actualizar total carrito
function actualizarCarrito(carrito) {
  document.getElementById('total-carrito').textContent =
    `$${calcularTotal(carrito).toFixed(2)}`;
}

// 🟢 Finalizar compra
async function finalizarCompra() {
  const carrito = await getCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  try {
    const { error } = await supabase
      .from('compras')
      .insert([{
        user_id: currentUser.id,
        productos: carrito,
        total: calcularTotal(carrito),
        fecha: new Date().toISOString()
      }]);
    if (error) throw error;

    const productos = await cargarProductos();
    const updates = carrito.map(item => {
      const producto = productos.find(p => p.id === item.id);
      return supabase
        .from('productos')
        .update({ stock: producto.stock - item.cantidad })
        .eq('id', item.id);
    });
    await Promise.all(updates);

    await setCarrito([]);
    actualizarCarrito([]);
    renderizarCarrito([]);
    const productosActualizados = await cargarProductos();
    renderizarProductos(productosActualizados, []);
    alert('¡Compra realizada con éxito!');
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    alert('Ocurrió un error al procesar tu compra. Por favor intenta nuevamente.');
  }
}

// 🟢 Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  const user = await getUser();
  if (!user) return;

  document.querySelector('.carrito').addEventListener('click', finalizarCompra);

  const [productos, carrito] = await Promise.all([cargarProductos(), getCarrito()]);
  renderizarProductos(productos, carrito);
  renderizarCarrito(carrito);
  actualizarCarrito(carrito);
});
