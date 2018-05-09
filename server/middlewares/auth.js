const jwt = require('json-web-token');

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

        req.usuario = decode.usuario
        next();
    });
}

// ======================
// Verifica Admin Role
// ======================
let verificaAdminRole = (req, res, next) => {

    let token = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            errs: { message: 'No es un administrador' }
        });
    }

}

module.exports = {
    verificaToken
}