var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var uglify = require('rollup-plugin-uglify');

rollup.rollup({
    entry: 'src/index.js',
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: [ "es2015-rollup" ]
        }),
        uglify()
    ]
}).then(function(bundle) {
    bundle.write({
        // output format - 'amd', 'cjs', 'es6', 'iife', 'umd'
        format: 'umd',
        moduleName: 'dqSystem',
        sourceMap: true,
        dest: 'dqSystem.js'
    });
});