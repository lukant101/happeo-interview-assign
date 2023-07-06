import apiClient from "./apiClient.js";

// All requests should run at the same time and produce only one request to the backend. All requests should return or reject.
function runTest() {
  const batchUrl = "/file-batch-api";

  // Should return [{id:"fileid1"},{id:"fileid2"}]
  apiClient
    .get(batchUrl, { params: { ids: ["fileid1", "fileid2"] } })
    .then((response) => {
      console.log("response in api call", response);
    })
    .catch((error) => {
      console.log(error);
    });
  // Should return [{id:"fileid2"}]
  apiClient
    .get(batchUrl, { params: { ids: ["fileid2"] } })
    .then((response) => {
      console.log("response in api call", response);
    })
    .catch((error) => {
      console.log(error);
    });

  // // Should reject as the fileid3 is missing from the response
  apiClient
    .get(batchUrl, { params: { ids: ["fileid3"] } })
    .then((response) => {
      console.log("response in api call", response);
    })
    .catch((error) => {
      console.log(error);
    });
}

runTest();

document.getElementById("app").innerHTML = `
<h1>Test</h1>
<div>
<p>Check console for output</p>
</div>
`;
