const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller')
const tweetsController = require('../controllers/tweets.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const passport = require('passport');

module.exports = router;

router.get('/', authMiddleware.isAuthenticated, tweetsController.index)
router.get('/tweets/:id', authMiddleware.isAuthenticated, tweetsController.show)
router.post('/tweets/:id/comments', authMiddleware.isAuthenticated, tweetsController.addComment)
router.post('/tweets/:id/like', authMiddleware.isAuthenticated, tweetsController.like)
router.post('/tweets', authMiddleware.isAuthenticated, tweetsController.create)

router.get('/users/new', authMiddleware.isNotAuthenticated, usersController.new)
router.post('/users', authMiddleware.isNotAuthenticated, usersController.create)
router.get('/users/:token/validate', usersController.validate)

router.get('/login', authMiddleware.isNotAuthenticated, usersController.login)
router.post('/login', authMiddleware.isNotAuthenticated, usersController.doLogin)
router.post('/logout', authMiddleware.isAuthenticated, usersController.logout)

router.post('/google', authMiddleware.isNotAuthenticated, passport.authenticate('google-auth', { scope: ['openid', 'profile', 'email'] }));
router.post('/facebook', authMiddleware.isNotAuthenticated, passport.authenticate('facebook-auth', { scope: ['email'] }));
router.get('/callback/:provider', authMiddleware.isNotAuthenticated, usersController.doSocialLogin);

router.get('/:username', authMiddleware.isAuthenticated, tweetsController.profile)
