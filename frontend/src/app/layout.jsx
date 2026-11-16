import '../styles/globals.css';
import { AppProvider } from '@/context/AppContext';
import { TooltipProvider } from '@/components/Tooltip';

export const metadata = {
  title: 'SENTINEX — Safety Dashboard',
  description: 'Intelligent PPE safety monitoring'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppProvider>
      </body>
    </html>
  );
}
