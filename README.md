# 赵明明 · AI 视觉作品集

暖色毛毡风格的个人简历与作品网站，采用原生 HTML、CSS、JavaScript。直接发布仓库根目录，无需安装依赖或运行构建命令。

## 发布对应关系

| 版本 | Git 分支 | Vercel 项目 | 访问地址 |
| --- | --- | --- | --- |
| 新版 | `codex/warm-portfolio-20261024` | `zhao-mingming-visual-preview` | https://zhao-mingming-visual-preview.vercel.app/ |
| 旧版 | `main` | `zhao-mingming-web` | https://zhao-mingming-web.vercel.app/ |

新版的后续修改提交到 `codex/warm-portfolio-20261024`。Vercel 的新版项目跟踪此分支，提交后自动部署到新版地址。保留 `main`，不要将新版合并到 `main`，以免替换旧站。

## 内容与素材

- `index.html`：简历、作品与页面结构。
- 根目录的 CSS 和 JavaScript：当前视觉样式、交互、轻微视差与视线跟随。
- `assets/hero/`：首页人物视频、封面与视线数据。
- `assets/recent/`、`assets/films/`：近期作品与影片素材。
- `assets/portraits/`：实拍及 AI 人像库。
- `assets/scroll/`：桌面端和手机端滚动视频。
- `assets/workflows/`：工作流案例与成果图。

替换素材时保留文件名和相对路径，或同步修改页面中的引用。已有新片场嵌入继续使用，新版自带视频与图片随仓库一同部署。

## 本地预览

在仓库根目录运行 `python3 -m http.server 8766`，然后访问 http://127.0.0.1:8766/ 。检查桌面、手机宽度下的排版和素材后，再提交到新版分支。
