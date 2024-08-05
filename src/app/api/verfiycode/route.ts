import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, code } = await req.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({
      username: decodedUsername,
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 500,
        }
      );
    }

    const isUserValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isUserValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account Verified Successfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code Expired",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Code is incorrect",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: "Error verifying User",
      },
      {
        status: 500,
      }
    );
  }
}
