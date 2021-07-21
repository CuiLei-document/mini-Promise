class Promise {
    constructor(executor) {
        // 定义状态
        this.PromiseState = 'pending'
        this.PromiseResult = null
        this.callBacks = []
        // 保存this
        let self = this
        // resolve函数
        function resolve(data) {
            if (self.PromiseState !== 'pending') { return }
            self.PromiseState = 'fulfilled'
            self.PromiseResult = data

            setTimeout(() => {
                self.callBacks.forEach(item => {
                    item.onResolved(data)
                })
            })

        }
        // reject函数
        function reject(data) {
            if (self.PromiseState !== 'pending') { return }
            self.PromiseState = 'rejected'
            self.PromiseResult = data

            setTimeout(() => {
                self.callBacks.forEach(item => {
                    item.onRejected(data)
                })
            })
        }
        // 同步执行调用
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }


    then(onResolved, onRejected) {
        let self = this
        if (typeof onRejected !== 'function') {
            onRejected = err => {
                throw err
            }
        }
        if (typeof onResolved !== 'function') {
            onResolved = value => value
        }
        return new Promise((resolve, reject) => {
            function callback(type) {
                try {
                    let result = type(self.PromiseResult)
                    if (result instanceof Promise) {
                        result.then(r => {
                            resolve(r)
                        }, e => {
                            reject(e)
                        })
                    } else {
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            if (this.PromiseState === 'fulfilled') {
                setTimeout(() => {
                    callback(onResolved)
                })

            }
            if (this.PromiseState === 'rejected') {
                setTimeout(() => {
                    callback(onRejected)
                })
            }
            if (this.PromiseState === 'pending') {
                this.callBacks.push({
                    onResolved: function () {
                        callback(onResolved)

                    },
                    onRejected: function () {
                        callback(onRejected)
                    }
                })
            }
        })
    }
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }
    static resolve(value) {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(v => {
                    resolve(v)
                }, e => {
                    reject(e)
                })
            } else {
                resolve(value)
            }
        })
    }
    static reject(value) {
        return new Promise((resolve, reject) => {
            reject(value)
        })
    }
    static all(promises) {
        return new Promise((resolve, reject) => {
            let count = 0
            let arr = []
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    count++
                    arr[i] = v
                    if (count === promises.length) {
                        resolve(arr)
                    }
                }, e => {
                    reject(e)
                })
            }
        })
    }
    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    resolve(v)
                }, e => {
                    reject(e)
                })
            }
        })
    }
}