import "./styles/globals.scss";
import { Navbar } from "@comp/Navbar";
import GlobalClient from "@comp/GlobalClient";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`antialiased text-slate-800 bg-gray-50`}>
        <Navbar />
        {children}
        {/*<GlobalClient />*/}
      </body>
    </html>
  );
}
