import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import { compare } from "bcrypt";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { AuthOptions } from "next-auth";

// Move clientPromise to a separate file
const clientPromise = MongoClient.connect(process.env.MONGODB_URI as string);

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          const { db } = await connectToDatabase();
          
          // Add console.log to debug
          console.log('Searching for user:', credentials.email);
          
          const user = await db.collection("authusers").findOne({ 
            email: credentials.email
          });

          // Log the found user
          console.log('Found user:', user);

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.isApproved) {
            throw new Error("User not approved");
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  // Add these configurations
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth({
  ...authOptions,
  session: {
    strategy: "jwt" as const,
  }
});
export { handler as GET, handler as POST };