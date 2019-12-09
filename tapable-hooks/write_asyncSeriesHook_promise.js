class AsyncSerisHooks{
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
               return acc.then( () => task.fn(...args) )
            },first.fn(...args)
        )
    }

}
let hook = new AsyncSerisHooks(['name','work'])
hook.tapPromise('step1',function(name,work){
    return new Promise(
        (resolve,reject) => {
            setTimeout(function(){
                console.log(name,work,'processing')
                resolve()
            }
        ,2000)
        }
    )

})
hook.tapPromise('step2',function(name,work){
    return new Promise(
        (resolve,reject) => {
            setTimeout(function(){
                console.log(name,work,'done')
                resolve()
            }
        ,1000)
        }
    )

})
hook.promise('lee','react-learning').then(function(){
    console.log('the end')
})
