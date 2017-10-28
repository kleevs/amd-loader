const amdLoader = require('../../src/index');
var require: NodeRequire = amdLoader.require;

amdLoader.require('./test/index', () => {
    console.log(amdLoader.require.modules);
}); 