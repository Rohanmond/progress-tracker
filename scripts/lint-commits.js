const { execFileSync } = require("node:child_process");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function resolveRange() {
  if (process.env.COMMITLINT_FROM && process.env.COMMITLINT_TO) {
    return `${process.env.COMMITLINT_FROM}..${process.env.COMMITLINT_TO}`;
  }

  if (process.env.GITHUB_EVENT_NAME === "pull_request" && process.env.GITHUB_BASE_REF) {
    return `origin/${process.env.GITHUB_BASE_REF}..HEAD`;
  }

  try {
    git(["rev-parse", "--verify", "origin/main"]);
    return "origin/main..HEAD";
  } catch (_error) {
    try {
      git(["rev-parse", "--verify", "HEAD~1"]);
      return "HEAD~1..HEAD";
    } catch (_nestedError) {
      return "HEAD";
    }
  }
}

const range = resolveRange();
const commitCount = range.includes("..")
  ? Number(git(["rev-list", "--count", range]))
  : 1;

if (commitCount === 0) {
  console.log("No new commits to lint.");
  process.exit(0);
}

const fromToArgs = range.includes("..")
  ? ["--from", range.split("..")[0], "--to", range.split("..")[1]]
  : ["--from", range, "--to", range];

execFileSync("npx", ["commitlint", ...fromToArgs, "--verbose"], { stdio: "inherit" });
