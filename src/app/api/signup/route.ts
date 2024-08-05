import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

// Ensure Response is imported correctly
import { NextResponse } from "next/server"; // Adjust this import based on your setup

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    // Debug statement
    console.log("Received data:", { username, email, password });

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username: username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({
      email: email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailSend = await sendVerificationEmail(username, email, verifyCode);
    console.log(emailSend);

    if (!emailSend.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailSend.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      {
        status: 200, // Changed to 200 for success
      }
    );
  } catch (error) {
    console.log("Error:", error); // Log full error

    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
