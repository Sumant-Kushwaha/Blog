import React from "react";
import { Link } from "wouter";
import { PenSquare, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">About</h3>
            <p className="text-base text-gray-600">
              BlogCollab is a collaborative blogging platform where writers can create, share, and improve content together.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-base text-gray-600 hover:text-primary-600">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/blogs">
                  <a className="text-base text-gray-600 hover:text-primary-600">Browse Blogs</a>
                </Link>
              </li>
              <li>
                <Link href="/blog/create">
                  <a className="text-base text-gray-600 hover:text-primary-600">Create New Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-base text-gray-600 hover:text-primary-600">My Dashboard</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Connect</h3>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">&copy; {new Date().getFullYear()} BlogCollab. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy">
              <a className="text-sm text-gray-500 hover:text-primary-600">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-sm text-gray-500 hover:text-primary-600">Terms of Service</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
