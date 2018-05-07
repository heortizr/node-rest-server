// ===========================
// Puerto
// ===========================
process.env.PORT = process.env.PORT || 3000;

// ===========================
// Environment
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// Data Base
// ===========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // deberia ser local, pero no lo quiero instalar
    urlDB = process.env.mongodb: //root:toor@ds217310.mlab.com:17310/cafe;
} else {
    urlDB = process.env.mongodb: //root:toor@ds217310.mlab.com:17310/cafe;
}

process.env.URLDB = urlDB;