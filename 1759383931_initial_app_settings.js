/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("donations");

  const existing = collection.fields.getByName("payment_method");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("payment_method"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "payment_method",
    required: false,
    values: ["Visa/Mastercard", "PayPal", "Airtel Money", "M-Pesa", "Tigo Pesa", "HaloPesa", "Bank Transfer"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("donations");
    collection.fields.removeByName("payment_method");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})