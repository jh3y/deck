import fs from "node:fs"
import path from "node:path"
import axios from "axios"

const count = process.argv[3] || 100
const width = process.argv[4] || 720
const height = process.argv[5] || 720

console.info({ count })

const fetches = []

async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath))
  })
}

const saveDirectory = path.join(
  process.cwd(),
  `public/images/stock/${width}x${height}/`,
)

fs.mkdirSync(saveDirectory, { recursive: true })

for (let i = 0; i < count; i++) {
  fetches.push(
    fetch(`https://picsum.photos/${width}/${height}?random=${i}`).then(
      (res) => res.url,
    ),
  )
}

const data = await Promise.allSettled(fetches)

const saves = []
for (let d = 0; d < data.length; d++) {
  saves.push(
    downloadImage(data[d].value, path.join(saveDirectory, `image-${d}.png`)),
  )
}

const complete = await Promise.allSettled(saves)

console.info("This is", complete)

process.exit(0)
