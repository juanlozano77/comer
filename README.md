# Manual de Comercio Electrónico - Vue estático para GitHub Pages

## Qué es
Un lector estático hecho con Vue 3 por CDN, sin backend y sin base de datos.
GitHub Pages puede servirlo tal cual.

## Estructura
- `index.html`: punto de entrada
- `app.js`: app Vue
- `style.css`: estilos del lector
- `data/chapters.json`: índice de capítulos
- `data/*.json`: un archivo por capítulo
- `data/book-styles.css`: estilos originales del libro para que las páginas rendericen bien
- `404.html`: copia de `index.html`

## Probar local
Podés abrir `index.html` directamente, pero algunos navegadores bloquean `fetch()` desde `file://`.
Lo mejor es levantar un servidor estático.

### Python
```bash
python -m http.server 8000
```

Luego abrí:
```bash
http://127.0.0.1:8000
```

## Subir a GitHub Pages
1. Creá un repo.
2. Subí todos estos archivos a la raíz.
3. En GitHub, andá a **Settings > Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná la rama `main` y la carpeta `/root`.
6. Guardá.

## Navegación
Usa rutas hash:
- `#/` índice
- `#/chapter/cap1`
- `#/chapter/cap2`
etc.

Eso evita problemas de routing en GitHub Pages.