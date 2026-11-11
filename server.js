import { fileURLToPath } from "node:url";
import { createApp } from "./server/app.js";

const app = createApp();
const port = process.env.PORT || 6006;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Express 5 passes startup errors (EADDRINUSE, EACCES) to this callback instead of throwing.
  app.listen(port, "0.0.0.0", (error) => {
    if (error) throw error;
    console.log(`Carbon Design System listening on ${port}`);
  });
}
export default app;
