import { Octokit } from "octokit";
import { paginateGraphql } from "@octokit/plugin-paginate-graphql";
import { Issue, SearchResultItemConnection } from "@octokit/graphql-schema";

const MyOctokit = Octokit.plugin(paginateGraphql);

let octokit;

export function initApi(apiKey: string) {
  octokit = new MyOctokit({
    auth: apiKey,
  });
}

export async function search(q: string) {
  const query = `
    query paginate($cursor: String) {
      search(query: "${q}", type: ISSUE, first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ... on Issue {
            __typename
            id
            databaseId
            createdAt
            updatedAt
            number
            title
            state
            url
            author {
              login
            }
            assignees(first: 3) {
              nodes {
                ... on Actor {
                  login
                }
              }
            }
    
            labels(first: 5) {
              nodes {
                ... on Label {
                  name
                }
              }
            }
    
            repository {
              name
              url
            }
    
            milestone {
              title
            }
    
            projectItems(first: 5) {
              nodes {
                id
                project {
                  title
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await octokit.graphql.paginate(query);

  const issues = data.search.nodes as Issue[];

  // console.log(issues.length);

  return issues;
}
