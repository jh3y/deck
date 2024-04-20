import { getCollection } from "astro:content"
import {
  ATTRIBUTE_DECORATOR,
  CODE_STEP_SPLITTER,
  SLIDE_SEPARATOR,
} from "@constants/index"
import type { MarkdownInstance } from "astro"

export interface Slide {
  file: string
  rawContent: () => string
}

export interface Deck {
  id: string
  collection: string
  data: {
    title: string
    slides: string[]
  }
}

export interface SlideStep {
  toRemove: boolean
  element: HTMLElement
  index?: number
  active: boolean
  linesToHighlight?: (string | number)[]
}

export const getSlides = async (slides: Slide[]) => {
  const deckSlides: { key: string; section: Slide; slides: string[] }[] = []
  const decks = await getCollection("decks")
  // Iterate over the decks and work out the slides
  for (let d = 0; d < decks.length; d++) {
    const deck = decks[d]
    // Go through all the decks and align the files in the right order
    for (const section of deck.data.slides) {
      for (const slide of slides) {
        if (slide.file.includes(section)) {
          if (!deckSlides.find((set) => set.key === section)) {
            deckSlides.push({
              key: section,
              section: slide,
              // base: slide.file.slice(slide.file.lastIndexOf('/src/slides/') + 12, slide.file.lastIndexOf('.md')),
              slides: slide
                .rawContent()
                .split(`${SLIDE_SEPARATOR}\n`)
                .map((line: string) => line.replace(/\n$/, "")),
            })
          }
        }
      }
    }
  }
  return deckSlides
}

