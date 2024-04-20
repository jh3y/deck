import { defineCollection, z } from "astro:content"

const decksCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slides: z.array(z.string()),
  }),
})

export const collections = {
  decks: decksCollection,
}
