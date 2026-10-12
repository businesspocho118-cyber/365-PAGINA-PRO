# 365 Archivo privado

Web privada en Next.js para acompañar un libro físico de 365 días.

## Correr localmente

```bash
pnpm install
pnpm run dev
```

Abrí `http://localhost:3000`.

## Llave privada

Configurá la llave antes de publicar:

```bash
SITE_ACCESS_CODE="tu-llave-privada"
```

Si la variable no existe, la llave local por defecto es `365`.

## Validación

```bash
pnpm run lint
pnpm run build
```

## Notas

- El progreso de fases se guarda en `localStorage`.
- Las respuestas aceptadas viven en código server-only y no se importan desde el cliente.
- El sitio incluye `robots.txt` y headers `noindex`.
