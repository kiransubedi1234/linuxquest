// filepath: apps/web/src/app/layout.tsx 
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "LinuxQuest — Learn Linux Terminal the Fun Way",
    template: "%s | LinuxQuest",
  },
  description:
    "Master the Linux terminal through interactive lessons, challenges, and quizzes. Earn XP, maintain streaks, and level up your command-line skills.",
  keywords: ["linux", "terminal", "bash", "learn", "interactive", "command line", "duolingo"],
  authors: [{ name: "LinuxQuest" }],
  openGraph: {
    title: "LinuxQuest — Learn Linux Terminal the Fun Way",
    description: "Master the Linux terminal through gamified interactive lessons.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-terminal-bg text-terminal-text antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161b22",
              color: "#e6edf3",
              border: "1px solid #30363d",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0d1117" } },
            error: { iconTheme: { primary: "#f85149", secondary: "#0d1117" } },
          }}
        />
      </body>
    </html>
  );
}
