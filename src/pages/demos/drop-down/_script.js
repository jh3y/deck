const label = document.querySelector("[popovertarget] span:last-of-type")

const pop = document.querySelector("#pop")

const selectOption = (event) => {
  document.querySelector("[data-selected=true]").dataset.selected = false
  label.innerText = event.target.dataset.value
  event.target.dataset.selected = true
}

const handleSelect = (event) => {
  if (event.newState === "open") pop.addEventListener("click", selectOption)
  else pop.removeEventListener("click", selectOption)
}

pop.addEventListener("beforetoggle", handleSelect)
