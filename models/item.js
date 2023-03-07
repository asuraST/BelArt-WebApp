const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const belartSchema = new Schema({
    name: {type: String, required: [true, 'Name is required']},
    artstyle: {type: String, required: [true, 'Art Category is required']},
    details: {type: String, required: [true, 'Details is required'],
              minLength: [10, 'The detail should have at least 10 characters']},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    artist: {type: String, required: [true, 'Artist is required']},
    createdon: {type: String, required: [true, 'Created on date is required']},
    image: {type: String, required: [true, 'Image details is required']},
    createAt:{type: String},
    status: { type: String, required: [true]}
    },
    {timestamps: true}
);

//collection name is belart in database
module.exports = mongoose.model('Belart', belartSchema);