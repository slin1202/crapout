/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY
});
const _ = require('lodash');


module.exports = {

	_config: {
		actions: false,
		rest: false
	},

	index: function(req, res){
		if(!req.param('lat') || !req.param('lng')) return res.serverError("No latitude or longitude sent, (send in params as lat and lng)");
		const location = [req.param('lat'), req.param('lng')];
		googleMapsClient.placesNearby(
			{
				language: 'en',
      		 	location: location,
      			radius: 1000
      		}, function(err, googleResponse){
      			if(err) return res.serverError(err);

				let places = _.map(googleResponse.json.results, (place) => {
					return {
						name: place.name,
						coordinates: place.geometry.location,
						id: place.place_id,
						types: place.types,
						open: (place.opening_hours && place.opening_hours.open_now),
						price_level: place.price_level,
						location_exists: false
					};
				});

				googleMapsClient.distanceMatrix(
					{
						origins: [location],
					 	destinations: _.map(places, "coordinates")
					}, (err, distanceResponse) => {
						if(err) return res.serverError(err);
						_.forEach(places, (place, i) => {
							place.distance = distanceResponse.json.rows[0].elements[i].distance;
							place.duration = distanceResponse.json.rows[0].elements[i].duration;
						});

						let place_ids = _.map(places, (place) => {
							return place.id;
						});

						Location.find({id: place_ids}).populate('images').exec((err, foundLocations) => {
							if(err) return res.serverError(err);

							_.forEach(places, (place) => {
								let foundLocation = _.find(foundLocations, {id: place.id});
								if(foundLocation){
									_.assign(place, foundLocation);
									place.location_exists = true;
									delete place.reviews;
								}
							});
							res.send(places);
						});

					});

		});
	},

	findOne: function(req, res){
		if(!req.param('id')) return res.serverError("No location id was sent");

		googleMapsClient.place({placeid: req.param('id')}, (err, placeResponse) => {
			if(err) return res.serverError(err);

			Location.findOne({id: req.param('id')}).populate('reviews').populate('images').exec((err, foundLocation) => {
				if(err) return res.serverError(err);
				let place = placeResponse.json.result;
				let placeResult = {
					name: place.name,
					coordinates: place.geometry.location,
					id: place.place_id,
					types: place.types,
					open: (place.opening_hours && place.opening_hours.open_now),
					price_level: place.price_level
				};
				if(!foundLocation) {
					return res.send(_.assign({
					  "reviews": [],
					  "images": [],
					  "cleanliness": null,
					  "accessible": null,
					  "public": null,
					  "average_rating": null,
					  "createdAt": null,
					  "updatedAt": null
					}, placeResult));
				}
				res.send(_.assign(foundLocation, placeResult));
			});
		});
	},

	reviews: function(req, res){
		if(!req.param('location_id')) return res.serverError("No location id was sent");
		Location.findOne({id: req.param('location_id')}).populate('reviews').exec((err, foundLocation) => {
			if(err) return res.serverError(err);
			if(!foundLocation) return res.send([]);
			res.send(foundLocation.reviews);
		});
	},

	images: function(req, res){
		if(!req.param('location_id')) return res.serverError("No location id was sent");
		Location.findOne({id: req.param('location_id')}).populate('images').exec((err, foundLocation) => {
			if(err) return res.serverError(err);
			if(!foundLocation) return res.send([]);
			res.send(foundLocation.images);
		});
	}
};

