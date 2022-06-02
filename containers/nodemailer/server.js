//subscriber
'use strict';

const amqplib = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

// Setup Nodemailer transport
const transport = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
	    user: 'codify045@gmail.com',
	    pass: 'sbbt ijlo gaqo ouwu'
	}
});

transport.verify((error, success) => {
	if (error) {
    		//if error happened code ends here
    		console.error(error);
    	} 
    	else {
    		//this means success
    		console.log('Ready to send mail!');
	}
})

// Create connection to AMQP server
amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }
    // Create channel
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }
        
        var queue = 'queue';

        // Ensure queue for messages
        channel.assertQueue(queue, {
            // Ensure that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            // Only request 1 unacked message from queue
            // This value indicates how many messages we want to process in parallel
            channel.prefetch(1);

            // Set up callback to handle messages received from the queue
            channel.consume(queue, data => {
                if (data === null) {
                    return;
                }

                // Decode message contents
                let message = JSON.parse(data.content.toString());
                console.log("ciao" + message);
                
                //prendo email e password
                let email = message.email;
                let username = message.username;
                
                console.log(message.email);
                console.log(message.username);
                
                var mailOptions = {
                	from: 'codify045@gmail.com',
                	to: email,
                	text: 'Congratulazioni ' + username + ' ti sei registrato!'
                }

                // Send the message using the previously set up Nodemailer transport
                transport.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        // put the failed message item back to queue
                        return channel.nack(data);
                    }
                    console.log('Delivered message %s', info.messageId);
                    // remove message item from the queue
                    channel.ack(data);
                }); 
            }, { noAck: false });
        });
    });
});
