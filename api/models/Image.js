/**
 * Image.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	image_path: {
  		type: 'string'
  	},
  	location: {
  		model: 'location'
  	}
  },

  beforeCreate: function(values, cb){

	let place_id = values['location'];
	console.log(place_id)
	Location.findOne({id: place_id}).exec((err, foundLocation) => {
		if(err) cb(err);

		if(!foundLocation){
			Location.create({
				id: place_id
			}).exec((err) => {
				cb(err);
			});
		} else {
			cb();
		}
	});

  }
};

