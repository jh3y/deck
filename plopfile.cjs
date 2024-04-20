const fs = require("fs");

// Base choices on directories under "templates" directory
const choices = fs.readdirSync(`${__dirname}/templates`);

const PLOPPER = (plop) => {
  plop.setGenerator("new deck demo", {
    description: "basic HTML, CSS, and JavaScript",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Name your demo",
      },
      {
        type: "list",
        name: "template",
        message: "Choose your template",
        choices,
        default: "standard",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: "src/pages/demos/{{name}}/",
        base: "templates/{{template}}/",
        transform: (template, data) => template.replace("DemoTitle", data.name),
        templateFiles: [
          "templates/{{template}}/index.*",
          "templates/{{template}}/_script.*",
          "templates/{{template}}/_style.*",
        ],
      },
    ],
  });
};

module.exports = PLOPPER;
