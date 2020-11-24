export const RU_MONTH = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", 
            "сентября", "октября", "ноября", "декабря"] 

export function display_date (date_obj) {
  return `${date_obj.getDate()} ${RU_MONTH[date_obj.getMonth()]}`
}

export function display_datetime (date_obj) {
  return `${date_obj.getDate()} ${RU_MONTH[date_obj.getMonth()]} ${date_obj.getHours()}:${date_obj.getMinutes()}`
}

export function isEmpty (obj) {
  return Object.keys(obj).length === 0
}

export function debugLog (msg) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.log(msg)
  }
}


