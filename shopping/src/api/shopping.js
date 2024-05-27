const { CUSTOMER_BINDING_KEY } = require("../config");
const ShoppingService = require("../services/shopping-service");
const { SubcribeMessage, PublishMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new ShoppingService();

  SubcribeMessage(channel, service);

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;
    try {
      console.log("start");

      const { data } = await service.PlaceOrder({ _id, txnNumber });

      if (Object.keys(data).length === 0) {
        return res.status(200).json("cart is empty");
      }

      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");
      // publishCustomerEvent(payload);
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const { data } = await service.GetCart({ _id });

      return res.status(200).json(data);
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  });
};
