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
  		inRange: true,
  		defaultsTo: 1
  	},

  	privacy: {
  		type: 'float',
  		inRange: true,
  		defaultsTo: 1
  	},

  	amenities: {
  		type: 'float',
  		inRange: true,
  		defaultsTo: 1
  	},

  	number_of_stalls: {
  		type: 'float',
  		inStallRange: true,
  		defaultsTo: 0
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

  	comment: {
  		type: 'string',
  		defaultsTo: ''
  	},

  	location: {
  		model: 'location'
  	}

  },


  types: {
  	inRange: function(value){
  		return !(value > 5 || value < 1);
  	},
  	inStallRange: function(value){
  		return (value >= 0 && value < 20);
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
	let reviewAmenities = values['amenities'];
	let reviewStalls = values['stalls'];
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
				change_table: reviewChangeTable,
				amenities: reviewAmenities,
				number_of_stalls: reviewStalls
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
			var averageAmenities = this.getAverageRating(foundLocation.reviews, values, "amenities");
			var averageStalls = this.getAverageRating(foundLocation.reviews, values, "number_of_stalls");

			Location.update({id: place_id}, {
				accessible: averageAccessible,
				cleanliness: averageCleanliness.toFixed(1),
				privacy: averagePrivacy.toFixed(1),
				change_table: averageChangeTable,
				public_space: averagePublic,
				amenities: averageAmenities.toFixed(1),
				number_of_stalls: Math.floor(averageStalls),
				average_rating: ((averageCleanliness + averagePrivacy + averageAmenities)/3).toFixed(1)
			}).exec((err) => {
				cb(err);
			});
		}
	});

  }
};

