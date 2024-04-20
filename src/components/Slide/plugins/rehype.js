import { ATTRIBUTE_DECORATOR } from "@constants/index.js"
import { visit } from "unist-util-visit"
/**
 * Two custom rehype plugins here for intercepting the Markdown compilation.
 *
 * 1. rehypeCodeLines uses the meta value of the element to determine whether code
 * lines should be shown on a rendered code block
 *
 * 2. rehypeSlidesSteps is a little more complex and takes the attribute decorator
 * and the keyword "step" to determine whether there are steps that need to be rendered
 * in a slide for walking through
 * */

// Use this merely to inject the line numbers syntax into a property on the AST tree
export const rehypeCodeLines = () => (tree) => {
  visit(tree, "element", (node) => {
    if (node.tagName === "code" && node.data?.meta) {
      const attr = node.data.meta.split(" ")
      for (let i = 0; i < attr.length; i++) {
        if (i === 0) node.properties.dataLineNumbers = attr[i]
        if (i === 1) node.properties.dataFile = attr[i]
      }
    }
  })
}

// This one's trickier.
export const rehypeSlideSteps = () => (tree) => {
  const steps = []
  // Visit the entire tree and sniff out any step decorations.
  // Store them in an Array
  visit(tree, "raw", (node) => {
    if (node.value.indexOf(`${ATTRIBUTE_DECORATOR}step`) !== -1) {
      // Extract the part surrounded by the comment and read off the attributes.
      const attributeMap = node.value
        .split("\n")
        .filter((block) => block.match(new RegExp(/<!--(.*?)-->/, "g")))[0]

      const attributes = attributeMap
        .substring(4, attributeMap.length - 3)
        .split(ATTRIBUTE_DECORATOR)
        .map((bloated) => bloated.trim())
        .filter((trimmed) => trimmed !== "")

      const toApply = {}

      // TODO:: This could be used to do some "extra" stuff.
      // But, I've never needed it? How about step-transitions?
      attributes.map((attr) => {
        const [key, value] = attr.split("=")
        if (!toApply.hasOwnProperty[key]) {
          toApply[key] = value ? value.replace(new RegExp(/\"/, "g"), "") : true
        }
      })
      steps.push({
        node,
        attributes: toApply,
      })
    }
  })

  // Gotta loop back over the raw and element to hook up the attributes...
  visit(tree, "raw", (node) => {
    const start = node.position.start.line
    for (const step of steps) {
      // console.info({ step, start })
      if (step.node.position.start.line === start - 1) {
        // Inject attributes into the raw element...
        // Inject at the start based on the first space.
        let attributeString = " "
        // Build a string from the step.attributes
        for (const [attr, value] of Object.entries(step.attributes)) {
          attributeString += `data-${attr}="${value}" `
        }
        // Add the active attribute
        attributeString += `data-step-active="false" `
        const attempt = `${node.value.substring(
          0,
          node.value.indexOf(" "),
        )}${attributeString}${node.value.substring(
          node.value.indexOf(" ") + 1,
        )}`
        // Swap out the value
        node.value = attempt
      }
    }
  })
  // And you gotta do this to elements too because some things won't get caught in
  // raw loop like they do in the element loop
  visit(tree, "element", (node) => {
    const nodeStart = node.position.start.line
    for (const step of steps) {
      const stepStart = step.node.position.start.line
      const match = stepStart === nodeStart - 1
      if (match) {
        // When we have an element, we can inject into the properties key
        for (const [attr, value] of Object.entries(step.attributes)) {
          // For it to stick and get rendered at the other end, you gotta camelCase it
          node.properties[
            `data${attr
              .split("-")
              .map(
                (word) => `${word.charAt(0).toUpperCase()}${word.substring(1)}`,
              )
              .join("")}`
          ] = value
        }
        // I've got a hunch that things like "dataStepTransition" are supported in script
        // but not styles yet
        node.properties.dataStepActive = "false"
      }
    }
  })
}
