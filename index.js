'use strict';

let DATA = ''
const baseURL = 'https://newsapi.org/v2/'
const apiKey = '7ea5333e8e7c4da08923033bc7146c77'

function handleFormSubmit() { 
  $('.js-searchbar').submit(event => {
    event.preventDefault();
    const userInput = $('.js-search-input').val().toLowerCase();
    requestNews(baseURL, userInput);;
  })
}

function requestNews(url, query) {
  const search = 'everything?'
  const perams = {
    q: query,
    language: 'en',
    pageSize: 2,
  };
  const options = {
    headers: new Headers({
      'X-Api-Key': apiKey
    })
  };
  const queryString = formatPerams(perams)
  const fullURL = url + search + queryString;
  fetch(fullURL, options)
    .then(responce => {
      if (responce.ok) {
        return responce.json();
      } else {
        throw new Error();
      }
    })
    .then(responceJson => {
      if (responceJson.totalResults === 0) {
        console.log("there are 0 results, search something else")
      } else { 
        DATA = JSON.stringify(responceJson);
        renderResults(DATA);
      }
    })
    .catch(err => {
      alert("something bad happened :(");
    })
}

function formatPerams(perams) {
  const queryString = Object.keys(perams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(perams[key])}`)
    .join('&');
    return queryString;
}

function renderResults(DATA) {
  const dataObj = JSON.parse(DATA);
  $('.js-results-list').empty()
  .html(resultsHTML(dataObj));
  analyzeSentiment(dataObj);
  $('.js-results-list').html(resultsHTML(dataObj));
}

function resultsHTML(dataObj) {
  const listItems = []
  const data = dataObj.articles
  for (let i = 0; i < dataObj.articles.length; i++) {
  listItems.push(`<li><img src="${data[i].urlToImage}" alt="article preview image" width="300px"><h3>${data[i].title}</h3><p>${data[i].description}</p><button class="sentiment-check">Check Sentiment</button></li>`)
  }
  return listItems;
}

function analyzeSentiment(dataObj) {
  console.log(dataObj.articles[0].content);
}

function handleSentimentCheck() {
  $('ul.js-results-list').on('click', '.sentiment-check', event => {
    const testString = "On this smaller episode we’re diving into the topic of small talk. Is it there real value in shooting the breeze, or is it just inane jibber-jabber? Wherever you stand on the topic, you’re going to be called on to engage in small talk sooner or later—so how"
    retrieveSentiment(testString);
  })
}

function retrieveSentiment(line) {
  const apiKey = "AIzaSyB7d8Gu5HReab2u-UtuZTAxZYdnO4HELNc"
  const apiEndpoint = "https://language.googleapis.com/v1/documents:analyzeSentiment?key=" + apiKey;

  const nlOptions = {
    'method': 'post',
    'contentType': 'application/json',
    'body': JSON.stringify({
      'document': {
          'language': 'en',
          'type': 'PLAIN_TEXT',
          'content': line,
        },
        'encodingType': 'UTF8',
    })
  };

  fetch(apiEndpoint, nlOptions)
    .then(responce => responce.json())
    .then(responceJson => {
      console.log(responceJson)
    })
}

function handleEntitySelect() {
}

function handleSortHistory() {
}

function startApp() {
  handleFormSubmit();
  handleSentimentCheck();
  handleEntitySelect();
  handleSortHistory();
}

$(startApp);