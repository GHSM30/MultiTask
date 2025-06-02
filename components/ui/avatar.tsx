"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  className?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className = "", alt, ...props }, ref) => (
    <div className={`aspect-square h-full w-full ${className}`}>
      <Image
        ref={ref}
        alt={alt}
        {...props}
        width={40}
        height={40}
        className="h-full w-full object-cover"
      />
    </div>
  )
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };