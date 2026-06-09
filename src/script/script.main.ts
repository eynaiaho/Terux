import { initOnce } from "./script.main.once";
await initOnce();

await import("./script.main.assets");
await import("./script.main.services");
await import("./script.main.listeners");
await import("./script.main.utils");
await import("./script.main.terminal");