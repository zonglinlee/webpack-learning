class AsyncParalleHook{
    constructor(){ //args是个数组，参数个数不确定
        this.tasks = []
    }

    tapAsync(name,callback){
        this.tasks.push({name,fn:callback})
    }

    callAsync(...args){ 
        let finalCallback = args.pop()//得到callAsync函数的最后一个回调函数
        let index = 0
        //定义一个cb函数，每次监听函数执行完毕之后，执行cb(),然后让index++
        let cb = () => { //写成箭头函数，内部this指向上一层函数的this
            index++
            if(index === this.tasks.length){
                finalCallback()
            }
        }
        this.tasks.forEach(
                (item) => {item.fn(...args,cb)}
            ) 
    }

}
let hook = new AsyncParalleHook(['name','work'])
hook.tapAsync('step1',function(name,work,cb){
    setTimeout(function(){
        console.log(name,work,'processing')
        cb()
    }
,1000)
})
hook.tapAsync('step2',function(name,work,cb){
    setTimeout(function(){
        console.log(name,work,'done')
        cb()
    }
,2300)
})
hook.callAsync('lee','react-learning',function(){
    console.log('the end')
})
