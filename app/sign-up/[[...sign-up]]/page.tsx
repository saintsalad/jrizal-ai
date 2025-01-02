import { SignUp } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import Image from "next/image";
import bg from "@/public/images/rizal-ai-bg.jpg";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className='relative flex min-h-screen'>
      {/* Left Column - Information */}
      <div className='hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 relative'>
        <div className='absolute inset-0 -z-10'>
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

        <div className='text-center'>
          <div className='mb-6 flex justify-center'>
            <div className='relative'>
              <div className='absolute -inset-1 animate-pulse rounded-full bg-[#d4b595]/50' />
              <div className='relative rounded-full bg-[#f5e6d3]/90 p-4 shadow-md border-2 border-[#8b4513]'>
                <Bot className='h-10 w-10 text-[#8b4513]' />
              </div>
            </div>
          </div>

          <h1 className='mb-4 font-serif text-4xl font-bold text-[#f5e6d3] text-shadow-sm'>
            Welcome to Rizal AI
          </h1>
          <p className='font-serif text-lg text-[#f5e6d3] text-shadow-sm max-w-md mx-auto mb-6'>
            Experience Rizal&apos;s final hours through meaningful conversations
          </p>
        </div>
      </div>

      {/* Right Column - Sign Up Form */}
      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#fff9f0]'>
        <div className='w-full max-w-md'>
          <div className='rounded-lg border-2 border-[#8b4513] bg-[#fff9f0]/95 p-6 shadow-md backdrop-blur-sm'>
            <SignUp
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
                  formFieldInput:
                    "bg-[#fff9f0] border-[#8b4513] text-[#5c3a2e]",
                  footerActionLink: "text-[#8b4513] hover:text-[#6d3710]",
                  dividerLine: "bg-[#8b4513]",
                  dividerText: "text-[#5c3a2e] font-serif",
                },
              }}
            />

            <div className='mt-6 flex items-center justify-center space-x-1 text-xs text-[#5c3a2e] font-serif'>
              <span>Designed by</span>
              <div className='flex items-center space-x-1'>
                <Sparkles className='h-3 w-3 text-[#8b4513]' />
                <span className='text-[#5c3a2e]'>Saint Salad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
