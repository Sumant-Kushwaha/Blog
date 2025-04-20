import { 
  users, User, InsertUser, blogs, Blog, InsertBlog,
  blogVersions, BlogVersion, InsertBlogVersion,
  notifications, Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser & { verificationToken: string }): Promise<User>;
  verifyUser(id: number): Promise<User>;
  updateUserResetToken(id: number, token: string, expiry: Date): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  
  // Blog operations
  createBlog(blog: InsertBlog): Promise<Blog>;
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogsByAuthor(authorId: number): Promise<Blog[]>;
  getAllBlogs(): Promise<Blog[]>;
  updateBlog(id: number, blog: Partial<Blog>): Promise<Blog>;
  deleteBlog(id: number): Promise<void>;
  
  // BlogVersion operations
  createBlogVersion(version: InsertBlogVersion): Promise<BlogVersion>;
  getBlogVersion(id: number): Promise<BlogVersion | undefined>;
  getBlogVersionsByBlog(blogId: number): Promise<BlogVersion[]>;
  getPendingBlogVersions(authorId: number): Promise<BlogVersion[]>;
  approveBlogVersion(id: number): Promise<BlogVersion>;
  rejectBlogVersion(id: number): Promise<BlogVersion>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private blogVersions: Map<number, BlogVersion>;
  private notifications: Map<number, Notification>;
  private userIdCounter: number;
  private blogIdCounter: number;
  private blogVersionIdCounter: number;
  private notificationIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.blogVersions = new Map();
    this.notifications = new Map();
    this.userIdCounter = 1;
    this.blogIdCounter = 1;
    this.blogVersionIdCounter = 1;
    this.notificationIdCounter = 1;
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token
    );
  }

  async createUser(insertUser: InsertUser & { verificationToken: string }): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      resetToken: null,
      resetTokenExpiry: null
    };
    this.users.set(id, user);
    return user;
  }

  async verifyUser(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    
    const updatedUser: User = {
      ...user,
      isVerified: true,
      verificationToken: null,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserResetToken(id: number, token: string, expiry: Date): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    
    const updatedUser: User = {
      ...user,
      resetToken: token,
      resetTokenExpiry: expiry,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: number, password: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    
    const updatedUser: User = {
      ...user,
      password,
      resetToken: null,
      resetTokenExpiry: null,
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Blog operations
  async createBlog(blog: InsertBlog): Promise<Blog> {
    const id = this.blogIdCounter++;
    const now = new Date();
    const newBlog: Blog = {
      ...blog,
      id,
      publishedAt: now,
      updatedAt: now,
    };
    
    this.blogs.set(id, newBlog);
    return newBlog;
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogsByAuthor(authorId: number): Promise<Blog[]> {
    return Array.from(this.blogs.values()).filter(
      (blog) => blog.authorId === authorId
    );
  }

  async getAllBlogs(): Promise<Blog[]> {
    return Array.from(this.blogs.values());
  }

  async updateBlog(id: number, update: Partial<Blog>): Promise<Blog> {
    const blog = this.blogs.get(id);
    if (!blog) {
      throw new Error(`Blog not found: ${id}`);
    }
    
    const updatedBlog: Blog = {
      ...blog,
      ...update,
      updatedAt: new Date(),
    };
    
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<void> {
    if (!this.blogs.has(id)) {
      throw new Error(`Blog not found: ${id}`);
    }
    
    this.blogs.delete(id);
    
    // Also delete any associated versions
    const versions = await this.getBlogVersionsByBlog(id);
    for (const version of versions) {
      this.blogVersions.delete(version.id);
    }
  }

  // BlogVersion operations
  async createBlogVersion(version: InsertBlogVersion): Promise<BlogVersion> {
    const id = this.blogVersionIdCounter++;
    const now = new Date();
    const newVersion: BlogVersion = {
      ...version,
      id,
      createdAt: now,
      isApproved: false,
      isRejected: false,
    };
    
    this.blogVersions.set(id, newVersion);
    
    // Create notification for the blog author
    const blog = await this.getBlog(version.blogId);
    if (blog && blog.authorId !== version.editorId) {
      const editor = await this.getUser(version.editorId);
      await this.createNotification({
        userId: blog.authorId,
        message: `${editor?.fullName || 'Someone'} suggested edits to your blog "${blog.title}"`,
        type: 'edit_suggestion',
        relatedId: id,
      });
    }
    
    return newVersion;
  }

  async getBlogVersion(id: number): Promise<BlogVersion | undefined> {
    return this.blogVersions.get(id);
  }

  async getBlogVersionsByBlog(blogId: number): Promise<BlogVersion[]> {
    return Array.from(this.blogVersions.values()).filter(
      (version) => version.blogId === blogId
    );
  }

  async getPendingBlogVersions(authorId: number): Promise<BlogVersion[]> {
    // Get all blogs by this author
    const authorBlogs = await this.getBlogsByAuthor(authorId);
    const authorBlogIds = authorBlogs.map(blog => blog.id);
    
    // Find all pending versions for those blogs
    return Array.from(this.blogVersions.values()).filter(
      (version) => 
        authorBlogIds.includes(version.blogId) && 
        !version.isApproved && 
        !version.isRejected
    );
  }

  async approveBlogVersion(id: number): Promise<BlogVersion> {
    const version = this.blogVersions.get(id);
    if (!version) {
      throw new Error(`Blog version not found: ${id}`);
    }
    
    // Update the version
    const updatedVersion: BlogVersion = {
      ...version,
      isApproved: true,
    };
    
    this.blogVersions.set(id, updatedVersion);
    
    // Update the blog with the new version's content
    const blog = await this.getBlog(version.blogId);
    if (blog) {
      await this.updateBlog(blog.id, {
        title: version.title,
        content: version.content,
        excerpt: version.excerpt,
        updatedAt: new Date(),
      });
      
      // Create notification for the editor
      await this.createNotification({
        userId: version.editorId,
        message: `Your suggested edits to "${blog.title}" have been approved`,
        type: 'edit_approved',
        relatedId: blog.id,
      });
    }
    
    return updatedVersion;
  }

  async rejectBlogVersion(id: number): Promise<BlogVersion> {
    const version = this.blogVersions.get(id);
    if (!version) {
      throw new Error(`Blog version not found: ${id}`);
    }
    
    // Update the version
    const updatedVersion: BlogVersion = {
      ...version,
      isRejected: true,
    };
    
    this.blogVersions.set(id, updatedVersion);
    
    // Create notification for the editor
    const blog = await this.getBlog(version.blogId);
    if (blog) {
      await this.createNotification({
        userId: version.editorId,
        message: `Your suggested edits to "${blog.title}" have been rejected`,
        type: 'edit_rejected',
        relatedId: blog.id,
      });
    }
    
    return updatedVersion;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: now,
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // newest first
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification not found: ${id}`);
    }
    
    const updatedNotification: Notification = {
      ...notification,
      isRead: true,
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return (await this.getNotificationsByUser(userId))
      .filter(notification => !notification.isRead)
      .length;
  }
}

export const storage = new MemStorage();
