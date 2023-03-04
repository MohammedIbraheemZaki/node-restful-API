const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// hash the password 
const bycrpt = require('bcrypt')

// use JWT for tokens
const jwt = require('jsonwebtoken')

const User = require('../models/user')

router.get('/', (req, res, next) => {
  User.find()
    .select('email _id')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        users: docs.map(doc => {
          return {
            email: doc.email,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/user/'+doc._id
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

router.post("/login", (req, res, next) => {
  User.find({email: req.body.email})
    .exec()
    .then(user => {
      if(user.length < 1){
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      bycrpt.compare(req.body.password, user[0].password, (err, result) => {
        if(err){
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
        if(result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            })
          return res.status(200).json({
            message: "auth successful",
            token: token
          })
        }
        return res.status(401).json({
          message: 'Auth failed'
        });
      })
    }

    )
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    });
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