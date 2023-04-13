import cors from "cors";
import express from "express";
import cuentasRoutes from "./routes/cuentas.js";
import fileRoutes from "./routes/file.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/cuenta", cuentasRoutes);
app.use("/file", fileRoutes);

export default app;