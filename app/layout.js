import './globals.css';

export const metadata = {
  title: 'Pro Clubs HQ - EA FC 26 Stats',
  description: 'Search Pro Clubs teams and view detailed match stats, player performance, and tactical analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-white min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
