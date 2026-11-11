// Guarda y lee los productos: en Supabase, o (si no está configurado) en este navegador ("modo prueba").
const DB = (() => {
  const cfg = window.DELFI_CONFIG || {};
  const modo = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY ? 'supabase' : 'demo';

  let _sb = null;
  function sb() {
    if (_sb) return _sb;
    if (!window.supabase) throw new Error('No hay conexión a internet. Probá de nuevo en un rato.');
    _sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    return _sb;
  }
  const chk = r => { if (r.error) throw new Error(r.error.message); return r.data; };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const ordenar = lista => lista.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  // ---------- Modo prueba ----------
  const KEY = 'delfi_demo_v2';
  function leer() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* sin acceso */ }
    if (!d) { d = { productos: ejemplos() }; escribir(d, true); }
    return d;
  }
  function escribir(d, silencio) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); }
    catch (e) { if (!silencio) throw new Error('No hay más lugar en este navegador para fotos (modo prueba).'); }
  }
  function ejemplos() {
    const r = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
    const p = (nombre, categoria, precio, talles, colores, descripcion) =>
      ({ id: uid(), nombre, categoria, precio, talles, colores, descripcion, foto_url: '', activo: true, creado: new Date().toISOString() });
    return [
      p('Runner Pro', 'zapatilla', 89990, r(38, 44), 'Negro, Blanco', 'Liviana, ideal para caminar o correr.'),
      p('Urbana Kids', 'zapatilla', 45990, r(22, 34), 'Azul, Rosa', 'Para chicos, con abrojo.'),
      p('Clásica de lona', 'zapatilla', 39990, r(35, 45), 'Blanco', ''),
      p('Ojota Playa', 'ojota', 15990, ['35/36', '37/38', '39/40', '41/42', '43/44'], 'Negro, Celeste', 'De goma, súper cómoda.'),
    ];
  }

  const auth = {
    async sesion() {
      if (modo === 'demo') return { demo: true };
      return chk(await sb().auth.getSession()).session;
    },
    async login(email, password) { if (modo === 'supabase') chk(await sb().auth.signInWithPassword({ email, password })); },
    async logout() { if (modo === 'supabase') await sb().auth.signOut(); },
    // Manda el mail con el enlace para poner una clave nueva
    async recuperar(email, volverA) {
      if (modo !== 'supabase') throw new Error('En modo prueba no hace falta clave.');
      chk(await sb().auth.resetPasswordForEmail(email, { redirectTo: volverA }));
    },
    // Guarda la clave nueva (después de tocar el enlace del mail)
    async nuevaClave(password) {
      if (modo !== 'supabase') return;
      chk(await sb().auth.updateUser({ password }));
    },
  };

  const productos = {
    async listar({ soloVisibles = false } = {}) {
      if (modo === 'supabase') {
        let q = sb().from('productos').select('*').order('nombre');
        if (soloVisibles) q = q.eq('activo', true);
        return chk(await q);
      }
      return ordenar(leer().productos.filter(p => !soloVisibles || p.activo));
    },
    async guardar(p) {
      const fila = {
        nombre: p.nombre.trim(), categoria: p.categoria, precio: Number(p.precio) || 0,
        talles: (p.talles || []).slice().sort(ordenTalle), colores: (p.colores || '').trim(),
        descripcion: (p.descripcion || '').trim(), foto_url: p.foto_url || '', activo: !!p.activo,
      };
      if (modo === 'supabase') {
        if (p.id) return chk(await sb().from('productos').update(fila).eq('id', p.id));
        return chk(await sb().from('productos').insert(fila));
      }
      const d = leer();
      if (p.id) Object.assign(d.productos.find(x => x.id === p.id), fila);
      else d.productos.push({ id: uid(), creado: new Date().toISOString(), ...fila });
      escribir(d);
    },
    async borrar(id) {
      if (modo === 'supabase') return chk(await sb().from('productos').delete().eq('id', id));
      const d = leer();
      d.productos = d.productos.filter(p => p.id !== id);
      escribir(d);
    },
    async subirFoto(blob) {
      if (modo === 'supabase') {
        const ruta = `${uid()}.jpg`;
        chk(await sb().storage.from('fotos').upload(ruta, blob, { contentType: 'image/jpeg' }));
        return sb().storage.from('fotos').getPublicUrl(ruta).data.publicUrl;
      }
      return new Promise((ok, mal) => {
        const r = new FileReader();
        r.onload = () => ok(r.result);
        r.onerror = () => mal(new Error('No se pudo leer la foto'));
        r.readAsDataURL(blob);
      });
    },
  };

  function reiniciarPrueba() { try { localStorage.removeItem(KEY); } catch (e) { /* nada */ } }

  return { modo, auth, productos, reiniciarPrueba };
})();
