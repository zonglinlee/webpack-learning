#!/usr/bin/env node
//拿到webpack.config.js文件
let  path  =  require('path')
let config = require(path.resolve('webpack-config.js'))
let Compiler = require('../lib/compiler.js')
let compiler = new Compiler(config)
compiler.run()
