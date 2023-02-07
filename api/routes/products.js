const express = require('express');
const router = express.Router();

// use mongoose schema to stor product in mongoDB
const mongoose = require('mongoose');
const Product = require('../models/product');

// using multer to upload all data as form (name, price, images)
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/');
  },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString()+file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  // reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({
  storage: storage, 
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

router.get('/', (req, res, next) => {
  Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/'+doc._id
            }
          }
        })
      }
      if(docs.length >= 0){
        res.status(200).json(response)
      } else {
        res.status(404).json({
          message: 'No entries found'
        })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    })
  
})
router.post('/', upload.single('productImage'),(req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product
    .save()
    .then(result => {
      res.status(200).json({
        message: 'handle post request /products',
        createdProduct: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/'+result._id
          }
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    })
  
})

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      console.log('From database : '+doc)
      if(doc) {
        res.status(200).json({
          product: doc,
          // name: doc.name,
          // price: doc.price,
          // _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/'+doc._id
          }
        });
      } else {
        res.status(404).json({message: 'Product Not Found'})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    });
  // if(id === 'special') {
  //   res.status(200).json({
  //     message: 'You discovered the special ID ',
  //     id: id
  //   })
  // } else {
  //   res.status(200).json({
  //     message: 'you passed an ID '
  //   })
  // }
})

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propName] = ops.value
  }
  Product.updateOne({_id: id}, {$set: updateOps})
  .exec()
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: 'product updated',
      request: {
        type: 'GET',
        url: 'http://localhost:3000/products/'+id
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  });
  // res.status(200).json({
  //   message: 'update product',
  //   id: id
  // })
})
router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "product deleted",
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products',
          data: {name: 'String', price: 'Number'}
        }
      }) 
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
  // res.status(200).json({
  //   message: 'delete product',
  //   id: id
  // })
})

module.exports = router