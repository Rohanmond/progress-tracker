const { execFileSync } = require("node:child_process");

const docsPatterns = [
  /^README\.md$/,
  /^ai\//,
  /^docs\//
];

const rules = [
  {
    name: "Client behavior changed",
    files: [/^client\/src\//],
    docs: [/^ai\/prd\.md$/, /^ai\/architecture\.md$/, /^ai\/project-context\.md$/, /^README\.md$/]
  },
  {
    name: "API behavior changed",
    files: [/^server\/src\/index\.js$/, /^client\/src\/lib\/api\.js$/],
    docs: [/^ai\/api-contract\.md$/, /^ai\/architecture\.md$/, /^README\.md$/]
  },
  {
    name: "Database or seed data changed",
    files: [/^db\//, /^server\/data\//, /^server\/src\/seed\.js$/],
    docs: [/^ai\/data-model\.md$/, /^ai\/architecture\.md$/, /^docs\/superset\.md$/]
  },
  {
    name: "Deployment changed",
    files: [/^railway\.json$/, /^vercel\.json$/, /^server\/\.env\.example$/, /^package\.json$/, /^client\/package\.json$/, /^server\/package\.json$/],
    docs: [/^ai\/deployment\.md$/, /^README\.md$/, /^ai\/ai-working-guide\.md$/]
  }
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function resolveDiffArgs() {
  if (process.env.DOC_CHECK_BASE && process.env.DOC_CHECK_HEAD) {
    return ["diff", "--name-only", `${process.env.DOC_CHECK_BASE}...${process.env.DOC_CHECK_HEAD}`];
  }

  if (process.env.GITHUB_EVENT_NAME === "pull_request" && process.env.GITHUB_BASE_REF) {
    return ["diff", "--name-only", `origin/${process.env.GITHUB_BASE_REF}...HEAD`];
  }

  try {
    git(["rev-parse", "--verify", "HEAD~1"]);
    return ["diff", "--name-only", "HEAD~1...HEAD"];
  } catch (_error) {
    return ["diff", "--name-only", "--cached"];
  }
}

const changedFiles = git(resolveDiffArgs())
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);

if (!changedFiles.length) {
  console.log("No changed files detected for doc check.");
  process.exit(0);
}

const docsChanged = changedFiles.some((file) => docsPatterns.some((pattern) => pattern.test(file)));
const failures = [];

for (const rule of rules) {
  const matchedFiles = changedFiles.filter((file) => rule.files.some((pattern) => pattern.test(file)));
  if (!matchedFiles.length) continue;

  const matchedDocs = changedFiles.filter((file) => rule.docs.some((pattern) => pattern.test(file)));
  if (!matchedDocs.length) {
    failures.push({ rule, matchedFiles });
  }
}

if (!docsChanged && failures.length) {
  console.error("Feature-sensitive files changed without any docs update.");
}

if (failures.length) {
  console.error("\nDocumentation check failed. Update the matching docs or explain why the rule should change.\n");
  for (const failure of failures) {
    console.error(`- ${failure.rule.name}`);
    console.error(`  Changed: ${failure.matchedFiles.join(", ")}`);
    console.error(`  Expected docs: ${failure.rule.docs.map(String).join(", ")}`);
  }
  process.exit(1);
}

console.log("Documentation check passed.");
