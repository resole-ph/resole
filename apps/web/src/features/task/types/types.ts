import { task, userTask, user } from '@/db/schema';
import { User } from '@/features/auth/types/types';

export type Task = typeof task.$inferSelect;
export type CreateTask = typeof task.$inferInsert;
export type UpdateTask = Partial<Task>;

type InferUserTask = typeof userTask.$inferSelect;
export type UserTask = Omit<InferUserTask, 'taskId' | 'userId' > & { task: Task, user: User };
export type CreateUserTask = typeof userTask.$inferInsert;
export type UpdateUserTask = Partial<InferUserTask>;