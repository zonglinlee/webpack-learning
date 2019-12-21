let fs = require('fs')
let path = require('path')
let babylon = require('babylon')
let traverse = require('@babel/traverse').default
let generator = require('@babel/generator').default
let ejs = require('ejs')
let { SyncHook } = require('tapable')
/**https://stackoverflow.com/questions/43247696/javascript-require-vs-require-default
 *  the require and require.default... when dealing with ES6 imports 
 * (export default MyComponent), the exported module 
 * is of the format {"default" : MyComponent}. The import statement correctly 
 * handles this assignment for you, however, you have to 
 * do the require("./mycomponent").default conversion yourself. 
 * The HMR interface code cannot use import as it doesn't work inline.
 *  If you want to avoid that, use module.exports instead of export default.
 */
let types = require('@babel/types')

class Compiler{
    constructor(config){
        this.config = config;
        this.entryID
        //用来保存所有模块依赖关系
        this.modules = {}
        this.entry = config.entry //入口路径
        //process.cwd() returns the current working directory of the Node.js process.
        this.root = process.cwd()
        this.hooks = {
            entryOption:new SyncHook(),
            compile:new SyncHook(),
            afterCompile:new SyncHook(),
            afterPlugins:new SyncHook(),
            run:new SyncHook(),
            emit:new SyncHook(),
            done:new SyncHook()
        }
        //如果webpackconfig传入了plugins参数
        let plugins = this.config.plugins
        if(Array.isArray(plugins)){
            plugins.forEach(plugin => {
                plugin.apply(this)
            })
        }
    }
    getSource(modulePath){
        //读取源文件
        let source = fs.readFileSync(modulePath,'utf8')
        //先匹配loader函数，预处理匹配文件
        let rules = this.config.module.rules
        for(let i = 0; i<rules.length; i++){
            let {test , use } = rules[i]
            //匹配loader
            if(test.test(modulePath)){//loader从右往左处理
               let last_loader_index = use.length -1
            //获得loader文件路径，并require进来
               debugger;
               while(last_loader_index > -1 ){
                    let loader_function = require( use[last_loader_index] )
                    source = loader_function(source)
                    last_loader_index--
               }
                
            }
        }
        
        return source
    }
    //解析源码  https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-babel-traverse
    //babylon  将源码解析为AST
    /**
     * @babel/traverse   The Babel Traverse module maintains the overall tree state,
     *  and is responsible for replacing, removing, and adding nodes.
    /
    /**
     * @babel/types  Babel Types is a Lodash-esque utility library for AST nodes. 
     * It contains methods for building, validating, and converting AST nodes. 
     * It's useful for cleaning up AST logic with well thought out utility methods.
    */
    /**
     * @babel/generator   Babel Generator is the code generator for Babel. 
     * It takes an AST and turns it into code with sourcemaps.
    */
    parse(source,parentPath){ //AST解析语法树
        /**
         * 遍历节点时候，定义进入CallExpression这个节点时候所要调用的 visitor 函数
         * When you have a visitor that has a Identifier() method, 
         * you're actually visiting the path instead of the node.
        */
       console.log(source)
       let ast = babylon.parse(source)
        //遍历/替换 节点，生成新的AST
       let dependencies = []; //创建当前文件 的 依赖文件列表
       traverse(ast,{
           CallExpression(_path){
            let node = _path.node
            if(node.callee.name === 'require'){ //识别require关键字，将require更名
                node.callee.name = '__webpack_require__'
                let moduleName = node.arguments[0].value; //提取模块引用路径
                moduleName += path.extname(moduleName) ? '':'js' ; //判断有无后缀名，没有则加上后缀
                //一个模块中 引用另一个模块，路径是相对于当前文件的
                //所以这里的moduleName 还要拼接上传入的parentPath
                moduleName = './' + path.join(parentPath,moduleName)
                dependencies.push(moduleName)
                //利用@babel/types更改 __webpack_require__ 中要传入的参数
                //这是一个callExpression ,修改传入的参数
                node.arguments = [types.stringLiteral(moduleName)]
                }
           }
       })
       //将新的ast转换成代码块
       let sourceCode = generator(ast).code
       return {sourceCode,dependencies}
         
    }
    //构建模块
    buildModule(modulePath,isEntry){
        //拿到模块内容
        let source = this.getSource(modulePath)
        //模块id
        // path.relative() method returns the relative path from from to to 
        //based on the current working directory.
        //moduleName是一个相对于当前工作路径的相对路径
        let moduleName = './' + path.relative(this.root,modulePath) //  ./src/index.js
        // console.log(source,'\n',moduleName)
        if(isEntry){
            this.entryID = moduleName //保存主入口路径名
        }
        //需要把source源码进行改造，返回一个依赖列表
        let {sourceCode,dependencies} = this.parse(source,path.dirname(moduleName)) //  ./src
        //把相对路径和模块中的内容对应起来
        this.modules[moduleName] = sourceCode
        //对当前模块进行递归解析其引用的子模块
        dependencies.forEach(dep => {
            this.buildModule(path.join(this.root,dep),false)
        })
    }
    emitFile(){     
        //buildModule生成的是一个js模板，用数据渲染模板，生成最终文件
        //然后交给浏览器解析执行js代码
        //1.拿到输出路径
        let output = path.join(this.config.output.path,this.config.output.filename)
        //2.拿到模板字符串
        let templatePath = path.join(__dirname,'ejs.js')
        let templateString = this.getSource(templatePath)
        //3。渲染模板字符串
        let code = ejs.render(templateString,{entryID:this.entryID,modules:this.modules})
        this.assets = {}
        this.assets[output] = code
        //4.写入到文件，输出到硬盘上
        fs.mkdirSync(this.config.output.path) //创建dist文件夹，但是下次打包的时候要手动删除此文件夹
        fs.writeFileSync(output,this.assets[output])
    }
    run(){
        //执行 并创建模块依赖关系
        this.buildModule(path.resolve(this.root,this.entry),true)
        //发射一个文件 打包后的文件
        this.emitFile()
        this.hooks.emit.call()
    }

}
module.exports = Compiler