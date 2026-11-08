// Funciones que usan el catálogo y el panel.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const _fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const fmt = n => _fmt.format(Math.round(Number(n) || 0));
const num = v => { const n = Number(String(v ?? '').replace(/\./g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Talles para elegir con un toque
const TALLES = {
  zapatilla: Array.from({ length: 30 }, (_, i) => String(17 + i)),               // 17 al 46
  ojota: Array.from({ length: 15 }, (_, i) => `${17 + i * 2}/${18 + i * 2}`),     // 17/18 al 45/46
};

function ordenTalle(a, b) {
  const na = parseFloat(a), nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return String(a).localeCompare(String(b), 'es', { numeric: true });
}
const listaColores = p => String(p.colores || '').split(',').map(c => c.trim()).filter(Boolean);
function textoTalles(ts) {
  if (!ts || !ts.length) return 'Consultar talles';
  return ts.length > 4 ? `Talles del ${ts[0]} al ${ts[ts.length - 1]}` : `Talles ${ts.join(' · ')}`;
}

function fotoHTML(p, clase = '') {
  if (p.foto_url) return `<img class="${clase}" src="${esc(p.foto_url)}" alt="${esc(p.nombre)}" loading="lazy">`;
  return `<div class="${clase} sin-foto" aria-hidden="true">${p.categoria === 'ojota' ? '🩴' : '👟'}</div>`;
}

function toast(msg, tipo = 'ok') {
  let cont = $('#toasts');
  if (!cont) { cont = document.createElement('div'); cont.id = 'toasts'; document.body.appendChild(cont); }
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  t.textContent = msg;
  cont.appendChild(t);
  setTimeout(() => t.remove(), tipo === 'error' ? 6000 : 3000);
}

function abrirModal(html, clase = '') {
  cerrarModal();
  const fondo = document.createElement('div');
  fondo.className = 'modal-fondo';
  fondo.id = 'modal';
  fondo.innerHTML = `<div class="modal ${clase}" role="dialog" aria-modal="true"><button type="button" class="modal-x" aria-label="Cerrar" data-cerrar>×</button>${html}</div>`;
  fondo.addEventListener('click', e => { if (e.target === fondo || e.target.closest('[data-cerrar]')) cerrarModal(); });
  document.body.appendChild(fondo);
  document.body.classList.add('sin-scroll');
  return fondo.querySelector('.modal');
}
function cerrarModal() {
  const m = $('#modal');
  if (m) m.remove();
  document.body.classList.remove('sin-scroll');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

// Achica la foto antes de guardarla (más rápida y liviana).
function achicarImagen(file, max = 1000) {
  return new Promise((ok, mal) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo usar esa foto'))), 'image/jpeg', 0.82);
    };
    img.onerror = () => mal(new Error('Ese archivo no parece una foto'));
    img.src = url;
  });
}
