const PORT = process.env.PORT || 8000; // this is for deploying on heroku
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: '',
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: '',
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk',
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        base: 'https://www.bbc.co.uk',
    },
    {
        name: 'standard',
        address: 'https://www.standard.co.uk/topic/climate-change',
        base: 'https://www.standard.co.uk',
    },
    {
        name: 'sun',
        address: 'https://www.thesun.co.uk/topic/climate-change-environment',
        base: '',
    },
    {
        name: 'dailymail',
        address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
        base: '',
    },
    {
        name: 'nypost',
        address: 'https://nypost.com/tag/climate-change/',
        base: '',
    },
];

const articles = [];

const getNews = ((topic) => {
    try {
        const newsList = topic.forEach( async (news) => {
            const {data: html} = await axios.get(news.address);
            const $ = cheerio.load(html);

            const scrapping = await $('a:contains("climate")', html).each(function() {
                const title = $(this).text();
                const url = $(this).attr('href');

                articles.push({
                    id: articles.length + 1,
                    title,
                    url: news.base + url,
                    source: news.name,
                })
            })
        })
        return articles;
    } catch (err) {
        console.log (`GetNews Error: - ${err}`);
    }
});

getNews(newspapers);

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API');
});

app.get('/news', (req , res) => {
    res.json(articles);
});

app.get('/news/:newspaperId', async (req, res) => {
    try {
        const { newspaperId } = await req.params;

        const newspaperAddress = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].address;
        const newspaperBase = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].base;

        const request = await axios.get(newspaperAddress);
        const html = request.data;
        const $ = await cheerio.load(html);
        const specificArticle = [];

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text();
            const url = $(this).attr('href');
            specificArticle.push({
                title,
                url: newspaperBase + url,
                source: newspaperId,
            })
        })
        res.status(200).json(specificArticle);
    } catch (err) {
        res.status(400).json({err: err})
    }
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
