import {model, Schema} from "mongoose";

export const cuentaSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    quantity: {type: Number, default: 0},
});

export const Cuenta = model("Cuenta", cuentaSchema);