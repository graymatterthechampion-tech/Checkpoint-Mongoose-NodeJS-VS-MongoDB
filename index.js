// Entry point: connects to MongoDB, runs every exercise in order, and prints
// the result of each one so you can screenshot or check them.
require("dotenv").config({ quiet: true }); // loads MONGO_URI from .env (quiet: no startup banner)
const { promisify } = require("util");
const mongoose = require("mongoose");
const app = require("./myApp");

// promisify turns each done-callback function into one we can `await`.
const createAndSavePerson = promisify(app.createAndSavePerson);
const createManyPeople = promisify(app.createManyPeople);
const findPeopleByName = promisify(app.findPeopleByName);
const findOneByFood = promisify(app.findOneByFood);
const findPersonById = promisify(app.findPersonById);
const findEditThenSave = promisify(app.findEditThenSave);
const findAndUpdate = promisify(app.findAndUpdate);
const removeById = promisify(app.removeById);
const removeManyPeople = promisify(app.removeManyPeople);
const queryChain = promisify(app.queryChain);

// Sample data for Model.create(). Two Marys (for removeManyPeople) and
// three burrito lovers (to show limit(2) and sort working).
const arrayOfPeople = [
  { name: "Mary", age: 30, favoriteFoods: ["salad", "burrito"] },
  { name: "Mary", age: 25, favoriteFoods: ["pasta"] },
  { name: "Ali", age: 22, favoriteFoods: ["burrito", "shawarma"] },
  { name: "Zainab", age: 35, favoriteFoods: ["burrito", "suya"] },
  { name: "Ben", age: 40, favoriteFoods: ["rice"] },
];

// Prints a heading plus the result, formatted so it's easy to read.
function show(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  const uri = process.env.MONGO_URI;

  // Stop early with a clear message if .env is missing or misspelled.
  if (!uri) {
    console.error("MONGO_URI is missing. Add it to your .env file.");
    process.exitCode = 1;
    return;
  }

  // The checkpoint shows { useNewUrlParser: true, useUnifiedTopology: true }.
  // Those options were removed in newer versions: Mongoose 9 throws
  // "options usenewurlparser, useunifiedtopology are not supported" if you pass them.
  // Both behaviours are now always on, so no options are needed.
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const johnny = await createAndSavePerson();
  show("1. createAndSavePerson (save)", johnny);

  const people = await createManyPeople(arrayOfPeople);
  show(`2. createManyPeople (create) - ${people.length} people saved`, people);

  show('3. findPeopleByName("Mary")', await findPeopleByName("Mary"));

  show('4. findOneByFood("burrito")', await findOneByFood("burrito"));

  show("5. findPersonById (Johnny's _id)", await findPersonById(johnny._id));

  show(
    '6. findEditThenSave (adds "hamburger" to Johnny)',
    await findEditThenSave(johnny._id)
  );

  show('7. findAndUpdate("Ben") -> age 20', await findAndUpdate("Ben"));

  show("8. removeById (deletes Johnny)", await removeById(johnny._id));

  show('9. removeManyPeople (deletes every "Mary")', await removeManyPeople());

  show("10. queryChain (burrito lovers, sorted, max 2, no age)", await queryChain());
}

// Run everything; on any error print a helpful message, and ALWAYS disconnect.
main()
  .catch((error) => {
    console.error("\nSomething went wrong:", error.message);

    if (error.message.includes("bad auth")) {
      console.error("-> Wrong username or password in MONGO_URI.");
    } else if (error.name === "MongooseServerSelectionError") {
      console.error(
        "-> Can't reach the database. For Atlas: add your IP in Network Access. " +
          "For local MongoDB: run `brew services start mongodb-community`."
      );
    }

    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());