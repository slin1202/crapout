/**
 * ImageController
 *
 * @description :: Server-side logic for managing Images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");

module.exports = {

	_config: {
		actions: false,
		shortcuts: false,
		rest: false
	},
	upload: function(req, res) {
	    if(req.method === 'GET') return res.json({ 'status': 'GET not allowed' });
	    //	Call to /upload via GET is error

	    if(!req.param('location_id')) return res.json({'status': 'No location was sent'});

    	Location.find({id: req.param('location_id')}).exec((err, foundLocation) => {
    		if(err) return res.serverError(err);
    		if(!foundLocation) return res.serverError("No location was found.");

		    var uploadFile = req.file('image');
		    uploadFile.upload({
		    	adapter: require('skipper-s3'),
		    	key: process.env.AWS_ACCESS_KEY,
		    	secret: process.env.AWS_SECRET_KEY,
		    	bucket: 'crapout'
		    }, function onUploadComplete(err, files) {
		        //	Files will be uploaded to .tmp/uploads

		        if (err) return res.serverError(err);
		        //	IF ERROR Return and send 500 error with error
    		    let imagePath = files[0] && files[0].extra ? files[0].extra.Location : "";

		        Image.create({location: req.param('location_id'), image_path: imagePath }).exec((err, createdImage) => {
		        	if(err) return res.serverError(err);
		        	res.send(createdImage);
		        });

		    });
    	})


	}
};

