/**
 * Review.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	cleanliness: {
  		type: 'float',
  		inRange: true
  	},

  	accessible: {
  		type: 'boolean',
  		defaultsTo: false
  	},

  	public: {
  		type: 'boolean',
  		defaultsTo: false
  	},

  	username: {
  		type: 'string',
  		defaultsTo: '',
  		alphanumericdashed: true,
  		maxLength: 20
  	},

  	location: {
  		model: 'location'
  	}

  },


  types: {
  	inRange: function(value){
  		return !(value > 5 || value < 1);
  	}
  },

  beforeCreate: function(values, cb){

	let place_id = values['location'];
	let reviewAccessible = values['accessible'];
	let reviewPublic = values['public'];
	let reviewCleanliness = values['cleanliness'];

	Location.findOne({id: place_id}).populate('reviews').exec((err, foundLocation) => {
		if(err) cb(err);

		if(!foundLocation){
			Location.create({
				id: place_id,
				accessible: reviewAccessible,
				cleanliness: reviewCleanliness,
				public: reviewPublic
			}).exec((err) => {
				cb(err);
			});
		} else {
			var numberOfReviews = foundLocation.reviews.length + 1;
			var averageAccessible = (_.filter(foundLocation.reviews, {accessible: true}).length + (reviewAccessible ? 1 : 0)) > numberOfReviews/2;
			var averagePublic = (_.filter(foundLocation.reviews, {public: true}).length + (reviewPublic ? 1 : 0)) > numberOfReviews/2;

			var totalCleanliness = 0;
			_.forEach(foundLocation.reviews, (review) => {
				totalCleanliness += review.cleanliness;
			});
			var averageCleanliness = (totalCleanliness + reviewCleanliness)/numberOfReviews;
			Location.update({id: place_id}, {
				accessible: averageAccessible,
				cleanliness: averageCleanliness,
				public: averagePublic,
				average_rating: averageCleanliness
			}).exec((err) => {
				cb(err);
			});
		}
	});

  }
};

