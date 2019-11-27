const mongoose = require('mongoose');
const Tweet = require('../models/tweet.model');
const User = require('../models/user.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');

module.exports.index = (req, res, next) => {
  const criteria = req.query.search
    ? {
      body: new RegExp(req.query.search, "i")
    }
    : {}

  Tweet.find(criteria)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('user')
    .populate('comments')
    .populate('likes')
    .then(tweets => {
      res.render('tweets/index', { user: req.currentUser, tweets })
    })
    .catch(next)
}

module.exports.like = (req, res, next) => {
  const params = { tweet: req.params.id, user: req.currentUser._id }

  Like.findOne(params)
    .then(like => {
      if (like) {
        Like.findByIdAndRemove(like._id)
          .then(() => {
            res.json({ likes: -1 })
          })
          .catch(next)
      } else {
        const like = new Like(params)

        like.save()
          .then(() => {
            res.json({ likes: 1})
          })
          .catch(next)
      }
    })
    .catch(next)
}

module.exports.addComment = (req, res, next) => {
  const tweetId = req.params.id

  const comment = new Comment({
    text: req.body.text,
    user: req.currentUser._id,
    tweet: tweetId
  })
  
  comment.save()
    .then(c => {
      req.session.genericSuccess = 'comment created'
      res.redirect(`/tweets/${tweetId}`)
    })
    .catch(() => {
      req.session.genericError = 'error creating comment'
      res.redirect(`/tweets/${tweetId}`)
    })
}

module.exports.show = (req, res, next) => {
  Tweet.findOne({ _id: req.params.id })
    .populate('user')
    .populate({
      path: 'comments',
      options: {
        sort: {
          createdAt: -1
        }
      },
      populate: {
        path: 'user'
      }
    })
    .then(tweet => {
      if (tweet) {
        res.render('tweets/show', { tweet, user: tweet.user })
      } else {
        req.session.genericError = 'tweet not found'
        res.redirect('/')
      }
    })
    .catch(next)
}

module.exports.create = (req, res, next) => {
  const tweet = new Tweet({
    user: req.currentUser._id,
    body: req.body.body,
    image: req.file ? req.file.url : undefined
  })
  
  tweet.save()
    .then(() => {
      req.session.genericSuccess = "tweet created"
      res.redirect('/')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        req.session.genericError = "can't create tweet"
        res.redirect('/')
      } else {
        next(error);
      }
    })
}

module.exports.profile = (req, res, next) => {
  User.findOne({ username: req.params.username })
    .populate({
      path: 'tweets',
      populate: {
        path: 'user'
      }
    })
    .then(user => {
      if (user) {
        res.render('tweets/index', { user, tweets: user.tweets })
      } else {
        req.session.genericError = 'user not found'
        res.redirect('/')
      }
    })
    .catch(next)
}