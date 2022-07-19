const axios = require('axios');
const HTMLParser = require('node-html-parser');

const getMALHTML = async () => {
    const { data: html } = await axios.get('https://myanimelist.net/topanime.php', {
        headers: {
            'authority': 'myanimelist.net',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'cookie': 'MALSESSIONID=jm75i908u3acrj72so3tah8on6; MALHLOGSESSID=1e3ba940617b1bbd5eb70ebc231c8242; usprivacy=1Y--; __qca=P0-1136226967-1657924224770; _gcl_au=1.1.956848132.1657924225; _rdt_uuid=1657924225034.88dff98e-04b5-4f0a-a02e-e90dda7934f0; _gid=GA1.2.1209241359.1658202398; _gat=1; _ga_26FEP9527K=GS1.1.1658202398.3.1.1658202404.54; _ga=GA1.1.1362279337.1657924224',
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

    for (let i in tableRows) {
        const tableRow = tableRows[i];
        const anime = {
            name: '',
            ranking: 0,
            imageUrl: '',
            dateRange: '',
            members: 0,
            type: '',
            numEpisodes: 0
        };

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

        console.log({
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
}

main();