export const getDeckSlides = async (
  deck: Deck,
  slides: MarkdownInstance<Record<string, string>>[],
) => {
  const deckSlides = []
  const allSlides = await getSlides(slides)

  const setSlides = []

  for (let s = 0; s < deck.data.slides.length; s++) {
    const setToAdd = allSlides.find(
      (c) => c.key === deck.data.slides[s],
    )?.slides
    if (setToAdd) setSlides.push(...setToAdd)
  }

  for (let i = 0; i < setSlides.length; i++) {
    const metadata: Record<string, string> = {}
    const slide = setSlides[i]
    const slideComment = slide
      .split("\n")[0]
      .match(new RegExp(/<!--(.*?)-->/, "g"))
    // If there's a match, you've got attributes to hook into and use
    if (slideComment) {
      // Take that comment and split it by whitespace.
      // Filter it for ATTRIBUTE_DECORATOR ("@") prefixed attributes
      const attributes = slideComment[0]
        .substring(4, slideComment[0].length - 3)
        .split(ATTRIBUTE_DECORATOR)
        .map((bloated) => bloated.trim())
        .filter((potential) => potential !== "")

      // The attribute decorator is used to split the attributes and create an options object
      for (let a = 0; a < attributes.length; a++) {
        const attribute = attributes[a]
        const [key, value] = attribute.split("=")
        metadata[key] = value
          ? value.replace(new RegExp(/\"/, "g"), "")
          : "true"
      }
    }

    const entry = {
      params: {
        deck: deck.id,
        slide: `${deck.id}-${i}`,
      },
      props: {
        entry: {
          index: i,
          progress: ((i / (setSlides.length - 1)) * 100).toFixed(2),
          prev: i === 0 ? undefined : `${deck.id}-${i - 1}`,
          next: i === setSlides.length - 1 ? undefined : `${deck.id}-${i + 1}`,
          title: `${deck.id}-${i}`,
          content: setSlides[i],
          metadata,
          theme: Math.random() > 0.5 ? "dark" : "light",
        },
      },
    }
    deckSlides.push(entry)
  }
  return deckSlides
}

export const getSlideSteps = ({
  activeStep,
  direction,
  slide,
}: {
  activeStep?: number
  direction: number
  slide: HTMLBodyElement
}) => {
  // Create a new starting point for slide steps
  const slideSteps: SlideStep[] = []
  const CURRENT_SLIDE = slide
  // Grab all steps including those that are code step throughs
  const STEPS = CURRENT_SLIDE.querySelectorAll(
    "[data-step], code[data-code-block-steps]",
  )
  // For each step, grab an order for it and push it into the step map "slideSteps"
  for (const STEP of STEPS as NodeListOf<HTMLElement>) {
    const index = Number.parseInt(STEP.dataset.step || "", 10)
    // If there's a code step, then make that a step
    // But key it to be removed before send off.
    // If there are code steps created, they will get inserted at this point
    // if (STEP.tagName === "CODE") {
    //   const STEP_MAP = STEP.getAttribute("data-code-block-steps");
    //   STEP.dataset.stepActive = "true";
    //   // Need to test these block edge cases, like transition in, multiple in a page, etc...
    //   // const BLOCK_STEPS = STEP_MAP.substring(1, STEP_MAP.length - 1).trim();
    //   // if (BLOCK_STEPS === '') STEP.setAttribute('data-step-active', true)
    // }
    // Push the slide step into the map. Remember, any specified order takes precedence
    slideSteps.push({
      toRemove: STEP.tagName === "CODE",
      element: STEP,
      index: Number.isNaN(index) ? undefined : index,
      active: direction < 0,
    } as SlideStep)
  }

  // At this point, sort the steps by decorator.
  // Unspecified steps go to the back of the line by DOM order
  const sortedSteps = [
    ...slideSteps
      .filter((step) => step.index !== undefined)
      .sort((a, b) =>
        a.index !== undefined && b.index !== undefined && a.index < b.index
          ? -1
          : 1,
      ),
    ...slideSteps.filter((step) => step.index === undefined),
  ]

  // Search for any code blocks that have steps defined
  const BLOCKS = CURRENT_SLIDE.querySelectorAll(
    "[data-code-block-steps]",
  ) as NodeListOf<HTMLElement>

  // For each block, you need to add the steps to the step map if there are any steps needed
  for (const BLOCK of BLOCKS) {
    // If there is a block, make steps from the lines that are desired.
    // If there is more than the code block in the slide, need to cater for this too.

    // 1. Take the attribute and check if it's not an empty Array
    const SPLITTER = CODE_STEP_SPLITTER
    const LINE_MAP = BLOCK.getAttribute("data-code-block-steps") as string
    const LINE_STEPS = LINE_MAP.substring(1, LINE_MAP.length - 1)
      .split(SPLITTER)
      .filter((entry) => entry.trim() !== "")

    // Grab the index for the associated order
    // Needs to be inserted at the point...
    let INSERTION_INDEX = 0
    for (let i = 0; i < sortedSteps.length; i++) {
      const STEP = sortedSteps[i]
      if (STEP.element === BLOCK) {
        INSERTION_INDEX = i
        break
      }
    }
    if (LINE_STEPS.length > 0) {
      // Iterate over the line steps and add a step for each.
      // You're going to insert things into the Array at the insertion index.
      const LINES: SlideStep[] = []

      for (let s = 0; s < LINE_STEPS.length; s++) {
        const step = LINE_STEPS[s]

        const lines = step.split(",")

        const selector = []

        // These are the different selector styles for code highlighting.
        // *: wildcard
        // 1,2: comma-separated lines
        // 4-6: range syntax for lines
        // Creates an Array of lines that get highlighted in each step
        for (let l = 0; l < lines.length; l++) {
          const nth = lines[l]
          if (nth === "*") {
            selector.push("*")
          } else if (nth.split("-").length > 1) {
            const ends = nth.split("-")
            const start = Number.parseInt(ends[0], 10)
            const end = Number.parseInt(ends[1], 10)
            for (let i = start; i < end + 1; i++) selector.push(i)
          } else {
            selector.push(Number.parseInt(nth, 10))
          }
        }

        // Here's the line step that gets inserted into our stepping map.
        // At the end we remove the parent block step because it isn't required. Need to test this...
        LINES.push({
          toRemove: false,
          element: BLOCK,
          index: undefined,
          active: direction < 0,
          linesToHighlight: selector,
        })
      }
      // Think the insertion index should be +1'd
      sortedSteps.splice(INSERTION_INDEX, 0, ...LINES)
    }
  }
  // Filter out the steps that need to be removed
  let newSteps = sortedSteps.filter((step) => !step.toRemove)
  // At this point, you can preload the step based on location hash if required.
  if (activeStep !== undefined) {
    newSteps = newSteps.map((step, index) => {
      if (index <= activeStep) step.active = true
      return {
        ...step,
        active: index <= activeStep,
      }
    })
  }
  return newSteps
}
