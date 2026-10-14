import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { programs } from "@/data/programs";
import { businessAdministrationProgram } from "@/data/program-details";
import {
  tourismProgram,
  informationTechnologyProgram,
  englishLanguageProgram,
  chineseLanguageProgram,
} from "@/data/supplemental-program-details";

const detailsMap = {
  ba: businessAdministrationProgram,
  tourism: tourismProgram,
  it: informationTechnologyProgram,
  english: englishLanguageProgram,
  chinese: chineseLanguageProgram,
};

function main() {
  const dbPath =
    process.env.TOPICA_DB_PATH ||
    path.join(process.env.TOPICA_DATA_DIR || path.join(process.cwd(), "data"), "topica.db");

  const db = new DatabaseSync(dbPath);

  console.log("Seeding full academic content for 5 programs into:", dbPath);

  for (const prog of programs) {
    const detail = detailsMap[prog.id];
    if (!detail) continue;

    const careersJson = JSON.stringify(detail.careers || []);
    const curriculumJson = JSON.stringify(detail.curriculum || []);
    const semestersJson = JSON.stringify(detail.semesters || []);
    const outcomesJson = JSON.stringify(detail.outcomes || []);
    const confirmationsJson = JSON.stringify(detail.confirmations || []);
    const durationCreditsJson = JSON.stringify({
      credits: 126,
      semesters: 9,
      estimatedMonths: 36,
      tracks: prog.targetAudiences.map((t) => ({
        audience: t.audienceName,
        credits: t.estimatedCredits,
        duration: `${t.durationYears} năm (${t.durationSemesters} học kỳ)`,
      })),
    });

    // 1. Update programs table
    db.prepare(
      `
      UPDATE programs SET
        summary = ?,
        marketing_label = ?,
        hero_label = ?,
        group_id = ?,
        icon = ?,
        image = ?,
        careers = ?,
        curriculum = ?,
        semesters = ?,
        outcomes = ?,
        admissions = ?,
        graduation = ?,
        further_study = ?,
        confirmations = ?,
        duration_credits = ?,
        updated_at = ?
      WHERE id = ?
    `,
    ).run(
      detail.summary || "",
      detail.marketingLabel || "",
      detail.heroLabel || "",
      prog.group,
      prog.icon,
      prog.image,
      careersJson,
      curriculumJson,
      semestersJson,
      outcomesJson,
      detail.admissions || null,
      detail.graduation || null,
      detail.furtherStudy || null,
      confirmationsJson,
      durationCreditsJson,
      new Date().toISOString(),
      prog.id,
    );

    // 2. Update latest revision payload in content_revisions so CMS loads it immediately
    const existingRevision = db
      .prepare(
        `SELECT id, payload FROM content_revisions WHERE entity_type = 'program' AND entity_id = ? ORDER BY version DESC LIMIT 1`,
      )
      .get(prog.id) as { id: number; payload: string } | undefined;

    if (existingRevision) {
      let payloadObj: any = {};
      try {
        payloadObj = JSON.parse(existingRevision.payload);
      } catch {}

      const updatedPayload = {
        ...payloadObj,
        summary: detail.summary || "",
        marketing_label: detail.marketingLabel || "",
        hero_label: detail.heroLabel || "",
        group: prog.group,
        icon: prog.icon,
        image: prog.image,
        careers: detail.careers || [],
        curriculum: detail.curriculum || [],
        semesters: detail.semesters || [],
        outcomes: detail.outcomes || [],
        admissions: detail.admissions || "",
        graduation: detail.graduation || "",
        further_study: detail.furtherStudy || "",
        confirmations: detail.confirmations || [],
        duration_credits: durationCreditsJson,
      };

      db.prepare(
        `UPDATE content_revisions SET payload = ?, updated_at = ? WHERE id = ?`,
      ).run(JSON.stringify(updatedPayload), new Date().toISOString(), existingRevision.id);
      console.log(`✓ Updated program '${prog.id}' and revision #${existingRevision.id}`);
    } else {
      console.log(`✓ Updated program '${prog.id}' table row`);
    }
  }

  console.log("Seeding complete!");
}

main();
