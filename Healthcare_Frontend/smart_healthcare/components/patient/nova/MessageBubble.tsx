"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/hooks/useNovaChat";
import { User, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6 group`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className={`flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full border transition-all duration-300
          ${isUser 
            ? "bg-zinc-900/80 border-white/5 shadow-inner" 
            : "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          }`}
        >
          {isUser ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-5 h-5 text-cyan-400" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
          <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">
              {isUser ? "You" : "Nova AI"}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[10px] text-zinc-600 font-medium tracking-wide">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`px-5 py-4 rounded-3xl relative
            ${isUser 
              ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-[0_10px_20px_-10px_rgba(6,182,212,0.4)] border border-cyan-400/20" 
              : "bg-zinc-900/90 text-zinc-200 rounded-tl-sm border border-white/5 shadow-2xl"
            }`}
          >
            {/* Markdown Content */}
            <div className={`prose prose-sm sm:prose-base max-w-none leading-relaxed ${isUser ? "prose-invert" : "prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-white prose-a:text-cyan-400 prose-code:text-cyan-300"}`}>
               {/* Make sure we display something if the stream hasn't yielded tokens yet */}
              {!isUser && message.content === "" ? (
                <div className="flex gap-1.5 py-1 px-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <div className="mb-3 last:mb-0 leading-relaxed">{children}</div>,
                    a: ({ node, ...props }) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-400 transition-colors" {...props} />,
                    code: ({ inline, className, children, ...props }: any) => {
                      const isInline = inline !== undefined ? inline : !(/language-(\w+)/.exec(className || ''));
                      return isInline ? (
                        <code className="bg-zinc-950/50 border border-white/5 pl-1.5 pr-1 py-0.5 rounded-md text-cyan-300 text-xs font-mono tracking-tight" {...props}>
                          {children}
                        </code>
                      ) : (
                        <div className="relative group/code mt-2 mb-4">
                          <code className="block bg-zinc-950/80 p-4 rounded-xl text-zinc-300 text-sm font-mono overflow-x-auto border border-white/5 shadow-inner" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-5 border border-white/5 rounded-xl bg-zinc-950/40 shadow-inner">
                        <table className="min-w-full divide-y divide-white/5 text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-zinc-900/50">{children}</thead>,
                    th: ({ children }) => <th className="px-5 py-3.5 text-left font-semibold text-white tracking-wide text-xs uppercase">{children}</th>,
                    td: ({ children }) => <td className="px-5 py-3 whitespace-nowrap text-zinc-300">{children}</td>,
                    ul: ({ children }) => <ul className="space-y-1.5 marker:text-cyan-500">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-1.5 marker:text-cyan-500 font-medium">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold text-cyan-50/90">{children}</strong>,
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
