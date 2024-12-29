import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
import nodemailer from "nodemailer"

interface CartItem {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export const sendEmail = TryCatch(async (req, res) => {
  const { receiver_email, shippingInfo, cartItems, subtotal, tax, discount, shippingCharges, total } = req.body;

  const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  // Format cart items into a string
  const cartItemsText = (cartItems as CartItem[]).map((item: CartItem) => 
    `- ${item.name}: ${item.quantity} x $${item.price}`
  ).join('\n');


  const emailText = `
    Dear Customer,

    This is to inform you that you have successfully completed the transaction. Here are the details of your purchase:

    Shipping Information:
    ${shippingInfo.address}

    Cart Items:
    ${cartItemsText}

    Charges:
    Subtotal: $${subtotal}
    Tax: $${tax}
    Discount: $${discount}
    Shipping Charges: $${shippingCharges}
    Total: $${total}

    Thank you for your purchase!

    Best regards,
    KUNAL JHA
  `;

  // console.log(cartItemsText)
  // console.log(receiver_email)

  const receiver = {
    from: process.env.EMAIL_USER,
    to: receiver_email,
    subject: "Verification Of Stripe Payment",
    text: emailText
  };

  try {
    await auth.sendMail(receiver);
    console.log("Success!");
    res.status(200).json('Email sent successfully');
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json('Error sending email');
  }
  });

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Please enter amount", 400));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  if (!code || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 400));

  await Coupon.create({ code, amount });

  return res.status(201).json({
    success: true,
    message: `Coupon ${code} Created Successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  return res.status(200).json({
    success: true,
    coupon,
  });
});

export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const { code, amount } = req.body;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  if (code) coupon.code = code;
  if (amount) coupon.amount = amount;

  await coupon.save();

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Updated Successfully`,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Deleted Successfully`,
  });
});
