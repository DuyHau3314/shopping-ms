const ShoppingService = require('../services/shopping-service');
const UserAuth = require('./middlewares/auth');
const {
    PublishCustomerEvent,
    SubscribeToChannel,
    PublishMessage,
} = require('../utils');
const { CUSTOMER_BINDING_KEY } = require('../config');

module.exports = (app, channel) => {
    const service = new ShoppingService();
    SubscribeToChannel(channel, service);

    app.post('/cart', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        const { product_id, qty } = req.body;

        try {
            const { data } = await service.AddCartItem(_id, product_id, qty);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.delete('/cart/:id', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        const productId = req.params.id;

        try {
            const { data } = await service.RemoveCartItem(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/cart', UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        try {
            const data = await service.GetCart(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Wishlist
    app.get('/wishlist', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        try {
            const data = await service.GetWishlist(_id);

            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.post('/wishlist', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        const { product_id } = req.body;

        try {
            const data = await service.AddToWishlist(_id, product_id);

            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        const productId = req.params.id;

        try {
            const data = await service.RemoveFromWishlist(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Orders
    app.post('/order', UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        const { txnNumber } = req.body;

        try {
            const data = await service.CreateOrder(_id, txnNumber);

            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/order/:id', UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        const orderId = req.params.id;

        try {
            const data = await service.GetOrder(_id, orderId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/orders', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });
};
