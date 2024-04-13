import "@logseq/libs";

import "./settings";
import { getUser, initApi, search } from "../api";
import { Issue, PullRequest } from "@octokit/graphql-schema";

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

  const page = await logseq.Editor.createPage(
    settings["TargetPage"],
    {},
    { redirect: true }
  );

  const queries = searchQuery.split(",").map((q) => q.trim());

  const mainBlock = await logseq.Editor.insertBlock(page.name, `Queries:`, {
    isPageBlock: true,
  });

  console.log("queries: ", queries);

  for (const query of queries) {
    const user = await getUser(query);

    console.log(user);

    const isOrg = user.type === "Organization";

    const fQuery = `${isOrg ? "org" : "owner"}:${query} is:issue`;

    console.log("query", fQuery);

    const data = await search(fQuery);

    await logseq.Editor.insertBlock(
      mainBlock.uuid,
      `Results for: ${query} - ${data.length} issues`
    );

    for (const item of data) {
      console.log(item.title);

      await insertIssue(item, page);
    }
  }

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

async function insertIssue(item: Issue | PullRequest, page) {
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
    `${["CLOSED", "MERGED"].includes(item.state) ? "DONE" : "TODO"} ${
      item.__typename === "PullRequest" ? "[[pull]]" : ""
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
