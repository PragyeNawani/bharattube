import './globals.css';
import Navbar from '@/components/Navbar';
export const metadata = {
  title: 'BTube - Bharattube',
  description: 'Indian video sharing platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}