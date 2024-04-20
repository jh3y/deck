import type { CSSProperties } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// @ts-ignore eslint-disable-next-line
import styles from "react-syntax-highlighter/dist/cjs/styles/prism/"
import BrowserSupport from "./browser-support/index.jsx"

const SlideComponents = {
  pre: ({ children }: { children: JSX.Element }) => {
    return children
  },
  demo: ({ ...props }) => {
    if (props.windowed) {
      return (
        <div
          style={
            {
              "--h": props.height || 80,
              "--w": props.width || 90,
            } as CSSProperties
          }
          className={
            "h-[calc(var(--h)*1%)] w-[calc(var(--w)*1%)] aspect-video shadow-perfect overflow-hidden resize border-[1px] border-solid border-[color-mix(in_lch,canvas,canvasText_25%)] rounded-[6px]"
          }
        >
          <div className="relative text-center p-1 h-[28px] bg-[color-mix(in_lch,canvas,canvasText_6%)] rounded-t-[6px]">
            <div className="absolute left-4 bottom-0 top-0 flex items-center gap-x-2">
              <div className="rounded-full bg-red-500 h-[12px] aspect-square" />
              <div className="rounded-full bg-amber-500 h-[12px] aspect-square" />
              <div className="rounded-full bg-green-500 h-[12px] aspect-square" />
            </div>
            <span className="text-[14px] font-[300] opacity-50">
              {props.title || ""}
            </span>
          </div>
          <iframe
            className="w-full h-[calc(100%-28px)] bg-transparent [color-scheme:none]"
            {...props}
          />
        </div>
      )
    }
    return (
      <iframe
        className="w-screen h-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent [color-scheme:none]"
        {...props}
      />
    )
  },
  iframe: ({ ...props }) => {
    return (
      <iframe
        className="w-screen h-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent [color-scheme:none]"
        {...props}
      />
    )
  },
  code: ({
    node,
    inline,
    className,
    children,
    ...props
  }: {
    node: { properties: { dataLineNumbers?: number[]; dataFile?: string } }
    inline: boolean
    className: string
    children: JSX.Element
  }) => {
    // TODO:: Work out syntax line number stepping...
    const match = /language-(\w+)/.exec(className || "")

    return (
      <div
        data-code-block
        className="[&_+_div:has(code)]:mt-8 inline-block border-[1px] w-[80ch] max-w-full overflow-auto border-solid border-[color-mix(in_lch,canvas,canvasText_25%)] rounded-[6px] shadow-perfect"
      >
        <div className="sticky top-0 text-center p-1 h-[28px] bg-[color-mix(in_lch,canvas,canvasText_6%)] rounded-t-[6px]">
          <div className="absolute left-4 bottom-0 top-0 flex items-center gap-x-2">
            <div className="rounded-full bg-red-500 h-[12px] aspect-square" />
            <div className="rounded-full bg-amber-500 h-[12px] aspect-square" />
            <div className="rounded-full bg-green-500 h-[12px] aspect-square" />
          </div>
          <span className="text-[14px] font-[300] opacity-50">
            {node.properties.dataFile || ""}
          </span>
        </div>
        <pre className="code-block w-full">
          {!inline && match ? (
            // @ts-ignore
            <SyntaxHighlighter
              style={styles.nightOwl}
              language={match[1]}
              showLineNumbers={node.properties.dataLineNumbers}
              wrapLines={true}
              lineProps={() => ({
                "data-code-block-line": "true",
              })}
              useInlineStyles={false}
              PreTag={({ children }) => <>{children}</>}
              codeTagProps={{
                "data-code-block-steps": node.properties.dataLineNumbers,
                "data-file": node.properties.dataFile,
                className: "code-block__code",
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="w-full">{children}</code>
          )}
        </pre>
      </div>
    )
  },
  browsersupport({
    captions,
    className,
    properties,
    experimental,
  }: {
    captions?: string
    className?: string
    properties: string
    experimental: boolean
  }) {
    return (
      <BrowserSupport
        captions={captions?.split(",")}
        className={className}
        properties={properties.split(",")}
        experimental={experimental}
      />
    )
  },
}

export default SlideComponents
