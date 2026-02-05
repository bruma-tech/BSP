import AcmeLogo from './components/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { wix } from './components/ui/fonts';
import LoginForm from './components/login/login-form';
import { ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="lg:flex lg:w-[95%] bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#02f4fa]" />
            </div>
            <span className={`${wix.className} antialiased text-5xl font-bold text-[#02f4fa]`}>Bruma</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Welcome to your<br />
            <span className="text-white/80">trusted portal</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Access your dashboard securely. Manage sponsors, plans, and everything.
          </p>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[5%] flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-8">
          <div className="lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Sign in to your account</h2>
            <p className="mt-3 text-lg text-black/75">
              Enter your credentials to access the portal
            </p>
          </div>
          <LoginForm />
          <div className="text-center">
            <p className="text-black/75">
              Don't have an account?{" "}
              <a href="#" className="text-primary text-lg transition-colors text-blue-500 hover:text-blue-700 font-semibold">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
