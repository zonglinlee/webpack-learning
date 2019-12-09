let {SyncHook} = require('tapable')
class Lesson {
    constructor(){
        this.hooks = {
            learning: new SyncHook(['name'])
        }
    }
    //注册事件
    tapLearning(){
        this.hooks.learning.tap('Vue',function(name){
            console.log(name,'vue','done')
        })
        this.hooks.learning.tap('React',function(name){
            console.log(name,'react','learning')
        })
    }
    startLearning(){
        this.hooks.learning.call('lee')
    }

}
let studentLee = new Lesson()
studentLee.tapLearning()
studentLee.startLearning()
