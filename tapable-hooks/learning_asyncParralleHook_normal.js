let {AsyncParallelHook}  = require('tapable')
//异步钩子 并行 执行
class Lesson {
    constructor(){
        this.hooks = {
            learning:new AsyncParallelHook(['subject1','subject2'])
        }
    }
    tap(){//在learning上注册监听函数，订阅
        this.hooks.learning.tapAsync('step1',function(subject1,subject2,cb){
            setTimeout(function(){
                console.log('learning completed',subject1 ," ", subject2)
                cb()
                /**
                 * 每个注册的异步函数上面都有一个回调，当异步任务结束之后触发，
                当所有注册的异步监听函数都执行完毕的时候，所有的cb()函数也都执行完了，
                此时在callAsync()调用函数身上的回调函数就会被调用，
                否则它就会一直等待所有的监听函数执行完毕
                 */
                
            },2000)
        })
        this.hooks.learning.tapAsync('step2',function(subject1,subject2,cb){
            setTimeout(function(){
                console.log('start-learing',`${subject1} ${subject2}`)
                cb()
            },1000)
        })
    }
    //触发钩子函数，发布
    start(){
        console.log('startLearning')
        this.hooks.learning.callAsync('node','mySql',function(){
            console.log('ended')
        })
    }
}
let aStudent = new Lesson()
aStudent.tap()
aStudent.start()