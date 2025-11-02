import './globals.css';

export const metadata = {
  title: 'BTube - Bharattube',
  description: 'Indian video sharing platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}