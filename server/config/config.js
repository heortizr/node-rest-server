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
process.env.CADUCIDAD_TOKEN = (60 * 60 * 60 * 24 * 30);

// ===========================
// SEED para el JWT
// ===========================
process.env.SEED = process.env.SEED || 'asdf';

// ===========================
// Google
// ===========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '684708854038-tp79ionfpk7kug1f3h2vejpjgu7bm30g.apps.googleusercontent.com';
process.env.GOOGLE_SECRET = process.env.GOOGLE_SECRET || '2JkBUu3G9qe6JLHgUEOXQoaT';

// ===========================
// Data Base
// ===========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // deberia ser local, pero no lo quiero instalar
    urlDB = process.env.MONGO_URI || 'mongodb://root:toor@ds217310.mlab.com:17310/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;