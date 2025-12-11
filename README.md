# NoveoMovil – Movilidad Accesible por Voz

Este proyecto es un prototipo de aplicación web para solicitar transporte accesible mediante comandos de voz.  
Incluye:
- Frontend en React (carpeta `dsproyecto`).
- Backend en Node.js/Express (carpeta `backend`).
- Base de datos MySQL para usuarios y autenticación.

---

## 1. Requisitos previos

Antes de ejecutar el proyecto, instale:

- Node.js 18 o superior  
- npm (incluido con Node.js)  
- MySQL Server (y un cliente como MySQL Workbench o phpMyAdmin)

---

## 2. Configuración de la base de datos MySQL

1. Inicie su servidor MySQL.
2.Crear la base de datos y la tabla que usa el backend:

CREATE DATABASE noveo_movil;
USE noveo_movil;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 



3. Verificar que la configuración de conexión del backend (`db.js`) apunte a esta base de datos:


// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
host: 'localhost',
user: 'root', // Usuario de MySQL
password: '', // Contraseña de MySQL (cambiar si no está vacía)
database: 'noveomovil',
});

module.exports = pool;

Si tu usuario/contraseña de MySQL son distintos, modificarlos en `db.js`.

## 3. Instalación y ejecución del backend (Node.js + Express)

El backend se encuentra en la carpeta donde están `server.js`, `db.js`, `package.json` y `noveomoviltabla.sql`.

1. Abrir una terminal en esa carpeta:
cd backend # o el nombre real de la carpeta de tu backend


2. Instalar dependencias:
npm install


3. Iniciar el servidor:
node server.js


El backend quedará escuchando en:

- `http://localhost:4000`

Las rutas principales son:

- `POST /api/register` – Registro de usuario (`fullName`, `identifier`, `password`, `disabilityType`).
- `POST /api/login` – Inicio de sesión (`identifier`, `password`).

---

## 4. Instalación y ejecución del frontend (React – carpeta dsproyecto)

Abrir **otra** terminal nueva (o una nueva pestaña de la misma terminal):

Si acabas de clonar el proyecto:
cd NOMBRE_DE_LA_CARPETA_DEL_PROYECTO # la carpeta que se descarga desde GitHub

Si ya estabas dentro del backend, primero sube un nivel:
cd .. # volver a la carpeta que contiene TODO el proyecto

npm install # instalar dependencias del frontend (solo la primera vez)
npm start # iniciar la app React en http://localhost:3000


> Importante: ejecutar `npm install` y luego `npm start` en la misma carpeta raíz donde está este README y el archivo `package.json` del frontend.


El frontend se ejecuta desde la misma carpeta raíz del proyecto donde se encuentra este README (la carpeta que se descarga desde GitHub).

---

## 5. Orden recomendado para poner todo a correr

1. **MySQL**
   - Asegurarse de que el servidor MySQL está encendido.
   - Haber ejecutado el script SQL anterior para crear la base de datos `noveomovil` y la tabla `users`.

2. **Backend**
   - En una primera terminal:

cd backend
npm install  (solo la primera vez que lo vayas a abrir)
node server.js


   - Verificar que en la terminal aparezca algo como:  
     `API escuchando en http://localhost:4000`.

3. **Frontend**
   - En una segunda terminal:

cd dsproyecto
npm install (solo la primera vez que lo vayas a abrir)
npm start


   - Abrir `http://localhost:3000` en el navegador.

4. **Uso básico**
   - Desde la app, registrarse con nombre completo, identificador, contraseña y tipo de discapacidad.
   - Luego iniciar sesión con el mismo identificador y contraseña.
   - Acceder a la pantalla principal con el mapa, ruta y asistente de voz.

---

## 6. Estructura principal del proyecto

### Backend

- `server.js`: Servidor Express, rutas `/api/register` y `/api/login`, puerto 4000.
- `db.js`: Conexión a MySQL mediante `mysql2/promise`.
- `noveomoviltabla.sql`: Script SQL de referencia para crear la base de datos y las tablas.

### Frontend (React – carpeta dsproyecto)

- `src/App.js`: Componente principal de la aplicación.
- `src/AppContext.js`: Estado global (usuario, ubicación, ruta, estado del viaje, etc.).
- `src/MapView.js`: Mapa y trazado de ruta.
- `src/RouteController.js`: Control para calcular y limpiar la ruta.
- `src/VoiceAssistantContinuous.js`: Asistente de voz continuo para comandos en español.
- `src/LocationWatcher.js`: Lectura y actualización de la ubicación del usuario.

---

## 7. Scripts rápidos

Backend:

cd backend
node server.js


Frontend:

cd dsproyecto
npm start
npm run build  (build de producción opcional)

