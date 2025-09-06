import "./globals.css";

export const metadata = { 
  title: "TSI - מחשבון הערכת שווי מתקדם לתרגול",
  description: "כלי אקדמי מתקדם לחישוב הערכת שווי מניות ותחזיות השקעות. מחשבון ידידותי למשתמש עם נתונים מהשוק בזמן אמת.",
  keywords: "TSI, מחשבון השקעות, הערכת שווי, מניות, תחזיות, בורסה",
  author: "TSI",
  
  // Open Graph
  openGraph: {
    locale: 'he_IL',
    type: 'website',
    siteName: 'TSI',
    title: 'TSI - מחשבון הערכת שווי מתקדם לתרגול',
    description: 'כלי אקדמי מתקדם לחישוב הערכת שווי מניות ותחזיות השקעות',
    images: [
      {
        url: 'https://res.cloudinary.com/dpy2hadid/image/upload/v1756976175/WhatsApp_Image_2025-09-04_at_11.55.07_tfty2m.jpg',
        width: 1200,
        height: 630,
        alt: 'TSI - מחשבון הערכת שווי מתקדם'
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@TSI',
    creator: '@TSI',
    title: 'TSI - מחשבון הערכת שווי מתקדם לתרגול',
    description: 'כלי אקדמי מתקדם לחישוב הערכת שווי מניות ותחזיות השקעות',
    images: ['https://res.cloudinary.com/dpy2hadid/image/upload/v1756976175/WhatsApp_Image_2025-09-04_at_11.55.07_tfty2m.jpg']
  },
  
  // Icons
  icons: {
    icon: 'https://res.cloudinary.com/dpy2hadid/image/upload/v1756976175/WhatsApp_Image_2025-09-04_at_11.55.07_tfty2m.jpg',
    shortcut: 'https://res.cloudinary.com/dpy2hadid/image/upload/v1756976175/WhatsApp_Image_2025-09-04_at_11.55.07_tfty2m.jpg',
    apple: 'https://res.cloudinary.com/dpy2hadid/image/upload/v1756976175/WhatsApp_Image_2025-09-04_at_11.55.07_tfty2m.jpg'
  },
  
  // Mobile
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=yes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TSI מחשבון השקעות'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}