# DELFI — Zapatillería

Página súper simple, con dos partes:

| Archivo | Qué es |
|---|---|
| `index.html` | **La página para los clientes.** Ven las zapatillas y ojotas, eligen el talle y mandan el pedido por WhatsApp. |
| `admin.html` | **"Mis productos".** Acá se agregan los productos, se ponen las fotos, se cambian los precios y se marcan los talles que hay. |

Los demás archivos (`estilos.css`, `comun.js`, `db.js`, `config.js`) tienen que estar en la misma carpeta.
`supabase.sql` se usa una sola vez, para preparar la base de datos.

---

## Cómo se usa "Mis productos"

- **Agregar:** tocá **"➕ Agregar un producto"**.
  - 📷 **Sacar foto**, o 🖼️ **Elegir foto** si ya la tenés guardada.
  - Elegí si es **Zapatilla** u **Ojota**.
  - Poné el **nombre** y el **precio**.
  - Tocá los **talles que hay**. Se ponen rosas.
  - Apretá **💾 Guardar**.
- **Cambiar precio, foto o talles:** tocá el producto, cambiá lo que quieras y **Guardar**.
- **Que no se vea un tiempo** (por ejemplo, si se agotó): sacale la tilde a **"Que se vea en la página"**.
- **Borrar:** tocá el producto y abajo de todo está **"🗑️ Borrar este producto"**.

---

## Antes de publicarlo

1. **WhatsApp:** en `config.js` poné el número del local, solo números y con 549 adelante (ej: `5491122334455`).
2. **Supabase**, para que los productos queden guardados en internet:
   1. En https://supabase.com creá un **proyecto nuevo**, por ejemplo `delfi`. Tiene que ser aparte del de FERRE.
   2. Andá a **SQL Editor → New query**, pegá todo `supabase.sql` y apretá **Run**.
   3. En **Authentication → Users → Add user** creá el usuario con email y contraseña. Tildá "Auto confirm".
   4. En **Authentication → Sign In / Providers** desactivá "Allow new users to sign up".
   5. En **Project Settings → API** copiá la **Project URL** y la clave **anon / publishable**, y pegalas en `config.js`.
3. **Publicar:** creá un repositorio nuevo en GitHub, por ejemplo `delfi`, y subí los archivos igual que con FERRE.
   - La página queda en `https://TU-USUARIO.github.io/delfi/`
   - "Mis productos" queda en `https://TU-USUARIO.github.io/delfi/admin.html`. Se entra una sola vez con el email y la contraseña, y después queda abierto.

Mientras no esté configurado Supabase, funciona en **modo prueba**: lo que cargues queda guardado solo en esa compu.
