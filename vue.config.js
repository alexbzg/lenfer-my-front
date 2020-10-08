module.exports = {
    devServer: {
	disableHostCheck: true,
        public: 'dev.lenfer.ru',
	port: 8083,
	watchOptions: {
	    ignored: /static/
	}
    }
}
