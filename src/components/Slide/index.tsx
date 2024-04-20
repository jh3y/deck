import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

import type { Components } from "node_modules/react-markdown/lib/index.js"
// import "./slides.css";
import SlideComponents from "./components/index"
import { rehypeCodeLines, rehypeSlideSteps } from "./plugins/rehype.js"

const Compiled = ({
  content,
  metadata,
}: {
  content: string
  metadata: Record<string, string>
}) => {
  return (
    <section
      className={`slide absolute inset-0 w-full grid place-items-center content-center gap-4 leading-[1.3] text-center overflow-hidden ${
        metadata.className ? metadata.className : ""
      }`}
    >
      <div className="slide__backdrop fixed inset-0 -z-10" />
      <div className="slide__layout absolute grid inset-0">
        <div className="slide__content max-h-screen relative flex flex-col items-center justify-center place-items-center content-center w-[80%] mx-auto max-w-[calc(100vw-2rem)]">
          <Markdown
            components={SlideComponents as unknown as Partial<Components>}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeCodeLines, rehypeSlideSteps, rehypeRaw]}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </section>
  )
}

export default Compiled
