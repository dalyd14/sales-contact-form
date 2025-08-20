'use client'

import { useChat } from '@ai-sdk/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import { getCookie } from '@/lib/utils';

export default function Chat({ meetingId, readOnly, height }: { meetingId: string, readOnly: boolean, height?: string }) {
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  const handleError = useCallback((error: unknown) => {
    // Keep this stable to avoid re-subscribing the internal store each render
    console.error(error);
  }, []);

  const chatId = useMemo(() => `meeting-${meetingId ?? 'default'}`, [meetingId]);

  const chatOptions = useMemo(() => ({
    id: chatId,
    api: '/api/chat',
    onError: handleError,
    experimental_throttle: 50,
  }), [chatId, handleError]);

  const { messages, sendMessage, setMessages } = useChat(chatOptions);

  useEffect(() => {
    const fetchChat = async () => {
      const response = await fetch(`/api/meeting-chat/${meetingId}`);
      const data = await response.json();
      if (data.length && data[0].messages && data[0].messages.length > 0) {
        setMessages(data[0].messages.map((msg: any) => {
            if (!msg.parts && msg.content) {
                msg.parts = msg.content
            }
            return msg;
        }));
      }
    }
    fetchChat();
  }, [meetingId]);

  const handleSendMessage = useCallback(async () => {
    if (readOnly) return;
    if (!input.trim()) return;
    setIsWaiting(true);
    try {
      await sendMessage({
        role: 'user',
        parts: [
          { type: 'text', text: input }
        ]
      },
      {
        body: {
          meetingId: meetingId
        }
      }
    );
    fetch(`/api/events`, {
        method: "POST",
        body: JSON.stringify({
          user_id: getCookie("prospectId"),
          event_type: "track",
          event_name: "message_sent"
        })
      })
    setInput('');
    } finally {
      setIsWaiting(false);
    }
  }, [input, sendMessage]);

  return (
    <>
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    }}>
        <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'black',
            justifyContent: 'center',
            width: '100%',
            height: height || '90vh',
            px: '1rem'

        }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                mb: 1,
                height: '9%'
            }}>
            <Typography variant="h6" component="h2" sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fff'
            }}>
                Prep AI Chat
            </Typography>
            {!readOnly && (
            <Typography variant="body1" component="p" sx={{
                fontSize: '0.9rem',
                color: '#a1a1a1',
                fontStyle: 'italic'
            }}>
                Please note: This conversation will be used by our Sales Rep to prepare for the meeting.
            </Typography>
            )}
            </Box>

            <Box sx={{
                width: '100%',
                background: 'linear-gradient(135deg, #111112 0%, #000 100%)',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)',
                padding: '2.5rem 2rem',
                gap: '1.5rem',
                height: readOnly ? '91%' : '84%',
                overflowY: 'scroll',
                scrollbarWidth: 'thin',
                scrollbarColor: '#444 #232526',
                border: '1.5px solid #333',
                borderRadius: '18px',
                position: 'relative',
                pb: 0
            }}>
                {(messages.length === 0) ? (
                        (!readOnly) ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Box sx={{width: '33%', p:2, mx:2, border: '1px solid #007AFF', borderRadius: '18px', cursor: 'pointer'}}
                                onClick={() => {
                                    setInput('How can Vercel help with my deployment process?');
                                }}
                                >
                                    <Typography variant="h6" sx={{color: '#007AFF', fontWeight: '100', fontStyle: 'italic'}}>
                                        How can Vercel help with my deployment process?
                                    </Typography>
                                </Box>
                                <Box sx={{width: '33%', p:2, mx:2, border: '1px solid #007AFF', borderRadius: '18px', cursor: 'pointer'}}
                                onClick={() => {
                                    setInput('How can Vercel help me build my AI tools?');
                                }}
                                >
                                    <Typography variant="h6" sx={{color: '#007AFF', fontWeight: '100', fontStyle: 'italic'}}>
                                        How can Vercel help me build my AI tools?
                                    </Typography>
                                </Box>
                                <Box sx={{width: '33%', p:2, mx:2, border: '1px solid #007AFF', borderRadius: '18px', cursor: 'pointer'}}
                                onClick={() => {
                                    setInput('How can v0 help me speed up my product development?');
                                }}
                                >
                                    <Typography variant="h6" sx={{color: '#007AFF', fontWeight: '100', fontStyle: 'italic'}}>
                                        How can v0 help me speed up my product development?
                                    </Typography>
                                </Box>
                                
                            </Box> 
                        ) : (
                            <Box>
                                <Typography variant="h6" sx={{color: '#fff', fontWeight: '100', fontStyle: 'italic'}}>
                                    The prospect has not sent any messages yet.
                                </Typography>
                            </Box>
                        )
                ) : (
                    <>
                    {messages.map((message, index) => (
                        <Box key={message.id || index} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start'
                        }}>
                            {message.parts.map((part, i) => {
                                if (part.type === 'text') {
                                    const isUser = message.role === 'user';
                                    return (
                                        <Box
                                            key={`${message.id}-${i}`}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isUser ? 'flex-end' : 'flex-start',
                                                width: '100%',
                                                mb: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    maxWidth: '80%',
                                                    bgcolor: isUser ? '#1976d2' : '#232526',
                                                    color: isUser ? '#fff' : '#fff',
                                                    borderRadius: isUser
                                                        ? '18px 18px 4px 18px'
                                                        : '18px 18px 18px 4px',
                                                    p: 1.5,
                                                    fontSize: '1.1rem',
                                                    boxShadow: isUser
                                                        ? '0 2px 8px 0 rgba(25, 118, 210, 0.10)'
                                                        : '0 2px 8px 0 rgba(44,83,100,0.08)',
                                                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                        margin: '0.5rem 0',
                                                        color: 'inherit',
                                                    },
                                                    '& p': {
                                                        margin: '0.5rem 0',
                                                    },
                                                    '& ul, & ol': {
                                                        margin: '0.5rem 0',
                                                        paddingLeft: '1.5rem',
                                                    },
                                                    '& li': {
                                                        margin: '0.25rem 0',
                                                    },
                                                    '& code': {
                                                        backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                        padding: '0.2rem 0.4rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9em',
                                                        fontFamily: 'monospace',
                                                    },
                                                    '& pre': {
                                                        backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                        padding: '0.75rem',
                                                        borderRadius: '6px',
                                                        overflow: 'auto',
                                                        margin: '0.5rem 0',
                                                        '& code': {
                                                            backgroundColor: 'transparent',
                                                            padding: 0,
                                                        },
                                                    },
                                                    '& blockquote': {
                                                        borderLeft: `3px solid ${isUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                                        margin: '0.5rem 0',
                                                        paddingLeft: '1rem',
                                                        fontStyle: 'italic',
                                                    },
                                                    '& a': {
                                                        color: isUser ? '#90caf9' : '#1976d2',
                                                        textDecoration: 'underline',
                                                    },
                                                    '& strong': {
                                                        fontWeight: 'bold',
                                                    },
                                                    '& em': {
                                                        fontStyle: 'italic',
                                                    },
                                                }}
                                            >
                                                {isUser ? (
                                                    part.text
                                                ) : (
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h1: ({children}) => <Typography variant="h6" component="h1">{children}</Typography>,
                                                            h2: ({children}) => <Typography variant="h6" component="h2">{children}</Typography>,
                                                            h3: ({children}) => <Typography variant="subtitle1" component="h3">{children}</Typography>,
                                                            h4: ({children}) => <Typography variant="subtitle1" component="h4">{children}</Typography>,
                                                            h5: ({children}) => <Typography variant="body1" component="h5">{children}</Typography>,
                                                            h6: ({children}) => <Typography variant="body1" component="h6">{children}</Typography>,
                                                            p: ({children}) => <Typography variant="body1" component="p">{children}</Typography>,
                                                            code: ({children, className}) => {
                                                                const isInline = !className;
                                                                return isInline ? (
                                                                    <code>{children}</code>
                                                                ) : (
                                                                    <pre><code>{children}</code></pre>
                                                                );
                                                            },
                                                            pre: ({children}) => <pre>{children}</pre>,
                                                            blockquote: ({children}) => <blockquote>{children}</blockquote>,
                                                            a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                                                            ul: ({children}) => <ul>{children}</ul>,
                                                            ol: ({children}) => <ol>{children}</ol>,
                                                            li: ({children}) => <li>{children}</li>,
                                                            strong: ({children}) => <strong>{children}</strong>,
                                                            em: ({children}) => <em>{children}</em>,
                                                        }}
                                                    >
                                                        {part.text}
                                                    </ReactMarkdown>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                }
                                return null;
                            })}
                        </Box>
                    ))} 
                    {isWaiting && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                width: '100%',
                                mt: 2,
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#232526',
                                    borderRadius: '18px 18px 18px 4px',
                                    px: 2,
                                    py: 1,
                                    minWidth: '56px',
                                    minHeight: '32px',
                                    boxShadow: '0 2px 8px 0 rgba(44,83,100,0.08)',
                                    position: 'relative',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            bgcolor: '#bdbdbd',
                                            borderRadius: '50%',
                                            animation: 'imessage-dot-1 1.4s infinite',
                                            '@keyframes imessage-dot-1': {
                                                '0%': { opacity: 0.3, transform: 'scale(1)' },
                                                '20%': { opacity: 1, transform: 'scale(1.2)' },
                                                '40%': { opacity: 0.3, transform: 'scale(1)' },
                                                '100%': { opacity: 0.3, transform: 'scale(1)' },
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            bgcolor: '#bdbdbd',
                                            borderRadius: '50%',
                                            animation: 'imessage-dot-2 1.4s infinite',
                                            animationDelay: '0.2s',
                                            '@keyframes imessage-dot-2': {
                                                '0%': { opacity: 0.3, transform: 'scale(1)' },
                                                '20%': { opacity: 0.3, transform: 'scale(1)' },
                                                '40%': { opacity: 1, transform: 'scale(1.2)' },
                                                '60%': { opacity: 0.3, transform: 'scale(1)' },
                                                '100%': { opacity: 0.3, transform: 'scale(1)' },
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            bgcolor: '#bdbdbd',
                                            borderRadius: '50%',
                                            animation: 'imessage-dot-3 1.4s infinite',
                                            animationDelay: '0.4s',
                                            '@keyframes imessage-dot-3': {
                                                '0%': { opacity: 0.3, transform: 'scale(1)' },
                                                '40%': { opacity: 0.3, transform: 'scale(1)' },
                                                '60%': { opacity: 1, transform: 'scale(1.2)' },
                                                '80%': { opacity: 0.3, transform: 'scale(1)' },
                                                '100%': { opacity: 0.3, transform: 'scale(1)' },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ ml: 1, color: '#888', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                AI is typing…
                            </Box>
                        </Box>
                    )}
                    </>
                )}
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'sticky',
                    left: 0,
                    bottom: 0,
                    zIndex: 10
                }}>               
                </Box>
            </Box>
            {!readOnly && (
            <TextField
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about Vercel..."
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                        <IconButton
                            onClick={handleSendMessage}
                            sx={{
                                color: '#38bdf8',
                                '&:hover': {
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                            >
                            <ArrowUpIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                sx={{
                    bgcolor: '#0a0a0a',
                    borderRadius: '22px',
                    width: '100%',
                    px: 2,
                    py: 1.5,
                    fontSize: '1.15rem',
                    height: '7%',
                    boxShadow: '0 2px 8px 0 rgba(44,83,100,0.10)',
                    border: '1.5px solid #333',
                    outline: 'none',
                    m: 2,
                    '& .MuiInputBase-input': {
                        color: '#fff',
                        padding: 0,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    }
                }}
            /> 
            )}
        </Box>        
    </Box>

    </>
  );
}