import { 
  users, 
  User, 
  InsertUser, 
  blogs, 
  Blog, 
  InsertBlog, 
  editSuggestions, 
  EditSuggestion, 
  InsertEditSuggestion,
  comments,
  Comment,
  InsertComment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog operations
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogs(filter?: { authorId?: number; status?: string }): Promise<Blog[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: number, blog: Partial<Blog>): Promise<Blog | undefined>;
  deleteBlog(id: number): Promise<boolean>;
  
  // Edit suggestion operations
  getEditSuggestion(id: number): Promise<EditSuggestion | undefined>;
  getEditSuggestions(filter?: { blogId?: number; editorId?: number; status?: string }): Promise<EditSuggestion[]>;
  createEditSuggestion(suggestion: InsertEditSuggestion): Promise<EditSuggestion>;
  updateEditSuggestion(id: number, suggestion: Partial<EditSuggestion>): Promise<EditSuggestion | undefined>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getComments(filter?: { blogId?: number; authorId?: number }): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any to bypass the SessionStore type issue
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private editSuggestions: Map<number, EditSuggestion>;
  private comments: Map<number, Comment>;
  private userIdCounter: number;
  private blogIdCounter: number;
  private suggestionIdCounter: number;
  private commentIdCounter: number;
  
  sessionStore: any; // Using any to bypass the SessionStore type issue

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.editSuggestions = new Map();
    this.comments = new Map();
    this.userIdCounter = 1;
    this.blogIdCounter = 1;
    this.suggestionIdCounter = 1;
    this.commentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    // Ensure role has a default value
    const role = insertUser.role || "user";
    const user: User = { 
      ...insertUser, 
      role,
      id, 
      createdAt 
    };
    this.users.set(id, user);
    return user;
  }

  // Blog operations
  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogs(filter?: { authorId?: number; status?: string }): Promise<Blog[]> {
    let blogs = Array.from(this.blogs.values());
    
    if (filter) {
      if (filter.authorId) {
        blogs = blogs.filter(blog => blog.authorId === filter.authorId);
      }
      if (filter.status) {
        blogs = blogs.filter(blog => blog.status === filter.status);
      }
    }
    
    // Sort by createdAt, newest first
    return blogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = this.blogIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    // Ensure status and excerpt have default values
    const status = insertBlog.status || "draft";
    const excerpt = insertBlog.excerpt || null;
    const blog: Blog = { 
      ...insertBlog, 
      status,
      excerpt,
      id, 
      createdAt, 
      updatedAt 
    };
    this.blogs.set(id, blog);
    return blog;
  }

  async updateBlog(id: number, blogUpdate: Partial<Blog>): Promise<Blog | undefined> {
    const blog = this.blogs.get(id);
    if (!blog) return undefined;
    
    const updatedBlog = { 
      ...blog, 
      ...blogUpdate, 
      updatedAt: new Date() 
    };
    
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<boolean> {
    return this.blogs.delete(id);
  }

  // Edit suggestion operations
  async getEditSuggestion(id: number): Promise<EditSuggestion | undefined> {
    return this.editSuggestions.get(id);
  }

  async getEditSuggestions(filter?: { blogId?: number; editorId?: number; status?: string }): Promise<EditSuggestion[]> {
    let suggestions = Array.from(this.editSuggestions.values());
    
    if (filter) {
      if (filter.blogId) {
        suggestions = suggestions.filter(suggestion => suggestion.blogId === filter.blogId);
      }
      if (filter.editorId) {
        suggestions = suggestions.filter(suggestion => suggestion.editorId === filter.editorId);
      }
      if (filter.status) {
        suggestions = suggestions.filter(suggestion => suggestion.status === filter.status);
      }
    }
    
    // Sort by createdAt, newest first
    return suggestions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createEditSuggestion(insertSuggestion: InsertEditSuggestion): Promise<EditSuggestion> {
    const id = this.suggestionIdCounter++;
    const createdAt = new Date();
    // Ensure status and comment have default values
    const status = insertSuggestion.status || "pending";
    const comment = insertSuggestion.comment || null;
    const suggestion: EditSuggestion = { 
      ...insertSuggestion, 
      status,
      comment,
      id, 
      createdAt 
    };
    this.editSuggestions.set(id, suggestion);
    return suggestion;
  }

  async updateEditSuggestion(id: number, suggestionUpdate: Partial<EditSuggestion>): Promise<EditSuggestion | undefined> {
    const suggestion = this.editSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { 
      ...suggestion, 
      ...suggestionUpdate
    };
    
    this.editSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
  
  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getComments(filter?: { blogId?: number; authorId?: number }): Promise<Comment[]> {
    let comments = Array.from(this.comments.values());
    
    if (filter) {
      if (filter.blogId) {
        comments = comments.filter(comment => comment.blogId === filter.blogId);
      }
      if (filter.authorId) {
        comments = comments.filter(comment => comment.authorId === filter.authorId);
      }
    }
    
    // Sort by createdAt, newest first
    return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const comment: Comment = { ...insertComment, id, createdAt, updatedAt };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: number, commentUpdate: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment = { 
      ...comment, 
      ...commentUpdate, 
      updatedAt: new Date() 
    };
    
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
