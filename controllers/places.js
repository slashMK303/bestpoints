const Place = require('../models/place');
const fs = require('fs');
const { geometry } = require('../utils/hereMaps');
const ExperssError = require('../utils/ErrorHandler');

module.exports.index = async (req, res) => {
    const places = await Place.find();
    const clusteringPlace = places.map(place => {
        return {
            latitude: place.geometry.coordinates[1],
            longitude: place.geometry.coordinates[0],
        }
    })
    const clusteredPlace = JSON.stringify(clusteringPlace);
    res.render('places/index', { places, clusteredPlace });
}

module.exports.store = async (req, res, next) => {
    const images = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }));

    const geoData = await geometry(req.body.place.location);

    console.log(geoData);

    const place = new Place(req.body.place);
    place.author = req.user._id;
    place.images = images;
    place.geometry = geoData;

    await place.save();

    req.flash('success_msg', 'Successfully created place!');
    res.redirect('/places');
}

module.exports.show = async (req, res) => {
    const place = await Place.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    res.render('places/show', { place });
}

module.exports.edit = async (req, res) => {
    const place = await Place.findById(req.params.id);
    res.render('places/edit', { place });
}

module.exports.update = async (req, res) => {
    const { place } = req.body;

    const geoData = await geometry(place.location);

    const newPlace = await Place.findByIdAndUpdate(req.params.id, { ...place, geometry: geoData });

    if (req.files && req.files.length > 0) {

        place.images.forEach(image => {
            fs.unlink(image.url, err => new ExperssError(err));
        })

        const images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));

        place.images = images;
        await newPlace.save();
    }

    req.flash('success_msg', 'Successfully updated place!');
    res.redirect(`/places/${req.params.id}`);
}

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const place = await Place.findById(id)

    if (place.images.length > 0) {

        place.images.forEach(image => {
            fs.unlink(image.url, err => new ExperssError(err));
        })
    }

    await place.deleteOne();

    req.flash('success_msg', 'Successfully deleted place!');
    res.redirect('/places');
}

module.exports.destroyImage = async (req, res) => {
    try {
        const { id } = req.params
        const { images } = req.body

        if (!images || images.length === 0) {
            req.flash('error_msg', 'No image selected')
            return res.redirect(`/places/${id}/edit`)
        }

        images.forEach(image => {
            fs.unlinkSync(image);
        });

        await Place.findByIdAndUpdate(
            id,
            { $pull: { images: { url: { $in: images } } } },
        );

        req.flash('success_msg', 'Successfully deleted images!');
        return res.redirect(`/places/${id}/edit`);
    } catch (error) {
        req.flash('error_msg', 'Failed to delete images');
        return res.redirect(`/places/${id}/edit`);
    }
}