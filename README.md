# Dimensionality reduction tools for browsers and Node.js

The `dimred` package is a wrapper around some dimensionality reduction methods implemented in JavaScript. It simplifies their API and makes it possible to try different algorithms without adapting data and code for each case. You can also use `dimred` via CLI to generate a lower-dimensional representation of a dataset without writing codeat all. 

### Supported dimensionality reduction methods
- **PCA** Princinpal Component Analysis (`pca`)
- **SOM** Self-Organizing Map (`som`)
- **tSNE** (`tsne`)
- **UMAP** (`umap`)
- **Autoencoder** (`ae` or `autoencoder`)

### Example
```javascript
const mkdata = require('mkdata')
const dimred = require('dimred')

// Generate a dataset with 1000 samples
// X: Array (1000, 10)
const [X, _] = mkdata.friedman1({
  'nSamples': 1000
}) 

// Run dimensionality reduction
// emb: Array (1000, 2)
const emb = dimred(X, {
  'method': 'pca',
  'dims': 2
}) 
```

### Web demo
All methods included in the **dimred** package are available online on [StatSim Vis](https://statsim.com/vis)
