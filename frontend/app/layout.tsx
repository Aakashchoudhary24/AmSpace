import "./globals.css";
import { interTight } from "./fonts";

export const metadata = { title: "AmSpace" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable}`}>
      <body className="font-sans font-medium">
        {children}
      </body>
    </html>
  );
}
