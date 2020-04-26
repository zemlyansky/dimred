#!/usr/bin/env node
const dimred = require('../')
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    clean: 'c',
    dims: 'd',
    force: 'f',
    method: 'm',
    steps: 's',
    epsilon: 'e',
    layerSize: 'l',
    ignore: 'i',
    target: 't'
  },
  default: {
    ignore: [],
    dims: 2
  }
})

argv.ignore = argv.ignore.split(',').map(v => v.trim())
if (argv.target && argv.target.length) argv.ignore.push(argv.target)

console.log(argv)

// Read
let input
if (argv._.length === 1) {
  const inputFile = argv._[0]
  input = fs.readFileSync(inputFile, 'utf8')
} else {
  input = fs.readFileSync(0, 'utf-8')
}

// Project
let output = ''
const records = parse(input, { skip_empty_lines: true })

if (records.length) {
  const head = records[0]
  let columns
  if (isNaN(head[0])) {
    columns = records.shift()
  }
  const X = records.map((r, ri) => r.filter((_, ci) => !argv.ignore.includes(columns[ci])))
  console.log(X[0])
  const Y = dimred(X, argv)
  output += new Array(argv.dims).fill('x').map((v, i) => v + (i + 1)).join(',')
  if (argv.target && argv.target.length) output += ',y'
  output += '\n'
  Y.forEach((y, i) => {
    output += y.join(',')
    if (argv.target && argv.target.length) output += ',' + records[i][columns.indexOf(argv.target)]
    output += '\n'
  })
} else {
  throw new Error('No records')
}

// Write
if (argv.o && argv.o.length) {
  fs.writeFileSync(argv.o, output)
} else {
  process.stdout.write(output)
}
