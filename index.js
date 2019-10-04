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
  console.log(fullURL);
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
}

function resultsHTML(dataObj) {
  const listItems = []
  const data = dataObj.articles
  for (let i = 0; i < dataObj.articles.length; i++) {
  listItems.push(`<li><img src="${data[i].urlToImage}" alt="article preview image" width="300px"><h3>${data[i].title}</h3><p>${data[i].description}</p></li>`)
  }
  return listItems;
}

function handleEntitySelect() {
}

function handleSortHistory() {
}

function startApp() {
  // renderTopStories();
  handleFormSubmit();
  handleEntitySelect();
  handleSortHistory();
}

$(startApp);