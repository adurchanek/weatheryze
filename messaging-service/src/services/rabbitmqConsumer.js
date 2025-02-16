import { getRabbitMQConnection } from "./rabbitmqConnection.js";
import { sendEmail } from "./emailService.js";

let channel = null;

export const consumeQueue = async (queue) => {
  try {
    const connection = await getRabbitMQConnection();
    channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    console.log(`Listening for messages on queue: ${queue}`);

    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          console.log("Message received:", message);

          const { email, subject, body: emailMessage } = message;

          try {
            await sendEmail(email, subject, emailMessage);
            console.log(`Email sent`);
            channel.ack(msg);
          } catch (error) {
            console.error("Error sending email:", error.message);
          }
        }
      },
      { noAck: false },
    );

    channel.on("error", (error) => {
      console.error("RabbitMQ channel error:", error.message);
      channel = null;
      retryConsume(queue);
    });

    channel.on("close", () => {
      console.warn("RabbitMQ channel closed. Recreating...");
      channel = null;
      retryConsume(queue);
    });
  } catch (error) {
    console.error("Error in RabbitMQ consumer:", error.message);
  }
};

const retryConsume = async (queue) => {
  console.log("Retrying to consume messages...");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await consumeQueue(queue);
};
