import {Router} from "express";
import multer from "multer";
import os from "os";
import cloudinary from "cloudinary";

const upload = multer({dest: os.tmpdir()});

const router = Router();

cloudinary.config({
    cloud_name: 'dmwtuuczm', // nombre de cloudinary
    api_key: '636124945342724', // api key de cloudinary
    api_secret: 'JhCXb50sFMHvCdKNgg9fx5DfQkU', // secret key de cloudinary
});

router.post("/", upload.single("file"), async (req, res) => {
    const file = req.file;

    if (!file) throw new Error("No se ha enviado ningún archivo");

    const result = await cloudinary.uploader.upload(file.path, {
        folder: '/banca/', // directorio de cloudinary donde se guardara la info
    });

    const fileUrl = result.secure_url;

    return res.send({url: fileUrl})
});

export default router;