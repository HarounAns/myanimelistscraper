const axios = require('axios');
const HTMLParser = require('node-html-parser');

const getMALHTML = async () => {
    const { data: html } = await axios.get('https://myanimelist.net/topanime.php', {
        headers: {
            'authority': 'myanimelist.net',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'referer': 'https://myanimelist.net/',
            'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
    });
    return html;
}

const _getValueBetweenParantheses = (str) => {
    const l = str.split('(');
    let val = '';
    for (let i = 1; i < l.length; i++) {
        val += l[i].split(')')[0];
    }
    return val;
}

const main = async () => {
    const html = await getMALHTML();
    const root = HTMLParser.parse(html);
    const tableRows = root.querySelectorAll('.ranking-list');

    const animeList = [];
    for (let i in tableRows) {
        const tableRow = tableRows[i];

        const name = tableRow.querySelector('.clearfix').innerText;
        const score = tableRow.querySelector('.score-label').innerText;
        const [typeAndNumEpisodes, dateRange, membersStr] = tableRow.querySelector('.information')
            .innerText.trim().split('\n').map(i => i.trim());
        const numEpisodes = parseInt(_getValueBetweenParantheses(typeAndNumEpisodes));

        let imageUrl;
        try {
            imageUrl = tableRow.querySelector('.lazyload')['_attrs']['data-srcset']
                .split(', ')[1]
                .split(' ')[0];
        } catch (error) {
            imageUrl = tableRow.querySelector('.lazyload')['_attrs']['data-src'];
        }

        animeList.push({
            name,
            score,
            typeAndNumEpisodes,
            dateRange,
            members: parseInt(membersStr.replace(',', '')),
            numEpisodes,
            ranking: parseInt(i) + 1,
            imageUrl
        });
    }

    console.table(animeList.map(a => { return { ...a, imageUrl: `${a.imageUrl.slice(0, 10)}...` } }));
}

main();