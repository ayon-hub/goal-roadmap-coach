const { createApp } = require("./src/infrastructure/http/createApp");

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Goal Roadmap Coach backend running at http://localhost:${port}`);
});
