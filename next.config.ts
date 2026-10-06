import type { NextConfig } from "next";

import { isPublicSupabaseKey } from "./lib/supabase/key-validation";

const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (publicKey && !isPublicSupabaseKey(publicKey)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY debe ser una clave pública publishable o anon. Nunca uses una secret/service_role aquí.",
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,

  allowedDevOrigins: ["192.168.1.75"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      {
        source: "/quote/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
