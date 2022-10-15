const got = require('@/utils/got');
const cheerio = require('cheerio');
const buildData = require('@/utils/common-config');
const baseUrl = 'https://www.csair.com';

module.exports = async (ctx) => {
    const link = `${baseUrl}/cn/about/news/notice/2022`;
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `%title%`,
        description: `%description%`,
        params: {
            title: '南航通知公告',
            description: '中国南方航空-通知公告',
        },
        item: {
            item: '.tabContent > ul:first > li',
            title: `$('a').text()`,
            link: `$('a').attr('href')`,
            pubDate: `parseDate($('span').text(), 'YYYY-MM-DD')`,
            guid: Buffer.from(`$('a').attr('href')`).toString('base64'),
        },
    });

    await Promise.all(
        ctx.state.data.item.slice(0, 20).map(async (item) => {
            const detailLink = baseUrl + item.link;
            item.description = await ctx.cache.tryGet(detailLink, async () => {
                const result = await got(detailLink);
                const $ = cheerio.load(result.data);
                return $('.news').html();
            });
        })
    );
};
