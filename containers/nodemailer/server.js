//subscriber
'use strict';

const amqplib = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	    user: 'codify045@gmail.com',
	    pass: 'sbbt ijlo gaqo ouwu'
	}
});

transport.verify((error, success) => {
	if (error) {
    		console.error(error);
    	} 
    	else {
    		console.log('Ready to send mail!');
	}
})

amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }
        
        var queue = 'queue';

        channel.assertQueue(queue, {
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            channel.prefetch(1);

            channel.consume(queue, data => {
                if (data === null) {
                    return;
                }

                let message = JSON.parse(data.content.toString());
                
                let email = message.email;
                let username = message.username;
                
                var mailOptions = {
                	from: 'codify045@gmail.com',
                	to: email,
                	text: 'Congratulazioni ' + username + ' ti sei registrato!'
                }

                transport.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        return channel.nack(data);
                    }
                    channel.ack(data);
                }); 
            }, { noAck: false });
        });
    });
});

