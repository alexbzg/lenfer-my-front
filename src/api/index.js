import axios from 'axios'

export const API_URL = '/api/'

function onError (error) {
  let e = {status: 0, log: '', message: 'Ошибка сервера. Пожалуйста, повторите операцию позднее.'}
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    e.log = error.response.data + '\n'
    + error.response.status + '\n'
    + error.response.headers
    if (error.response.status === 400) {
    e.status = 400
    e.message = error.response.data
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    e.log = error.request
  } else {
    // Something happened in setting up the request that triggered an Error
    e.log = error.message
  }
  e.log += '\n' + error.config
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.log(e.log)
  }
  throw e
}

export function post (URL, data) {
  return axios.post(API_URL + URL, data)
    .catch(onError)
}

export function get (URL) {
  if (!URL.startsWith('/')) {
    URL = window.location.pathname + '/' + URL
  }
  return axios.get(URL)
    .catch(onError)
}

export function dataPost(url, data) {
  return post (url, data)
    .then(response => {
      return response.data
    })
}


