var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const User = require('./User');

var EventSchema = new Schema({
    createdAt       : { type: Date }
  , updatedAt       : { type: Date }
  , name            : { type: String }
  , date            : { type: String }
  , dateFormatted   : { type: String }
  , description     : { type: String }
  , address         : { type: String }
  , placeId         : { type: String }
  , lat             : { type: Number }
  , lng             : { type: Number }
  , loc             : { type : [ Number ], index : '2d'}
  , organizer       : { type: String, required: true, unique: false }
  , organizerId     : { type: String, required: true, unique: false }
  , tags            : { type: String }
  , attendeeCount   : { type: Number, default: 1 }
  , attendees       : [String]
  , payout          : { type: Number, default: 0}
  , pins            : [{
      id : Number,
      img : String,
      pos : {lat : Number, lng : Number}
    }]
});

EventSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});


module.exports = mongoose.model('Event', EventSchema);
