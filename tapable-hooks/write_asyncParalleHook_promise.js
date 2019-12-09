//tapble库中这个钩子也是名字叫做AayncParalleHook,他可以tapAsync/tapPromise
//调用的时候可以callAsync/promise
class AsyncParalleHook{
    constructor(){ 
        this.tasks = []
    }
    tapPromise(name,callback){
        this.tasks.push({name,fn:callback})
    }

    promise(...args){ 
    //Promise.all()接受一个[promise1,promise2]这样的promise数组
    //等promise数组所有promise完成之后，再返回一个promise对象
     return Promise.all(this.tasks.map(item => item.fn(...args)))
    }

}
let hook = new AsyncParalleHook(['name','work'])
hook.tapPromise('step1',function(name,work){
    return new Promise(
        (resolve,reject) => {
            setTimeout(function(){
                console.log(name,work,'processing')
                resolve()
            }
        ,1000)
        }
    )

})
hook.tapPromise('step2',function(name,work){
    return new Promise(
        (resolve) => {
            setTimeout(function(){
                console.log(name,work,'done')
                resolve()
            }
        ,2300)
        }
    )

})
//通过then传递finalcallback，表明所有异步任务结束之后的回调
hook.promise('lee','react-learning').then(function(){
    console.log('the end')
})
