const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Challenge = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
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
	},
	score: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
		max: 1000
	}
    }, {collection: 'challenges'});

exports.Challenge = mongoose.model('Challenge', Challenge);
