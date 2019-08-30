import express from "express";
import serveStatic from "serve-static";
import compression from "compression";

const { PORT = 5000 } = process.env;

const app = express();
app.use(compression());
app.use(serveStatic(__dirname + "/dist"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
