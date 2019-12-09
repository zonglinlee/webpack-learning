//Waterfall. A waterfall hook also calls each tapped function in a row. 
//Unlike the basic hook, it passes a return value from each function to 
//the next function.
class AsyncSeriesWaterfallHook{
    constructor(){ 
        this.tasks = []
    }

    tapAsync(name,callback){
        this.tasks.push({name,fn:callback})
    }

    callAsync(...args){ 
        let finalCallback = args.pop()
        let index = 0
        let next = (value) => {
            if(index === this.tasks.length)return finalCallback()
            if(index === 0){
                this.tasks[index].fn(...args,next)
            }else{
                this.tasks[index].fn(value,next)
            }
            index++
        }
        next()
    }

}
let hook = new AsyncSeriesWaterfallHook(['name','work'])
hook.tapAsync('step1',function(name,work,next){
            setTimeout(function(){
                console.log(name,work,'ok')
                next('lee-sleeping')
            }
        ,2000)
        }
    )
hook.tapAsync('step2',function(data,next){

            setTimeout(function(){
                console.log(data,'zzzz')
                next('8hs later')
            }
        ,4000)
        }
    )
hook.tapAsync('step3',function(data,next){

            setTimeout(function(){
                console.log(data,'get-up')
                next()
            }
        ,1000)
        }
    )

hook.callAsync('lee','light-out',function(){
    console.log('good morning')
})
