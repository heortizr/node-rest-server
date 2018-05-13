const jwt = require('jsonwebtoken');

// ======================
// Verifica token
// ======================
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decode) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                errs: err
            });
        }

        req.usuario = decode.payload;
        next();
    });
};

// ======================
// Verifica Admin Role
// ======================
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            errs: { message: 'No es un administrador' }
        });
    }

};

// ======================
// Verifica Admin Role
// ======================
let verificaTokenQuery = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decode) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                errs: err
            });
        }

        req.usuario = decode.payload;
        next();
    });
};

module.exports = {
    verificaToken,
    verificaTokenQuery,
    verificaAdminRole
};