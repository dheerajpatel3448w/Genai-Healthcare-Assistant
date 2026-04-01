"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/hooks/useDoctorChat";

interface DoctorMessageBubbleProps {
  message: ChatMessage;
}

export function DoctorMessageBubble({ message }: DoctorMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className={`flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full border shadow-sm
          ${isUser 
            ? "bg-zinc-800 border-zinc-700" 
            : "bg-teal-500/10 border-teal-500/30"
          }`}
        >
          {isUser ? <span className="text-zinc-400 text-sm font-medium">Dr</span> : <span className="text-teal-400 text-xl font-serif">A</span>}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
          <div className={`flex items-center gap-2 mb-1 px-1`}>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
              {isUser ? "You" : "Doctor AI"}
            </span>
            <span className="text-[10px] text-zinc-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`px-5 py-3.5 rounded-2xl relative group
            ${isUser 
              ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-zinc-700 shadow-md" 
              : "bg-zinc-900/80 text-zinc-300 rounded-tl-sm border border-teal-500/20 shadow-lg"
            }`}
          >
            <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : "prose-invert prose-teal"}`}>
              {!isUser && message.content === "" ? (
                <span className="animate-pulse inline-block w-2 h-4 bg-teal-500/50 align-middle"/>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2" {...props} />,
                    code: ({ inline, className, children, ...props }: any) => {
                      return inline ? (
                        <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-teal-300 text-xs font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-zinc-950 p-3 rounded-lg text-zinc-300 text-sm font-mono overflow-x-auto border border-zinc-800" {...props}>
                          {children}
                        </code>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 border border-zinc-800 rounded-lg">
                        <table className="min-w-full divide-y divide-zinc-800 text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-zinc-900">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-zinc-200">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{children}</td>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
