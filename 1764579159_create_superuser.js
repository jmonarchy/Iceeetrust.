/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("donations");

  const existing = collection.fields.getByName("sponsor_type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("sponsor_type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "sponsor_type",
    required: false,
    values: ["General", "Sponsor a Project", "Sponsor a Community", "Sponsor a Youth Program", "Sponsor Environmental Activities"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("donations");
    collection.fields.removeByName("sponsor_type");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})