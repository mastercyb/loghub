import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

const settings: SettingSchemaDesc[] = [
  {
    key: "API Key",
    type: "string",
    title: "Enter github personal access token",
    description: "Enter your personal access token here",
    default: "user:sawhney17",
  },
  {
    key: "SearchQuery",
    type: "string",
    title: "Enter github search query",
    description: "Enter your desired search query here",
    default: "user:sawhney17",
  },
  {
    key: "TargetPage",
    type: "string",
    title: "Enter target page",
    description:
      "Enter your desired page, to where the blocks will be inserted",
    default: "Github Issues",
  },
  {
    key: "Block1InsertionTemplate",
    type: "string",
    title: "Insertion template for block 1",
    description:
      "Enter your desired template for the parent block, created by default for every return value of the query ",
    default: "TODO [Title](URL)",
  },
  {
    key: "Block2InsertionTemplate",
    type: "string",
    title: "Insertion template for block 2",
    description:
      "Enter your desired template for the child block, created by default for every return value of the query ",
    default: "{Body}",
  },
];

logseq.useSettingsSchema(settings);
