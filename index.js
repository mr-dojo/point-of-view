'use strict';

let DATA = ''
let sentimentCheckId = Number
const baseURL = 'https://newsapi.org/v2/'
const apiKey = '7ea5333e8e7c4da08923033bc7146c77'

function handleFormSubmit() { 
  $('.js-searchbar').submit(event => {
    event.preventDefault();
    const query = $('.js-search-input').val().toLowerCase();
    moveHistory();
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
  </li>`)
  }
  return listItems;
}

function handleSentimentCheck(dataObj) {
  $('ul').off('click').on('click', 'button', event => {
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
    sentimentCheckId = articleNum
    
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
      renderSentiment(calculateSentiment(responceJson))
    })
}

function calculateSentiment(responceJson) {
  const sentences = responceJson.sentences
  const scoreArray = []
  const magArray = []
  const add = (a, b) => a + b
  for (let i = 0; i < sentences.length; i++) {
    const sentenceScore = sentences[i].sentiment.score
    const sentenceMagnitude = sentences[i].sentiment.magnitude
    if (sentences[i].text.content.length >= 40) {
      scoreArray.push(sentenceScore)
      magArray.push(sentenceMagnitude)
    }
  }
  const magnitudeSum = magArray.reduce(add);
  const scoreSum = scoreArray.reduce(add);
  const articleMagnitude = magnitudeSum / magArray.length
  const articleSentiment = scoreSum / scoreArray.length
  const sentimentNumber = findSentimentNum(articleSentiment);
  const magnitudeString = findMagnitude(articleMagnitude);
  return [sentimentNumber, magnitudeString]
}

function findSentimentNum(articleSentiment) {
  let sentimentResult = 0
  if (articleSentiment <= -.25) {
    sentimentResult = 1
  } else if (articleSentiment > -.25 && articleSentiment < .25) {
    sentimentResult = 2
  } else if (articleSentiment >= .25) {
    sentimentResult = 3
  } else {
    console.log("error in sentiment calculations");
  }
  return sentimentResult
}

function findMagnitude(articleMagnitude) {
  let magnitudeResult = Number
  if (articleMagnitude <= .25) {
    magnitudeResult = 0
  } else if (articleMagnitude > .25 && articleMagnitude < .4) {
    magnitudeResult = 1
  } else if (articleMagnitude >= .4) {
    magnitudeResult = 2
  } else {
    console.log("error in sentiment calculations");
  }
  return magnitudeResult
}

function renderSentiment(sentimentData) {
  let  magnitudeText = ''
  const sentiment = sentimentData[0]
  const magnitude = sentimentData[1]
  if (sentiment === 1 && magnitude === 1) {
    magnitudeText = 'slightly'
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be ${magnitudeText} NEGATIVE</p>`)
  } else if (sentiment === 1 && magnitude === 2) {
    magnitudeText = 'strongly'
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be ${magnitudeText} NEGATIVE</p>`)
  } else if (sentiment === 2 && magnitude === 0) {
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be NEUTRAL</p>`)   
  } else if (sentiment === 2 && magnitude > 0) {
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be MIXED</p>`) 
  } else if (sentiment === 3 && magnitude === 1) {
    magnitudeText = 'slightly'
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be ${magnitudeText} POSITIVE</p>`)
  } else if (sentiment === 3 && magnitude === 2) {
    magnitudeText = 'strongly'
    $(`#${sentimentCheckId}`).after(`<p class="sentiment-feedback">Article seems to be ${magnitudeText} POSITIVE</p>`)
  } 
}

function startApp() {
  handleFormSubmit();
}

$(startApp);