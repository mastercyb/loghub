export async function fetchWrapper(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getOrgRepos(org: string) {
  const repos = await fetchWrapper(`https://api.github.com/orgs/${org}/repos`);

  console.log(repos.length);
  return repos;
}

export async function getIssues(name: string) {
  const issues = await fetchWrapper(
    `https://api.github.com/repos/cybercongress/${name}/issues?per_page=20`
  );
  return issues;
}

getOrgRepos("cybercongress");
