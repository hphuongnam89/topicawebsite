import { getProgramDetail } from "@/data/program-details";

const expectedCourseCounts: Record<string, number> = {
  "quan-tri-kinh-doanh-marketing": 59,
  "cong-nghe-thong-tin": 53,
  "quan-tri-dich-vu-du-lich-va-lu-hanh": 57,
  "ngon-ngu-anh": 62,
  "ngon-ngu-trung-quoc": 54,
};

const slugs = Object.keys(expectedCourseCounts) as Array<keyof typeof expectedCourseCounts>;

for (const slug of slugs) {
  const program = getProgramDetail(slug);
  if (!program) throw new Error(`Missing program: ${slug}`);

  const credits = program.semesters.reduce((sum, semester) => sum + semester.credits, 0);
  const courses = program.curriculum.flatMap((group) => group.courses);
  const duplicateCodes = [...new Set(courses.map((course) => course.code))].filter(
    (code) => courses.filter((course) => course.code === code).length > 1,
  );
  const knownCodes = new Set(courses.map((course) => course.code));
  const missingPrerequisites = courses
    .filter((course) => course.prerequisite && !knownCodes.has(course.prerequisite))
    .map((course) => `${course.code} -> ${course.prerequisite}`);
  const totalCoursesFact = program.facts.find((fact) => fact.label === "Tổng học phần");
  const actualCourseCount = Number.parseInt(totalCoursesFact?.value ?? "", 10);

  if (actualCourseCount !== expectedCourseCounts[slug] || totalCoursesFact?.needsVerification) {
    throw new Error(`${program.code}: DOCX course count is not verified`);
  }

  if (program.semesters.length !== 9 || credits !== 126) {
    throw new Error(`${program.code}: expected 9 semesters and 126 credits`);
  }

  console.log(
    JSON.stringify({
      slug,
      code: program.code,
      semesters: program.semesters.length,
      credits,
      listedCourses: courses.length,
      uniqueCodes: new Set(courses.map((course) => course.code)).size,
      duplicateCodes,
      missingPrerequisites,
      outcomes: program.outcomes.length,
      courseCount: actualCourseCount,
      courseCountNeedsVerification: totalCoursesFact?.needsVerification === true,
    }),
  );
}
