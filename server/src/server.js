import app from "./app.js";
import { testDbConnection } from "./config/db.js";

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await testDbConnection();
    console.log("Connected to MySQL database.");
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
