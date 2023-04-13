import amqp from "amqplib";
import {Cuenta} from "./schemas/cuenta.js"
import AWS from "aws-sdk";

const crearUsuarioCola = 'crearCuenta';
const retirarCola = 'retirar';
const depositarCola = 'depositar';

const rabbitConfig = {
    protocol: 'amqp',
    hostname: '127.0.0.1',
    port: 5672,
    username: 'guest',
    password: 'guest',
}

const sns = new AWS.SNS({
    accessKeyId: "AKIA33XH47FEVXNO6HH3",
    secretAccessKey: "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",
    region: "us-east-1"
});

export async function connectRabbit() {
    try {
        const connection = await amqp.connect(rabbitConfig);

        const channel = await connection.createChannel();

        await channel.assertQueue(crearUsuarioCola);
        await channel.assertQueue(retirarCola);
        await channel.assertQueue(depositarCola);

        await channel.consume(crearUsuarioCola, async (msn) => {
            const data = JSON.parse(msn.content.toString());

            const cuenta = new Cuenta({
                email: data.email,
                password: data.password,
                profile: data.profile,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            await cuenta.save();

            const params = {
                Protocol: 'EMAIL',
                TopicArn: 'arn:aws:sns:us-east-1:815456385353:Banca',
                Endpoint: data.email
            };

            sns.subscribe(params, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            });

            channel.ack(msn);
        });

        await channel.consume(retirarCola, async (msn) => {
            const data = JSON.parse(msn.content.toString());

            const cuenta = await Cuenta.findOne({email: data.email});

            if (!cuenta) return;

            cuenta.quantity -= data.quantity;

            await cuenta.save();

            let email = `${data.email} \n \n Se retiro ${data.quantity}`;
            let params = {
                Message: email,
                Subject: data.email,
                TopicArn: 'arn:aws:sns:us-east-1:815456385353:Banca'
            };

            sns.publish(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else console.log(data);
            });

            channel.ack(msn);
        });

        await channel.consume(depositarCola, async (msn) => {
            const data = JSON.parse(msn.content.toString());

            const cuenta = await Cuenta.findOne({email: data.email});

            if (!cuenta) return;

            cuenta.quantity += data.quantity;

            await cuenta.save();

            let email = `${data.email} \n \n Se deposito ${data.quantity}`;
            let params = {
                Message: email,
                Subject: data.email,
                TopicArn: 'arn:aws:sns:us-east-1:815456385353:Banca'
            };

            sns.publish(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else console.log(data);
            });

            channel.ack(msn);
        });


    } catch (error) {
        console.log(`Error => ${error}`);
    }
}