export const MigrationStage = {
  Database: 'database',
  Legacy: 'legacy',
  Done: 'done',
} as const;

export type MigrationStage = (typeof MigrationStage)[keyof typeof MigrationStage];
