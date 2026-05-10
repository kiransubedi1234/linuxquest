import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | LinuxQuest",
  description: "Sign in to LinuxQuest to save your progress across devices and track your learning journey.",
};

export default function LoginPage() {
  return <LoginClient />;
}
