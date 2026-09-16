import "./globals.css";
import SiteChrome from "../components/SiteChrome";

export const metadata = {
  title: "Indraprasth Foundation",
  description: "Serving humanity, spreading kindness.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}