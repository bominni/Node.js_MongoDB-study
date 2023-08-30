// 서버를 띄우기 위한 기본 셋팅(위 3줄)
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
require("dotenv").config();
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.use("/public", express.static("public"));

// var db;
// MongoClient.connect(process.env.DB_URL, function (err, client) {
//   if (err) return console.log(err);
//   db = client.db("Example1");
//   app.listen(process.env.PORT, function () {
//     console.log("listening on 8080");
//   });
// });

var db;
MongoClient.connect(
  "mongodb+srv://bomin:bomin1206@cluster0.7d0tfmz.mongodb.net/?retryWrites=true&w=majority",
  function (에러, client) {
    app.listen(8080, function () {
      if (에러) return console.log(에러);
      db = client.db("todoapp");

      //   db.collection("post").insertOne(
      //     { 이름: "John", 나이: 20, _id: 100 },
      //     function (에러, 결과) {
      //       console.log("저장완료");
      //     }
      //   );

      // listen(서버띄울 포트번호, 띄운 후 실행할 코드)
      console.log("listening on 8080");
    });
  }
);

app.get("/pet", function (요청, 응답) {
  응답.send("펫용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (요청, 응답) {
  응답.send("뷰티용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (요청, 응답) {
  응답.render("index.ejs");
});

// app.get("/wrtie", function(요청, 응답) {
//     응답.sendFile(__dirname + '/write.html');
// });
app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

app.post("/add", function (요청, 응답) {
  응답.send("전송완료");
  // console.log(요청.body);
  // console.log(요청.body.title);
  // console.log(요청.body.content);
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (에러, 결과) {
      console.log(결과.totalPost);
      var 총게시물갯수 = 결과.totalPost;
      db.collection("post").insertOne(
        {
          _id: 총게시물갯수 + 1,
          제목: 요청.body.title,
          내용: 요청.body.content,
        },
        function (에러, 결과) {
          if (에러) return console.log("저장 실패");
          console.log("저장 완료");
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            { $inc: { totalPost: 1 } }, // operator라는 함수
            // $set(변경), $inc(증가) ...
            function (에러, 결과) {
              if (에러) return console.log(에러);
              console.log(결과);
            }
          );
        }
      );
    }
  );
});

app.get("/list", function (요청, 응답) {
  db.collection("post")
    .find()
    .toArray(function (에러, 결과) {
      // 다 찾아주세요
      console.log(결과);
      응답.render("list.ejs", { posts: 결과 });
    });
});

app.get("/search", (요청, 응답) => {
  console.log(요청.query.value);
  var 검색조건 = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: 요청.query.value,
          path: "제목", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    // { $sort: { _id: 1 } }, // 정렬 가능
    // { $limit: 5 }, // 갯수 limit 주기
    // { $project: { 제목: 1, _id: 0, score: { $meta: "searchScore" } } }, // 0을 적으면 안 가져옴
  ];
  db.collection("post")
    .aggregate(검색조건)
    // .find({ $text: { $search: 요청.query.value } })
    // .find({ 제목: 요청.query.value })
    .toArray((에러, 결과) => {
      console.log(결과);
      응답.render("result.ejs", { result: 결과 });
    });
});

app.delete("/delete", function (요청, 응답) {
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection("post").deleteOne(요청.body, function (에러, 결과) {
    console.log("삭제완료");
    응답.status(200).send({ message: "성공했습니다." }); // 2XX 보내면 요청성공, 4XX 잘못된 요청, 5XX 서버 잘못
  });
});

app.get("/detail/:id", function (요청, 응답) {
  요청.params.id = parseInt(요청.params.id);
  db.collection("post").findOne({ _id: 요청.params.id }, function (에러, 결과) {
    console.log(결과);
    응답.render("detail.ejs", { data: 결과 });
  });
});

app.get("/edit/:id", function (요청, 응답) {
  db.collection("post").findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      응답.render("edit.ejs", { post: 결과 });
    }
  );
});

app.put("/edit", function (요청, 응답) {
  db.collection("post").updateOne(
    { _id: parseInt(요청.body.id) },
    { $set: { 제목: 요청.body.title, 내용: 요청.body.content } },
    function () {
      console.log("수정완료");
      응답.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (요청, 응답) {
  응답.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (요청, 응답) {
    응답.redirect("/");
  }
);

app.get("/mypage", 로그인했니, function (요청, 응답) {
  console.log(요청.user);
  응답.render("mypage.ejs", { 사용자: 요청.user });
});

function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    next();
  } else {
    응답.send("로그인이 되지 않았습니다.");
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);
          if (!결과)
            // DB에 아이디가 없으면
            return done(null, false, { message: "존재하지않는 아이디입니다" });
          if (입력한비번 == 결과.pw) {
            // DB에 아이디가 있으면, 입력한비번과 결과.PW 비교
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번이 틀렸습니다" });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  // 세션에 저장시키는 코드(로그인 성공시 발동)
  done(null, user.id); // id를 이용해서 세션을 저장시키는 코드
});

passport.deserializeUser(function (아이디, done) {
  // 나중에 쓸거임(마이페이지 접속시 발동)
  db.collection("login").findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과); // 이 세션 데이터를 가진 사람을 DB에서 찾아주세요
  });
});

app.post("/register", function (요청, 응답) {});
