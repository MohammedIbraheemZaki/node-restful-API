const express = require('express');
const router = express.Router();

// use mongoose schema to stor order in mongoDB
const mongoose = require('mongoose');
const Order = require('../models/order');
// check if we have the product or not before create order
const Product = require('../models/product')

router.get('/', (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
      if(docs.length >= 0){
        res.status(200).json({
          count: docs.length,
          orders: docs.map(doc => {
            return {
              _id: doc._id,
              product: doc.product,
              quantity: doc.quantity,
              rerquest: {
                type: 'GET',
                url: 'http://localhost:3000/orders/'+ doc._id
              }
            }
          })
          
        })
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
  // res.status(200).json({
  //   message: 'handle get request /orders'
  // })
})

router.post('/', (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if(!product){
        return res.status(404).json({
          message: "product not found"
        })
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
      })
      return order.save()
    })
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'order created',
        createdOrders: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        rerquest: {
          type: 'GET',
          url: 'http://localhost:3000/orders/'+ result._id
        }
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err}) 
    })
    // .catch(err => {
    //   res.status(500).json({
    //     message: 'Product nott found',
    //     error: err
    //   })
    // })
  
})
router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
  .populate('product')
  .exec()
  .then(order => {
    res.status(200).json({
      order: order,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/orders/'+ order._id
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  })
  // const id = req.params.orderId;
  // res.status(200).json({
  //   message: 'order details',
  //   orderId: id
  // })
})
router.patch('/:orderId', (req, res, next) => {
  const id = req.params.orderId;
  res.status(200).json({
    message: 'update order',
    orderId: id
  })
})
router.delete('/:orderId', (req, res, next) => {
  const id = req.params.orderId;
  Order.remove({_id: id})
  .exec()
  .then(order => {
    if(!order){
      return res.status(404).json({
        message: "order not found"
      })
    }
    res.status(200).json({
      message: "order deleted",
      request: {
        type: "GET",
        url: "http://localhost:3000/orders",
        body: {productId: 'ID', quantity: 'Number'}
      }
    })
  })
  .catch(err => {
    res.status(500).json({error: err})
  }

  )
  // res.status(200).json({
  //   message: 'delete order',
  //   orderId: id
  // })
})

module.exports = router