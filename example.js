const mkdata = require('mkdata')
const dimred = require('.')

// Generate a dataset with 1000 samples
const [X, y] = mkdata.friedman1({
  'nSamples': 1000
})

// Run dimensionality reduction
const options = {
  'method': 'pca',
  'dims': 2
}
const res = dimred(X, options)
