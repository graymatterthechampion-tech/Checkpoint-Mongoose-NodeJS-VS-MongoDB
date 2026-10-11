const Person = require("./models/Person");

// Helper: waits for a promise and passes its result to a Node-style callback.
// The two-argument form of then() guarantees done() is called exactly once.
function sendToCallback(promise, done) {
  promise.then(
    (data) => done(null, data),
    (error) => done(error)
  );
}

// 1. Create and save ONE person with document.save().
const createAndSavePerson = (done) => {
  const person = new Person({
    name: "Johnny",
    age: 28,
    favoriteFoods: ["jollof rice", "pizza"],
  });

  sendToCallback(person.save(), done);
};

// 2. Create MANY people at once with Model.create(arrayOfPeople).
const createManyPeople = (arrayOfPeople, done) => {
  sendToCallback(Person.create(arrayOfPeople), done);
};

// 3. Find ALL people with a given name -> returns an array (empty if none).
const findPeopleByName = (personName, done) => {
  sendToCallback(Person.find({ name: personName }), done);
};

// 4. Find ONE person who has `food` in their favoriteFoods array.
//    Matching a single value against an array field checks "does the array contain it?".
const findOneByFood = (food, done) => {
  sendToCallback(Person.findOne({ favoriteFoods: food }), done);
};

// 5. Find the (only!) person with a given _id -> returns one document or null.
const findPersonById = (personId, done) => {
  sendToCallback(Person.findById(personId), done);
};

// 6. Classic update: find by _id, edit the document in JavaScript, then save it.
const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  const updatePromise = Person.findById(personId).then((person) => {
    // findById returns null when no person has this _id.
    if (!person) {
      throw new Error(`No person found with id ${personId}`);
    }

    person.favoriteFoods.push(foodToAdd);
    return person.save();
  });

  sendToCallback(updatePromise, done);
};

// 7. New-style update: find by name and set age to 20 in one database call.
//    { new: true } makes Mongoose return the UPDATED document instead of the old one.
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  sendToCallback(
    Person.findOneAndUpdate(
      { name: personName },
      { age: ageToSet },
      { new: true }
    ),
    done
  );
};

// 8. Delete ONE person by _id. Returns the deleted document (or null if not found).
const removeById = (personId, done) => {
  sendToCallback(Person.findByIdAndDelete(personId), done);
};

// 9. Delete ALL people named "Mary". Returns a summary like
//    { acknowledged: true, deletedCount: 2 }, not the deleted documents.
const removeManyPeople = (done) => {
  const nameToRemove = "Mary";

  sendToCallback(Person.deleteMany({ name: nameToRemove }), done);
};

// 10. Chain query helpers: people who like burritos, sorted by name (A to Z),
//     at most 2 results, without the age field.
const queryChain = (done) => {
  const foodToSearch = "burrito";

  sendToCallback(
    Person.find({ favoriteFoods: foodToSearch })
      .sort({ name: 1 })   // 1 = ascending (A to Z)
      .limit(2)            // return at most 2 documents
      .select({ age: 0 })  // 0 = hide this field
      .exec(),
    done
  );
};

module.exports = {
  createAndSavePerson,
  createManyPeople,
  findPeopleByName,
  findOneByFood,
  findPersonById,
  findEditThenSave,
  findAndUpdate,
  removeById,
  removeManyPeople,
  queryChain,
};