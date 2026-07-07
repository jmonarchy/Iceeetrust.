/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("donations");
  const field = collection.fields.getByName("payment_method");
  field.values = ["Visa/Mastercard", "Mobile Money", "Bank Transfer", "PayPal", "M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"];
  field.maxSelect = 1;
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("donations");
  const field = collection.fields.getByName("payment_method");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["Visa", "Mastercard", "PayPal", "M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Bank Transfer"];
  field.maxSelect = 0;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})