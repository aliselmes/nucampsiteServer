const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,(req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            for (let i = (req.body.length-1); i >= 0; i--) {
                if (!favorite.campsites.includes(req.body[i]._id)) {
                    favorite.campsites.push(req.body[i]._id)
                }
            }
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({user: req.user._id })
            .then(favorite => {
                for (let i = (req.body.length-1); i >= 0; i--) {
                    if (!favorite.campsites.includes(req.body[i]._id)) {
                        favorite.campsites.push(req.body[i]._id)
                    }
                }
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite)
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete');
        }
    })
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite){
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
            })
            .catch(err => next(err));
            } else {
                err = new Error('That campsite is already in the list of favorites!');
                err.status = 403;
                return next(err);
            }   
        } else {
            Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            favorite.campsites = favorite.campsites.filter(campsite => campsite.toString() !== req.params.campsiteId);
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.end('No favorites to delete!');
        }
    })
});

module.exports = favoriteRouter;