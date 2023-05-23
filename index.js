var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

const fs = require('fs/promises');

var START_URL = "webae.com.br";

var MAX_PAGES_TO_VISIT = 999;

var pagesVisited = {};
var numPagesVisited = 0;

var pagesToVisit = [
  {
    "link": "https://websys-ti.com",
  },];

var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Atingiu o limite de Crawler");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage.link, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Robot Visitou: " + url);
  if(url === undefined){callback();}
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     //console.log($('#title').text());
     //console.log($('div.content.article').text());
    //txt = ",**"+$('#title').text()+"**,**"+$('div.content.article').text()+"**,"+$('div.image-cover img').attr('src')+",**"+$('a.author-name').text().trim()+"**,"+url+"\n"; 
    //saveFile(txt);
    collectInternalLinks($);
    // In this short program, our callback is just calling crawl()
    callback();
     
  });
}

collectInternalLinks = ($, domain, foundPages) => {
  return new Promise(resolve => {
      const elements = "a[href^='http://" + domain + "']:not(a[href^='mailto']), " +
          "a[href^='https://" + domain + "']:not(a[href^='mailto']), " +
          "a[href^='https://www." + domain + "']:not(a[href^='mailto']), " +
          "a[href^='http://www." + domain + "']:not(a[href^='mailto']), " +
          "a[href^='/']:not(a[href^='mailto'])";

      const relativeLinks = $(elements);

      relativeLinks.each(function(i, e) {

          let href = $(this).attr('href');

          if (href.indexOf('www.') !== -1) {
              href = href.substr(href.indexOf('www.') + 4, href.length);
          }
          if (href.indexOf('http') === 0) {
              href = href.substr(href.indexOf('://') + 3, href.length);
          } else if (href.indexOf('/') === 0) {
              href = domain + href;
          }

          // only add the href to the foundPages if it's not there yet.
          if (foundPages.indexOf(href) === -1) {
              foundPages.push(href);
          }
      });

      resolve(foundPages);
  })
}

async function saveFile(txt) {
    try {
      const content = txt;
      await fs.appendFile('/Users/ericfurlani/Downloads/crawler/urls.txt', content);
    } catch (err) {
      console.log(err);
    }
}
