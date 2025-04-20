import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBlogSchema, insertEditSuggestionSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const { authorId, status } = req.query;
      const filter: { authorId?: number; status?: string } = {};
      
      if (authorId) filter.authorId = Number(authorId);
      if (status) filter.status = status as string;
      
      const blogs = await storage.getBlogs(filter);
      
      // For each blog, fetch the author
      const blogsWithAuthor = await Promise.all(
        blogs.map(async (blog) => {
          const author = await storage.getUser(blog.authorId);
          return {
            ...blog,
            author: author ? {
              id: author.id,
              username: author.username,
              email: author.email,
              role: author.role,
              createdAt: author.createdAt
            } : undefined
          };
        })
      );
      
      res.json(blogsWithAuthor);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blogId = Number(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      const author = await storage.getUser(blog.authorId);
      
      res.json({
        ...blog,
        author: author ? {
          id: author.id,
          username: author.username,
          email: author.email,
          role: author.role,
          createdAt: author.createdAt
        } : undefined
      });
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a blog" });
    }
    
    try {
      const validatedData = insertBlogSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const blog = await storage.createBlog(validatedData);
      res.status(201).json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Failed to create blog" });
      }
    }
  });

  app.put("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update a blog" });
    }
    
    try {
      const blogId = Number(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Check if user is the author
      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this blog" });
      }
      
      const updatedBlog = await storage.updateBlog(blogId, req.body);
      res.json(updatedBlog);
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({ message: "Failed to update blog" });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete a blog" });
    }
    
    try {
      const blogId = Number(req.params.id);
      const blog = await storage.getBlog(blogId);
      
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Check if user is the author
      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this blog" });
      }
      
      await storage.deleteBlog(blogId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // Edit suggestion routes
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { blogId, editorId, status } = req.query;
      const filter: { blogId?: number; editorId?: number; status?: string } = {};
      
      if (blogId) filter.blogId = Number(blogId);
      if (editorId) filter.editorId = Number(editorId);
      if (status) filter.status = status as string;
      
      const suggestions = await storage.getEditSuggestions(filter);
      
      // Fetch additional details for each suggestion
      const suggestionsWithDetails = await Promise.all(
        suggestions.map(async (suggestion) => {
          const editor = await storage.getUser(suggestion.editorId);
          const blog = await storage.getBlog(suggestion.blogId);
          
          return {
            ...suggestion,
            editor: editor ? {
              id: editor.id,
              username: editor.username,
              email: editor.email,
              role: editor.role,
              createdAt: editor.createdAt
            } : undefined,
            blog
          };
        })
      );
      
      res.json(suggestionsWithDetails);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.get("/api/suggestions/:id", async (req, res) => {
    try {
      const suggestionId = Number(req.params.id);
      const suggestion = await storage.getEditSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      const editor = await storage.getUser(suggestion.editorId);
      const blog = await storage.getBlog(suggestion.blogId);
      
      res.json({
        ...suggestion,
        editor: editor ? {
          id: editor.id,
          username: editor.username,
          email: editor.email,
          role: editor.role,
          createdAt: editor.createdAt
        } : undefined,
        blog
      });
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      res.status(500).json({ message: "Failed to fetch suggestion" });
    }
  });

  app.post("/api/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a suggestion" });
    }
    
    try {
      const validatedData = insertEditSuggestionSchema.parse({
        ...req.body,
        editorId: req.user.id
      });
      
      // Ensure blog exists
      const blog = await storage.getBlog(validatedData.blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      const suggestion = await storage.createEditSuggestion(validatedData);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating suggestion:", error);
        res.status(500).json({ message: "Failed to create suggestion" });
      }
    }
  });

  app.put("/api/suggestions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update a suggestion" });
    }
    
    try {
      const suggestionId = Number(req.params.id);
      const suggestion = await storage.getEditSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      // Get the blog
      const blog = await storage.getBlog(suggestion.blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Check if user is the blog author
      if (blog.authorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this suggestion" });
      }
      
      // If accepting the suggestion, update the blog content
      if (req.body.status === "accepted") {
        await storage.updateBlog(blog.id, {
          title: suggestion.suggestedTitle,
          content: suggestion.suggestedContent
        });
      }
      
      const updatedSuggestion = await storage.updateEditSuggestion(suggestionId, req.body);
      res.json(updatedSuggestion);
    } catch (error) {
      console.error("Error updating suggestion:", error);
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });

  // Comment routes
  app.get("/api/comments", async (req, res) => {
    try {
      const { blogId, authorId } = req.query;
      const filter: { blogId?: number; authorId?: number } = {};
      
      if (blogId) filter.blogId = Number(blogId);
      if (authorId) filter.authorId = Number(authorId);
      
      const comments = await storage.getComments(filter);
      
      // Fetch author details for each comment
      const commentsWithAuthor = await Promise.all(
        comments.map(async (comment) => {
          const author = await storage.getUser(comment.authorId);
          return {
            ...comment,
            author: author ? {
              id: author.id,
              username: author.username,
              email: author.email,
              role: author.role,
              createdAt: author.createdAt
            } : undefined
          };
        })
      );
      
      res.json(commentsWithAuthor);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  app.get("/api/comments/:id", async (req, res) => {
    try {
      const commentId = Number(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      const author = await storage.getUser(comment.authorId);
      
      res.json({
        ...comment,
        author: author ? {
          id: author.id,
          username: author.username,
          email: author.email,
          role: author.role,
          createdAt: author.createdAt
        } : undefined
      });
    } catch (error) {
      console.error("Error fetching comment:", error);
      res.status(500).json({ message: "Failed to fetch comment" });
    }
  });
  
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a comment" });
    }
    
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      // Ensure blog exists
      const blog = await storage.getBlog(validatedData.blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Only allow comments on published blogs
      if (blog.status !== "published") {
        return res.status(403).json({ message: "Cannot comment on unpublished blogs" });
      }
      
      const comment = await storage.createComment(validatedData);
      
      // Include author details in the response
      const author = await storage.getUser(req.user.id);
      const commentWithAuthor = {
        ...comment,
        author: author ? {
          id: author.id,
          username: author.username,
          email: author.email,
          role: author.role,
          createdAt: author.createdAt
        } : undefined
      };
      
      res.status(201).json(commentWithAuthor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });
  
  app.put("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update a comment" });
    }
    
    try {
      const commentId = Number(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user is the comment author
      if (comment.authorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this comment" });
      }
      
      const updatedComment = await storage.updateComment(commentId, req.body);
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });
  
  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete a comment" });
    }
    
    try {
      const commentId = Number(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user is the comment author or blog owner
      const isBlogOwner = async () => {
        const blog = await storage.getBlog(comment.blogId);
        return blog?.authorId === req.user.id;
      };
      
      if (comment.authorId !== req.user.id && !(await isBlogOwner())) {
        return res.status(403).json({ 
          message: "You don't have permission to delete this comment" 
        });
      }
      
      await storage.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
