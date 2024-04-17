import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/header";
import { AuthProvider } from "@/components/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nextloop Admin",
  description: "Nextloop Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
