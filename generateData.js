/* eslint-env node */
import { faker } from '@faker-js/faker'

/**
 * Генеруриет json с данными для страницы: заголовки, карточки
 * @param {string} categoryTitle - для тэга title
 * @param {string} categoryHeader - для тэга h1
 * @param {number} numberOfCards - количество карточек для страницы
 * @returns {Promise<Object>}
*/
export default function generateData( categoryTitle, categoryHeader, numberOfCards ) {
  return new Promise( ( res, rej ) => {
    if ( !categoryTitle ) rej( new Error( "Please provide title" ) )
    if ( !categoryHeader ) rej( new Error( "Please provide header" ) )
    if ( !numberOfCards || numberOfCards < 1 ) rej( new Error( "Please provide number of cards" ) )

    let cards = []

    for ( let i = 0; i < numberOfCards; i++ ) {
      let card = {}
      card.sku = "sku-" + String( i ).padStart( 4, '0' )
      card.title = faker.commerce.productName()
      card.price = faker.commerce.price( 250, 7500, 2, '₽' )
      card.qtyMax = Math.floor( Math.random() * 150 ) + 25
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

// const d = await generateData()
// fs.writeFileSync( "data.json", JSON.stringify( d, null, 2 ) )
