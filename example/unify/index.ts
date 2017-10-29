const amdLoader = require('../../src/index');

amdLoader.require('./test/index', () => {
    console.log(amdLoader.require.modules);
}); 