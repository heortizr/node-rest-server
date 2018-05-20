const fileUpload = require('express-fileupload');
const Product = require('../models/product');
const User = require('../models/user');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// default options
// envia lo que sea que se suba 
// hacia req.files
app.use(fileUpload());

app.put('/:type/:id', (req, res) => {

    let { type, id } = req.params;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'No image uploaded'
            }
        });
    }

    let validTyes = ['productos', 'usuarios'];
    if (validTyes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'Valid types ' + validTyes.join(', '),
                type
            }
        });
    }


    // The name of the input field 
    // (i.e. "sampleFile") is used to 
    // retrieve the uploaded file
    let { file } = req.files;

    let splitName = file.split('.');
    let extension = splitName[splitName.length - 1];

    // extensiones validas
    let validExtension = ['png', 'jgp', 'gif', 'jpeg'];

    if (validExtension.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'Valid extensiones ' + validExtension.join(', '),
                extension
            }
        });
    }

    // cambiar nombre del archivo
    let newFileName = `${id}-${new Date().getUTCMilliseconds()}.${extension}`;

    // Use the mv() method to place the
    // file somewhere on your server
    file.mv(`uploads/${type}/${newFileName}`, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        // imagen cargada
        switch (type) {
        case 'usuarios':
            userImage(id, res, newFileName);
            break;
        case 'productos':
            productImage(id, res, newFileName);
            break;
        }
    });

});

let userImage = (id, res, fileName) => {
    User.findById(id, (err, data) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        deleteFile('usuarios', data.img);
        data.img = fileName;

        data.save((err, db) => {
            res.json({
                ok: true,
                user: db,
            });
        });

    });
};

let productImage = (id, res, fileName) => {
    Product.findById(id, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        deleteFile('productos', producto.img);
        producto.img = fileName;

        producto.save((err, db) => {
            res.json({
                ok: true,
                product: db,
            });
        });

    });
};

let deleteFile = (tipo, archivo) => {
    let url = path.resolve(__dirname + `../../uploads/${tipo}/${archivo}`);

    // borrar imagen anterior
    if (fs.existsSync(url)) {
        fs.unlinkSync(url);
    }
};

module.exports = app;