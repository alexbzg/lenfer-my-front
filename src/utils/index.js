export const RU_MONTH = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", 
            "сентября", "октября", "ноября", "декабря"] 

export function display_date (date_obj) {
  return `${date_obj.getDate()} ${RU_MONTH[date_obj.getMonth()]}`
}
