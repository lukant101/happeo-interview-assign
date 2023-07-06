import apiClient from "./apiClient.js";

function batchInterceptor(instance) {
  // Add your code here
  instance.interceptors.request.use(batchRequests, handleBatchError);
  instance.interceptors.response.use(handleBatchedResults);
}

const batchUrl = "/file-batch-api";
const batchInterval = 2000;

let batching = false;

const batchIds = new Set();

let batchResults = null;

function batchRequests(config) {
  if (!batching && config.url === batchUrl) {
    if (!batchIds.size) {
      batchResults = new Promise((resolve, reject) => {
        setTimeout(() => {
          batching = true;
          const ids = [...batchIds];
          batchIds.clear();
          apiClient.get(batchUrl, { params: { ids } }).then((response) => {
            resolve(response);
            batching = false;
          });
        }, batchInterval);
      });
    }
    config.params.ids.forEach((id) => {
      batchIds.add(id);
    });
    config.adapter = function (config) {
      return new Promise((resolve, reject) => {
        const response = {
          data: { items: null },
        };

        return batchResults.then((results) => {
          response.data.items = results.filter((el) =>
            config.params.ids.includes(el.id)
          );
          return resolve(response);
        });
      });
    };
  }
  return config;
}

function handleBatchError(error) {
  console.log("error", err);
  return Promise.reject(error);
}

function handleBatchedResults(response) {
  // console.log("response in response interceptor", response);
  return response.data.items;
}

export default batchInterceptor;
