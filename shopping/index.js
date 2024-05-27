const app = require("express")();

app.get("/", (req, res) => {
  return res.json("hello world shopping");
});

app.listen(3003, () => {
  console.clear();
  console.log("shoping server connected 3003 port");
});
