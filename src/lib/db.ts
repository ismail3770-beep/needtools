/**
 * Database Client for NeedTools
 * Powered by Appwrite Web SDK (Client-side)
 */

import { databases, ID_GEN } from "./appwrite";
import { Query } from "appwrite";

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
}

export interface ToolFeedback {
  id?: string;
  toolSlug: string;
  isHelpful: boolean;
  comment?: string;
  createdAt?: string;
}

export interface ToolStat {
  toolSlug: string;
  usageCount: number;
  lastUsedAt: string;
}

// In-memory fallback if Appwrite is not configured yet
const memoryContacts: ContactSubmission[] = [];
const memoryFeedback: ToolFeedback[] = [];
const memoryStats: Record<string, ToolStat> = {};

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "replace-with-db-id";
const CONTACT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COL_ID || "replace-with-contact-col-id";
const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACK_COL_ID || "replace-with-feedback-col-id";
const STATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_STATS_COL_ID || "replace-with-stats-col-id";

/**
 * Save contact submission into Appwrite
 */
export async function saveContactSubmission(data: ContactSubmission) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...payload } = data;
  const record = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await databases.createDocument(
      DB_ID,
      CONTACT_COLLECTION_ID,
      ID_GEN.unique(),
      record
    );
    return res;
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Appwrite Insert Contact Error:", err);
    memoryContacts.push(record);
    return record;
  }
}

/**
 * Save tool feedback into Appwrite
 */
export async function saveToolFeedback(data: ToolFeedback) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...payload } = data;
  const record = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await databases.createDocument(
      DB_ID,
      FEEDBACK_COLLECTION_ID,
      ID_GEN.unique(),
      record
    );
    return res;
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Appwrite Insert Feedback Error:", err);
    memoryFeedback.push(record);
    return record;
  }
}

/**
 * Increment tool usage counter in Appwrite
 */
export async function recordToolUsage(toolSlug: string) {
  try {
    // 1. Try to find existing stats document for this tool
    const response = await databases.listDocuments(DB_ID, STATS_COLLECTION_ID, [
      Query.equal("toolSlug", toolSlug)
    ]);

    if (response.documents.length > 0) {
      // 2. If exists, increment usage count
      const doc = response.documents[0];
      await databases.updateDocument(DB_ID, STATS_COLLECTION_ID, doc.$id, {
        usageCount: doc.usageCount + 1,
        lastUsedAt: new Date().toISOString()
      });
      return { success: true, toolSlug };
    } else {
      // 3. If not exists, create new stats document
      await databases.createDocument(DB_ID, STATS_COLLECTION_ID, ID_GEN.unique(), {
        toolSlug,
        usageCount: 1,
        lastUsedAt: new Date().toISOString()
      });
      return { success: true, toolSlug };
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Appwrite Record Usage Error:", err);
    // Fallback to memory
    if (!memoryStats[toolSlug]) {
      memoryStats[toolSlug] = { toolSlug, usageCount: 1, lastUsedAt: new Date().toISOString() };
    } else {
      memoryStats[toolSlug].usageCount++;
      memoryStats[toolSlug].lastUsedAt = new Date().toISOString();
    }
    return { success: true, toolSlug, mode: "offline" };
  }
}

// ─────────────────────────────────────────────────────────────
// Pinned Tools & User Tasks (Authenticated users only)
// ─────────────────────────────────────────────────────────────

const PINNED_TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PINNED_TOOLS_COL_ID || "pinned_tools";
const USER_TASKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_TASKS_COL_ID || "user_tasks";

export interface PinnedTool {
  userId: string;
  toolSlug: string;
  pinnedAt: string;
}

export interface UserTask {
  userId: string;
  toolSlug: string;
  fileName: string;
  fileSize?: number;
  outputFileId?: string;
  status: "completed" | "expired";
  createdAt: string;
  expiresAt: string;
}

// ─── Pinned Tools ───────────────────────────────────────────

export async function getPinnedTools(userId: string): Promise<PinnedTool[]> {
  try {
    const res = await databases.listDocuments(DB_ID, PINNED_TOOLS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderDesc("pinnedAt"),
      Query.limit(50),
    ]);
    return res.documents.map((d) => ({
      userId: d.userId,
      toolSlug: d.toolSlug,
      pinnedAt: d.pinnedAt,
    }));
  } catch {
    return [];
  }
}

export async function savePinnedTool(userId: string, toolSlug: string) {
  try {
    return await databases.createDocument(DB_ID, PINNED_TOOLS_COLLECTION_ID, ID_GEN.unique(), {
      userId,
      toolSlug,
      pinnedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Pin tool error:", err);
    return null;
  }
}

export async function removePinnedTool(userId: string, toolSlug: string) {
  try {
    const res = await databases.listDocuments(DB_ID, PINNED_TOOLS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("toolSlug", toolSlug),
    ]);
    if (res.documents.length > 0) {
      await databases.deleteDocument(DB_ID, PINNED_TOOLS_COLLECTION_ID, res.documents[0].$id);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Unpin tool error:", err);
  }
}

// ─── User Tasks (Processing History) ────────────────────────

export async function getUserTasks(userId: string): Promise<UserTask[]> {
  try {
    const res = await databases.listDocuments(DB_ID, USER_TASKS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderDesc("createdAt"),
      Query.limit(50),
    ]);
    return res.documents.map((d) => ({
      userId: d.userId,
      toolSlug: d.toolSlug,
      fileName: d.fileName,
      fileSize: d.fileSize,
      outputFileId: d.outputFileId,
      status: d.status,
      createdAt: d.createdAt,
      expiresAt: d.expiresAt,
    }));
  } catch {
    return [];
  }
}

export async function saveUserTask(task: Omit<UserTask, "status" | "expiresAt">) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 min
  try {
    return await databases.createDocument(DB_ID, USER_TASKS_COLLECTION_ID, ID_GEN.unique(), {
      ...task,
      status: "completed",
      expiresAt,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Save task error:", err);
    return null;
  }
}

