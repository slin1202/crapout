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
  	accessible: {
  		type: 'boolean',
  		defaultsTo: false
  	},
  	public: {
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

