// src/app/layout.js

import "./globals.css";

export const metadata = {
  title: "Indraprasth Foundation",
  description: "Serving humanity, spreading kindness.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}