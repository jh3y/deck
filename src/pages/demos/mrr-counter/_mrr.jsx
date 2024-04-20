import React from "react"

const config = {
  min: 0,
  max: 20000,
  step: 0.01,
  value: 12010.0,
  pad: true,
  explode: false,
  ease: "basic",
  transition: 2,
  currency: "USD",
  easeOptions: [
    "back",
    "basic",
    "bounce",
    "circ",
    "elastic",
    "expo",
    "power",
    "sine",
  ],
  currencyOptions: ["USD", "GBP", "EUR"],
}

const FORMATTERS = {
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }),
}

const Character = ({ className, passKey, value }) => {
  return (
    <span
      data-value={value}
      className={`character ${className || ""}`}
      style={{ "--v": value }}
    >
      <span className="character__track">
        <span>9</span>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => {
          return <span key={passKey}>{val}</span>
        })}
        <span>0</span>
      </span>
    </span>
  )
}

const Counter = ({ value }) => {
  const padCount =
    config.max.toFixed(2).toString().length - value.toFixed(2).toString().length

  const paddedValue = value
    .toFixed(2)
    .toString()
    .padStart(value.toFixed(2).toString().length + padCount, "1")

  let i = 0
  const renderValue = FORMATTERS.USD.format(paddedValue)
    .split("")
    .map((character) => {
      if (!Number.isNaN(Number.parseInt(character, 10)) && i < padCount) {
        i++
        return "0"
      }
      return character
    })
    .join("")

  return (
    <div className="counter">
      <fieldset>
        <legend>MRR</legend>
        <h2>
          <span className="sr-only">{renderValue}</span>
          <span aria-hidden="true" className="characters">
            {renderValue.split("").map((character, index) => {
              if (Number.isNaN(Number.parseInt(character, 10)))
                return (
                  <span
                    key={`${index}-${character}`}
                    className="character character--symbol"
                  >
                    {character}
                  </span>
                )
              return (
                <React.Fragment key={`${index}-${character}`}>
                  <Character
                    passKey={`${index}-${character}`}
                    value={character}
                    className={
                      index > renderValue.split("").length - 3 ? "fraction" : ""
                    }
                  />
                </React.Fragment>
              )
            })}
          </span>
        </h2>
      </fieldset>
    </div>
  )
}

const App = ({ defaultValue }) => {
  return (
    <>
      <Counter value={Number.parseFloat(defaultValue, 10)} />
      <Counter value={Number.parseFloat(defaultValue, 10)} />
    </>
  )
}
export default App
