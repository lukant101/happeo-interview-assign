# Happeo interview assignment

### How to test your code?

Test the following cases:

- (test included in the skeleton) within one batch interval make multiple requests; in addition:
  - request the same file in multiple requests
  - request more than one file in a request
  - request a file that does not exist
- (test included in the skeleton) make requests that span over two batch intervals

Test these cases using Jest. Also, adjust the `runtTest` script included in the skeleton to make requests in two batch intervals.

### What are the challenges you faced? and how did you solve them?

- I didn't know how to block a request in an Axios request interceptor, but still have the request resolve (as opposed to just cancelling the request).  
  I had to go through the Axios documentation and some online examples to see how I could use the adapter in the Axios configuration object to achieve the desired behaviour.
- Also, I wasn't immediately sure how I should share the batch request promise between the requests in the same batch. I settled on closure.

### Give another good use case for batching requests and its benefits

- offline support: when clients have an intermittent internet connection, batch requests and send when client comes back online
