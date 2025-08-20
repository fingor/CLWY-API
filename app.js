var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config(); // 加载环境变量(注意dotenv引用的位置，一定要在自定义的两个中间件和其他路由上面。因为在这两个中间件里，也使用了环境变量)
// 中间件
const adminAuth = require("./middlewares/admin-auth");
const userAuth = require("./middlewares/user-auth");
const cors = require("cors");

// 前台路由文件
var indexRouter = require("./routes/index");
var categoriesRouter = require("./routes/categories");
const coursesRouter = require("./routes/courses");
const chaptersRouter = require("./routes/chapters");
const articlesRouter = require("./routes/articles");
const settingsRouter = require("./routes/settings");
const searchRouter = require("./routes/search");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const likesRouter = require("./routes/likes");
const postsRouter = require("./routes/posts");

// 后台路由文件
const adminArticlesRouter = require("./routes/admin/articles.js");
const adminCategoriesRouter = require("./routes/admin/categories.js");
const adminSettingsRouter = require("./routes/admin/settings.js");
const adminUsersRouter = require("./routes/admin/users");
const adminCoursesRouter = require("./routes/admin/courses");
const adminChaptersRouter = require("./routes/admin/chapters");
const adminChartsRouter = require("./routes/admin/charts");
const adminAuthRouter = require("./routes/admin/auth");

// 文件上传路由
const uploadsRouter = require("./routes/uploads");
const uploadsBigRouter = require("./routes/uploadsBig"); //大文件上传
const adminAttachmentsRouter = require("./routes/admin/attachments");
// AI问答
const aiChatRouter = require('./routes/ai/chat')
// typescript练习接口
const tsRouter = require('./routes/ts')
// 验证码
const captchaRouter = require('./routes/captcha')
// 笔记
const notesRouter = require('./routes/notes/notes')

var app = express();
// 使用cors允许跨域
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors()); // CORS 跨域配置
// 前台路由
app.use("/", indexRouter);
app.use("/categories", categoriesRouter);
app.use("/courses", coursesRouter);
app.use("/chapters", chaptersRouter);
app.use("/articles", articlesRouter);
app.use("/settings", settingsRouter);
app.use("/search", searchRouter);
app.use("/auth", authRouter);
app.use("/users", userAuth, usersRouter);
app.use("/likes", userAuth, likesRouter);
app.use("/posts", postsRouter);

// 后台路由
app.use("/admin/articles", adminAuth, adminArticlesRouter);
app.use("/admin/categories", adminAuth, adminCategoriesRouter);
app.use("/admin/settings", adminAuth, adminSettingsRouter);
app.use("/admin/users", adminAuth, adminUsersRouter);
app.use("/admin/courses", adminAuth, adminCoursesRouter);
app.use("/admin/chapters", adminAuth, adminChaptersRouter);
app.use("/admin/charts", adminAuth, adminChartsRouter);
app.use("/admin/auth", adminAuthRouter);

app.use("/uploads", userAuth, uploadsRouter);
app.use("/uploadsBig", uploadsBigRouter);
app.use("/admin/attachments", adminAuth, adminAttachmentsRouter);

app.use("/ai/chat", aiChatRouter);
app.use("/ts", tsRouter);
app.use("/captcha", captchaRouter);
app.use("/notes", userAuth, notesRouter);

module.exports = app;
