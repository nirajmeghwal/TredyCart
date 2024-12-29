import { Request } from "express";
import { redis, redisTTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { Review } from "../models/review.js";
import { User } from "../models/user.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import {
  deleteFromCloudinary,
  findAverageRatings,
  invalidateCache,
  uploadToCloudinary,
} from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
// import { faker } from "@faker-js/faker";
import { GoogleGenerativeAI } from "@google/generative-ai";
import similarity from "compute-cosine-similarity";

function calculateManhattanDistance(vectorA:any, vectorB:any) {
  return vectorA.reduce((sum:any, value:any, index:any) => sum + Math.abs(value - vectorB[index]), 0);
}

async function find_embedding(product:any){
   const genAI=new GoogleGenerativeAI(process.env.GEMINI_API!)
   const model = genAI.getGenerativeModel({ model: "text-embedding-004"}); 
   const text = product;
   const result = await model.embedContent(text);
   const embedding = result.embedding;
   return embedding.values;
}
export const getProductByEmbeddings=TryCatch(async(req,res,next)=>{
  const resultPerPage=12
  const productsCount = await Product.countDocuments();
  const text = req.query.text;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);    
 

  
  const summarizer = genAI.getGenerativeModel({
      model : "gemini-1.5-flash",
      systemInstruction: "Summarize the text and give the summary of the demand of customer. like the user first asked for dress and then writes show me \
      it should be blue then the model will summarize it as \"A Blue Dress\" you just give the description of product user wants and nothing more like A Blue Dress.",
  });

  // console.log(rfe)
  const currUser = await User.findById(req.query.id);

  var summTillNow = currUser!.chats + " " + text;
  const result = await summarizer.generateContent(summTillNow);
  const response = await result.response;
  var textSummary = response.text();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are a customer relations assistant for an e-commerce website. 
    Based on the user's input "${textSummary}", provide relevant product details without repeating the same response structure.`,
});

  
  const res2 = await model.generateContent(textSummary);
  const resp = await res2.response;
  const aiChat = resp.text();
  const AIRes = {
      "text" : aiChat
  };
  console.log(textSummary)
  const searchEmbedding = await find_embedding(textSummary);
  
  textSummary = textSummary + " " + aiChat;

  const newUserData = {
      name: currUser!.name,
      email: currUser!.email,
      gender: currUser!.gender,
      role: currUser!.role,
      chats : textSummary,
  }

  console.log(newUserData);
  // await User.findByIdAndUpdate(req.query.id, newUserData, {
  //     new: true,
  //     runValidators: true,
  //     useFindAndModify: false,
  // });

  const rawProducts = await Product.find();

  // const res3 = await storeUserChat()
  const similarityScores = rawProducts.map(embedding => ({
      similarity: similarity(searchEmbedding, embedding.embeddings),
      _id: embedding._id
  }));

//   const similarityScores = rawProducts.map(product => ({
//     similarity: calculateManhattanDistance(searchEmbedding, product.embeddings),
//     _id: product._id,
// }));

  
  // console.log(similarityScores)
  similarityScores.sort((a, b) => {
    const similarityA = a.similarity ?? -Infinity; // Use -Infinity if similarity is null
    const similarityB = b.similarity ?? -Infinity; // Use -Infinity if similarity is null
    
    return similarityB - similarityA;
  });
  // console.log(similarityScores);
    // Get the top 5 document IDs
  const top5Ids = similarityScores.slice(0, 2).map(score => score._id);

  const products = await Product.find({ _id: { $in: top5Ids } });
  const filteredProductsCount = products.length;
  //  return nearestAnswers;
  const prodNames = products.map(prod => ({
      name : prod.name,
      id : prod._id,
      photos:prod.photos,
      description:prod.description,
      price:prod.price

  }));

  res.status(200).json({
      success: true,
      prodNames,
      AIRes,
      productsCount,
      resultPerPage,
      filteredProductsCount,
  });
})

// Revalidate on New,Update,Delete Product & on New Order
export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products;

  products = await redis.get("latest-products");

  if (products) products = JSON.parse(products);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    await redis.setex("latest-products", redisTTL, JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  categories = await redis.get("categories");

  if (categories) categories = JSON.parse(categories);
  else {
    categories = await Product.distinct("category");
    await redis.setex("categories", redisTTL, JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  products = await redis.get("all-products");

  if (products) products = JSON.parse(products);
  else {
    products = await Product.find({});
    await redis.setex("all-products", redisTTL, JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  const key = `product-${id}`;

  product = await redis.get(key);
  if (product) product = JSON.parse(product);
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    await redis.setex(key, redisTTL, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category, description } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are a product description generator. For each product, you will be given a text in the form of key value pair you \
        have to generate full product summary showing the key features, cost, discounts etc. make a description as neutral as possible . if the desccription or highlight says the word good or bad just ignore it and focus only on specs\
        . remember to keep it as crisp as possible.Ignore links",
      });

    if (!photos) return next(new ErrorHandler("Please add Photo", 400));

    if (photos.length < 1)
      return next(new ErrorHandler("Please add atleast one Photo", 400));

    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 Photos", 400));

    if (!name || !price || !stock || !category || !description)
      return next(new ErrorHandler("Please enter All Fields", 400));

    // Upload Here

    const photosURL = await uploadToCloudinary(photos);
    var txt={
      "description":description,
       "title":name,
       "name":name,
       "price":price,
       "category":category
    }

    var stringVar=JSON.stringify(txt)
    const AIresult=await model.generateContent(stringVar)
    const response= AIresult.response
    var textSummary=response.text()
    const embeddings=await find_embedding(textSummary);
    const aiDescription=textSummary
     
    console.log('hii',textSummary)

    await Product.create({
      name,
      embeddings,
      price,
      description,
      stock,
      aiDescription,
      category: category.toLowerCase(),
      photos: photosURL,
    });

    await invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photos && photos.length > 0) {
    const photosURL = await uploadToCloudinary(photos);

    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);

    product.photos = photosURL;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;
  if(description)product.embeddings=await find_embedding(description)

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const ids = product.photos.map((photo) => photo.public_id);

  await deleteFromCloudinary(ids);

  await product.deleteOne();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const key = `products-${search}-${sort}-${category}-${price}-${page}`;

    let products;
    let totalPage;

    const cachedData = await redis.get(key);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      totalPage = data.totalPage;
      products = data.products;
    } else {
      // 1,2,3,4,5,6,7,8
      // 9,10,11,12,13,14,15,16
      // 17,18,19,20,21,22,23,24
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
      const skip = (page - 1) * limit;

      const baseQuery: BaseQuery = {};

      if (search)
        baseQuery.name = {
          $regex: search,
          $options: "i",
        };

      if (price)
        baseQuery.price = {
          $lte: Number(price),
        };

      if (category) baseQuery.category = category;

      const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

      const [productsFetched, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
      ]);

      products = productsFetched;
      totalPage = Math.ceil(filteredOnlyProduct.length / limit);

      await redis.setex(key, 30, JSON.stringify({ products, totalPage }));
    }

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
  let reviews;
  const key = `reviews-${req.params.id}`;

  reviews = await redis.get(key);

  if (reviews) reviews = JSON.parse(reviews);
  else {
    reviews = await Review.find({
      product: req.params.id,
    })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    await redis.setex(key, redisTTL, JSON.stringify(reviews));
  }

  return res.status(200).json({
    success: true,
    reviews,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review Update" : "Review Added",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review Not Found", 404));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401));

  await review.deleteOne();

  const product = await Product.findById(review.product);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\5ba9bd91-b89c-40c2-bb8a-66703408f986.png",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
