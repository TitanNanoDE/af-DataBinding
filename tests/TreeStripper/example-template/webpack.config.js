module.exports = {
    entry: './main',
    output: {
        filename: 'test.bundle.js'
    },
    module: {
        rules: [
            { test: /\.html$/, use: 'html-loader' }
        ],
    },
    mode: 'development',
    resolve: {
        extensions: ['.js', '.html'],
    }
};
