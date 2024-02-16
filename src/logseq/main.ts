import "@logseq/libs";

import "./settings";
import { initApi, search } from "../api";
import { Issue } from "@octokit/graphql-schema";

// var blockArray;

// function updateSettings() {
//   blockArray = logseq.settings.blockTracker;
// }

// function syncSettings() {
//   logseq.updateSettings({ blockTracker: blockArray });

async function init() {
  // get logseq settings
  const settings = logseq.settings;
  const searchQuery = settings["SearchQuery"];

  console.log("search: ", searchQuery);

  if (!searchQuery) {
    return;
  }

  const data = await search(searchQuery);

  const page = await logseq.Editor.createPage(
    settings["TargetPage"],
    {},
    { redirect: true }
  );

  data.forEach((item) => {
    console.log(item);

    insertIssue(item, page);
  });

  // const mainBlock = await logseq.Editor.insertBlock(
  //   page.name,
  //   `### ${repos.length} repositories`,
  //   { isPageBlock: true }
  // );

  // await logseq.Editor.insertBlock(page.name, `---`, { isPageBlock: true });

  // for (const repo of repos) {
  //   const issues = await getIssues(octokit, orgName, repo.name);

  //   await logseq.Editor.insertBlock(
  //     mainBlock.uuid,
  //     `[[${repo.name}]] - ${issues.length} issues`,
  //     { isPageBlock: true }
  //   );

  //   for (const item of issues) {
  //     insertIssue(item, repo, page);
  //   }
  // }

  await logseq.Editor.insertBlock(page.name, "", { isPageBlock: true });
}

async function insertIssue(item: Issue, page) {
  const formattedUserLogin = item.author.login
    .replace("[", "(")
    .replace("]", ")");

  function formatDate(date: string) {
    const d = date.split("T")[0];
    const t = date.split("T")[1].split("Z")[0].substring(0, 5);

    return `[[${d}]] ${t}`;
  }

  // const orgName = logseq.settings["OranizationName"];
  const orgName = "";

  const block1 = await logseq.Editor.insertBlock(
    page.name,
    `${item.state === "CLOSED" ? "DONE" : "TODO"} ${
      item.pull_request ? "[[pull]]" : ""
    } [[${item.repository.name}]] ${item.title} [[@${formattedUserLogin}]] [${
      item.number
    }](${item.url})`,
    { isPageBlock: true }
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `creator: [[@${formattedUserLogin}]]`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `assignees: ${
      item.assignees.nodes
        .map((assignee) => `[[@${assignee.login}]]`)
        .join(", ") || "-"
    }`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `created: ${formatDate(item.createdAt)}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `updated: ${formatDate(item.updatedAt)}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `labels: ${item.labels.nodes
      .map((label) => `[[${label.name}]]`)
      .join(", ")}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `milestones: ${item.milestone ? `[[${item.milestone.title}]]` : "-"}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `projects: ${
      item.projectItems.nodes
        .map((project) => `[[${project?.project?.title}]]`)
        .join(", ") || "-"
    }`
  );
}

const main = async () => {
  console.log("plugin loaded");
  // logseq.onSettingsChanged(updateSettings);

  logseq.Editor.registerSlashCommand("GithubPlugin: init", async () => {
    await logseq.Editor.deletePage(logseq.settings["TargetPage"]);

    const apiKey = logseq.settings["API Key"];
    initApi(apiKey);

    await init();
  });

  // if (logseq.settings.blockTracker == undefined) {
  // logseq.updateSettings({ blockTracker: [] });
  // console.log(logseq.settings.blockTracker);
  // }
};

logseq.ready(main).catch(console.error);
