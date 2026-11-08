import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Logic Engine: questions bank mirroring the JSON schema:
 * { id, chapter, difficulty, type, question, options, correctAnswer, explanation }
 */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().unique(),
  levelId: integer("level_id").notNull(),
  chapter: text("chapter").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>(),
  correctAnswer: text("correct_answer").notNull(),
  acceptableAnswers: jsonb("acceptable_answers").$type<string[]>(),
  explanation: text("explanation").notNull(),
  hint: text("hint"),
});

/** Anonymous player stats synced from localStorage */
export const playerStats = pgTable("player_stats", {
  userId: text("user_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  unlockedLevels: jsonb("unlocked_levels").$type<number[]>().notNull().default([1]),
  completedLevels: jsonb("completed_levels").$type<number[]>().notNull().default([]),
  totalCorrect: integer("total_correct").notNull().default(0),
  lastActive: text("last_active"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Every level attempt for analytics & leaderboard */
export const levelAttempts = pgTable("level_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  levelId: integer("level_id").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  passed: boolean("passed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QuestionRow = typeof questions.$inferSelect;
export type PlayerStatsRow = typeof playerStats.$inferSelect;
export type LevelAttemptRow = typeof levelAttempts.$inferSelect;
