import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blog model
export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Edit suggestion model
export const editSuggestions = pgTable("edit_suggestions", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull().references(() => blogs.id),
  editorId: integer("editor_id").notNull().references(() => users.id),
  originalTitle: text("original_title").notNull(),
  suggestedTitle: text("suggested_title").notNull(),
  originalContent: text("original_content").notNull(),
  suggestedContent: text("suggested_content").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  blogId: integer("blog_id").notNull().references(() => blogs.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertBlogSchema = createInsertSchema(blogs)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertEditSuggestionSchema = createInsertSchema(editSuggestions)
  .omit({ id: true, createdAt: true });

export const insertCommentSchema = createInsertSchema(comments)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type EditSuggestion = typeof editSuggestions.$inferSelect;
export type InsertEditSuggestion = z.infer<typeof insertEditSuggestionSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Extended types for frontend use
export type BlogWithAuthor = Blog & {
  author: User;
};

export type EditSuggestionWithDetails = EditSuggestion & {
  editor: User;
  blog: Blog;
};

export type CommentWithAuthor = Comment & {
  author: User;
};
