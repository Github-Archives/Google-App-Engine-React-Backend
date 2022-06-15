// MongoDb schema (cleans up when calling MongoDb)
//  a js model created with a mongoose package. mongoose is all about using models to represent data in mongoDB
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});


// creates a model from the schema and exports it
module.exports = mongoose.model('Event', eventSchema);