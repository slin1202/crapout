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

  	privacy: {
  		type: 'float',
  		inRange: true
  	},

  	accessible: {
  		type: 'boolean',
  		defaultsTo: false
  	},

  	public_space: {
  		type: 'boolean',
  		defaultsTo: false
  	},

  	change_table: {
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

  getAverageRating: function(reviews, values, attribute){
	var total = 0;
	var numberOfReviews = reviews.length + 1;
	_.forEach(reviews, (review) => {
		total += review[attribute];
	});
	return (total + values[attribute])/numberOfReviews;
  },

  beforeCreate: function(values, cb){

	let place_id = values['location'];
	let reviewAccessible = values['accessible'];
	let reviewPublic = values['public_space'];
	let reviewCleanliness = values['cleanliness'];
	let reviewPrivacy = values['privacy'];
	let reviewChangeTable = values['change_table'];

	Location.findOne({id: place_id}).populate('reviews').exec((err, foundLocation) => {
		if(err) cb(err);

		if(!foundLocation){
			Location.create({
				id: place_id,
				accessible: reviewAccessible,
				cleanliness: reviewCleanliness,
				public_space: reviewPublic,
				privacy: reviewPrivacy,
				change_table: reviewChangeTable
			}).exec((err) => {
				cb(err);
			});
		} else {
			var numberOfReviews = foundLocation.reviews.length + 1;
			var averageAccessible = (_.filter(foundLocation.reviews, {accessible: true}).length + (reviewAccessible ? 1 : 0)) > numberOfReviews/2;
			var averagePublic = (_.filter(foundLocation.reviews, {public_space: true}).length + (reviewPublic ? 1 : 0)) > numberOfReviews/2;
			var averageChangeTable = (_.filter(foundLocation.reviews, {change_table: true}).length + (reviewChangeTable ? 1 : 0)) > numberOfReviews/2;

			var averageCleanliness = this.getAverageRating(foundLocation.reviews, values, "cleanliness");
			var averagePrivacy = this.getAverageRating(foundLocation.reviews, values, "privacy");

			Location.update({id: place_id}, {
				accessible: averageAccessible,
				cleanliness: averageCleanliness,
				privacy: averagePrivacy,
				change_table: averageChangeTable,
				public_space: averagePublic,
				average_rating: averageCleanliness
			}).exec((err) => {
				cb(err);
			});
		}
	});

  }
};

