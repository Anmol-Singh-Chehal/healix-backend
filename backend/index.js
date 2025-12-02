import "../utils/injectEnv.js"
import app from "./app.js";
import connectDatabase from "./lib/db/connection.js";

connectDatabase().then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port ${process.env.PORT}.`);
    });
    app.on("error", (error) => {
        console.log("Server error:", error);
    });
}).catch((error) => {
    console.log("MonogDB connection error: ", error);
    throw error;
});