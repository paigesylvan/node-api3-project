const express = require("express");

// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required
const {
  validateUserId,
  validateUser,
  validatePost,
} = require("../middleware/middleware.js");

const User = require("./users-model");
const Post = require("../posts/posts-model");

const router = express.Router();

router.get("/", (req, res, next) => {
  User.get()
    .then((users) => res.json(users))
    .catch(next);
});

router.get("/:id", validateUserId, (req, res) => {
  // RETURN THE USER OBJECT
  // this needs a middleware to verify user id
  res.json(req.user);
});

router.post("/", validateUser, (req, res, next) => {
  // RETURN THE NEWLY CREATED USER OBJECT
  // this needs a middleware to check that the request body is valid
  User.insert({ name: req.name })
    .then((newUser) => {
      res.status(201).json(newUser);
    })
    .catch(next);
});

router.put("/:id", validateUser, validateUserId, (req, res, next) => {
  User.update(req.params.id, { name: req.name })
    .then(() => {
      return User.getById(req.params.id);
    })
    .then((user) => res.json(user))
    .catch(next);
});

router.delete("/:id", validateUserId, async (req, res, next) => {
  try {
    await User.remove(req.params.id);
    res.json(req.user);
  } catch (err) {
    next(err);
  }
  console.log(req.user);
});

router.get("/:id/posts", validateUserId, async (req, res, next) => {
  try {
    const result = await User.getUserPosts(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/posts",
  validateUserId,
  validatePost,
  async (req, res, next) => {
    try {
      const result = await Post.insert({
        user_id: req.params.id,
        text: req.text,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: "user not found",
    errMessage: err.message,
    stack: err.stack,
  });
});

// do not forget to export the router
module.exports = router;