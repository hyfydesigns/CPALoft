"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Email verified!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your CPA Loft account is now active. You can log in and start using
          your AI-powered workspace.
        </p>
        <Link href="/login">
          <Button className="bg-forest-600 hover:bg-forest-700 h-11 px-8">
            Sign In to Your Account
          </Button>
        </Link>
      </div>
    );
  }

  if (error === "expired_token") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-9 h-9 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Link expired</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your verification link has expired. They&apos;re only valid for 24 hours.
          Sign up again to receive a fresh link.
        </p>
        <Link href="/signup">
          <Button className="bg-forest-600 hover:bg-forest-700 h-11 px-8">
            Back to Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid link</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          This verification link is invalid or has already been used. If you
          already verified your account, you can sign in below.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login">
            <Button className="w-full bg-forest-600 hover:bg-forest-700 h-11">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full h-11">
              Create a New Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default: "check your email" state (after signup)
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-9 h-9 text-forest-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h1>
      <p className="text-gray-500 mb-2 leading-relaxed">
        We&apos;ve sent a verification link to your email address.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Click the link in the email to activate your account. It expires in 24 hours.
      </p>
      <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm text-forest-700 text-left mb-6">
        <p className="font-medium mb-1">Didn&apos;t receive it?</p>
        <ul className="space-y-1 text-forest-600 text-xs">
          <li>• Check your spam or junk folder</li>
          <li>• Make sure you entered the correct email</li>
          <li>• Wait a minute or two and refresh</li>
        </ul>
      </div>
      <Link href="/login" className="text-sm text-forest-600 hover:underline">
        Already verified? Sign in →
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-mist to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Logo markSize={40} wordmarkSize="lg" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
