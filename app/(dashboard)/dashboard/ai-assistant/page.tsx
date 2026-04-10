"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Brain,
  Send,
  Plus,
  Loader2,
  Copy,
  Check,
  Trash2,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BookmarkPlus,
  Bookmark,
} from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const SUGGESTED_PROMPTS = [
  "What is the 2024 Section 179 deduction limit and how does bonus depreciation work?",
  "Explain the differences between S-Corp and C-Corp taxation for a small business owner",
  "What are the key GAAP revenue recognition principles under ASC 606?",
  "How should I handle crypto transactions on a client's tax return?",
  "What are the BOI reporting requirements under FinCEN for 2024?",
  "Explain the Qualified Business Income (QBI) deduction limitations",
];

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    .replace(/^\| (.*) \|$/gm, (_match: string, row: string) => {
      const cells = row.split("|").filter((c: string) => c.trim());
      return `<table><tr>${cells.map((c: string) => `<th>${c.trim()}</th>`).join("")}</tr></table>`;
    })
    .replace(/^- (.*?)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hup])/gm, "")
    .trim();
}

function AIAssistantContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chat");

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Saved prompts
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveContent, setSaveContent] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadChats();
    loadSavedPrompts();
  }, []);

  useEffect(() => {
    if (initialChatId) {
      loadChat(initialChatId);
    }
  }, [initialChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChats() {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch {
      setChats([]);
    }
  }

  async function loadSavedPrompts() {
    try {
      const res = await fetch("/api/saved-prompts");
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts(Array.isArray(data) ? data : []);
      }
    } catch {
      setSavedPrompts([]);
    }
  }

  async function loadChat(chatId: string) {
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      const chat = await res.json();
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error("Failed to load chat", error);
    }
  }

  function newChat() {
    setCurrentChat(null);
    setMessages([]);
    setInput("");
  }

  async function deleteChat(chatId: string) {
    await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (currentChat?.id === chatId) {
      newChat();
    }
  }

  async function savePrompt() {
    if (!saveTitle.trim() || !saveContent.trim()) return;
    setSavingPrompt(true);
    try {
      const res = await fetch("/api/saved-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: saveTitle.trim(), content: saveContent.trim() }),
      });
      if (res.ok) {
        const prompt = await res.json();
        setSavedPrompts((prev) => [prompt, ...prev]);
        setShowSaveDialog(false);
        setSaveTitle("");
        setSaveContent("");
      }
    } finally {
      setSavingPrompt(false);
    }
  }

  async function deletePrompt(id: string) {
    await fetch(`/api/saved-prompts/${id}`, { method: "DELETE" });
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  function openSaveDialog(prefill?: string) {
    setSaveContent(prefill || input);
    setSaveTitle("");
    setShowSaveDialog(true);
  }

  async function sendMessage(content?: string) {
    const text = content || input.trim();
    if (!text || streaming) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          chatId: currentChat?.id,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${err.error || "Something went wrong"}`,
          };
          return updated;
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      let fullText = "";
      let chatId = currentChat?.id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullText,
                  };
                  return updated;
                });
              }
              if (data.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: `⚠️ ${data.error}`,
                  };
                  return updated;
                });
              }
              if (data.chatId) {
                chatId = data.chatId;
              }
              if (data.done && chatId) {
                // Update current chat and refresh list
                await loadChat(chatId);
                await loadChats();
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Connection error. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function copyMessage(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(content);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Chat History + Saved Prompts Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm text-gray-700">Chat History</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openSaveDialog()}
              className="h-7 px-2 text-xs"
              title="Save a prompt"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={newChat}
              className="h-7 px-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 px-3">
                Your chat history will appear here
              </p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-start justify-between gap-1 p-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                    currentChat?.id === chat.id && "bg-forest-50"
                  )}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "text-xs font-medium truncate",
                        currentChat?.id === chat.id
                          ? "text-forest-700"
                          : "text-gray-700"
                      )}
                    >
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeDate(chat.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Saved Prompts section */}
          {savedPrompts.length > 0 && (
            <div className="px-2 pb-4">
              <div className="border-t border-gray-100 pt-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2 flex items-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  Saved Prompts
                </p>
                <div className="space-y-1">
                  {savedPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="group flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setInput(prompt.content)}
                    >
                      <span className="text-xs text-gray-600 truncate flex-1">{prompt.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePrompt(prompt.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-transform",
                sidebarOpen && "rotate-180"
              )}
            />
          </button>
          <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">
              CPA Loft AI Assistant
            </h1>
            <p className="text-xs text-gray-400">
              Expert CPA knowledge · Tax · GAAP · Audit
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="success" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Online
            </Badge>
            <Button variant="ghost" size="sm" onClick={newChat} className="h-8">
              <Plus className="w-4 h-4 mr-1.5" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  How can I help your practice today?
                </h2>
                <p className="text-gray-500 text-sm">
                  Ask me anything about tax law, accounting standards, audit
                  procedures, or client-specific scenarios.
                </p>
              </div>

              {/* Saved prompts as chips above suggested prompts */}
              {savedPrompts.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" />
                    Your Saved Prompts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedPrompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => sendMessage(prompt.content)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-forest-200 bg-forest-50 text-forest-700 text-xs font-medium hover:bg-forest-100 transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                        {prompt.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-forest-300 hover:shadow-sm transition-all text-sm text-gray-600 hover:text-gray-900"
                  >
                    <MessageSquare className="w-4 h-4 text-forest-600 mb-2" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" && "justify-end"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 group",
                      msg.role === "user"
                        ? "bg-forest-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="relative">
                        <div
                          className="prose-chat"
                          dangerouslySetInnerHTML={{
                            __html:
                              msg.content ||
                              '<span class="animate-pulse">●</span>',
                          }}
                        />
                        {msg.content && (
                          <button
                            onClick={() => copyMessage(msg.content)}
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                          >
                            {copied === msg.content ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <p className="text-sm leading-relaxed pr-6">{msg.content}</p>
                        <button
                          onClick={() => openSaveDialog(msg.content)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-forest-700"
                          title="Save this prompt"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-white/70" />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-1 text-sm font-semibold text-gray-600">
                      {session?.user?.name?.[0] || "U"}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about tax law, GAAP standards, audit procedures, or any CPA topic..."
                  className="resize-none min-h-[52px] max-h-36 pr-12 text-sm focus:ring-forest-600"
                  rows={1}
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                className="h-[52px] w-[52px] bg-forest-600 hover:bg-forest-700 shrink-0 rounded-xl p-0"
              >
                {streaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              CPA Loft AI may make mistakes. Always verify important tax
              advice with authoritative sources.
            </p>
          </div>
        </div>
      </div>

      {/* Save Prompt Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-forest-600" />
              Save Prompt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="e.g. Section 179 Deduction"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                value={saveContent}
                onChange={(e) => setSaveContent(e.target.value)}
                placeholder="The prompt text to save..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest-600 hover:bg-forest-700"
              onClick={savePrompt}
              disabled={!saveTitle.trim() || !saveContent.trim() || savingPrompt}
            >
              {savingPrompt ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BookmarkPlus className="w-4 h-4 mr-2" />
              )}
              Save Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <AIAssistantContent />
    </Suspense>
  );
}
