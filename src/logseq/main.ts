import "@logseq/libs";

import "./settings";
import { getIssues, getOrgRepos } from "../api";
import { Octokit } from "octokit";

// var blockArray;

// function updateSettings() {
//   blockArray = logseq.settings.blockTracker;
// }

// function syncSettings() {
//   logseq.updateSettings({ blockTracker: blockArray });

async function init(octokit) {
  // get logseq settings
  const settings = logseq.settings;
  const orgName = settings["OranizationName"];

  if (!orgName) {
    return;
  }

  const repos = await getOrgRepos(octokit, orgName);

  const page = await logseq.Editor.createPage(
    settings["TargetPage"],
    {},
    { redirect: true }
  );

  const mainBlock = await logseq.Editor.insertBlock(
    page.name,
    `### ${repos.length} repositories`,
    { isPageBlock: true }
  );

  await logseq.Editor.insertBlock(page.name, `---`, { isPageBlock: true });

  for (const repo of repos) {
    const issues = await getIssues(octokit, orgName, repo.name);

    await logseq.Editor.insertBlock(
      mainBlock.uuid,
      `[[${repo.name}]] - ${issues.length} issues`,
      { isPageBlock: true }
    );

    for (const item of issues) {
      insertIssue(item, repo, page);
    }
  }

  await logseq.Editor.insertBlock(page.name, "", { isPageBlock: true });
}

async function insertIssue(item, repo, page) {
  const formattedUserLogin = item.user.login
    .replace("[", "(")
    .replace("]", ")");

  function formatDate(date: string) {
    const d = date.split("T")[0];
    const t = date.split("T")[1].split("Z")[0].substring(0, 5);

    return `[[${d}]] ${t}`;
  }

  const orgName = logseq.settings["OranizationName"];

  const block1 = await logseq.Editor.insertBlock(
    page.name,
    `${item.state === "closed" ? "DONE" : "TODO"} ${
      item.pull_request ? "[[pull]]" : ""
    } [[${orgName}]]/[[${repo.name}]] ${
      item.title
    } [[@${formattedUserLogin}]] [${item.number}](${item.html_url})`,
    { isPageBlock: true }
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `creator: [[@${formattedUserLogin}]]`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `assignee: ${item.assignee ? `[[@${item.assignee.login}]]` : "-"}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `created: ${formatDate(item.created_at)}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `updated: ${formatDate(item.updated_at)}`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `labels: ${
      item.labels.map((label) => `[[${label.name}]]`).join(", ") || "-"
    }`
  );

  await logseq.Editor.insertBlock(
    block1.uuid,
    `milestones: ${item.milestone ? `[[${item.milestone.title}]]` : "-"}`
  );

  //   await logseq.Editor.insertBlock(
  //     block1.uuid,
  //     `
  // projects: TODO
  //     `,
  //   );
}

const main = async () => {
  console.log("plugin loaded");
  // logseq.onSettingsChanged(updateSettings);

  logseq.Editor.registerSlashCommand("GithubPlugin: init", async () => {
    await logseq.Editor.deletePage(logseq.settings["TargetPage"]);

    const octokit = new Octokit({
      auth: logseq.settings["API Key"],
    });

    await init(octokit);
  });

  // if (logseq.settings.blockTracker == undefined) {
  // logseq.updateSettings({ blockTracker: [] });
  // console.log(logseq.settings.blockTracker);
  // }
};

logseq.ready(main).catch(console.error);
