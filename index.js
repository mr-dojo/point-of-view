'use strict';

let DATA = ''
const baseURL = 'https://newsapi.org/v2/'
const apiKey = '7ea5333e8e7c4da08923033bc7146c77'

function handleFormSubmit() { 
  $('.js-searchbar').submit(event => {
    event.preventDefault();
    moveHistory();
    const query = $('.js-search-input').val().toLowerCase();
    requestNews(baseURL, query);
  })
}

function moveHistory() {
  const listHistory = $('.js-results-list').html()
  if (listHistory !== '') {
    $('.js-history-list').append(listHistory);
    $('.js-history-container').removeClass('hidden');
  }
}

function requestNews(url, query) {
  const search = 'everything?'
  const perams = {
    q: query,
    language: 'en',
    pageSize: 2,
  };
  const newsOptions = {
    headers: new Headers({
      'X-Api-Key': apiKey
    })
  };
  const queryString = formatPerams(perams)
  const newsURL = url + search + queryString;
  fetch(newsURL, newsOptions)
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
        renderResults(DATA, query);
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

function renderResults(DATA, query) {
  const dataObj = JSON.parse(DATA);
  $('.js-results-list').empty()
  .html(resultsHTML(dataObj));

  $('.js-results-header').empty()
  .html(`<h2>Results for ${query}`)

  $('.js-results-container').removeClass('hidden');

  handleSentimentCheck(dataObj);
  
}

function resultsHTML(dataObj) {
  const listItems = []
  const data = dataObj.articles
  for (let i = 0; i < dataObj.articles.length; i++) {
  listItems.push(`
  <li>
  <img src="${data[i].urlToImage}" alt="article preview image" width="300px">
  <h3>${data[i].title}</h3>
  <p>${data[i].description}</p>
  <button id="${[i]}" class="js-sentiment-check">Check Sentiment</button>
  <p class="sentiment-feedback hidden"></p></li>`)
  }
  return listItems;
}

function handleSentimentCheck(dataObj) {
  $('ul.js-results-list').off('click').on('click', 'button', event => {
    const articleNum = event.target.id
    const descriptionString = dataObj.articles[articleNum].description
    const contentString = dataObj.articles[articleNum].content
    if (descriptionString !== null && contentString !== null) {
      requestSentiment(descriptionString + contentString);
    } else if (descriptionString === null && contentString !== null) {
      console.log("descriptionString is empty")
      requestSentiment(contentString);
    } else if (descriptionString !== null && contentString === null) {
      console.log("contentString is empty")
      requestSentiment(descriptionString);
    }
    
  })
}

function requestSentiment(line) {
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
      renderSentiment(calculateSentiment(responceJson))
    })
}

function calculateSentiment(responceJson) {
  const sentences = responceJson.sentences
  const scoreArray = []
  const magArray = []

  for (let i = 0; i < sentences.length; i++) {
    const score = sentences[i].sentiment.score
    const magnitude = sentences[i].sentiment.magnitude
    if (sentences[i].text.content.length >= 40) {
      scoreArray.push(score)
      magArray.push(magnitude)
    }
  }

  const add = (a, b) => a + b
  const added = scoreArray.reduce(add)

  return added / scoreArray.length
}

function renderSentiment(sentiment) {
  console.log(sentiment)
}

function handleEntitySelect() {
}

function handleSortHistory() {
}

function startApp() {
  handleFormSubmit();
  handleEntitySelect();
  handleSortHistory();
}

$(startApp);