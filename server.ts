import express from "express";
import serveStatic from "serve-static";

const { PORT = 5000 } = process.env;

const app = express();
app.use(serveStatic(__dirname + "/dist"));

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
