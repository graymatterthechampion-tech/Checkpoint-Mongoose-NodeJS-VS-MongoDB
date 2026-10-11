// Person model: defines the shape of every "person" document in MongoDB.
const mongoose = require("mongoose");

// The schema lists each field, its type, and its rules (validators/defaults).
const personSchema = new mongoose.Schema({
  // name: a string that MUST be provided (required validator).
  name: {
    type: String,
    required: [true, "A person must have a name"],
    trim: true, // removes spaces at the start and end
  },

  // age: an optional number that can't be negative.
  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
  },

  // favoriteFoods: an array of strings. Declaring it as [String] (not a plain
  // Array) means Mongoose tracks push() changes automatically, so we don't
  // need markModified() when we edit it.
  favoriteFoods: {
    type: [String],
    default: [],
  },
});

// mongoose.model("Person", ...) creates the model. Mongoose stores the
// documents in a collection named "people" (the plural of "person").
const Person = mongoose.model("Person", personSchema);

module.exports = Person;