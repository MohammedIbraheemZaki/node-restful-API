const express = require('express');

const app = express();

// login with morgan
const morgan = require('morgan')
const bodyParser = require('body-parser')

// connect mongoDB to my project with mongoose => then after routes use it
const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')

// use mongoose
mongoose.connect('mongodb+srv://admin:'+process.env.MONGO_ATLAS_PW+'@testcluster1.vknsc.mongodb.net/?retryWrites=true&w=majority')
// to avoid warning of deprication
mongoose.Promise = global.Promise;

// you need to use morgan before using routes
app.use(morgan('dev'))
// create new route for upload files to show it
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

// fix cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next();
})

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)


// handle error routes
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
})


// app.use((req, res, next) => {
//   res.status(200).json({
//     message: 'it works'
//   })
// })

module.exports = app