class SyncHook{
    constructor(){ 
        this.tasks = []
    }
    tap(name,callback){
        this.tasks.push({name,fn:callback})
    }
    call(...args){ //将传入的参数合并成数组
        this.tasks.forEach(item => item.fn(...args)) //将数组参数展开成单个参数
    }

}
let hook = new SyncHook(['name','work'])
//此处的构造函数传入的参数数组 ['name','work'] 并没有什么实际用处，知识用来提示
//call函数需要传入两个参数，你们就用我传入的这个数组中的字符串作为形参吧
//在实际构造函数实例化的过程中，传入的参数是给constructor用的，在本例中构造函数constructor
//并没有接受任何形式的参数
hook.tap('step1',function(name,work){
    console.log(name,work,'processing')
})
hook.tap('step2',function(name,work){
    console.log(name,work,'done')
})
hook.call('lee','react-learning')
