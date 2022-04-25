const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.mongoconnect = () => {
  mongoose.connect('mongodb://root:example@mongodb/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB Connected');
  }).catch(err => {
    console.log("Database connection error");
    console.log(err);
    process.exit(-1);
  });
};


const User = new Schema({
		username: {
			type: String,
		    unique: true,
		    required: true,
		    trim: true,
		},
		email: {
			type: String,
		    unique: true,
		    required: true,
		    trim: true,
		},
		password: {
			type: String,
            required: true,
		}
	}, {collection: 'users'});

exports.User = mongoose.model('User', User);
