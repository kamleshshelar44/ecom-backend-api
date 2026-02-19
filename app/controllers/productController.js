const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.addProduct = async (req, res) => {
    try {

        if (!req.user || req.user.role !== 'SELLER') return res.status(403).json({ message: 'Only sellers can add products' });

        const { productName, productDescription } = req.body;

        if (!productName) return res.status(400).json({ message: 'Product name required' });

        let brands = [];

        if (req.body.brands) {
            if (typeof req.body.brands === "string") {
                brands = JSON.parse(req.body.brands);
            } else if (Array.isArray(req.body.brands)) {
                brands = req.body.brands;
            } else {
                return res.status(400).json({ message: "Invalid brands format" });
            }
        }


        if (req.files && req.files.length) {
            for (let i = 0; i < req.files.length; i++) {
                if (brands[i]) {
                    brands[i].image = `/uploads/${req.files[i].filename}`;
                }
            }
        }


        if (!brands || brands.length === 0) return res.status(400).json({ message: 'At least one brand required' });

        for (const b of brands) {
            if (!b.brandName || b.price == null) return res.status(400).json({ message: 'Each brand must have brandName and price' });
        }

        const product = new Product({
            seller: req.user._id,
            productName,
            productDescription,
            brands
        });
        await product.save();

        res.status(201).json({ message: 'Product added', product });

    } catch (err) {
        console.log('error', err);

        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.listSellerProducts = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'SELLER') return res.status(403).json({ message: 'Only sellers can view their products' });

        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const filter = { seller: req.user._id };
        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({ page, limit, total, products });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {

        const { productId } = req.params;
        if (!req.user || req.user.role !== 'SELLER') return res.status(403).json({ message: 'Only sellers can delete products' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can delete only your own products' });
        }

        await product.deleteOne();

        res.status(200).json({ message: 'Product deleted' });

    } catch (err) {
        console.log('error', err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.generateProductPDF = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename=${product.productName}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(22).text('Product Details', { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(16).text(`Product Name: ${product.productName}`);
        doc.moveDown(0.5);

        doc.fontSize(14).text(`Description: ${product.productDescription || '-'}`);
        doc.moveDown(1);

        doc.fontSize(16).text('Brand Details:');
        doc.moveDown(0.5);

        let totalPrice = 0;

        for (const brand of product.brands) {
            doc.fontSize(14).text(`Brand Name: ${brand.brandName}`);
            doc.text(`Price: ₹${brand.price}`);
            totalPrice += brand.price;

            if (brand.image) {
                const imagePath = path.join(__dirname, '..', brand.image);
                if (fs.existsSync(imagePath)) {
                    doc.moveDown(0.5);
                    doc.image(imagePath, {
                        width: 100
                    });
                }
            }

            doc.moveDown(1);
            doc.text('----------------------------------------');
            doc.moveDown(1);
        }

       
        doc.fontSize(16).text(`Total Price: ₹${totalPrice}`, {
            align: 'right'
        });

        doc.end();

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};
