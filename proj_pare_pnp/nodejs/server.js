const express = require("express");
const app = express();
const port = 3000;

// ให้ express เสิร์ฟไฟล์ static (index.html ฯลฯ) จากโฟลเดอร์ www
app.use("/pnp", express.static("dist"));

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
