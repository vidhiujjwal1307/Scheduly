import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/AppShell";

export const instant = false;

export const metadata = {
  title: "Scheduly",
  description: "AI-Powered Timetable and Study Plan Generator for Students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
