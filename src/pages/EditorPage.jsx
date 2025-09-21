import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import Terminal from '../components/Terminal';
import initSocket from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [currentCode, setCurrentCode] = useState('// Start coding here...\nconsole.log("Hello World!");');
    const [currentLanguage, setCurrentLanguage] = useState('javascript');
    const [showTerminal, setShowTerminal] = useState(false);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    console.log('JOINED event received:', { clients, username, socketId });
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room!`, {
                            duration: 3000,
                            icon: '👥',
                            style: {
                                background: '#10b981',
                                color: '#ffffff',
                                fontWeight: '500'
                            }
                        });
                        console.log(`${username} joined`);
                    }
                    
                    // Remove duplicates based on socketId and ensure unique clients
                    const uniqueClients = clients.filter((client, index, self) => 
                        index === self.findIndex(c => c.socketId === client.socketId)
                    );
                    
                    console.log('Setting clients:', uniqueClients);
                    setClients(uniqueClients);
                    
                    // Only sync code if this is a new user joining
                    if (username !== location.state?.username) {
                        socketRef.current.emit(ACTIONS.SYNC_CODE, {
                            code: codeRef.current,
                            socketId,
                        });
                    }
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    console.log('DISCONNECTED event received:', { socketId, username });
                    toast.success(`${username} left the room.`, {
                        duration: 3000,
                        icon: '👋',
                        style: {
                            background: '#f59e0b',
                            color: '#ffffff',
                            fontWeight: '500'
                        }
                    });
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
            }
        };
    }, [roomId, location.state?.username, reactNavigator]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success(`Room ID "${roomId}" copied to clipboard!`, {
                duration: 3000,
                icon: '📋',
                style: {
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: '500'
                }
            });
        } catch (err) {
            toast.error('Could not copy the Room ID. Please try again.', {
                duration: 4000,
                icon: '❌',
                style: {
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: '500'
                }
            });
            console.error(err);
        }
    }

    function leaveRoom() {
        toast.success('You have left the room successfully!', {
            duration: 2500,
            icon: '👋',
            style: {
                background: '#3b82f6',
                color: '#ffffff',
                fontWeight: '500'
            }
        });
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className={`clientsList ${clients.length >= 10 ? 'very-crowded' : clients.length >= 8 ? 'crowded' : ''}`}>
                        {clients.map((client, index) => (
                            <Client
                                key={`${client.socketId}-${client.username}-${index}`}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button 
                    className="btn" 
                    onClick={() => {
                        toast.success('Opening Discussion Forum...', {
                            duration: 2000,
                            icon: '💬',
                            style: {
                                background: '#28a745',
                                color: '#ffffff',
                                fontWeight: '500'
                            }
                        });
                        reactNavigator(`/forum/${roomId}`, { state: { username: location.state?.username } });
                    }}
                    style={{ background: '#28a745', margin: '5px 20px' }}
                >
                    💬 Discussion Forum
                </button>
                <button 
                    className="btn" 
                    onClick={() => {
                        setShowTerminal(!showTerminal);
                        toast.success(showTerminal ? 'Terminal hidden' : 'Terminal shown', {
                            duration: 2000,
                            icon: showTerminal ? '💻' : '💻',
                            style: {
                                background: '#007acc',
                                color: '#ffffff',
                                fontWeight: '500'
                            }
                        });
                    }}
                    style={{ background: '#007acc', margin: '5px 20px' }}
                >
                    {showTerminal ? '💻 Hide Terminal' : '💻 Show Terminal'}
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                {showTerminal ? (
                    <div className="split-container">
                        <div className="editor-section">
                            <Editor
                                socketRef={socketRef}
                                roomId={roomId}
                                onCodeChange={(code) => {
                                    codeRef.current = code;
                                    setCurrentCode(code);
                                    console.log('Code changed:', code);
                                }}
                                onLanguageChange={setCurrentLanguage}
                            />
                        </div>
                        <div className="terminal-section">
                            <Terminal
                                socketRef={socketRef}
                                roomId={roomId}
                                username={location.state?.username}
                                currentCode={currentCode}
                                language={currentLanguage}
                            />
                        </div>
                    </div>
                ) : (
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                            setCurrentCode(code);
                            console.log('Code changed:', code);
                        }}
                        onLanguageChange={setCurrentLanguage}
                    />
                )}
            </div>
        </div>
    );
};

export default EditorPage;