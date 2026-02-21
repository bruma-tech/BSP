'use client';

import { Button } from '../ui/button';
import { useActionState, useState, startTransition, useEffect } from 'react';
import { Label } from '../ui/label';
import LoginSlider from './LoginSlider';
import { Input } from '../ui/input';
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signin } from '@/app/auth/actions/signin'

export default function LoginForm() {
  const [loginType, setLoginType] = useState<"tpa" | "sponsor">("tpa");
  const [state, action, pending] = useActionState(signin, undefined)

  const [showPassword, setShowPassword] = useState(false);

  // Handle redirect after successful sign-in
  // The signin server action uses DAL (Data Access Layer) to determine
  // the correct dashboard URL based on user role:
  // - 'tpa' or 'user' role → /tpa-dashboard
  // - 'sponsor' role → /sponsor-dashboard
  // Pass loginType via hidden input so we can use form action={action} directly.

  return (
    <>
      <div className="space-y-2">
        <Label className="text-lg text-black/50">Login as</Label>
        <LoginSlider value={loginType} onChange={setLoginType} />
      </div>
      <form action={action} className="space-y-8">
        <input type="hidden" name="role" value={loginType} />
        <div className="space-y-2">
          <Label htmlFor="email">Email or Username</Label>
          {state?.errors?.email && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {state.errors.email?.join(', ')}
          </div>
        )}
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Enter your email or username"
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
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
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
        {state?.errors?.password && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {state.errors.password?.join(', ')}
          </div>
        )}
        {state?.error && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {state.error}
          </div>
        )}
        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Forgot password?
          </a>
        </div>

        <Button 
          type="submit" 
          disabled={pending}
          className="w-full h-12 text-base font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </>
  );
}
