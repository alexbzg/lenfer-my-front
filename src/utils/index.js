export const RU_MONTH = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", 
            "сентября", "октября", "ноября", "декабря"] 

export function display_date (date_obj) {
  return `${date_obj.getDate()} ${RU_MONTH[date_obj.getMonth()]}`
}

export function display_datetime (date_obj) {
  return `${date_obj.getDate()} ${RU_MONTH[date_obj.getMonth()]} ${string_pad(date_obj.getHours())}:${string_pad(date_obj.getMinutes())}`
}

export function isEmpty (obj) {
  return Object.keys(obj).length === 0
}

export function string_pad (val, pad_char="0", pad_to_length=2) {
  val = val.toString()
  while (val.length < pad_to_length) {
    val = pad_char + val
  }
  return val
}

export function zeropad_range (limit, pad_to_length=2, shift=0) {
  return [...Array(limit).keys()].map(item => string_pad(item + shift, "0", pad_to_length)) 
}

export function debugLog (msg) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.log(msg)
  }
}

export function seconds_to_timestring (val) {
  let value = val || 0
  if (value < 0) {
    value = -value
  }
  const hr = Math.floor(value/3600)
  const mn = Math.floor((value - hr*3600)/60)
  return `${val < 0 ? '-' : ''}${string_pad(hr)}:${string_pad(mn)}`
}

export function seconds_to_timetuple (val) {
  let value = val || 0
  let sign = 1
  if (value < 0) {
    value = -value
    sign = -1
  }
  const hr = Math.floor(value/3600)
  const mn = Math.floor((value - hr*3600)/60)
  return [sign * hr, sign * mn]
}


