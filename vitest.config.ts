import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname),
        },
    },
    test: {
        environment: "node",
        include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    },
});