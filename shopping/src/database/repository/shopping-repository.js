const { CustomerModel, ProductModel, OrderModel, CartModel, WishListModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError, STATUS_CODES } = require('../../utils/app-errors')
const _ = require('lodash')

//Dealing with data base operations
class ShoppingRepository {

    // payment

    async Orders(customerId){
        try{
            const orders = await OrderModel.find({customerId });
            return orders;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async Cart(customerId) {
        return CartModel.findOne({ customerId });
    }

    async ManageCart(customerId,productId,isRemove){
        const cart = await CartModel.findOne({customerId});
        if(cart) {
            if(isRemove) {
                // handle remove case
                const cartItems =  _.filter(cart.items, () => item.product._id !== product._id);

                cart.items = cartItems;
            } else {
                const cartIndex = _.findIndex(cart.items, { product: {_id: product._id} });

                if(cartIndex > -1) {
                    // update the qty
                    cart.items[cartIndex].unit = qty;
                } else {
                    // add new item
                    cart.items.push({
                        product: {...product},
                        unit: qty
                    })
                }
            }
            return await cart.save();

        } else {
            // create a new one
            const cart = new CartModel({
                customerId,
                items: [{
                    product: {...product},
                    unit: qty
                }]
            })

        }
    }

    async ManageWishList(customerId,productId, isRemove = false){
        const wishlist = await WishListModel.findOne({customerId});
        console.log('=====wishlist', wishlist);
        if(wishlist) {
            if(isRemove) {
                // handle remove case
                const products =  _.filter(wishlist.products, (product) => product._id !== productId);

                wishlist.products = products;
            } else {
                const wishlistIndex = _.findIndex(wishlist.products, {
                    _id: product._id
                });

                if(wishlistIndex < 0) {
                    // update the qty
                    wishlist.products.push({
                        _id: product._id
                    })
                }
            }
            return await wishlist.save();

        } else {
            // create a new one
            const wishlist = new WishListModel({
                customerId,
                products: [{
                    _id: productId
                }]
            })

            return await wishlist.save();
        }
    }

    async GetWishlistByCustomerId(customerId){
        return WishListModel.findOne({customerId});
    }

    async CreateNewOrder(customerId, txnId){

        //check transaction for payment Status

        try{
            const cart = await CartModel.findOne({customerId});

            if(cart){

                let amount = 0;

                let cartItems = cart.items;

                if(cartItems.length > 0){
                    //process Order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) *  parseInt(item.unit);
                    });

                    const orderId = uuidv4();

                    const order = new OrderModel({
                        orderId,
                        customerId,
                        amount,
                        txnId,
                        status: 'received',
                        items: cartItems
                    })

                    cart.items = [];

                    const orderResult = await order.save();
                    await cart.save();

                    return orderResult;
                }
            }

          return {}

        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Category')
        }


    }

    async GetOrderById(orderId){
        return OrderModel.findById(orderId);
    }

    async DeleteProfileData(customerId){
        // Delete cart, wishlist, orders
        try {
            const deletedCart = CartModel.findOneAndDelete({customerId});
            const deletedWishlist = WishListModel.findOneAndDelete({customerId});
            const deletedOrders = OrderModel.deleteMany({customerId});

            return await Promise.all([deletedCart, deletedWishlist, deletedOrders]);

        } catch(error) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Profile Data')
        }
    }
}

module.exports = ShoppingRepository;