import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { 
  insertBlogSchema, 
  insertBlogVersionSchema,
  BlogVersion
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getAllBlogs();
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(parseInt(req.params.id));
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const blogData = insertBlogSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });

      const blog = await storage.createBlog(blogData);
      res.status(201).json(blog);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  app.put("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const blogId = parseInt(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // If user is not the author, create a new version instead of direct update
      if (blog.authorId !== req.user.id) {
        const versionData = insertBlogVersionSchema.parse({
          blogId,
          title: req.body.title,
          content: req.body.content,
          excerpt: req.body.excerpt,
          editorId: req.user.id,
          revisionComment: req.body.revisionComment,
        });
        
        const version = await storage.createBlogVersion(versionData);
        return res.status(201).json({ 
          message: "Edit suggestion submitted for approval",
          version 
        });
      }
      
      // If user is the author, update directly
      const updatedBlog = await storage.updateBlog(blogId, req.body);
      res.json(updatedBlog);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update blog" });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const blogId = parseInt(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this blog" });
      }
      
      await storage.deleteBlog(blogId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // Blog version routes
  app.get("/api/blogs/:id/versions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const blogId = parseInt(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view versions" });
      }
      
      const versions = await storage.getBlogVersionsByBlog(blogId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog versions" });
    }
  });

  app.post("/api/blog-versions/:id/approve", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const versionId = parseInt(req.params.id);
      const version = await storage.getBlogVersion(versionId);
      
      if (!version) {
        return res.status(404).json({ message: "Blog version not found" });
      }
      
      const blog = await storage.getBlog(version.blogId);
      
      if (!blog || blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to approve this version" });
      }
      
      const approvedVersion = await storage.approveBlogVersion(versionId);
      res.json(approvedVersion);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve blog version" });
    }
  });

  app.post("/api/blog-versions/:id/reject", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const versionId = parseInt(req.params.id);
      const version = await storage.getBlogVersion(versionId);
      
      if (!version) {
        return res.status(404).json({ message: "Blog version not found" });
      }
      
      const blog = await storage.getBlog(version.blogId);
      
      if (!blog || blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to reject this version" });
      }
      
      const rejectedVersion = await storage.rejectBlogVersion(versionId);
      res.json(rejectedVersion);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject blog version" });
    }
  });

  // My blogs route
  app.get("/api/my-blogs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const blogs = await storage.getBlogsByAuthor(req.user.id);
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  // Pending edits route
  app.get("/api/pending-edits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const pendingVersions = await storage.getPendingBlogVersions(req.user.id);
      
      // Get full context for each version
      const result = await Promise.all(
        pendingVersions.map(async (version) => {
          const editor = await storage.getUser(version.editorId);
          const blog = await storage.getBlog(version.blogId);
          
          return {
            version,
            editorName: editor?.fullName || 'Unknown',
            blogTitle: blog?.title || 'Unknown',
          };
        })
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending edits" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const count = await storage.getUnreadNotificationsCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications count" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
