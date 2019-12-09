//瀑布流函数，上一个任务的输出传入到下一个任务作为输入
class AsyncSeriesWaterfallHook{
    constructor(){ 
        this.tasks = []
    }

    tapPromise(name,callback){
        this.tasks.push({name,fn:callback})
    }

    promise(...args){ 
        let [first,...rest] = this.tasks
        //fist(args)执行完毕会返回一个promise给acc
        //acc继续调用then，传入下一个task
        return rest.reduce(
            (acc,task) => {
               return acc.then( (data) => task.fn(data))
            },first.fn(...args)
        )
    }

}
let hook = new AsyncSeriesWaterfallHook(['name','work'])
hook.tapPromise('step1',function(name,work){
    return new Promise(
        (resolve,reject) => {
            setTimeout(function(){
                console.log(name,work,'ok')
                resolve('lee-sleeping')
            }
        ,2000)
        }
    )

})
hook.tapPromise('step2',function(data){
    return new Promise(
        (resolve,reject) => {
            setTimeout(function(){
                console.log(data,'zzzz')
                resolve()
            }
        ,1000)
        }
    )

})
hook.promise('lee','light-out').then(function(){
    console.log('good night')
})
