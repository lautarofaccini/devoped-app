# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


A continuación encontrarás una guía paso a paso para extender tu suite de pruebas con **tests de integración** y **tests E2E** (end-to-end) en tu proyecto React+Vite con Vitest. Incluiremos:

1. **Qué son y para qué sirven**
2. **Cómo montar tests de integración** usando Vitest (o Jest)
3. **Cómo montar tests E2E** usando Playwright (o Cypress)
4. **Cómo disparar esas pruebas en CI**

---

## 1. Conceptos clave

1. **Unit Tests (ya tienes Vitest)**

   * Verifican piezas pequeñas e independientes (funciones puras, componentes aislados).
   * Corren en ambiente simulado (por ejemplo, `jsdom`), rápido y sin levantar servidor ni navegador real.

2. **Integration Tests**

   * Integran varios módulos/partes de la aplicación juntos.
   * Pueden implicar:

     * Llamar a rutas internas de tu API (si tuvieras backend).
     * Renderizar un componente con sus subcomponentes y verificar su comportamiento conjunto.
     * Probar hooks personalizados que dependen de varios servicios.
   * Sigues usando Vitest (o Jest) pero, en lugar de “renderizar un `<Botón/>` aislado”, renderizas un `<Formulario/>` completo con su lógica de validación, o bien “levantas” un servidor de prueba y chequeas la comunicación front→back.

3. **E2E Tests (End-to-End)**

   * Simulan el flujo de usuario completo, normalmente en un navegador real o headless.
   * Abren tu aplicación real (o un build de prueba), interactúan con botones, inputs, navegan entre páginas, y validan que todo funcione como si realmente un usuario estuviera usando la app.
   * Requieren un runner de navegador (Chrome, Chromium, Firefox, WebKit) y scripts de automatización.

---

## 2. Tests de Integración con Vitest

### 2.1. Elección de librería

* **Vitest** (ya lo usas para unit) permite tests de integración del mismo modo, porque tu entorno `jsdom` puede renderizar componentes con React Testing Library y combinar lógica de varios hooks o API mocks.
* Si tuvieras un backend en Node (Express, Fastify, etc.), podrías arrancar un servidor “in-memory” en un `beforeAll()` y hacer requests HTTP desde Vitest usando `supertest`.

En esta guía asumiremos que deseas **probar componentes React que interactúan entre sí**, o bien **módulos puros de lógica**.

### 2.2. Estructura de carpetas

Una posible organización:

```
/project
  /src
    /components
      Calculator.jsx
      ...
    /hooks
      useAuth.js
      ...
    /api
      client.js      ← (axios/fetch client)
      …
    App.jsx
  /test            ← ← ← carpeta para todos tus tests
    /unit
      react.test.jsx
      fizzbuzz.test.js
      canReconfigure.test.js
    /integration
      Calculator.integration.test.jsx
      Auth.integration.test.js
    /e2e            ← (ver más adelante)
```

* `/test/unit`: unit tests que ya tienes.
* `/test/integration`: nuevos tests que integran múltiples módulos.
* `/test/e2e`: scripts E2E (Playwright, Cypress).

### 2.3. Configurar Vitest para integración

1. **Asegúrate de tener `vitest.config.js` con `environment: 'jsdom'`:**

   ```js
   // vitest.config.js
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: './test/setup.ts', // si necesitás mocks globales
       coverage: { reporter: ['text', 'lcov'] },
       include: ['test/**/*.test.{js,jsx,ts,tsx}'],
     },
   });
   ```

   * De este modo, Vitest podrá renderizar vía Testing Library tus componentes React con DOM simulado.

