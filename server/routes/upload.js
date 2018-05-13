const fileUpload = require('express-fileupload');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// default options
// envia lo que sea que se suba 
// hacia req.files
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'No image'
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'Tipos validos ' + tiposValidos.join(', '),
                tipo
            }
        });
    }


    // The name of the input field 
    // (i.e. "sampleFile") is used to 
    // retrieve the uploaded file
    let archivo = req.files.archivo;

    let splitName = archivo.split('.');
    let extension = splitName[splitName.length - 1];

    // extensiones validas
    let extencionesValidas = ['png', 'jgp', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            errs: {
                message: 'Extensiones valida ' + extencionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // cambiar nombre del archivo
    let nombreArchivo = `${id}-${new Date().getUTCMilliseconds()}.${extension}`

    // Use the mv() method to place the
    // file somewhere on your server
    archivo.mv(`uploads/${tipo}/file.jpg`, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        // imagen cargada
        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
        }
    });

});

let imagenUsuario = (id, res, nombreArchivo) => {
    Usuario.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                errs: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(tipo, producto.img);

        user.img = nombreArchivo;
        user.save((err, db) => {
            res.json({
                ok: true,
                user: db,
            });
        });

    });
};

let imagenProducto = (id, res, nombreArchivo) => {
    Producto.findById(id, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errs: err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                errs: {
                    message: 'Producto no existe'
                }
            });
        }

        borrarArchivo(tipo, producto.img);

        producto.img = nombreArchivo;
        producto.save((err, db) => {
            res.json({
                ok: true,
                producto: db,
            });
        });

    });
};

let borrarArchivo = (tipo, archivo) => {
    let url = path.resolve(__dirname + `../../uploads/${tipo}/${archivo}`);

    // borrar imagen anterior
    if (fs.existsSync(url)) {
        fs.unlinkSync(url);
    }
};

module.exports = app;