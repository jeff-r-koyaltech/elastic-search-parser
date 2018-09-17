const fs = require('fs')
const { promisify } = require("util")
const writeFile = promisify(fs.writeFile)

const inputFilePath = 'elastic-search.json'
main()

async function main() {
  let count = 1
  let acordXmlFilter = /\"req_body\": \"(.*)\"/

  const inputReadStream = fs.createReadStream(inputFilePath, {
    encoding: 'utf8'
  })

  let acordXmlAsync = xmlCleanup(filterByRegex(chunksToLines(inputReadStream), acordXmlFilter))
  for await (const acordXmlStr of acordXmlAsync) {
    let fileName = `elastic-search-req-body${count++}.xml`
    console.log(fileName)
    // fire-and-forget, but report exceptions
    await writeFile(fileName, acordXmlStr, { encoding: 'utf8' })
  }

  console.log('done')
}

// log has wonky formatting - remove it
async function* xmlCleanup(xmlAsync) {
  for await (const xml of xmlAsync) {
    let cleanXml = xml
      .replace(/\\r\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')

    yield cleanXml
  }
}

// Borrowed from http://2ality.com/2018/04/async-iter-nodejs.html
async function* chunksToLines(chunksAsync) {
  let previous = ''
  for await (const chunk of chunksAsync) {
    previous += chunk
    let eolIndex
    while ((eolIndex = previous.indexOf('\n')) >= 0) {
      // line includes the EOL
      const line = previous.slice(0, eolIndex+1)
      // console.log('line')
      yield line
      previous = previous.slice(eolIndex+1)
    }
  }
  if (previous.length > 0) {
    yield previous
  }
}

// my filter - only want req_body JSON fragments, which (fortunate for us) are always on one line
async function* filterByRegex(linesAsync, reqBodyRegex) {
  for await (const line of linesAsync) {
    let match = reqBodyRegex.exec(line)
    if (match && match[1]) {
      yield match[1]
    }
  }
}
