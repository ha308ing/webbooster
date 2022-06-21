/* eslint-env node */
import { faker } from '@faker-js/faker'
import fs from "fs"
import yargs from "yargs"

const argv = yargs( process.argv ).argv
const argvDefault = {
  categoryTitle: argv.title || "Category Default Title",
  categoryHeader: argv.header || "Category Default Header",
  numberOfCards: argv.cards || 4
}

export default function generateData(
  categoryTitle = argvDefault.categoryTitle,
  categoryHeader = argvDefault.categoryHeader,
  numberOfCards = argvDefault.numberOfCards,
) {
  return new Promise( ( res, rej ) => {
    let cards = []

    for ( let i = 0; i < numberOfCards; i++ ) {
      let card = {}
      card.sku = "sku-" + String( i ).padStart(4, '0')
      card.title = faker.commerce.productName()
      card.price = faker.commerce.price( 250, 7500, 2, '₽' )
      card.qtyMax = Math.floor( Math.random() * 150 )  + 25
      card.imageSrc = `http://via.placeholder.com/320/e3f2ff/9b4c4c?text=Изображение+${ i + 1 }`
      cards.push( card )
    }

    res(
      {
        title: categoryTitle,
        header: categoryHeader,
        cards
      }
    )
  }
  )
}

const d = await generateData()
fs.writeFileSync( "data.json", JSON.stringify( d, null, 2 ) )
