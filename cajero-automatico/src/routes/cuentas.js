import {Router} from "express";
import jwt from "jsonwebtoken";
import {Cuenta} from "../schemas/cuenta.js";
import amqp from "amqplib";
import bcrypt from "bcrypt";

const rabbitConfig = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
}

const PRIVATE_KEY_JWT = 'admin';

const router = Router();

// registrar cuenta
router.post("/", async (req, res) => {
    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);

    const data = {
        email: req.body.email,
        password: hashedPwd,
        profile: req.body.profile,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    };

    const cola = 'crearCuenta';
    const conn = await amqp.connect(rabbitConfig);
    const chann = await conn.createChannel();
    const dataParseada = JSON.stringify(data);

    chann.sendToQueue(cola, Buffer.from(dataParseada));
    return res.send({"mensaje": "Información enviada"});
});

// identificar cuenta
router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send({"mensaje": "Envie email y contraseña"});
    }

    const cuenta = await Cuenta.findOne({email});

    if (!cuenta) {
        return res.status(400).send({"mensaje": "Usuario no encontrado"});
    }
    console.log(cuenta);

    if (!bcrypt.compare(req.body.password, cuenta.password)) {
        return res.status(400).send({"mensaje": "Contraseña no valida"});
    }

    const token = generarJWTToken(email, cuenta.firstName, cuenta.profile);


    return res.send({token});
});

// retirar dinero
router.post("/retirar", async (req, res) => {
    const token = req.headers.authorization;

    if (!token || !verificarJWTToken(token)) {
        return res.status(400).send({"mensaje": "No estas identificado"});
    }

    const data = {quantity: req.body.quantity, email: req.body.email};

    const cola = 'retirar';
    const conn = await amqp.connect(rabbitConfig);
    const chann = await conn.createChannel();
    const dataParseada = JSON.stringify(data);

    chann.sendToQueue(cola, Buffer.from(dataParseada));
    return res.send({"mensaje": "Información enviada"});

});

// depositar dinero
router.post("/depositar", async (req, res) => {
    const token = req.headers.authorization;

    console.log(token)

    if (!token || !verificarJWTToken(token)) {
        return res.status(400).send({"mensaje": "No estas identificado"});
    }

    const data = {quantity: req.body.quantity, email: req.body.email};

    const cola = 'depositar';
    const conn = await amqp.connect(rabbitConfig);
    const chann = await conn.createChannel();
    const dataParseada = JSON.stringify(data);

    chann.sendToQueue(cola, Buffer.from(dataParseada));
    return res.send({"mensaje": "Información enviada"});
});

const generarJWTToken = (email, name, profile) => {
    return jwt.sign({email, name, profile}, PRIVATE_KEY_JWT);
};

const verificarJWTToken = (token) => {
    try {
        const payload = jwt.verify(token, PRIVATE_KEY_JWT);

        return payload.email;
    } catch (e) {
        return null;
    }
};

export default router;