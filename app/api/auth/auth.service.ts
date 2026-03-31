import { clearAuthCookie, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoginInput, SignupInput } from "@/lib/validators";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const authService = {
  async signup(input: SignupInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
      select: { id: true, email: true, name: true },
    });

    // Set auth cookie
    await setAuthCookie(user.id, user.email);

    return user;
  },

  async login(input: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Set auth cookie
    await setAuthCookie(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  },

  async logout() {
    await clearAuthCookie();
  },

  async verifyEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    return user;
  },
};
