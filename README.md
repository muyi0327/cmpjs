# cmpjs
Components of the generation tool

## install
    npm install cmpjs -g

## fix build slow problem
    If your NPM version is 2.x, execute the 'npm dedupe' after the execution of the 'npm install' command.

## Documentation

### create command
    cmpjs create <componentName> [--combine]

#### example ./index.cmp

    command:
    cmpjs create new-box

    result:

    ./index.cmp
    ----content:
    <style src="./src/attention-btn.scss" lang="sass"></style>

    <template src="./src/attention-btn.html"></template>

    <script src="./src/attention-btn.js" lang="es6"></script>

    /src
    ---attention-btn.scss
    ---attention-btn.html
    ---attention-btn.js

    ./cmp.config.js
    ./karma.conf.js
    ./package.json




### build command
    cmpjs build
