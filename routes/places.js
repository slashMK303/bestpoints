const express = require('express');
const PlaceController = require('../controllers/places');
const wrapAsync = require('../utils/wrapAsync');
const isValidObjectid = require('../middlewares/isValidObjectid');
const isAuth = require('../middlewares/isAuth');
const { isAuthorPlace } = require('../middlewares/isAuthor');
const { validatePlace } = require('../middlewares/validator');
const upload = require('../config/multer');

const router = express.Router();

router.route('/')
    .get(wrapAsync(PlaceController.index))
    .post(isAuth, upload.array('image', 5), validatePlace, wrapAsync(PlaceController.store))

router.get('/create', isAuth, (req, res) => {
    res.render('places/create');
})

router.route('/:id')
    .get(isValidObjectid('/places'), wrapAsync(PlaceController.show))
    .put(isAuth, isAuthorPlace, isValidObjectid('/places'), upload.array('image', 5), validatePlace, wrapAsync(PlaceController.update))
    .delete(isAuth, isAuthorPlace, isValidObjectid('/places'), wrapAsync(PlaceController.destroy))

router.get('/:id/edit', isAuth, isAuthorPlace, isValidObjectid('/places'), wrapAsync(PlaceController.edit));

router.delete('/:id/images', isAuth, isAuthorPlace, isValidObjectid('/places'), wrapAsync(PlaceController.destroyImage));



module.exports = router;