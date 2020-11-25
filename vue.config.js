module.exports = {
    devServer: {
	    disableHostCheck: true,
            public: 'dev.lenfer.ru',
	    port: 8083,
	    watchOptions: {
	        ignored: /static/
	    }
    },
	chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "My.Lenfer.ru";
                return args;
            })
    }
}
