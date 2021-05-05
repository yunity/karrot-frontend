export const presets = {
  WELCOME_IMGS: 'welcomeImgs',
  WELCOME_SCREENSHOTS_BROWSER: 'screenshotsMainBrowser',
  WELCOME_SCREENSHOTS_PHONE: 'screenshotsMainPhone',
}

const presetsDefs = {
  [presets.WELCOME_SCREENSHOTS_BROWSER]: {
    maxWidthRetina: 1776,
    possibleWidths: [400, 600, 800, 880, 889, 1200, 1600, 1760, 1776],
    sizes: `
          (max-width: 386px) 400px,
          (max-width: 583px) 600px,
          (max-width: 699px) 800px,
          (max-width: 760px) 600px,
          (max-width: 960px) 800px,
          (max-width: 1049px) 889px,
          880px
          `,
  },
  [presets.WELCOME_SCREENSHOTS_PHONE]: {
    maxWidthRetina: 490,
    possibleWidths: [100, 120, 130, 160, 200, 211, 240, 245, 260, 320, 422, 490],
    sizes: `
          (max-width: 340px) 100px,
          (max-width: 401px) 120px,
          (max-width: 432px) 130px,
          (max-width: 544px) 160px,
          (max-width: 699px) 211px,
          (max-width: 716px) 160px,
          (max-width: 929px) 211px,
          245px
          `,
  },
  [presets.WELCOME_IMGS]: {
    maxWidthRetina: 600,
    possibleWidths: [100, 150, 200, 250, 300, 400, 500, 600],
    sizes: `
          (max-width: 372px) 100px,
          (max-width: 560px) 150px,
          (max-width: 599px) 200px,
          (max-width: 640px) 150px,
          (max-width: 790px) 200px,
          (max-width: 940px) 250px,
          (max-width: 1049px) 300px,
          250px
          `,
  },
}

const sliceAndSpliceSrcsetWidths = (listOfWidths, imgWidth) => {
  const maxIndex = listOfWidths.reduce(function (
    highestIndex,
    element,
    index,
    array,
  ) {
    return element > array[highestIndex] && element < imgWidth
      ? index
      : highestIndex
  },
  0)

  const srcsetWidths = listOfWidths.slice(0, maxIndex + 1)

  if (!srcsetWidths.includes(imgWidth)) {
    // insert actual image width into array
    // to generate a srcset entry for it
    srcsetWidths.splice(maxIndex + 1, 0, imgWidth)
  }

  return srcsetWidths
}

const generateSrcsetEntries = (baseFileName, basePath, entries) => {
  return entries.reduce((acc, curr, index) => {
    const divider = index < entries.length - 1 ? ', ' : ''
    const currWidth = curr.toString()
    const entry = require(`@/${basePath}${baseFileName}-${currWidth}w.jpg`) + ` ${currWidth}w`
    return acc + entry + divider
  }, '')
}

// TODO: add params description
// TODO: add usage to docs?
export const getImgSources = ({ baseFileName = '', basePath = '', physicalWidth = 0, preset = '' } = {}) => {
  if (!baseFileName || !basePath || !physicalWidth || !preset) {
    return {}
  }

  let baseWidth = presetsDefs[preset].maxWidthRetina
  const possibleWidths = presetsDefs[preset].possibleWidths
  let widths = possibleWidths

  if (physicalWidth < presetsDefs[preset].maxWidthRetina) {
    baseWidth = physicalWidth
    widths = sliceAndSpliceSrcsetWidths(possibleWidths, physicalWidth)
  }

  return {
    src: require(`@/${basePath}${baseFileName}-${baseWidth.toString()}w.jpg`),
    sizes: presetsDefs[preset].sizes,
    srcset: generateSrcsetEntries(baseFileName, basePath, widths),
  }
}
