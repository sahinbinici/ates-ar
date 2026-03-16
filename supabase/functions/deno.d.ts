// Type stubs for Supabase Edge Functions (Deno runtime)
// These declarations silence VS Code TypeScript errors for Deno-specific APIs.
// Actual types are provided by the Deno runtime at deploy time.

declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }
  const env: Env;
}

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export { createClient, SupabaseClient } from '@supabase/supabase-js';
}
