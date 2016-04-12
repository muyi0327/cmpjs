# cmpjs
Components of the generation tool

## install
    npm install cmpjs -g

## fix build slow problem
    If your NPM version is 2.x, execute the 'npm dedupe' after the execution of the 'npm install' command.

## Documentation

### Create command
    cmpjs create <componentName> [--combine]

#### Example

    command:
    cmpjs create new-box

    result:

    ./index.cmp
    ----content:
    <style src="./src/new-box.scss" lang="sass"></style>

    <template src="./src/new-box.html"></template>

    <script src="./src/new-box.js" lang="es6"></script>

    /src
    ---new-box.scss
    ---new-box.html
    ---new-box.js

    ./cmp.config.js
    ./karma.conf.js
    ./package.json

### Build command
    cmpjs build
