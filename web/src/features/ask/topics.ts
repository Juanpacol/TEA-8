export type TopicId = "dry" | "soil" | "yield" | "rotation";

export type Topic = { id: TopicId; questions: string[] };

/**
 * The example questions, grouped by topic so a visitor can walk from a subject to a question.
 * Every question is about figures the question service holds (summer weather, drought checks, county yields).
 * The rotation question is on purpose one the tool must refuse: it asks for a best option.
 */
export function askTopics({
  driestYear,
  lastYear,
  baseline,
}: {
  driestYear: number | null;
  lastYear: number;
  baseline: string;
}): Topic[] {
  const topics: Topic[] = [
    {
      id: "dry",
      questions: [
        ...(driestYear !== null ? [`How dry was summer ${driestYear}?`] : []),
        `How did summer ${lastYear} compare with the ${baseline} average?`,
        ...(driestYear !== null
          ? [
              `Did the US Drought Monitor also show drought in summer ${driestYear}?`,
            ]
          : []),
      ],
    },
    {
      id: "soil",
      questions:
        driestYear !== null
          ? [`How wet was the soil in summer ${driestYear}?`]
          : [],
    },
    {
      id: "yield",
      questions:
        driestYear !== null
          ? [
              `How much did corn yield change in ${driestYear} against the usual?`,
            ]
          : [],
    },
    {
      id: "rotation",
      questions: ["Which rotation will give me the best yield?"],
    },
  ];
  return topics.filter((topic) => topic.questions.length > 0);
}
