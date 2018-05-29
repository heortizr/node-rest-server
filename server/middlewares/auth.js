const jwt = require('jsonwebtoken');

// ======================
// Verify Token
// ======================
let verifyToken = (req, res, next) => {

    let token = req.get('token') || req.query.token;

    jwt.verify(token, process.env.SEED, (err, decode) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                errs: err
            });
        }

        req.user = decode.payload;
        next();
    });
};

// ======================
// Verify Admin Role
// ======================
let verifyAdminRole = (req, res, next) => {
    let { user } = req;
    if (user && user.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            errs: { message: 'You are not an Admin' }
        });
    }

};

module.exports = {
    verifyToken,
    verifyAdminRole
};