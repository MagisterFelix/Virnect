const path = require('path');

const resolvePath = (p) => path.resolve(__dirname, p);

module.exports = {
    webpack: {
        alias: {
            '@styles': resolvePath('src/res/styles'),
            '@api': resolvePath('src/api'),
            '@components': resolvePath('src/components')
        },
    },
};