# Recibite en la UCU · Búsqueda del Tesoro AR

Juego de realidad aumentada con A-Frame 1.6.0 + AR.js 3.4.8 (marcadores de patrón).

## Estructura

```
web/                 → lo que se sube a GitHub Pages
  index.html         → escena AR, marcadores y pantallas
  style.css
  textures.js        → textos que se ven en 3D (diapositivas, diploma, sellos)
  game.js            → lógica: escolaridad, minijuegos, defensa, graduación
  markers/*.patt     → patrones de los 4 marcadores
  data/camera_para.dat
imprimir/            → NO subir: marcadores para imprimir
```

## Publicar en GitHub Pages

1. Creá un repo público en GitHub (ej. `ar-tesoro-ucu`).
2. Subí el **contenido** de la carpeta `web/` a la raíz del repo (que `index.html` quede en la raíz).
3. En el repo: Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. En un par de minutos queda en `https://TU-USUARIO.github.io/ar-tesoro-ucu/`. Esa es la URL a entregar.

## Probar antes de pegar los marcadores

- Abrí la URL en el celular (Chrome en Android, Safari en iPhone) y aceptá la cámara.
- Abrí `imprimir/marcador-*.png` en la pantalla de la compu y apuntale con el celular.
- Para empezar de cero: Escolaridad → "Reiniciar partida".

## Marcadores

| Lugar | Archivo | Letra |
|---|---|---|
| Edificio San José · piso 4, en los sillones | pingpong | Z |
| Auditorio del piso 2 | aulamagna | A |
| Cantina | cantina | G |
| Piso 3 · salón 301 | biblioteca | J |

Imprimir `marcadores-para-imprimir.pdf` al 100 %, plastificar y no tapar el borde blanco.

## Dónde cambiar cosas

- Acertijos, pistas y nombres de materias: `MATERIAS` en `game.js`.
- Preguntas del tribunal: `PREGUNTAS` en `game.js` (si cambiás un dato, cambialo también en `textures.js`).
- Dificultad del ping pong: `PP_MIN` / `PP_MAX` y la duración en `ppCuadro`.
