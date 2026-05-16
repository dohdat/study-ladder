import type { RunResult } from "../types/study";

const MAX_FAILED_TESTS_IN_STATUS = 3;

export function getFailedTestsSummary(failedResults: RunResult[]) {
  if (failedResults.length === 0) {
    return "Tests failed, but the runner did not return failed test details.";
  }
  const shown = failedResults.slice(0, MAX_FAILED_TESTS_IN_STATUS).map((result) => {
    return `${result.name}: expected ${result.expected}, got ${result.actual}`;
  });
  const remaining = failedResults.length - shown.length;
  if (remaining > 0) {
    shown.push(`${remaining} more failed`);
  }
  return `Failed ${failedResults.length} test(s): ${shown.join("; ")}`;
}
