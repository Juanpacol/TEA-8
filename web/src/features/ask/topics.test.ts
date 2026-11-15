import { describe, expect, it } from "vitest";
import { askTopics } from "./topics.ts";

describe("askTopics", () => {
  it("groups the questions by topic, in reading order", () => {
    const topics = askTopics({
      driestYear: 2012,
      lastYear: 2023,
      baseline: "2001-2023",
    });
    expect(topics.map((topic) => topic.id)).toEqual([
      "dry",
      "soil",
      "yield",
      "rotation",
    ]);
    expect(topics[0].questions).toEqual([
      "How dry was summer 2012?",
      "How did summer 2023 compare with the 2001-2023 average?",
      "Did the US Drought Monitor also show drought in summer 2012?",
    ]);
  });

  it("keeps the rotation question that the tool must refuse", () => {
    const topics = askTopics({
      driestYear: 2012,
      lastYear: 2023,
      baseline: "2001-2023",
    });
    expect(topics.at(-1)).toEqual({
      id: "rotation",
      questions: ["Which rotation will give me the best yield?"],
    });
  });

  it("drops the topics about a driest summer when the data has none", () => {
    const topics = askTopics({
      driestYear: null,
      lastYear: 2023,
      baseline: "2001-2023",
    });
    expect(topics.map((topic) => topic.id)).toEqual(["dry", "rotation"]);
    expect(topics[0].questions).toEqual([
      "How did summer 2023 compare with the 2001-2023 average?",
    ]);
  });
});
