// Global type declarations for browser APIs

declare global {
  function btoa(data: string): string;
  function alert(message?: any): void;
  
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export {};