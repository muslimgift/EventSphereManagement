const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  StallName: {
    type: String,
    required: true,
  },
  Product:{
    type: String,
    required: true,
  },
  StaffName:{
    type: String,
    required: true,
  },
  boothId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "BoothSchema",
},
locationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "LocationSchema",
},

  file: {
  type: String,
  required: [true, "A related file is required"],
},
status:{
  type:String,
  enum:["Waiting","Approved"],
  default:"Waiting"

}

}, { timestamps: true });

const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);
module.exports = EventRegistration;