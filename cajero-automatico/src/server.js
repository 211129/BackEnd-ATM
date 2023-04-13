import app from "./app.js";
import connectMongo from "./mongo.js";

(async () => {
    await connectMongo();
    app.listen(3000, () => {
        console.log("Escuchando en el puerto 3000");
    });
})();