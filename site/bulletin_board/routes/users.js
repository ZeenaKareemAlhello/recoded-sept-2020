var express = require('express');
var router = express.Router();
var postsourece = require('../data/posts');
var datasource = require('../data/users.js')

/**
 * The "Login" endpoint.
 *
 * {
 *   username: string,
 *   password: string
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 *   error_message: string
 * }
 */

router.post('/login', function(req, res, next) {
  var credentials = req.body;

  datasource.login(credentials, function(result) {
    if (!result || !result.success) {
      result = {
        success: false,
        error_message: result ? result.error_message : "Database error"
      }
      return res.status(403).send(result);
    }

    req.login({ id: result.user.id, username: result.user.username }, function(err) {
      
      if (err) {
        result = {
          success: false,
          error_message: err
        }
        return res.status(403).send(result);
      }

      result = {
        success: true,
        redirect_uri: "/posts/recent"
      }
      return res.send(result);
    });
  });
});

/**
 * The "Sign Up" endpoint.
 *
 * {
 *   username: string,
 *   password: string
 * }
 *
 * {
 *   success: boolean,
 *   redirect_uri: string,
 *   error_message: string
 * }
 */
router.post('/', (req, res, next) => {
  var credentials = req.body;

  datasource.signup(credentials, (result) => {
    if (!result.success) {
      result = {
        success: false,
        error_message: result.error_message
      }
      return res.status(400).send(result);
    }

    req.login(result.user, function(err) {
      if (err) { return next(err); }
      result = {
        success: true,
        redirect_uri: "/posts/recent"
      };
      res.send(result);
    });
  });
});

router.get('/profile', (req, res, next) => {
  res.redirect("profile/"+req.session.passport.user);
});
router.get('/profile/:id', (req, res, next) => {
  datasource.retrieve(req.params['id'], req.user.id, (user) => {
    postsourece.retrieveperuser(req.user.id, (posts) => {
      postsourece.post_liked(req.user.id, (posts_liked) => {
        console.log(posts)

        res.render('profile_view', { name : user.username, birthdate : user.birthdate , user: user ,posts : posts,posts_liked:posts_liked});
      });});
  });
});

router.get('/:id', (req, res, next) => {
  datasource.retrieve(req.params['id'], req.user.id, (user) => {
    postsourece.retrieveperuser(req.user.id, (posts) => {
      postsourece.post_liked(req.user.id, (posts_liked) => {
        res.render('user_view', { name : user.username, birthdate : user.birthdate , user: user ,posts : posts,posts_liked:posts_liked});
      });});
  });
});
module.exports = router;
