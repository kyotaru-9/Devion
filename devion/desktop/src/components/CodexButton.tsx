'use client';

import { useState, useEffect, useRef } from 'react';

interface CodexButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const CodexButton = ({ children, onClick, disabled, className = '' }: CodexButtonProps) => {
  const text = typeof children === 'string' ? children : 'Start';
  const isRunning = text === 'Running';
  const [displayText, setDisplayText] = useState(text);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isRunning) {
      setDisplayText(text);
      return;
    }

    let displayIndex = 0;
    
    const animate = () => {
      displayIndex++;
      if (displayIndex > text.length) {
        displayIndex = 0;
      }
      setDisplayText(text.slice(0, displayIndex));
      timeoutRef.current = setTimeout(animate, displayIndex === text.length ? 1500 : 80);
    };
    
    timeoutRef.current = setTimeout(animate, 500);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, isRunning]);

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border-2 border-white font-medium transition-all duration-300 bg-black ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className='inline-flex h-12 translate-y-0 items-center justify-center px-6 bg-black text-white transition duration-500 group-hover:-translate-y-[150%]'>
        <span>{displayText}</span>
      </div>
      <div className='absolute inline-flex h-12 w-full translate-y-full items-center justify-center text-neutral-950 transition duration-500 group-hover:translate-y-0'>
        <span className='absolute h-full w-full translate-y-full skew-y-12 scale-y-0 bg-white transition duration-500 group-hover:translate-y-0 group-hover:scale-150'></span>
        <span className='z-10'>{displayText}</span>
      </div>
    </button>
  );
};

export default CodexButton;
