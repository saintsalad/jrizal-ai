"use client";

import Image from "next/image";
import bg from "@/public/images/rizal-ai-bg.jpg";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

// Define message type
type Message = {
  id: string;
  content: string;
  sender: "ai" | "user";
};

export default function Home() {
  return (
    <div className='h-screen flex flex-col'>
      <div className='w-full h-screen absolute top-0 left-0 -z-10'>
        <Image
          src={bg}
          alt='Rizal AI'
          priority
          layout='fill'
          objectFit='cover'
          style={{ transform: "scaleX(-1)" }}
          className='opacity-100'
        />
        <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px]' />
        <div className='absolute inset-0 [background-image:repeating-linear-gradient(45deg,_transparent_0,_transparent_2px,_rgba(255,255,255,0.03)_2px,_rgba(255,255,255,0.03)_4px)]' />
      </div>
      <Header />
      <ChatContainer />
    </div>
  );
}

function Header() {
  const { isSignedIn } = useUser();

  return (
    <div className='fixed w-full top-0 left-0 px-6 py-3'>
      <div className='flex justify-between items-center max-w-5xl mx-auto backdrop-blur-md bg-black/30 rounded-lg px-6 py-2 border border-amber-100/10'>
        <div className='text-xl font-serif text-amber-100/90'>JRizal AI</div>
        <div className='flex items-center gap-6'>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode='modal'>
              <button
                className='px-4 py-1.5 rounded-md text-sm font-serif text-amber-100/90 
                border border-amber-100/20 hover:border-amber-100/40 
                bg-black/30 hover:bg-black/40 transition-all duration-200'>
                Login
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 120;
  const [inputDisabled, setInputDisabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const username = user?.username
    ? user?.username
    : user?.firstName?.toLowerCase().replace(/\s+/g, "").trim();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, userName: username }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.response,
          sender: "ai",
        },
      ]);
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || mutation.isPending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: "user",
    };

    // Clear input before sending to prevent double sends
    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, newMessage]);

    // Send message to API
    mutation.mutate(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex-1 flex flex-col w-full mx-auto px-2 sm:px-6 overflow-hidden mt-16'>
      <div className='flex-1 overflow-hidden'>
        <div
          ref={chatContainerRef}
          className='h-full w-full max-w-4xl mx-auto overflow-y-auto py-4 sm:py-6 px-2 sm:px-4
          [&::-webkit-scrollbar]:w-3
          [&::-webkit-scrollbar]:bg-transparent
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-amber-100/5
          [&::-webkit-scrollbar-track]:mx-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-amber-100/10
          hover:[&::-webkit-scrollbar-thumb]:bg-amber-100/20'>
          {messages.length === 0 ? (
            <div className='h-full flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto px-4'>
              <div
                className='space-y-6 backdrop-blur-sm bg-black/20 rounded-lg p-8 border border-white/10
                [background-image:repeating-linear-gradient(45deg,_transparent_0,_transparent_1px,_rgba(255,255,255,0.1)_1px,_rgba(255,255,255,0.1)_2px)]'>
                <div className='space-y-2'>
                  <h1 className='text-2xl sm:text-3xl font-serif text-amber-100/90 text-center'>
                    Welcome to JRizal AI
                  </h1>
                  <div className='flex items-center gap-4'>
                    <div className='h-px flex-1 bg-amber-100/20' />
                    <div className='text-amber-100/40 text-xs font-serif'>
                      1896
                    </div>
                    <div className='h-px flex-1 bg-amber-100/20' />
                  </div>
                </div>
                <p className='text-amber-50/80 text-center text-sm sm:text-base leading-relaxed font-serif'>
                  December 29, 1896. Fort Santiago, Manila. Through a mystical
                  oil lamp, you can now speak with Jose Rizal on the eve of his
                  destiny. The revolutionary writer, physician, and hero of the
                  Philippines awaits your words.
                </p>
                <div className='flex justify-center pt-2'>
                  <button
                    onClick={() => {
                      const message = `Hi Jose, I'm ${user?.firstName}`;
                      setInputMessage("");
                      setInputDisabled(false);

                      const newMessage: Message = {
                        id: Date.now().toString(),
                        content: message,
                        sender: "user",
                      };

                      setMessages((prev) => [...prev, newMessage]);
                      mutation.mutate(message);

                      inputRef.current?.focus();
                    }}
                    className='px-6 py-2.5 rounded-md text-sm font-serif text-amber-100/90 
                      border border-amber-100/20 hover:border-amber-100/40
                      bg-black/30 hover:bg-black/40 transition-all duration-300 
                      backdrop-blur-sm shadow-lg shadow-black/20'>
                    Hi Jose, I&apos;m {user?.firstName}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isFirstMessage = index === 0;
              const isLastMessage = index === messages.length - 1;
              const prevMessage = !isFirstMessage ? messages[index - 1] : null;
              const nextMessage = !isLastMessage ? messages[index + 1] : null;

              const isGroupedMessage =
                prevMessage?.sender === message.sender ||
                nextMessage?.sender === message.sender;

              const isFirstInGroup = prevMessage?.sender !== message.sender;
              const isLastInGroup = nextMessage?.sender !== message.sender;

              const messageSpacing =
                isGroupedMessage && !isFirstInGroup ? "mt-0.5" : "mt-4";

              return message.sender === "ai" ? (
                <div
                  key={message.id}
                  className={`flex flex-col gap-0.5 ${
                    index === 0 ? "" : messageSpacing
                  } animate-fade-in`}>
                  {isFirstInGroup && (
                    <div className='text-xs sm:text-sm text-amber-100/60 font-serif px-2 sm:px-4'>
                      Rizal AI
                    </div>
                  )}
                  <div className='flex items-start gap-2 sm:gap-3'>
                    <div
                      className={`bg-black/30 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 
                        text-sm sm:text-base text-amber-50/90 font-serif max-w-[85%] sm:max-w-[80%]
                        border border-amber-100/10 ${
                          isGroupedMessage
                            ? !isFirstInGroup && !isLastInGroup
                              ? "rounded-2xl rounded-tl-lg rounded-bl-lg"
                              : isFirstInGroup
                              ? "rounded-2xl rounded-bl-lg"
                              : isLastInGroup
                              ? "rounded-2xl rounded-tl-lg"
                              : "rounded-2xl"
                            : "rounded-2xl"
                        }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={message.id}
                  className={`flex flex-col gap-0.5 items-end ${
                    index === 0 ? "" : messageSpacing
                  } animate-fade-in`}>
                  {isFirstInGroup && (
                    <div className='text-xs sm:text-sm text-amber-100/60 font-serif px-2 sm:px-4'>
                      You
                    </div>
                  )}
                  <div className='w-full flex justify-end'>
                    <div
                      className={`bg-amber-100/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 
                        text-sm sm:text-base text-amber-50/90 font-serif max-w-[85%] sm:max-w-[80%] 
                        border border-amber-100/20 ${
                          isGroupedMessage
                            ? !isFirstInGroup && !isLastInGroup
                              ? "rounded-2xl rounded-tr-lg rounded-br-lg"
                              : isFirstInGroup
                              ? "rounded-2xl rounded-br-lg"
                              : isLastInGroup
                              ? "rounded-2xl rounded-tr-lg"
                              : "rounded-2xl"
                            : "rounded-2xl"
                        }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className='relative w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-2 sm:px-0'>
        {(messages.length > 0 || !inputDisabled) && (
          <div className='backdrop-blur-md bg-black/30 rounded-lg border border-amber-100/10 p-1.5 sm:p-2'>
            <input
              ref={inputRef}
              type='text'
              value={inputMessage}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setInputMessage(e.target.value);
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder='Type your message...'
              disabled={mutation.isPending || inputDisabled}
              maxLength={MAX_CHARS}
              className='w-full bg-transparent text-amber-50/90 placeholder-amber-100/40 
                outline-none px-3 py-2 pr-24 text-sm sm:text-base font-serif
                disabled:opacity-50'
            />
            <div
              className='absolute right-[3.25rem] sm:right-[3.75rem] top-1/2 -translate-y-1/2 
              text-xs text-amber-100/40 font-serif'>
              {inputMessage.length}/{MAX_CHARS}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={mutation.isPending || !inputMessage.trim()}
              className='absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 
                hover:bg-amber-100/10 rounded-md transition-colors 
                disabled:opacity-50 disabled:hover:bg-transparent'>
              {mutation.isPending ? (
                <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 text-amber-100/90 animate-spin' />
              ) : (
                <Send className='w-4 h-4 sm:w-5 sm:h-5 text-amber-100/90' />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
