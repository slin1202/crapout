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

  	amenities: {
  		type: 'float',
  		inRange: true
  	},

  	number_of_stalls: {
  		type: 'float',
  		inStallRange: true
  	},

  	accessible: {
  		type: 'boolean'
  	},

  	public_space: {
  		type: 'boolean'
  	},

  	change_table: {
  		type: 'boolean'
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
  		return !(value > 5 || value < 1) || (value == null);
  	},
  	inStallRange: function(value){
  		return (value >= 0 && value < 20) || (value == null);
  	}
  },

  getAverageRating: function(reviews, values, attribute){
	var total = 0;
  	let nonNullReviews = _.filter(reviews, (review) => {
  		return (review[attribute] !== null);
  	});

	var numberOfReviews = nonNullReviews.length + (values[attribute] ? 1 : 0);
	if(numberOfReviews == 0) return null;
	_.forEach(nonNullReviews, (review) => {
		total += review[attribute];
	});


	return (total + (values[attribute] || 0))/numberOfReviews;
  },

  getAverageBoolean: function(reviews, values, attribute){
  	let nonNullReviews = _.filter(reviews, (review) => {
  		return (review[attribute] !== null);
  	});

  	let trueReviews = _.filter(nonNullReviews, (review) => { return !!review[attribute]});
  	let value = values[attribute] ? 1 : 0;
  	return (trueReviews.length + value) >= (nonNullReviews.length + 1)/2;
  },

  getAverage: function(arrayOfNumbers){
  	let definedArrayOfNumbers = _.filter(arrayOfNumbers, (number) => {return (number !== undefined)});
  	return definedArrayOfNumbers.reduce((a, b)=>a+b, 0)/_.filter(definedArrayOfNumbers, (number) => {return (number !== null)}).length;
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

			var averageRating = this.getAverage([reviewCleanliness, reviewPrivacy, reviewAmenities]);

			Location.create({
				id: place_id,
				accessible: reviewAccessible,
				cleanliness: reviewCleanliness ? reviewCleanliness.toFixed(1) : null,
				privacy: reviewPrivacy ? reviewPrivacy.toFixed(1) : null,
				change_table: reviewChangeTable,
				public_space: reviewPublic,
				amenities: reviewAmenities ? reviewAmenities.toFixed(1) : null,
				number_of_stalls: reviewStalls ? Math.floor(averageStalls) : null,
				average_rating: averageRating ? averageRating.toFixed(1) : null
			}).exec((err) => {
				cb(err);
			});
		} else {

			var averageAccessible = this.getAverageBoolean(foundLocation.reviews, values, "accessible");
			var averagePublic = this.getAverageBoolean(foundLocation.reviews, values, "public_space");
			var averageChangeTable = this.getAverageBoolean(foundLocation.reviews, values, "change_table");

			var averageCleanliness = this.getAverageRating(foundLocation.reviews, values, "cleanliness");
			var averagePrivacy = this.getAverageRating(foundLocation.reviews, values, "privacy");
			var averageAmenities = this.getAverageRating(foundLocation.reviews, values, "amenities");
			var averageStalls = this.getAverageRating(foundLocation.reviews, values, "number_of_stalls");

			var averageRating = this.getAverage([averageCleanliness, averagePrivacy, averageAmenities]);

			Location.update({id: place_id}, {
				accessible: averageAccessible,
				cleanliness: averageCleanliness ? averageCleanliness.toFixed(1) : null,
				privacy: averagePrivacy ? averagePrivacy.toFixed(1) : null,
				change_table: averageChangeTable,
				public_space: averagePublic,
				amenities: averageAmenities ? averageAmenities.toFixed(1) : null,
				number_of_stalls: averageStalls ? Math.floor(averageStalls) : null,
				average_rating: averageRating ? averageRating.toFixed(1) : null
			}).exec((err) => {
				cb(err);
			});
		}
	});

  }
};

