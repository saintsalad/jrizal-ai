import { SignIn } from "@clerk/nextjs";
import { Bot, Sparkles } from "lucide-react";
import Image from "next/image";
import bg from "@/public/images/rizal-ai-bg.jpg";

export default function SignInPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center px-4'>
      {/* Background Image */}
      <div className='w-full h-screen absolute top-0 left-0 -z-10'>
        <Image
          src={bg}
          alt='Rizal AI'
          priority
          fill
          className='object-cover'
          style={{
            filter: "blur(4px) brightness(0.7)",
          }}
        />
      </div>

      {/* Logo and Title Section */}
      <div className='mb-8 text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='relative'>
            <div className='absolute -inset-1 animate-pulse rounded-full bg-[#d4b595]/50' />
            <div className='relative rounded-full bg-[#f5e6d3]/90 p-4 shadow-md border-2 border-[#8b4513]'>
              <Bot className='h-10 w-10 text-[#8b4513]' />
            </div>
          </div>
        </div>

        <h1 className='mb-3 font-serif text-4xl font-bold text-[#f5e6d3] text-shadow-sm transition-all hover:scale-105'>
          JRizal AI
        </h1>
        <p className='font-serif text-sm font-medium tracking-wide text-[#f5e6d3] text-shadow-sm'>
          A conversation with Rizal in his final hours
        </p>
      </div>

      {/* Sign In Container */}
      <div className='w-full max-w-md rounded-lg border-2 border-[#8b4513] bg-[#fff9f0]/95 p-6 shadow-md backdrop-blur-sm'>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-[#8b4513] hover:bg-[#6d3710] text-sm normal-case font-serif",
              card: "bg-transparent shadow-none",
              headerTitle: "text-[#5c3a2e] font-serif",
              headerSubtitle: "text-[#5c3a2e] font-serif",
              socialButtonsBlockButton:
                "bg-[#fff9f0] border-2 border-[#8b4513] hover:bg-[#f5e6d3] font-serif",
              socialButtonsBlockButtonText: "text-[#5c3a2e]",
              formFieldLabel: "text-[#5c3a2e] font-serif",
              formFieldInput: "bg-[#fff9f0] border-[#8b4513] text-[#5c3a2e]",
              footerActionLink: "text-[#8b4513] hover:text-[#6d3710]",
              dividerLine: "bg-[#8b4513]",
              dividerText: "text-[#5c3a2e] font-serif",
            },
          }}
        />

        <div className='mt-6 flex items-center justify-center space-x-2 text-xs text-[#5c3a2e] font-serif'>
          <span>Powered by</span>
          <div className='flex items-center space-x-1'>
            <Sparkles className='h-3 w-3 text-[#8b4513]' />
            <span className='text-[#5c3a2e]'>Advanced AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
