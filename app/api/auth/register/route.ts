
import { NextResponse } from "next/server"
import { dbConnection } from "@/db"
import { users } from "@/db/schema"
import { signUpSchema } from "@/utils/zod"
import { saltAndHashPassword } from "@/utils/authUtils"
// import { ulid } from "ulid"
import { eq } from "drizzle-orm"
import { ZodError } from "zod"
import { v7 as uuid } from "uuid"

export async function POST(req: Request) {
// Check if the request is a POST request
  if (req.method !== "POST") {
    return NextResponse.json({
        success: false,
        message: "Method not allowed",
        status: 405,
    })
}

  try {
    const body = await req.json()
    const { email, password, name } = await signUpSchema.parseAsync(body)

    // Check if user already exists
    const existingUser = await dbConnection
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists",
        status: 409,
      })
    }

    const hashedPassword = await saltAndHashPassword(password)

    const newuserPayload = {
        id: uuid(),
        email,
        name,
        // username,
        password: hashedPassword,
    }

    const newUser = await dbConnection.insert(users).values(newuserPayload).returning()

    return NextResponse.json({
        success: true,
        message: "User registered successfully",
        status: 201,
        data: newUser[0]
    })

  } catch (error) {

    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        message: "Validation error",
        errors: error.errors,
        status: 422,
      })
    }

    console.error('Registration error:', error)
    return NextResponse.json({
        success: false,
        message: "There was an while registering the user",
        status: 500,
    })
  }
}