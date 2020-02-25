class InitProject{
    async run(){
        console.log(arguments[2])
    }
}  
new InitProject().run('hello', 'jjojoojo', 7)