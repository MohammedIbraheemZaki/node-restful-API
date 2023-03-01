const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// hash the password 
const bycrpt = require('bcrypt')

const User = require('../models/user')

router.post('/signup', (req, res, next) => {
  User.find({email: req.body.email})
    .exec()
    .then(user => {
      if(user.length >= 1){
        return res.status(409).json({
          message: "mail exists"
        })
      } else {
        bycrpt.hash(req.body.password, 10, (err, hash) => {
          if(err){
            return res.status(500).json({
              error: err
            })
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            })
            user.save()
            .then(result => {
              console.log(result)
              res.status(201).json({
                message: 'user created'
              })
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({error: err})
            })
          }
        })
      }
    }
  )  
})

router.delete('/:userId', (req, res, next) => {
  const id = req.params.userId;
  User.remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "user deleted",
        request: {
          type: 'POST',
          data: {email: 'String', password: 'String'}
        }
      }) 
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
})


module.exports = router