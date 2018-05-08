// ===========================
// Puerto
// ===========================
process.env.PORT = process.env.PORT || 3000;

// ===========================
// Environment
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// Caducidad del token
// ===========================
process.env.CADUCIDAD_TOKEN = (60 * 60 * 24 * 30);

// ===========================
// SEED para el JWT
// ===========================
process.env.SEED = process.env.SEED || 'asdf';

// ===========================
// Data Base
// ===========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // deberia ser local, pero no lo quiero instalar
    urlDB = process.env.MONGO_URI;
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;