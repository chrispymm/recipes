const GithubApi = require('@octokit/rest');
const { Octokit } = require("@octokit/core");
const cookie = require("cookie");
const { tokens, getCookie } = require("./util/auth.js");
const { base64encode } = require('nodejs-base64');

exports.handler = async (event, context) => {
  const [owner, repo] = process.env.GITHUB_REPO.split('/');
  console.log(event)
  let authToken;
  let provider;
  
  if(event.headers && event.headers.cookie) {
    let cookies = cookie.parse(event.headers.cookie);
    if(cookies._11ty_oauth_token) {
      authToken = tokens.decode(cookies._11ty_oauth_token);
    }
    if(cookies._11ty_oauth_provider) {
      provider = cookies._11ty_oauth_provider;
    }
  }
  if( authToken ) {

    const github = new Octokit({
        auth: `token ${authToken}`,
        request: {
          timeout: 5000
        }
      });

    const title = event.queryStringParameters.title;
    const metadataTitle = `>> title: ${title} \r\n`;
    const content = base64encode( metadataTitle + event.queryStringParameters.content );
    const path = `recipes/${title.replace(' ', '-')}.cook`

    const response = await github.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: path,
      message: `Add recipe: ${title}`,
      content: content
    });
  
    console.log(response);
    if(response.status < 300) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success" }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Error" }),
      };
    }
  }



}
