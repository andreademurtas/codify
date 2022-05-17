const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Challenge = new Schema({
    title: {
        type: String,
	  	required: true,
   	  	trim: true,
   	  	minlength: 1,
	},
    description: {
        type: String,
	  	required: true,
   	  	trim: true,
   	  	minlength: 1,
	},
    answer: {
	  	type: String,
	  	required: true,
   	  	trim: true,
   	  	minlength: 1,
	}
    }, {collection: 'challenges'});

exports.Challenge = mongoose.model('Challenge', Challenge);