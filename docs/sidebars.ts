import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    "installation",
    {
      type: "category",
      label: "Generators",
      items: [
        "generators/init",
        "generators/model",
        "generators/actions",
        "generators/scaffold",
        "generators/resource",
        "generators/api",
      ],
    },
    "field-types",
    "cli-reference",
    "examples",
  ],
};

export default sidebars;
