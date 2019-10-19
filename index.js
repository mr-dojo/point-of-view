"use strict";

let DATA = "";
let sentimentCheckId = Number;

function handleFormSubmit() {
  $(".js-searchbar").submit(event => {
    event.preventDefault();
    const query = $(".js-search-input")
      .val()
      .toLowerCase();
    $(".js-search-input").val("");
    requestNews(query);
  });
}

function requestNews(query) {
  const baseURL = "https://newsapi.org/v2/";
  const apiKey = "7ea5333e8e7c4da08923033bc7146c77";
  const search = "everything?";
  const perams = {
    q: query,
    language: "en",
    pageSize: 6
  };
  const newsOptions = {
    headers: new Headers({
      "X-Api-Key": apiKey
    })
  };
  const queryString = formatPerams(perams);
  const newsURL = baseURL + search + queryString;
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
        renderError(query)
        console.log("there are 0 results, search something else");
      } else {
        $('p.error-message').addClass('display-none');
        DATA = JSON.stringify(responceJson);
        renderResults(DATA, query);
      }
    })
    .catch(err => {
      alert("something bad happened :(");
    });
}

function formatPerams(perams) {
  const queryString = Object.keys(perams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(perams[key])}`)
    .join("&");
  return queryString;
}

function renderError(query) {
  $('p.error-message').html(`There are 0 results for "${query}",  try something else`)
  .removeClass('display-none');
}

function renderResults(DATA, query) {
  const dataObj = JSON.parse(DATA);
  $(".js-results-list")
    .empty()
    .html(resultsHTML(dataObj));
  $(".js-results-header")
    .empty()
    .html(`<h2>Results for "${query}"`);
  $(".js-results-container").removeClass("hidden");
  handleSentimentCheck(dataObj);
}

function resultsHTML(dataObj) {
  const listItems = [];
  const data = dataObj.articles;
  for (let i = 0; i < dataObj.articles.length; i++) {
    listItems.push(`
    <li class="list-item-content">
      <div class="image-box">
        <h3 class="title">${data[i].title}</h3>
        <img src="${data[i].urlToImage}" alt="article preview image" width="300px">
      </div>
      <div>
        <p id="${[i]}" class="js-sentiment-check sentiment-check">CHECK BIAS</p>
      </div>
      <p class="description">${data[i].description}</p>
      <div class="info-box">
        <div class="more-info-box">
          <p>Published by: <a href="${data[i].url}" target="_blank">${data[i].source.name}</a></p>
          <p>On: <span id="publish-date">${renderTime(data[i].publishedAt)}</span></p>
        </div>
        <a class="full-article" href="${data[i].url}" target="_blank">Read full article..</a>
      </div>     
    </li>`);
  }

  return listItems;
}

function renderTime(timeCode) {
  const timeDate = timeCode.split("T");
  const date = timeDate[0].split("-");
  const time = timeDate[1].split(":");
  return `${date[1]}/${date[2]}/${date[0]}`;
}

// check to see if the news article is missing discription or content
function handleSentimentCheck(dataObj) {
  $("ul")
    .off("click")
    .on("click", ".sentiment-check", event => {
      const articleNum = event.target.id;
      const descriptionString = dataObj.articles[articleNum].description;
      const contentString = dataObj.articles[articleNum].content;
      if (descriptionString !== null && contentString !== null) {
        requestSentiment(descriptionString + contentString);
      } else if (descriptionString === null && contentString !== null) {
        console.log("descriptionString is empty");
        requestSentiment(contentString);
      } else if (descriptionString !== null && contentString === null) {
        console.log("contentString is empty");
        requestSentiment(descriptionString);
      }
      sentimentCheckId = articleNum;
    });
}

function requestSentiment(line) {
  const apiKey = "AIzaSyB7d8Gu5HReab2u-UtuZTAxZYdnO4HELNc";
  const apiEndpoint =
    "https://language.googleapis.com/v1/documents:analyzeSentiment?key=" +
    apiKey;
  const nlOptions = {
    method: "post",
    contentType: "application/json",
    body: JSON.stringify({
      document: {
        language: "en",
        type: "PLAIN_TEXT",
        content: line
      },
      encodingType: "UTF8"
    })
  };
  fetch(apiEndpoint, nlOptions)
    .then(responce => responce.json())
    .then(responceJson => {
      renderSentiment(calculateSentiment(responceJson));
    });
}

// decides if the article sentence long enough to be worth analyzing
// adds each sentence sentiment/magnitude and returns average
function calculateSentiment(responceJson) {
  const sentences = responceJson.sentences;
  const scoreArray = [];
  const magArray = [];
  const add = (a, b) => a + b;
  for (let i = 0; i < sentences.length; i++) {
    const sentenceScore = sentences[i].sentiment.score;
    const sentenceMagnitude = sentences[i].sentiment.magnitude;
    if (sentences[i].text.content.length >= 40) {
      scoreArray.push(sentenceScore);
      magArray.push(sentenceMagnitude);
    }
  }
  const magnitudeSum = magArray.reduce(add);
  const scoreSum = scoreArray.reduce(add);
  const articleMagnitude = magnitudeSum / magArray.length;
  const articleSentiment = scoreSum / scoreArray.length;
  const sentimentNumber = findSentimentNum(articleSentiment);
  const magnitudeString = findMagnitude(articleMagnitude);
  return [sentimentNumber, magnitudeString];
}

// makes final sentiment decision
function findSentimentNum(articleSentiment) {
  let sentimentResult = 0;
  if (articleSentiment <= -0.25) {
    sentimentResult = 1;
  } else if (articleSentiment > -0.25 && articleSentiment < 0.25) {
    sentimentResult = 2;
  } else if (articleSentiment >= 0.25) {
    sentimentResult = 3;
  } else {
    console.log("error in sentiment calculations");
  }
  return sentimentResult;
}

// makes final magnitude decision
function findMagnitude(articleMagnitude) {
  let magnitudeResult = Number;
  if (articleMagnitude <= 0.25) {
    magnitudeResult = 0;
  } else if (articleMagnitude > 0.25 && articleMagnitude < 0.4) {
    magnitudeResult = 1;
  } else if (articleMagnitude >= 0.4) {
    magnitudeResult = 2;
  } else {
    console.log("error in sentiment calculations");
  }
  return magnitudeResult;
}

function renderSentiment(sentimentData) {
  let magnitudeText = "";
  const sentiment = sentimentData[0];
  const magnitude = sentimentData[1];
  if (sentiment === 1 && magnitude === 1) {
    magnitudeText = "slightly";
    $(`#${sentimentCheckId}`).replaceWith(`
      <p id="${sentimentCheckId}"w class="js-sentiment-check sentiment-clicked">
      Article seems to be <i class="magnitude">${magnitudeText}</i><span>NEGATIVE</span></p>`);
    borderColor("slightly-negative");
  } else if (sentiment === 1 && magnitude === 2) {
    magnitudeText = "strongly";
    $(`#${sentimentCheckId}`).replaceWith(`
      <p id="${sentimentCheckId}" class="js-sentiment-check sentiment-clicked">
      Article seems to be <i class="magnitude">${magnitudeText}</i><span>NEGATIVE</span></p>`);
    borderColor("strongly-negative");
  } else if (sentiment === 2 && magnitude === 0) {
    $(`#${sentimentCheckId}`).replaceWith(`
      <p id="${sentimentCheckId}" class="js-sentiment-check sentiment-clicked">
      Article seems to be <span>NEUTRAL</span></p>`);
    borderColor("neutral");
  } else if (sentiment === 2 && magnitude > 0) {
    $(`#${sentimentCheckId}`).replaceWith(`
    <p id="${sentimentCheckId}" class="js-sentiment-check sentiment-clicked">
    Article seems to be <span>MIXED</span></p>`);
    borderColor("mixed");
  } else if (sentiment === 3 && magnitude === 1) {
    magnitudeText = "slightly";
    $(`#${sentimentCheckId}`).replaceWith(`
    <p id="${sentimentCheckId}" class="js-sentiment-check sentiment-clicked">
    Article seems to be <i class="magnitude">${magnitudeText}</i><span>POSITIVE</span></p>`);
    borderColor("slightly-positive");
  } else if (sentiment === 3 && magnitude === 2) {
    magnitudeText = "strongly";
    $(`#${sentimentCheckId}`).replaceWith(`
    <p id="${sentimentCheckId}" class="js-sentiment-check sentiment-clicked">
    Article seems to be <i class="magnitude">${magnitudeText}</i><span>POSITIVE</span></p>`);
    borderColor("strongly-positive");
  }
}

function borderColor(magnitude) {
  $(`#${sentimentCheckId}`).addClass(magnitude);
}

function startApp() {
  handleFormSubmit();
}

$(startApp);
