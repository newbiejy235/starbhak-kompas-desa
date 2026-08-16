// lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});

console.log(cloudinary.config());


export default cloudinary;
