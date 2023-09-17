const ProductService = require('../services/product-service');

module.exports = app => {
	const service = new ProductService();

	app.use('/app-events', async (req, res, next) => {
		const {payload} = req.body;

		console.log('============   Products Service received Event: ', payload.event, ' ============');

		res.status(200).send(payload);
	})
}