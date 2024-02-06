export async function fetchWrapper(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getOrgRepos(org: string) {
  const repos = await fetchWrapper(
    `https://api.github.com/orgs/${org}/repos?per_page=100`
  );
  return repos;
}

export async function getIssues(name: string) {
  const issues = await fetchWrapper(
    `https://api.github.com/repos/cybercongress/${name}/issues?state=all`
  );
  return issues;
}
