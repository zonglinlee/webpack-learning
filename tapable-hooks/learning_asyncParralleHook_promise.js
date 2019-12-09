let {AsyncParallelHook}  = require('tapable')
//异步钩子 并行 执行
class Lesson {
    constructor(){
        this.hooks = {
            learning:new AsyncParallelHook(['subject1','subject2'])
        }
    }
    tap(){//在learning上注册监听函数，订阅
        this.hooks.learning.tapPromise('step1',function(subject1,subject2){
            return new Promise( (resolve,reject) => {
                setTimeout(function(){
                    console.log('start-learing',subject1 ," ", subject2)
                    resolve()
                },1000)
            }
        )})
        this.hooks.learning.tapPromise('step2',function(subject1,subject2){
            return new Promise( (resolve,reject) => {
                setTimeout(function(){
                    console.log('learning-completed',subject1 ," ", subject2)
                    resolve()
                },1000)
            }
        )})
    }
    //触发钩子函数，发布
    start(){
        console.log('startLearning')
        this.hooks.learning.promise('node','mySql').then(function(){
            console.log('ended')
        })
    }
}
let aStudent = new Lesson()
aStudent.tap()
aStudent.start()