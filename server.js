import { fileURLToPath } from "node:url";
import { createApp } from "./server/app.js";

const app = createApp();
const port = process.env.PORT || 6006;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, "0.0.0.0", () => console.log(`Carbon Design System listening on ${port}`));
}
export default app;
