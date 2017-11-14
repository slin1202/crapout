/**
 * Location.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	id: {
  		type: 'string',
  		unique: true,
  		primaryKey: true
  	},
  	cleanliness: {
  		type: 'float',
  		defaultsTo: 0
  	},
  	privacy: {
  		type: 'float',
  		defaultsTo: 0
  	},
  	amenities: {
  		type: 'float',
  		defaultsTo: 0
  	},
  	number_of_stalls: {
  		type: 'integer'
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
  	reviews: {
  		collection: 'review',
  		via: 'location'
  	},
  	average_rating: {
  		type: 'float',
  		defaultsTo: 0
  	},
  	images: {
  		collection: 'image',
  		via: 'location'
  	}
  }
};

