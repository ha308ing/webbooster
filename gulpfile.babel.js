/* eslint-env node */
import { task, src, dest, series, parallel, watch } from "gulp"
import pug from "gulp-pug"
import dartSass from "sass"
import gulpSass from "gulp-sass"
import babel from "gulp-babel"
import sourcemaps from "gulp-sourcemaps"
import data from "gulp-data"
import browser from "browser-sync"
import { argv as yargs } from "yargs"
import generateData from "./generateData"
import fs from "fs"
import path from "path"

const sass = gulpSass( dartSass )

// disable watching and server
const isProduction = false || yargs.prod || yargs.production

// need to generate data
const needData = false || yargs.needData

task( "server", () =>
  browser.init( { server: "dist" } ) )

task( "gen-data", async ( cb ) => {
  try {
    let { g_title, g_header, g_cards } = yargs
    const d = await generateData( g_title || "Default title", g_header || "Default header", g_cards || 4 )
    fs.writeFile( "./src/data.json", JSON.stringify( d, null, 2 ), cb )
  }
  catch ( error ) {
    console.log( `Error in generating data: ${ error }` )
  }
} )

task( "copy-data", () =>
  src( "src/data.json" ).
    pipe( dest( "dist" ) ) )

task( "copy-php", () =>
  src( "src/script.php" ).
    pipe( dest( "dist" ) ) )

task( "copy", parallel( "copy-data", "copy-php" ) )

task( "pug", () =>
  src( "src/template/*.pug" ).
    pipe( data( function () {
      const dataFile = path.join( __dirname, "src/data.json" )
      return JSON.parse( fs.readFileSync( dataFile ) )
    } ) ).
    pipe( pug( { data } ) ).
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

// parallel task for pug, babel, sass
task( "pbs", parallel( "pug", "babel", "sass" ) )

const tasks = () => {
  let tasks = []
  if ( needData ) tasks = tasks.concat( "gen-data" )
  tasks = tasks.concat( "pbs" )
  tasks = tasks.concat( isProduction ? "copy" : [ "server", "watch" ] )
  console.log( tasks )
  return tasks
}

task( "default", series( tasks() ) )
