# Carrera Financiera PRO - Centro de Comando de Riqueza

Esta es una aplicación de finanzas personales de nivel profesional diseñada para ayudar a empresarios y personas con mentalidad de crecimiento a alcanzar la libertad financiera. Inspirada en los principios de "Cashflow", se enfoca en construir activos, generar ingresos pasivos y tomar decisiones estratégicas basadas en datos.

## Características Clave

- **Dashboard de CEO:** Métricas clave (KPIs), proyecciones y un Asesor IA que entrega un "Briefing Estratégico" diario.
- **Balance General Completo:** Seguimiento detallado de Cuentas de Efectivo, Activos de Inversión, Activos Patrimoniales y Pasivos.
- **Gestión de "Ventures":** Planifica y sigue la rentabilidad (P&L) de tus proyectos de inversión.
- **Automatización:** Gestiona y genera gastos recurrentes con un solo clic.
- **Estrategia de Deuda:** Un simulador para visualizar el impacto de pagos acelerados y ahorrar en intereses.
- **Entrada Rápida con IA:** Registra transacciones usando lenguaje natural.

---

## Configuración del Proyecto

Para ejecutar esta aplicación localmente o desplegarla, necesitarás Node.js y npm instalados.

### 1. Clonar el Repositorio

Primero, clona este repositorio en tu máquina local.

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instalar Dependencias

Instala todas las dependencias del proyecto usando npm.

```bash
npm install
```

### 3. Configurar la Clave de API de Gemini

Esta aplicación utiliza la API de Gemini para sus funciones de inteligencia artificial.

1.  Copia el archivo de ejemplo `.env.example` y renómbralo a `.env`.

    ```bash
    cp .env.example .env
    ```

2.  Abre el nuevo archivo `.env` en tu editor de texto.
3.  Reemplaza `TU_API_KEY_DE_GEMINI_AQUI` con tu clave de API real de Google AI Studio.

    ```
    VITE_GEMINI_API_KEY=TU_API_KEY_DE_GEMINI_AQUI
    ```

    **Importante:** El archivo `.env` está incluido en `.gitignore`, por lo que tu clave de API nunca se subirá a GitHub.

### 4. Ejecutar en Modo Desarrollo

Para iniciar el servidor de desarrollo local, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que se indique en la terminal).

---

## Despliegue en GitHub Pages

Sigue estos pasos para publicar tu aplicación como un sitio web público y gratuito usando GitHub Pages.

### 1. Crear un Repositorio en GitHub

Si aún no lo has hecho, crea un nuevo repositorio en tu cuenta de GitHub. **No** incluyas un `README.md` o `.gitignore` inicial, ya que este proyecto ya los tiene.

### 2. Configurar `package.json`

Abre el archivo `package.json` y edita la línea `"homepage"`. Reemplaza `https://tu-usuario.github.io/tu-repositorio` con la URL correcta de tu repositorio.

```json
"homepage": "https://tu-usuario.github.io/tu-repositorio",
```

### 3. Subir tu Código

Conecta tu repositorio local al repositorio remoto de GitHub y sube tu código.

```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git branch -M main
git push -u origin main
```

### 4. Desplegar

Ejecuta el script de despliegue. Este comando construirá la aplicación para producción y la publicará en una rama especial llamada `gh-pages` en tu repositorio.

```bash
npm run deploy
```

### 5. Configurar GitHub Pages

1.  Ve a tu repositorio en GitHub.
2.  Haz clic en la pestaña **"Settings"**.
3.  En el menú lateral, ve a **"Pages"**.
4.  En la sección "Build and deployment", bajo "Source", selecciona **"Deploy from a branch"**.
5.  Asegúrate de que la rama seleccionada sea `gh-pages` y la carpeta sea `/ (root)`.
6.  Haz clic en **"Save"**.

Después de unos minutos, tu aplicación estará en vivo en la URL que configuraste en el paso 2.

¡Listo! Tu "Cuartel General de Riqueza" ahora es accesible desde cualquier lugar.
