import apiClient from "./apiClient.js";

const batchedRequestFlag = "_isBatchedRequest";

function batchInterceptor(instance) {
  // Add your code here
  instance.interceptors.request.use(
    handleBatchRequestsWrapper,
    handleBatchRequestsError
  );
}

const batchUrl = "/file-batch-api";
const batchInterval = 2000;

const batchIds = new Set();

let currentBatchHandler = null;

function handleBatchRequestsFactory() {
  let batchResults = null;

  function handleBatchRequests(config) {
    if (!config[batchedRequestFlag] && config.url === batchUrl) {
      if (!batchIds.size) {
        batchResults = new Promise((resolve, reject) => {
          setTimeout(() => {
            const ids = [...batchIds];
            batchIds.clear();
            apiClient
              .get(batchUrl, { params: { ids }, [batchedRequestFlag]: true })
              .then((response) => {
                resolve(response.data.items);
              })
              .catch((err) => reject(err));
          }, batchInterval);
        });
      }
      const requestIds = new Set(config.params.ids);
      config.params.ids.forEach((id) => {
        batchIds.add(id);
      });
      config.adapter = function (config) {
        return new Promise((resolve, reject) => {
          const response = {
            data: { items: null },
          };

          return batchResults.then((results) => {
            const fetchedFiles = results.filter((el) => requestIds.has(el.id));

            if (fetchedFiles.length !== requestIds.size) {
              const unfetchedIds = getUnfetfchedIds(requestIds, fetchedFiles);

              return reject(
                `Error. Could not fetch files: ${unfetchedIds.join(", ")}`
              );
            }
            response.data.items = fetchedFiles;
            return resolve(response);
          });
        });
      };
    }
    return config;
  }

  return handleBatchRequests;
}

function handleBatchRequestsWrapper(config) {
  if (!batchIds.size || !currentBatchHandler) {
    currentBatchHandler = handleBatchRequestsFactory();
  }
  return currentBatchHandler(config);
}

function handleBatchRequestsError(error) {
  console.log("error", error);
  return Promise.reject(error);
}

function getUnfetfchedIds(requestIds, fetchedFiles) {
  const unfetchedIds = [];
  const fetchedIds = new Set(fetchedFiles.map((el) => el.id));
  requestIds.forEach((id) => {
    if (!fetchedIds.has(id)) {
      unfetchedIds.push(id);
    }
  });
  return unfetchedIds;
}

export default batchInterceptor;
