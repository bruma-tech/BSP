'use client';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Label } from '../ui/label';
import LoginSlider from './LoginSlider';
import { Input } from '../ui/input';
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [loginType, setLoginType] = useState<"tpa" | "sponsor">("tpa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/tpa-dashboard');
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-lg text-black/50">Login as</Label>
        <LoginSlider value={loginType} onChange={setLoginType} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input
            id="email"
            type="text"
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border-gray-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500 
                  transition-colors
                "
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className='mb-4'>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-gray-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500 
                  transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold flex items-center justify-center">
          Sign In
        </Button>
      </form>
    </>
  );
}
