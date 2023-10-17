const fetch = require('node-fetch');
const fs = require('fs').promises;

const crypto = require('crypto');
const secret = 'Hi9s$w&bD8JjK+R)qYzZAzg8kRsaEe5G'; // 替换为您在 Webhook 中设置的密钥
const payload = JSON.stringify(request.body);
const computedSignature = `sha1=${crypto
  .createHmac('sha1', secret)
  .update(payload)
  .digest('hex')}`;
const webhookSignature = request.headers['x-hub-signature'];
if (computedSignature !== webhookSignature) {
  return response.status(401).send('Unauthorized');
}

// 继续处理请求

async function updateReadme() {
  const rssUrl = 'https://siriusq.top/en/atom.xml';  // 替换成你的博客的 RSS Feed 链接

  try {
    const response = await fetch(rssUrl);
    const rssContent = await response.text();

    // 解析 RSS Feed，提取最近的7篇博文标题和链接
    const postRegex = /<title>(.*?)<\/title>.*?<link>(.*?)<\/link>/gs;
    const posts = [];
    let match;
    let i = 0;
    while ((match = postRegex.exec(rssContent)) && i < 7) {
      const title = match[1].trim();
      const link = match[2].trim();
      posts.push(`- [${title}](${link})`);
      i++;
    }

    if (posts.length > 0) {
      // 读取 README 文件
      const readme = await fs.readFile('README.md', 'utf-8');

      // 更新 README 文件中的标识符内容
      const updatedReadme = readme.replace(
        /<!-- Start_Position -->.*<!-- End_Position -->/s,
        `<!-- Start_Position -->\n${posts.join('\n')}\n<!-- End_Position -->`
      );

      // 写回 README 文件
      await fs.writeFile('README.md', updatedReadme);
      console.log('README 更新成功！');
    } else {
      console.error('未能找到博文。');
    }
  } catch (error) {
    console.error('更新失败:', error);
  }
}

updateReadme();
