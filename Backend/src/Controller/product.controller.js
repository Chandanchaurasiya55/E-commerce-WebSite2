const Product = require('../Model/product.model');

// Product controller
// NOTE: Previously this endpoint required a seller secret key header (x-seller-key).
// The requirement has been removed and uploads are allowed without that header.
async function createProduct(req, res) {
  try {
    // NOTE: seller key check removed — uploads allowed without an x-seller-key header.
    // If you want to re-introduce optional verification, check process.env.SELLER_KEY
    // and validate the header only if a value is present.

    // normalize incoming image(s): accept `images` as array or a single `img` string
    const { title, price, images, img, description } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: 'title and price are required' });
    }

    // ensure images is an array with <= 3 items
    let finalImages = [];
    if (Array.isArray(images)) finalImages = images.filter(Boolean).slice(0, 3);
    else if (typeof images === 'string' && images.trim()) finalImages = [images.trim()].slice(0, 3);
    else if (typeof img === 'string' && img.trim()) finalImages = [img.trim()];

    if (finalImages.length > 3) {
      return res.status(400).json({ message: 'You can upload up to 3 images only' });
    }

    // keep `img` for backward compatibility (first image or empty string)
    const firstImg = finalImages[0] || img || '';
    const newProduct = await Product.create({ title, price, images: finalImages, img: firstImg, description, seller: 'seller' });
    return res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin: delete a product by id
async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Product id required' });

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    return res.status(200).json({ message: 'Product deleted', product: deleted });
  } catch (err) {
    console.error('deleteProduct error', err);
    return res.status(500).json({ message: 'Server error while deleting product' });
  }
}

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  getProductById
};

// New: get one product by id
async function getProductById(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Product id required' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    return res.status(200).json({ product });
  } catch (err) {
    console.error('getProductById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
