// Ambient module declarations for packages without bundled types
declare module 'cmdk' {
  export const Command: any;
  export default Command;
}

declare module 'vaul' {
  export const Drawer: any;
  export default Drawer;
}

declare module 'input-otp' {
  export const OTPInput: any;
  export const OTPInputContext: any;
  export default OTPInput;
}

declare module 'react-resizable-panels' {
  const content: any;
  export = content;
}

declare module 'embla-carousel-react' {
  const content: any;
  export default content;
}

declare module 'next-themes' {
  export function useTheme(): { theme?: string; setTheme: (t: any) => void };
}

declare module 'sonner' {
  export const Toaster: any;
  export type ToasterProps = any;
  export default Toaster;
}

// Fallback for any other untyped packages
declare module '*';
