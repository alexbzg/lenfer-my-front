module.exports = {
    devServer: {
	    disableHostCheck: true,
            public: 'mydev.lenfer.ru',
	    port: 8083,
	    watchOptions: {
	        ignored: /static/
	    }
    },
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: false,
            reportFilename: '../public/report.html'
        }
    },
    configureWebpack: {
        externals: {
            moment: 'moment'
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
