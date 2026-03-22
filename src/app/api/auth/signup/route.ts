import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { signupSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return apiError("Invalid input", 400, result.error.flatten());
    }

    const { email, password, name } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    return apiSuccess(
      { id: user.id, email: user.email, name: user.name },
      201
    );
  } catch {
    return apiError("Internal server error", 500);
  }
}
