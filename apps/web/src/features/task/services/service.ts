import { db } from '@/config/db';
import { eq, getTableColumns } from 'drizzle-orm';
import { task, userTask, user } from '@/db/schema';
import { 
  Task,
  CreateTask,
  UpdateTask,
  UserTask,
  CreateUserTask,
  UpdateUserTask
} from '@/features/task/types/types';

export async function createTask(data: CreateTask) {
  try {
    const result = await db
      .insert(task)
      .values(data)
      .returning();

    return result[0] as Task ?? null;
  } catch (error) {
    console.error("Error creating task.");
    return null;
  }
}

export async function createUserTask(data: CreateUserTask) {
  try {
    const result = await db
      .insert(userTask)
      .values(data)
      .returning({ id: userTask.id });

    return getUserTaskById(result[0].id);
  } catch (error) {
    console.error("Error creating user task.");
    return null;
  }
}

export async function getAllTask() {
  try {
    const rows = await db
      .select()
      .from(task);
    
    return rows as Task[] ?? null;
  } catch (error) {
    console.error("Error fetching tasks.");
    return null;
  }
}

export async function getAllUserTask() {
  try {
    const rows = await db
      .select({
        task: getTableColumns(task),
        user: getTableColumns(user),
        ...getTableColumns(userTask)
      })
      .from(userTask)
      .innerJoin(task, eq(userTask.taskId, task.id))
      .innerJoin(user, eq(userTask.userId, user.id));
    
    return rows as UserTask[] ?? null;
  } catch (error) {
    console.error("Error fetching user tasks.");
    return null;
  }
}

export async function getTaskById(id: number) {
  try {
    const rows = await db
      .select()
      .from(task)
      .where(eq(task.id, id));
    
    return rows[0] as Task ?? null;
  } catch (error) {
    console.error("Error fetching task.");
    return null;
  }
}

export async function getUserTaskById(id: number) {
  try {
    const rows = await db
      .select({
        task: getTableColumns(task),
        user: getTableColumns(user),
        ...getTableColumns(userTask)
      })
      .from(userTask)
      .innerJoin(task, eq(userTask.taskId, task.id))
      .innerJoin(user, eq(userTask.userId, user.id))
      .where(eq(userTask.id, id));
    
    return rows as UserTask[] ?? null;
  } catch (error) {
    console.error("Error fetching user task.");
    return null;
  }
}

export async function getUserTaskByTaskId(id: number) {
  try {
    const rows = await db
      .select({
        task: getTableColumns(task),
        user: getTableColumns(user),
        ...getTableColumns(userTask)
      })
      .from(userTask)
      .innerJoin(task, eq(userTask.taskId, task.id))
      .innerJoin(user, eq(userTask.userId, user.id))
      .where(eq(userTask.taskId, id));
    
    return rows as UserTask[] ?? null;
  } catch (error) {
    console.error("Error fetching user task.");
    return null;
  }
}

export async function getUserTaskByUserId(id: string) {
  try {
    const rows = await db
      .select({
        task: getTableColumns(task),
        user: getTableColumns(user),
        ...getTableColumns(userTask)
      })
      .from(userTask)
      .innerJoin(task, eq(userTask.taskId, task.id))
      .innerJoin(user, eq(userTask.userId, user.id))
      .where(eq(userTask.userId, id));
    
    return rows[0] as UserTask ?? null;
  } catch (error) {
    console.error("Error fetching user task.");
    return null;
  }
}

export async function updateTask(data: UpdateTask, id: number) {
  try {
    const result = await db 
      .update(task)
      .set(data)
      .where(eq(task.id, id))
      .returning();

    return result[0] as Task ?? null;
  } catch (error) {
    console.error("Error updating task.");
    return null
  }
}

export async function deleteTask(id: number) {
  try {
    const result = await db 
      .delete(task)
      .where(eq(task.id, id))

    return "Task successfully deleted.";
  } catch (error) {
    console.error("Error deleting task.");
    return null
  }
}