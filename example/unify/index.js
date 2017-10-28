const amdLoader = require('../../src/index');
var require = amdLoader.require;
amdLoader.require('./test/index', () => {
    console.log(amdLoader.require.modules);
});
//# sourceMappingURL=index.js.map