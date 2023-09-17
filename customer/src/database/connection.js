const mongoose = require('mongoose');
const { DB_URL } = require('../config');

module.exports = async() => {

    try {
        mongoose.set('debug', true);
        mongoose.set('debug', { color: true })
        mongoose.set('strictQuery', true);

        await mongoose.connect(DB_URL);
        console.log('Db Connected');

    } catch (error) {
        console.log('Error ============')
        console.log(error);
        process.exit(1);
    }

};
