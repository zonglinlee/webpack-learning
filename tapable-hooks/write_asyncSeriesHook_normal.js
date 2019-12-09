class AsyncSerisHooks{
    constructor(){ //args是个数组，参数个数不确定
        this.tasks = []
    }

    tapAsync(name,callback){
        this.tasks.push({name,fn:callback})
    }

    callAsync(...args){ 
        let finalCallback = args.pop()//得到callAsync函数的最后一个回调函数
        let index = 0
        //定义一个next函数，每次当上一个监听函数执行完毕之后，再执行next(),调用下一个监听函数
        //这个next()类似于express的中间件函数写法
        let next = () => { //写成箭头函数，内部this指向上一层函数的this
            if(index === this.tasks.length) return finalCallback()
            this.tasks[index++].fn(...args,next)
        }
        next()
    }

}
let hook = new AsyncSerisHooks(['name','work'])
hook.tapAsync('step1',function(name,work,next){
    setTimeout(function(){
        console.log(name,work,'processing')
        next()
    }
,2000)
})
hook.tapAsync('step2',function(name,work,next){
    setTimeout(function(){
        console.log(name,work,'done')
        next()
    }
,1000)
})
hook.callAsync('lee','react-learning',function(){
    console.log('the end')
})
