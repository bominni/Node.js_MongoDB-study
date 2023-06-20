// 서버를 띄우기 위한 기본 셋팅(위 3줄)
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8080, function () {
  // listen(서버띄울 포트번호, 띄운 후 실행할 코드)
  console.log("listening on 8080");
});

app.get("/pet", function (요청, 응답) {
  응답.send("펫용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (요청, 응답) {
  응답.send("뷰티용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (요청, 응답) {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/write", (요청, 응답) => {
  응답.sendFile(__dirname + "/write.html");
});

app.post("/add", function (요청, 응답) {
  응답.send("전송완료");
  console.log(요청.body);
  console.log(요청.body.title);
  console.log(요청.body.content);
});
