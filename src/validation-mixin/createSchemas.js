import schemasTmplt from './schemas.json'

import {rdaValues} from '../ham-radio'

const replace = {
    rdaValues: JSON.stringify(rdaValues),
    reCallsignBase: "\"^\\\\d?[A-Z]+\\\\d+[A-Z]+$\"",
    reCallsignFull: "\"^(:?[A-Z\\\\d]+\\\\/)?\\\\d?[A-Z]+\\\\d+[A-Z]+(:?\\\\/[A-Z\\\\d]+)*$\""
}

export default function () {
  let schemasStr = JSON.stringify(schemasTmplt)
  for (const r in replace) {
    const re = new RegExp("\"\\$" + r + "\\$\"", 'g')
    schemasStr = schemasStr.replace(re, replace[r])
  }
  return JSON.parse(schemasStr)
}