2. **Instala dependencias necesarias** (si no las tienes ya):

   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event supertest
   ```

3. **Ejemplo de Integration Test para tu `Calculator`**

   * Supongamos que quieres probar que:

     1. El componente entero (con botones, input y cálculo) funcione de punta a punta, sin mockear nada.
     2. Verificar que al hacer “1 + 1 =” aparece `2`.
   * En `/test/integration/Calculator.integration.test.jsx`:

   ```jsx
   import { render, screen } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { describe, it, expect, beforeEach } from 'vitest';
   import { Calculator, equalSign } from '../../src/Calculator';

   describe('Calculator Integration', () => {
     beforeEach(() => {
       // Si tuvieras que reiniciar algún estado global, se hace aquí.
     });

     it('performs a simple addition from start to finish', async () => {
       render(<Calculator />);

       // Compruebo que el h1 sigue siendo el correcto
       screen.getByText('Calculator'); // si tuviste que revertir el título

       const one = screen.getByText('1');
       const plus = screen.getByText('+');
       const equal = screen.getByText(equalSign);

       await userEvent.click(one);
       await userEvent.click(plus);
       await userEvent.click(one);
       await userEvent.click(equal);

       const input = screen.getByRole('textbox');
       expect(input.value).toBe('2');
     });
   });
   ```

   * En este test no “mockeamos” `evaluate` ni nada: renderizamos el componente, hacemos clicks reales (con `userEvent`) y comprobamos el resultado.
   * **Distingue** este test de tus unit tests porque:

     * En unit, probablemente aislás solo un botón o función pura.
     * En integración, chequeás el flujo que une todo: renderizado + `handleClick` + `evaluate`.

4. **Integration Test de un Hook o API cliente**

   * Si tuvieras un hook `useWeather` que hace un `fetch('/api/weather')`, podrías “levantar” un servidor mock con `msw` (Mock Service Worker) dentro de Vitest.

   * Ejemplo rápido (sin msw, solo supertest, asumiendo que tu API Express está en `src/server.js`):

     ```js
     // test/integration/Auth.integration.test.js
     import request from 'supertest';
     import { describe, it, expect, beforeAll, afterAll } from 'vitest';
     import createServer from '../../src/server'; // tu app Express

     let server, app;

     beforeAll(async () => {
       // inicilizar tu servidor en un puerto random
       ({ app, server } = await createServer(/* opciones: PUERTO=0 */));
     });

     afterAll(async () => {
       await server.close();
     });

     describe('Auth API Integration', () => {
       it('returns 200 + token cuando credenciales son correctas', async () => {
         const response = await request(app)
           .post('/api/login')
           .send({ username: 'test', password: '1234' });
         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('token');
       });

       it('rechaza con 401 cuando credenciales son incorrectas', async () => {
         const response = await request(app)
           .post('/api/login')
           .send({ username: 'test', password: 'mala' });
         expect(response.status).toBe(401);
       });
     });
     ```

   * En este test estamos **integrando tu servidor Express completo**:

     1. Lo iniciamos en `beforeAll`.
     2. Con `supertest` (client HTTP) enviamos peticiones reales a `/api/login`.
     3. Verificamos respuestas sin tocar la base real (puedes configurar un “in-memory DB” o mocks de repositorio).

---

## 3. Tests E2E (End-to-End) con Playwright

Para simular al usuario abriendo tu app completa (por ejemplo, en `http://localhost:3000` tras un `npm run dev`) y navegando en el navegador real, lo más común es usar **Playwright** (también podrías optar por **Cypress**; aquí mostraremos Playwright ya que se integra bien con Vite y Vitest si quisieras).

### 3.1. Instalación de Playwright

1. Desde la rama de tu proyecto:

   ```bash
   npm install --save-dev @playwright/test
   ```

2. Inicializa Playwright (opcional, para que descargue binarios y cree un archivo de configuración inicial):

   ```bash
   npx playwright install
   npx playwright init
   ```

   * Esto crea, por ejemplo, `playwright.config.ts` y la carpeta `tests/` con ejemplos.
   * Asegúrate de que en `playwright.config.ts` el **`webServer`** esté apuntando a tu “dev server” de Vite.

### 3.2. Configuración básica de Playwright

