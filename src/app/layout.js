import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";

export const metadata = {
  title: "Indraprasth Foundation",
  description: "Serving humanity, spreading kindness.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="pb-16 lg:pb-0">
        <Navbar />
        {children}
        {/* <Footer /> */}
        <MobileBottomNav />
      </body>
    </html>
  );
}