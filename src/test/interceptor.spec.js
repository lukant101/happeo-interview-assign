import apiClient from "../apiClient";

describe("Interceptor tests", () => {
  it("Test batch with fileid1, fileid2, fileid3 ", () => {
    const batchUrl = "/file-batch-api";
    // those calls should trigger only ONE request in the network tab
    // but each call should resolve its own request
    // currently they all send their requests
    const call1_part1 = apiClient.get(batchUrl, {
      params: {
        ids: ["fileid1", "fileid2"]
      }
    });

    const call1_part2 = apiClient.get(batchUrl, {
      params: {
        ids: ["fileid2"]
      }
    });

    const call1_part3 = apiClient.get(batchUrl, {
      params: {
        ids: ["fileid3"]
      }
    });

    return Promise.allSettled([call1_part1, call1_part2, call1_part3]).then(
      (values) => {
        expect(values[0].status).toEqual("fulfilled");
        expect(values[0].value.data.items).toEqual([
          { id: "fileid1" },
          { id: "fileid2" }
        ]);
        expect(values[1].status).toEqual("fulfilled");
        expect(values[1].value.data.items).toEqual([{ id: "fileid2" }]);
        // you are free to reject any way you prefer
        expect(values[2]).toEqual({
          status: "rejected",
          // you are free to reject with any reason
          reason: "No results"
        });
      }
    );
  });

  it("Test batch in different calls with fileid1, fileid2, fileid3 ", (done) => {
    const batchUrl = "/file-batch-api";
    // you are free to experiment with any timeout
    const myTimeout = 3000;
    // you should see this call in the network tab
    const call1 = apiClient.get(batchUrl, {
      params: {
        ids: ["fileid3"]
      }
    });

    return Promise.allSettled([
      call1,
      (resolve) => {
        setTimeout((_) => {
          // you should see this one as SECOND call in the network tab
          const call2 = apiClient.get(batchUrl, {
            params: {
              ids: ["fileid1", "fileid2", "fileid3"]
            }
          });

          Promise.allSettled([call2])
            .then((values) => {
              expect(values[0].status).toEqual("fulfilled");
              expect(values[0].value.data.items).toEqual([
                { id: "fileid1" },
                { id: "fileid2" }
              ]);
            })
            .finally(resolve);
        }, myTimeout);
      }
    ])
      .then((values) => {
        // you are free to reject any way you prefer
        expect(values[0]).toStrictEqual({
          status: "rejected",
          // you are free to reject any way you prefer
          reason: "Files(s) not found."
        });
      })
      .finally(done);
  });
});
