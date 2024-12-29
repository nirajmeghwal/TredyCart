import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    embeddings:{
      type:Array,
       required:[true,"Please enter embeddings"]
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "Please enter Public ID"],
        },
        url: {
          type: String,
          required: [true, "Please enter URL"],
        },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please enter Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter Category"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Please enter Description"],
    },
    aiDescription :{
      type : String,
      default:"",
  },
    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", schema);
