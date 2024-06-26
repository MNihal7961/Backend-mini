const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
  QUEUE_NAME,
  SHOPPING_BINDING_KEY,
} = require("../config");

//Utility functions

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET || "mini-ecommerse-ms", {
      expiresIn: "30d",
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(
      signature.split(" ")[1],
      APP_SECRET || "mini-ecommerse-ms"
    );
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

//===============message broker=====================//

//create channel
module.exports.CreateChannel = async () => {
  try {
    //
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (err) {
    throw err;
  }
};
//publish message

module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    console.log(`message has been sent ${message}`);
  } catch (err) {
    throw err;
  }
};
//subscribe message

module.exports.SubcribeMessage = async (channel, service) => {
  const appQueue = await channel.assertQueue(QUEUE_NAME);

  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);

  channel.consume(appQueue.queue, (data) => {
    console.log("recived data");
    const jsonData = JSON.parse(data.content.toString());
    console.log(jsonData);

    // Call the service method with the received payload
    service.SubscribeEvents(jsonData);
    channel.ack(data);
  });
};
