const express = require('express');
const ReviewController = require('../controllers/reviews');
const wrapAsync = require('../utils/wrapAsync');
const isValidObjectid = require('../middlewares/isValidObjectid');
const isAuth = require('../middlewares/isAuth');
const { isAuthorReview } = require('../middlewares/isAuthor');
const { validateReview } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

router.post('/', isAuth, isValidObjectid('/places'), validateReview, wrapAsync(ReviewController.store));

router.delete('/:review_id', isAuth, isAuthorReview, isValidObjectid('/places'), wrapAsync(ReviewController.destroy));

module.exports = router;