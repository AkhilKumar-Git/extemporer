import { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends NextAuthUser {
    role?: string;
    id: string; // Ensure id is always string
  }
  interface Session extends DefaultSession {
    user?: User & DefaultSession["user"]; // Merge custom User with DefaultSession User
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id?: string;
    role?: string;
  }
} 