Edita (o crea) `playwright.config.ts` en la raíz:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  reporter: 'html', // podrías usar 'list', 'dot', 'json', etc.
  use: {
    actionTimeout: 0,
    navigationTimeout: 30 * 1000,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },
  // Levanta tu servidor de desarrollo antes de correr tests E2E:
  webServer: {
    command: 'npm run dev',   // o "npm start" si tuviste configurado así
    port: 5173,               // puerto donde Vite sirve por defecto
    reuseExistingServer: !process.env.CI, // en CI, siempre arranca uno nuevo
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

* `testDir: './test/e2e'`: guarda tus tests E2E en `test/e2e/`.
* `webServer`: arranca Vite en `npm run dev` (o el script que uses) en `localhost:5173`. En CI, como no hay dev server corriendo, arranca uno automáticamente.

### 3.3. Escribir un test E2E de ejemplo

Crea la carpeta `test/e2e` si no existe y dentro un archivo, por ejemplo `Calculator.e2e.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Calculator E2E', () => {
  // La configuración de webServer en playwright.config.ts ya levanta la app en localhost:5173 antes de estas pruebas.

  test('should show "Calculator" en el título y poder sumar 2 números', async ({ page }) => {
    await page.goto('/'); // Vite sirve la app en la raíz

    // Verificar que el título sea “Calculator”
    await expect(page.locator('h1')).toHaveText('Calculator');

    // Hacer clic en 1, +, 1, =
    await page.click('text=1');
    await page.click('text=+');
    await page.click('text=1');
    await page.click('text==');

    // Verificar que el input muestre “2”
    await expect(page.locator('input[readonly]')).toHaveValue('2');
  });
});
```

Detalles:

* `page.locator('h1')` selecciona el `h1`. `toHaveText('Calculator')` espera que su texto sea exactamente ese.
* `page.click('text=1')` hace click sobre el botón “1” (Playwright busca un elemento cuyo texto contenga “1”).
* Para el “=”, usamos `text==` (se escapa el `=`).
* Finalmente, chequeamos el `value` del `<input readonly>`.

### 3.4. Scripts NPM

Añade en tu `package.json`:

```jsonc
{
  "scripts": {
    // ya tenías:
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    // Agrega:
    "test:integration": "vitest --config vitest.config.js --testNamePattern \"integration\"",
    "test:e2e": "playwright test",
    "test:ci": "vitest --coverage && playwright test",
  }
}
```

* `test:integration` podría ejecutarse igual que `npm test`, pero aquí etiqueta tus tests de integración con `.integration.test.` para diferenciarlos si quisieras.
* `test:e2e` lanza Playwright y levanta la app automáticamente (por `webServer`) antes de ejecutar.
* `test:ci` corre todo: primero Vitest (unit + integración) y luego Playwright (E2E).

---

## 4. Integrar Integration + E2E en GitHub Actions

Querrás que, antes de cualquier despliegue, corran:

1. **Unit & Integration (Vitest)**
2. **E2E (Playwright)**

En `.github/workflows/node.js.yml`, extiende los jobs:

```yaml
name: Node.js CI

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main"]

jobs:
  test:
    name: Run unit & integration tests
    runs-on: self-hosted
    strategy:
      matrix:
        node-version: [22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run Vitest (unit + integration)
        run: npm test
        # Asume que Vitest encuentre tanto los unit tests en /test/unit
        # como los integration tests en /test/integration

      - name: Run Playwright E2E
        # Esto levanta Vite (por webServer) y lanza los E2E
        run: npm run test:e2e

  deploy:
    name: Build & Deploy (PM2)
    runs-on: self-hosted
    needs: test
    if: github.event_name == 'push'
    strategy:
      matrix:
        node-version: [22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build (Vite)
        run: npm run build --if-present

      - name: Reload application via PM2
        run: pm2 reload 0
```

* **Job `test`**

  1. Instala dependencias.
  2. Corre `npm test` (Vitest) para todos los unit + integration.
  3. Corre `npm run test:e2e` (Playwright), que justo levanta tu app de Vite y ejecuta los E2E.

  * Si algun paso falla (unit, integración o E2E), el job marca **failure** y `deploy` nunca arranca.

* **Job `deploy`**

  * Solo se ejecuta en **push** (no en PR).
  * Tiene `needs: test`, por lo que solo corre si todos los tests pasaron.
  * Construye (`npm run build`) y recarga tu instancia PM2.

---

## 5. Resumen del Flujo Completo

1. **Desarrollo local**

   * `npm test` → unit + integration (Vitest).
   * `npm run test:e2e` → pruebas E2E (Playwright).
   * Corrés `npm run dev` y ves que todo pase antes de commitear.

2. **En GitHub Actions**

   * **Pull Request → Job `test`**

     * Se clona el repo, se instala, se corre `npm test` (Vitest).
     * Luego `npm run test:e2e` (Playwright levanta Vite en background y corre E2E).
     * Si cualquiera falla: ❌ el job `test` finaliza en error, **no se hace build ni deploy**, y tu rama en staging/no-prod no se ve afectada.

   * **Push a `main` → Job `test` + Job `deploy`**

     * `test` corre igual que en PR (unit + integration + E2E).
     * Si todo pasa, `deploy` se dispara y hace:

       1. `npm run build`
       2. `pm2 reload 0` → Actualiza tu servidor con el último build.

3. **De esta forma**:

   * **Jamás** se construye ni se recarga PM2 si tus tests unitarios, de integración o E2E fallan.
   * Al abrir un PR, el único efecto es “run tests”; tu servidor de producción no se ve modificado.
   * Solo al hacer merge/push a `main` con tests verdes se hace build+deploy.

---

## 6. Consideraciones Adicionales

1. **Mocks y Datos de Prueba**

   * En integration tests, usa mocks para servicios externos (por ejemplo, `msw` o mock de axios).
   * Para E2E, podrías poblar una base de datos de prueba antes de correr (`beforeAll` en Playwright), o reutilizar fixtures.

2. **Separar Responsabilidades**

   * Mantén claramente diferenciados los test unitarios, de integración y los E2E; nómbralos con sufijos `.unit.test.js`, `.integration.test.jsx`, `.e2e.spec.ts`, etc.

3. **Duración de los Tests**

   * **Unit/Integration (Vitest)**: suelen correr muy rápido (milisegundos a segundos).
   * **E2E (Playwright)**: tardan más (varios segundos) porque abren un navegador real.
   * Ajusta timeouts en `playwright.config.ts` si tu app tarda en arrancar.

4. **Reportes y Coverage**

   * Vitest te genera cobertura de unit+integration automáticamente si agregas `--coverage`.
   * Playwright puede generar reportes HTML (configurado en `reporter: 'html'`) para revisar red de pasos E2E.

5. **Monitoreo en CI**

   * Agrega badges en tu `README.md` para mostrar “Tests passing” y “E2E passing” basados en los reportes de GitHub Actions.

---

### Conclusión

* **Integration Tests**: se construyen sobre Vitest + Testing Library. Renderizas componentes completos o levantas un servidor HTTP interiormente (supertest) para verificar flujos que involucran varios módulos.
* **E2E Tests**: se hacen con Playwright (o Cypress). Levantas tu app real (Vite) y, con scripts de Playwright, emulas clics, navegación, validas resultados en DOM.
* En tu **workflow de GitHub Actions**, separas:

  * `job: test` (unit + integration + e2e) que corre en PR y en push,
  * `job: deploy` (build + pm2 reload) que solo corre en `push` **si** `test` pasó.

Siguiendo estos pasos, tendrás una cobertura robusta: si cualquier parte de tu aplicación deja de comportarse (un componente, tu API o todo el flujo en el navegador), GitHub Actions detendrá el pipeline y nunca desplegarás código roto a producción. ¡Éxitos!
