const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoutes = require("../middlewares/roleMiddleware");

router.get(
  "/",
  verifyToken,
  authorizeRoutes("Super Admin", "Manager", "User"),
  postController.getQuotes
);

router.post(
  "/",
  verifyToken,
  authorizeRoutes("Super Admin", "Manager", "User"),
  postController.createQuotes
);

router.post(
  "/:id",
  verifyToken,
  authorizeRoutes("Super Admin", "Manager"),
  postController.updateQuotes
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoutes("Super Admin"),
  postController.deleteQuotes
);

module.exports = router;
