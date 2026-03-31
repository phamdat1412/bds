import app from "./app.js";
import { env } from "./configs/env.js";

app.listen(env.port, () => {
  console.log(`Server running at ${env.appBaseUrl}`);
});