const TSNE = require('tsne').tSNE
const { Matrix } = require('ml-matrix')
const PCA = require('ml-pca').PCA
const SOM = require('ml-som')
const UMAP = require('umap-js').UMAP
const Autoencoder = require('autoencoder')

const defaults = {
  clean: true,
  dims: 2,
  force: false, // force a method to generate provided dimensions (SOM)
  method: 'PCA'
}

module.exports = function dimred (X, opts) {
  const options = Object.assign({}, defaults, opts)
  const method = options.method.toLowerCase()

  if (options.clean) {
    const len = X.length || 1

    X = new Matrix(X)

    // Remove cols with NaNs
    const cols = []
    for (let i = 0; i < X.columns; i++) {
      const col = X.getColumn(i)
      const na = col.reduce((a, x) => a + isNaN(x), 0)
      if (na < len / 10) {
        cols.push(i)
      }
    }
    X = X.subMatrixColumn(cols)

    // Scale
    if (options.transform) {
      if (options.transform === 'Scale') {
        X = X.scaleColumns()
      } else if (options.transform === 'Log') {
        X = X.add(1).log()
      }
    }

    // Remove rows with NaN
    const rows = []
    for (let i = 0; i < len; i++) {
      const row = X.getRow(i)
      const na = row.reduce((a, x) => a + isNaN(x), 0)
      if (na === 0) {
        rows.push(i)
      }
    }
    X = X.subMatrixRow(rows)

    // Convert X to a native 2d array
    X = X.to2DArray()
  }

  switch (method) {
    case 'pca': {
      return new PCA(X).predict(X, { nComponents: options.dims }).to2DArray()
    }
    case 'som': {
      const somOptions = Object.assign({}, {
        iterations: options.steps || 20,
        fields: X[0].length
      }, options)
      const som = new SOM(
        options.x || 100,
        options.y || 100,
        somOptions
      )
      som.train(X)
      if (options.dims === 2) return som.predict(X)
      else if (options.force) return som.predict(X).map(y => y.concat(new Array(options.dims - 2).fill(0)))
      else throw new Error('SOM supports only 2D mapping')
    }
    case 'umap': {
      const steps = options.steps || 200
      const umap = new UMAP({
        nComponents: options.dims,
        nEpochs: steps
      })
      umap.initializeFit(X)
      for (let i = 0; i < steps; i++) {
        umap.step()
      }
      return umap.getEmbedding()
    }
    case 'tsne':
    case 't-sne': {
      const tsne = new TSNE({
        epsilon: options.epsilon || 10,
        dim: options.dims
      })
      tsne.initDataRaw(X)
      const steps = options.steps || 200
      for (let k = 0; k <= steps; k++) {
        tsne.step()
      }
      return tsne.getSolution()
    }
    case 'ae':
    case 'autoencoder': {
      const ae = new Autoencoder({
        encoder: [
          { nOut: options.layerSize || 30, activation: 'tanh' },
          { nOut: options.dims, activation: 'sigmoid' }
        ],
        decoder: [
          { nOut: options.layerSize || 30, activation: 'tanh' },
          { nOut: X[0].length }
        ]
      })
      ae.fit(X, {
        iterations: options.steps || 10000,
        stepSize: options.stepSize || 0.005,
        batchSize: options.batchSize || 20,
        method: 'adam'
      })
      return ae.encode(X)
    }
  }
}
