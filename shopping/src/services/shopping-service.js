const { ShoppingRepository } = require('../database');
const { FormateData, RPCRequest } = require('../utils');

// All Business logic will be here
class ShoppingService {
    constructor() {
        this.repository = new ShoppingRepository();
    }

    //Cart
    async AddCartItem(customerId, productId, qty) {
        // Grab product info from Product Service through RPC
        // TODO: add RPC codes
        const productResponse = await RPCRequest('PRODUCT_RPC', {
            type: 'VIEW_PRODUCT',
            data: productId,
        });

        if (productResponse && productResponse._id) {
            const data = await this.repository.ManageCart(
                customerId,
                productResponse,
                qty,
                false
            );
            return data;
        }

        throw new Error('Product data not found');
    }

    async RemoveCartItem(customerId, productId) {
        const data = await this.repository.ManageCart(
            customerId,
            { _id: productId },
            0,
            true
        );
        return data;
    }

    async GetCart(_id) {
        try {
            return this.repository.Cart(_id);
        } catch (error) {
            throw err;
        }
    }

    // WishList
    async AddToWishlist(customerId, productId) {
        return this.repository.ManageWishList(customerId, productId, false);
    }

    async RemoveFromWishlist(_id, productId) {
        return this.repository.ManageWishList(_id, productId, true);
    }

    async GetWishlist(customerId) {
        const wishlist = await this.repository.GetWishlistByCustomerId(
            customerId
        );

        if(!wishlist) return {};

        const {products} = wishlist;

        if (Array.isArray(products)) {
            const ids = products.map((product) => product._id);

            const productResponse = await RPCRequest('PRODUCT_RPC', {
                type: 'VIEW_PRODUCTS',
                data: ids,
            });

            console.log('====productResponse', productResponse);

            if (productResponse && productResponse.length > 0) {
                return productResponse;
            }
        }

        return [];
    }

    // Orders
    async CreateOrder(customerId, txnNumber) {
        // Verify the txn number with payment logs
        return await this.repository.CreateNewOrder(customerId, txnNumber);
    }

    async GetOrder(orderId) {
        return await this.repository.GetOrderById(orderId);
    }

    async GetOrders(customerId) {
        try {
            const orders = await this.repository.Orders(customerId);
            return FormateData(orders);
        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    // get order details

    async ManageCart(customerId, item, qty, isRemove) {
        try {
            const cartResult = await this.repository.AddCartItem(
                customerId,
                item,
                qty,
                isRemove
            );

            return FormateData(cartResult);
        } catch (err) {
            throw err;
        }
    }

    async DeleteProfileData(userId) {
        try {
            return await this.repository.DeleteProfileData(userId);
        } catch (err) {
            throw err;
        }
    }

    async SubscribeEvents(payload) {
        payload = JSON.parse(payload);

        payload = JSON.parse(payload);

        const { event, data } = payload;

        switch (event) {
            case 'DELETE_PROFILE':
                this.DeleteProfileData(data.userId);
                break;
            default:
                break;
        }
    }

    async GetOrderPayload(userId, order, event) {
        if (order) {
            const payload = {
                event: event,
                data: { userId, order },
            };

            console.log('======SHOPPING', FormateData(payload));

            return FormateData(payload);
        }

        return FormateData({ error: 'No Order is available' });
    }
}

module.exports = ShoppingService;
