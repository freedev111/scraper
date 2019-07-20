const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');

const baseURL = 'https://www.yellowpages.com';  
const searchURL = '/search?search_terms=printing&geo_location_terms=New+York%2C+NY';  

const getCompanies = async () => {
    const html = await rp(baseURL + searchURL);
    const businessMap = cheerio('a.business-name', html).map(async (i, e) => {
        const link = baseURL + e.attribs.href;
        const innerHtml = await rp(link);
        const emailAddress = cheerio('a.email-business', innerHtml).prop('href');
        const name = e.children[0].data;
        const ratings = cheerio('div.rating-stars', innerHtml).prop('class');
        const reviews = cheerio('span.count', innerHtml).text();
        const address = cheerio('h2.address', innerHtml).text();
        const phone = cheerio('p.phone', innerHtml).text();
        const number = cheerio('div.number', innerHtml).text();
        const article = cheerio('article', innerHtml).get().children;

        console.log(article);

        return {
            emailAddress,
            link,
            name,
            ratings,
            reviews,
            address,
            phone,
            number,
        };
    }).get();

    return Promise.all(businessMap);
}

getCompanies()
.then(result => {
    const transformed = new otcsv(result);
    console.log(result);
    return transformed.toDisk('./output.csv');
})
.then(() => {
    console.log('Successfully compiled the web scraping sample');
})