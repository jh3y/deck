import React from "react"
import "./_generator.js"

const EASINGS = [
  "none",
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
  "power4.in",
  "power4.out",
  "power4.inOut",
  "back.in",
  "back.out",
  "back.inOut",
  "bounce.in",
  "bounce.out",
  "bounce.inOut",
  "circ.in",
  "circ.out",
  "circ.inOut",
  "elastic.in",
  "elastic.out",
  "elastic.inOut",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "sine.in",
  "sine.out",
  "sine.inOut",
  "steps",
  "flicker",
  "hop",
  "fortune",
  "slow",
]

window.customEases = {}

const buildEases = (accuracy = 0.0025, rounding = 4) => {
  let eases = ""
  for (const EASE of EASINGS) {
    if (EASE === "none") {
      window.customEases[EASE] = generateCustomEase(EASE, accuracy, rounding, 1)
      eases += `--${EASE}: ${window.customEases[EASE].output};`
    } else if (EASE === "steps") {
      window.customEases[EASE] = generateCustomEase(
        "steps(10)",
        accuracy,
        rounding,
        1,
      )
      eases += `--${EASE}: ${window.customEases[EASE].output};`
    } else if (EASE === "hop") {
      window.customEases[EASE] = generateCustomEase(
        "M0,0 C0,0 0.056,0.442 0.175,0.442 0.294,0.442 0.332,0 0.332,0 0.332,0 0.414,1 0.671,1 0.991,1 1,0 1,0",
        accuracy,
        rounding,
        1,
      )
      eases += `--${EASE}: ${window.customEases[EASE].output};`
    } else if (EASE === "fortune") {
      window.customEases[EASE] = generateCustomEase(
        "M0,0 C0.126,0.382 0.142,0.857 0.142,0.857 0.215,0.989 0.818,1.001 1,1",
        accuracy,
        rounding,
        1,
      )
      eases += `--${EASE}: ${window.customEases[EASE].output};`
    } else if (EASE === "slow") {
      window.customEases[EASE] = generateCustomEase(
        "slow(0.5,0.7,false)",
        accuracy,
        rounding,
        1,
      )
      eases += `--${EASE}: ${window.customEases[EASE].output};`
    } else if (EASE === "flicker") {
      const temp = `rough({ template: power1.inOut, strength: 2, points: 50, taper: 'none', randomize: true, clamp: true})`
      window.customEases[EASE] = generateCustomEase(temp, accuracy, rounding, 1)
      eases += `--${EASE.replace(".", "-")}: ${
        window.customEases[EASE].output
      };`
    } else {
      window.customEases[EASE] = generateCustomEase(EASE, accuracy, rounding, 1)
      eases += `--${EASE.replace(".", "-")}: ${
        window.customEases[EASE].output
      };`
    }
  }
  return `:root {${eases}}`
}

const generatePointsString = (easeKey) => {
  let result = ""
  const ease = customEases[easeKey]
  if (ease) {
    for (const point of ease.optimised) result += `${point[0]},${point[1]} `
  }
  return result
}

const Graph = ({ ease }) => {
  const points = generatePointsString(ease)
  return (
    <svg className="graph" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
      <title>{`"${ease}" easing graph`}</title>
      <polyline className="x" points="0,0 0,1" strokeWidth="0.01" />
      <polyline className="y" points="0,0 1,0" strokeWidth="0.01" />
      <polyline
        className="l"
        fill="none"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.02"
        pathLength={1}
      />
      <polyline
        className="s"
        fill="none"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.02"
        pathLength={1}
      />
    </svg>
  )
}

const App = () => {
  const accuracy = 0.0025
  const rounding = 4
  const [customStyles, setCustomStyles] = React.useState("")

  React.useEffect(() => {
    setCustomStyles(buildEases(accuracy, rounding))
  }, [])

  return (
    <>
      <div className="eases">
        <style type="text/css">{customStyles}</style>
        {EASINGS.map((easing) => {
          return (
            <button type="button" className="copy" key={easing}>
              <span className="sr-only">{`Copy "${easing}" easing`}</span>
              <div
                aria-hidden="true"
                className="arena"
                style={{ "--ease": `var(--${easing.replace(".", "-")})` }}
              >
                <div className="box" />
                <Graph ease={easing} />
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

export default App
