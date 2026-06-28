const solvedCache = new Map();

const cacheTtlMs = 10 * 60 * 1000;

async function fetchSolvedSlugs(username) {
  const cached = solvedCache.get(username);
  if (cached && Date.now() - cached.createdAt < cacheTtlMs) {
    return cached.slugs;
  }

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: `https://leetcode.com/${username}/`
    },
    body: JSON.stringify({
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            titleSlug
            timestamp
          }
        }
      `,
      variables: {
        username,
        limit: 2000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`LeetCode verification failed with HTTP ${response.status}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }

  const slugs = new Set((body.data?.recentAcSubmissionList || []).map((item) => item.titleSlug));
  solvedCache.set(username, { createdAt: Date.now(), slugs });
  return slugs;
}

async function verifySolved(question) {
  const username = process.env.LEETCODE_USERNAME;
  if (!username) {
    return {
      ok: false,
      reason: "Set LEETCODE_USERNAME in server/.env to verify solved status from LeetCode."
    };
  }

  if (!question.leetcode_slug) {
    return {
      ok: false,
      reason: "This item is not linked to a LeetCode problem yet, so it cannot be marked solved."
    };
  }

  const solvedSlugs = await fetchSolvedSlugs(username);
  if (!solvedSlugs.has(question.leetcode_slug)) {
    return {
      ok: false,
      reason: `LeetCode user ${username} has no accepted submission for ${question.leetcode_slug} in the public accepted-submissions feed.`
    };
  }

  return { ok: true, username };
}

module.exports = {
  verifySolved
};
