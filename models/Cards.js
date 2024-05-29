const mongoose = require("mongoose");

const CardsSchema = new mongoose.Schema(
  {
    title: { type: String },
    name: { type: String },
    location: { type: String },
    description: { type: String },
    website_url: { type: String },
    features:[
      {
        type:String
      }
    ],
    items: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Card",
      },
    ],
    image: {
      filename: { type: String },
      mimetype: { type: String },
      path: { type: String },
    },
    bg_img: {
      filename: { type: String },
      mimetype: { type: String },
      path: { type: String },
    },
    authorized: { type: Boolean },
    webiste_url: { type: String },
    is_parent: {type:Boolean}
  },
  { timestamps: true }
);

const Cards = mongoose.model("Card", CardsSchema);

module.exports = Cards;
