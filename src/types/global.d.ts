// Augment Next.js fetch cache options into RequestInit
declare global {
  interface RequestInit {
    next?: {
      revalidate?: number | false;
      tags?: string[];
    };
  }
}

export {};
