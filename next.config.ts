import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";

let gitCommit = "unknown";
try {
  gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
  // Ignorer l'erreur si git n'est pas disponible
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.*"],
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
};

export default nextConfig;
