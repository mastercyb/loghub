import { Octokit } from "octokit";

export async function getOrgRepos(octokit: Octokit, org: string) {
  const repos = await octokit.request("GET /orgs/{org}/repos", {
    org,
    per_page: 100,
  });

  return repos.data;
}

export async function getIssues(
  octokit: Octokit,
  repoName: string,
  orgName: string
) {
  const data = await octokit.paginate({
    method: "GET",
    url: `/repos/${repoName}/${orgName}/issues`,
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return data;
}
