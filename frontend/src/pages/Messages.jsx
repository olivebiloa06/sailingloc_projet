import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import InlineAlert from "../components/InlineAlert";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function formatTime(date) {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ prenom, nom, size = "h-9 w-9" }) {
  const initials = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-sky text-xs font-bold text-white ${size}`}>
      {initials}
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState("");
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [typing, setTyping] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  // Connexion Socket.io
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    return () => socketRef.current?.disconnect();
  }, []);

  // Charger la liste des conversations
  const loadConversations = useCallback(async () => {
    setConvError("");
    try {
      const { data } = await api.get("/conversations");
      setConversations(data.conversations || []);
    } catch {
      setConvError("Impossible de charger tes conversations.");
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Si un otherUserId est passé en query string (depuis la fiche bateau ou
  // la demande de réservation), on ouvre ou crée la conversation directement.
  useEffect(() => {
    const otherUserId = searchParams.get("with");
    const bookingId = searchParams.get("booking");

    if (otherUserId) {
      api.post("/conversations", { otherUserId: Number(otherUserId), bookingId: bookingId ? Number(bookingId) : undefined })
        .then(({ data }) => {
          setActiveConv(data.conversation);
          loadConversations();
        })
        .catch(() => {});
    }
  }, [searchParams, loadConversations]);

  // Charger les messages de la conversation active + rejoindre la room socket
  useEffect(() => {
    if (!activeConv) return;

    setMessagesLoading(true);
    setMessagesError("");
    api.get(`/conversations/${activeConv.id}/messages`)
      .then(({ data }) => {
        setMessages(data.messages || []);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(() => setMessagesError("Impossible de charger les messages de cette conversation."))
      .finally(() => setMessagesLoading(false));

    socketRef.current?.emit("join_conversation", activeConv.id);
    socketRef.current?.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    socketRef.current?.on("typing", ({ prenom }) => {
      setTyping(prenom);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(null), 2000);
    });
    socketRef.current?.on("stop_typing", () => setTyping(null));

    return () => {
      socketRef.current?.emit("leave_conversation", activeConv.id);
      socketRef.current?.off("new_message");
      socketRef.current?.off("typing");
      socketRef.current?.off("stop_typing");
    };
  }, [activeConv]);

  const getOther = (conv) => {
    if (!conv) return null;
    return conv.participant1Id === user?.id ? conv.participant2 : conv.participant1;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv) return;

    setSending(true);
    setSendError("");
    socketRef.current?.emit("stop_typing", { conversationId: activeConv.id });

    try {
      await api.post(`/conversations/${activeConv.id}/messages`, { contenu: draft.trim() });
      setDraft("");
      loadConversations();
    } catch {
      setSendError("Le message n'a pas pu être envoyé. Réessaie.");
    } finally { setSending(false); }
  };

  const handleTyping = (e) => {
    setDraft(e.target.value);
    socketRef.current?.emit("typing", { conversationId: activeConv?.id, prenom: user?.prenom });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { conversationId: activeConv?.id });
    }, 1500);
  };

  const other = getOther(activeConv);

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* LISTE DES CONVERSATIONS */}
      <div className={`flex w-full flex-col border-r border-gray-100 sm:w-80 ${activeConv ? "hidden sm:flex" : "flex"}`}>
        <div className="border-b border-gray-100 px-5 py-4">
          <h1 className="font-heading text-lg font-semibold text-navy">Messages</h1>
        </div>

        {convLoading ? (
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : convError ? (
          <div className="p-4">
            <InlineAlert message={convError} onDismiss={() => setConvError("")} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-400">
            Aucune conversation.<br />Commence à discuter depuis une fiche bateau.
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const other = getOther(conv);
              const lastMsg = conv.messages?.[0];
              const isActive = activeConv?.id === conv.id;

              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => setActiveConv(conv)}
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-cloud ${isActive ? "bg-cloud" : ""}`}
                  >
                    <Avatar prenom={other?.prenom} nom={other?.nom} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-navy">
                          {other?.prenom} {other?.nom}
                        </p>
                        {lastMsg && (
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatDate(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {lastMsg.senderId === user?.id ? "Toi : " : ""}{lastMsg.contenu}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* PANNEAU DE CHAT */}
      {activeConv ? (
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setActiveConv(null)}
              className="mr-1 text-gray-400 hover:text-navy sm:hidden"
            >
              ←
            </button>
            <Avatar prenom={other?.prenom} nom={other?.nom} />
            <div>
              <p className="font-heading text-sm font-semibold text-navy">
                {other?.prenom} {other?.nom}
              </p>
              {typing && (
                <p className="text-xs text-sky">{typing} écrit...</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messagesLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                    <div className="h-9 w-40 animate-pulse rounded-2xl bg-gray-100" />
                  </div>
                ))}
              </div>
            )}
            {messagesError && (
              <InlineAlert message={messagesError} onDismiss={() => setMessagesError("")} />
            )}
            <div className="space-y-3">
              {!messagesLoading && messages.map((msg, i) => {
                const isMine = msg.senderId === user?.id;
                const showDate = i === 0 || formatDate(messages[i - 1].createdAt) !== formatDate(msg.createdAt);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-3 text-center text-xs text-gray-400">
                        {formatDate(msg.createdAt)}
                      </div>
                    )}
                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMine ? "bg-navy text-white" : "bg-cloud text-gray-800"
                      }`}>
                        {msg.contenu}
                        <span className={`mt-1 block text-right text-[10px] ${isMine ? "text-white/50" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                          {isMine && msg.luAt && " ✓✓"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && !messages.length && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-cloud px-4 py-2.5 text-sm text-gray-400">
                    ...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Saisie */}
          {sendError && (
            <div className="border-t border-gray-100 px-5 pt-3">
              <InlineAlert message={sendError} onDismiss={() => setSendError("")} />
            </div>
          )}
          <form onSubmit={handleSend} className={`flex items-center gap-3 px-5 py-4 ${sendError ? "" : "border-t border-gray-100"}`}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={handleTyping}
              placeholder="Écris un message..."
              disabled={sending}
              className="flex-1 rounded-full border border-gray-200 bg-cloud px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Envoyer le message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition hover:bg-navy-light disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-center text-sm text-gray-400 sm:flex">
          <div>
            <p className="text-4xl">💬</p>
            <p className="mt-3 font-heading text-base font-medium text-navy">Tes messages</p>
            <p className="mt-1 text-xs">Sélectionne une conversation pour commencer.</p>
          </div>
        </div>
      )}
    </div>
  );
}
