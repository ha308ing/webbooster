/* eslint-env node */
import { task, src, dest, series, parallel, watch } from "gulp"
import pug from "gulp-pug"
import dartSass from "sass"
import gulpSass from "gulp-sass"
import babel from "gulp-babel"
import sourcemaps from "gulp-sourcemaps"
import data from "./data.json"
import browser from "browser-sync"

const sass = gulpSass( dartSass )

const server = cb => {
  browser.init( { server: "dist" } )
  cb()
}

task( "copy-data", () =>
  src( "data.json" ).
    pipe( dest( "dist" ) ) )

task( "copy-php", () =>
  src( "src/script.php" ).
    pipe( dest( "dist" ) ) )

task( "copy", parallel( "copy-data", "copy-php" ) )

task( "pug", () =>
  src( "src/template/*.pug" ).
    pipe( pug( { locals: data } ) ).
    pipe( dest( "dist" ) ) )

task( "babel", () =>
  src( "src/js/main.js" ).
    pipe( babel() ).
    pipe( dest( "dist/js" ) ) )

task( "sass", () =>
  src( "src/css/main.scss" ).
    pipe( sourcemaps.init() ).
    pipe( sass( { includePaths: [ "node_modules/minireset.css" ] } ).on( "error", sass.logError ) ).
    pipe( sourcemaps.write() ).
    pipe( dest( "dist/css" ) ) )

task( "watch", () => {
  watch( "src/template" ).on( "all", series( "pug", browser.reload ) )
  watch( "src/js" ).on( "all", series( "babel", browser.reload ) )
  watch( "src/css" ).on( "all", series( "sass", browser.reload ) )
} )

task( "default", series( "copy", parallel( "pug", "babel", "sass" ), server, "watch" ) )
