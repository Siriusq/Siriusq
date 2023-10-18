import fetch from 'node-fetch';
import { readFile, writeFile } from 'fs/promises';
import FeedParser from 'feedparser';

async function updateReadme() {
  const rssUrl = 'https://siriusq.top/atom.xml';  // 替换成你的博客的 RSS Feed 链接

  try {
    const response = await fetch(rssUrl);
    const feedparser = new FeedParser();

    response.body.pipe(feedparser);

    const posts = [];

    feedparser.on('readable', function () {
      let item;
      while ((item = this.read())) {
        if (posts.length < 7) { // 获取前7篇博文
          const title = item.title;
          const link = item.link;
          posts.push(`- [${title}](${link})`);
        } else {
          break;
        }
      }
    });

    feedparser.on('end', async () => {
      if (posts.length > 0) {
        // 读取 CNREADME 文件
        const readme = await readFile('CNREADME.md', 'utf-8');

        // 更新 CNREADME 文件中的标识符内容
        const updatedReadme = readme.replace(
          /<!-- Start_Position -->.*<!-- End_Position -->/s,
          `<!-- Start_Position -->\n${posts.join('\n')}\n<!-- End_Position -->`
        );

        // 写回 CNREADME 文件
        await writeFile('CNREADME.md', updatedReadme);
        console.log('CNREADME 更新成功！');
      } else {
        console.error('未能找到博文。');
      }
    });
  } catch (error) {
    console.error('更新失败:', error);
  }
}

updateReadme();
