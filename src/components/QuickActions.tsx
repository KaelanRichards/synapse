"use client";

import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

export default function QuickActions() {
  const actions = [
    {
      name: "Create Note",
      description: "Start a new note in your knowledge base",
      href: "/notes/new",
      icon: PlusIcon,
      color: "bg-green-500",
    },
    {
      name: "Recent Notes",
      description: "View and edit your recent notes",
      href: "/notes/recent",
      icon: ClockIcon,
      color: "bg-blue-500",
    },
    {
      name: "Search",
      description: "Search through your knowledge base",
      href: "/search",
      icon: MagnifyingGlassIcon,
      color: "bg-purple-500",
    },
    {
      name: "Explore Graph",
      description: "Visualize and explore note connections",
      href: "/explore",
      icon: ShareIcon,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="relative group rounded-lg border border-gray-200 p-6 hover:border-gray-400 transition-all duration-200"
          >
            <div>
              <span
                className={`inline-flex p-3 rounded-lg ${action.color} text-white ring-4 ring-white`}
              >
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {action.name}
                <span className="absolute inset-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
