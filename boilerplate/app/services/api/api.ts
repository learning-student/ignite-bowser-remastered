import axios from 'axios'
import { DEFAULT_API_CONFIG } from "./api-config"

let Api = axios.create({
  baseURL: DEFAULT_API_CONFIG.url,
  timeout: DEFAULT_API_CONFIG.timeout,
  headers: {
    accept: 'application/json',
    "content-type": "application/json;charset=UTF-8"
  }
})


// example usage of axios with async storage
// this interceptors adds Bearer token to headers
/*api.interceptors.request.use(async (request) => {
  let token = await AsyncStorage.getItem('token')

  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`
  }
  return request
})*/


export default Api
