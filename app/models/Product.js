const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    brandName: {
        type: String,
        required: true
    },
    detail: { type: String },
    image: { type: String },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const productSchema = new Schema({
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productDescription: { type: String },
    brands: [brandSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
