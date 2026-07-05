const dotenv = require("dotenv");
const mongoose = require("mongoose");


dotenv.config({
  quiet: true,
});


beforeAll(async () => {
  const developmentUri =
    process.env.MONGO_URI;

  const testUri =
    process.env.MONGO_URI_TEST;


  if (!testUri) {
    throw new Error(
      "MONGO_URI_TEST is required for integration tests."
    );
  }


  if (testUri === developmentUri) {
    throw new Error(
      "MONGO_URI_TEST must not be the same as MONGO_URI."
    );
  }


  const parsedTestUri =
    new URL(testUri);

  const testDatabaseName =
    parsedTestUri.pathname
      .replace(/^\/+/, "")
      .trim();


  if (
    !testDatabaseName ||
    !testDatabaseName.endsWith(
      "_test"
    )
  ) {
    throw new Error(
      "Test database name must end with _test."
    );
  }


  await mongoose.connect(testUri);


  if (
    mongoose.connection.name !==
    testDatabaseName
  ) {
    throw new Error(
      "Connected database does not match the expected test database."
    );
  }
});


afterAll(async () => {
  await mongoose.disconnect();
});
