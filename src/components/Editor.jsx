import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/php/php';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/xml-hint';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/merge/merge';
import 'codemirror/addon/merge/merge.css';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange, onLanguageChange }) => {
    const editorRef = useRef(null);
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('dracula');
    const [isInitialized, setIsInitialized] = useState(false);

    // Language configurations
    const languageConfigs = {
        javascript: { name: 'javascript', json: true },
        python: { name: 'python' },
        html: { name: 'htmlmixed' },
        css: { name: 'css' },
        xml: { name: 'xml' },
        java: { name: 'text/x-java' },
        cpp: { name: 'text/x-c++src' },
        c: { name: 'text/x-csrc' },
        php: { name: 'application/x-httpd-php' },
        ruby: { name: 'ruby' },
        shell: { name: 'shell' },
        sql: { name: 'text/x-sql' },
        markdown: { name: 'markdown' }
    };

    // Code snippets
    const snippets = {
        javascript: {
            'for': 'for (let i = 0; i < array.length; i++) {\n    \n}',
            'function': 'function name() {\n    \n}',
            'arrow': 'const name = () => {\n    \n}',
            'class': 'class Name {\n    constructor() {\n        \n    }\n}',
            'if': 'if (condition) {\n    \n}',
            'try': 'try {\n    \n} catch (error) {\n    \n}',
            'console': 'console.log();',
            'const': 'const name = value;',
            'let': 'let name = value;',
            'var': 'var name = value;'
        },
        python: {
            'def': 'def function_name():\n    \n',
            'class': 'class ClassName:\n    def __init__(self):\n        \n',
            'if': 'if condition:\n    \n',
            'for': 'for item in iterable:\n    \n',
            'while': 'while condition:\n    \n',
            'try': 'try:\n    \n\nexcept Exception as e:\n    \n',
            'import': 'import module',
            'print': 'print()'
        },
        html: {
            'html': '<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n    \n</body>\n</html>',
            'div': '<div>\n    \n</div>',
            'span': '<span>\n    \n</span>',
            'p': '<p>\n    \n</p>',
            'a': '<a href="">\n    \n</a>',
            'img': '<img src="" alt="">',
            'form': '<form>\n    \n</form>',
            'input': '<input type="" name="">',
            'button': '<button>\n    \n</button>'
        },
        css: {
            'class': '.class-name {\n    \n}',
            'id': '#id-name {\n    \n}',
            'media': '@media (max-width: 768px) {\n    \n}',
            'keyframes': '@keyframes animation-name {\n    from {\n        \n    }\n    to {\n        \n    }\n}',
            'flex': 'display: flex;\njustify-content: center;\nalign-items: center;',
            'grid': 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(200px, 1fr));',
            'transform': 'transform: translateX(0);',
            'transition': 'transition: all 0.3s ease;'
        }
    };

    // Initialize CodeMirror
    useEffect(() => {
        const initEditor = () => {
            if (isInitialized) return;

            const textarea = document.getElementById('realtimeEditor');
            if (!textarea) {
                console.error('Textarea not found, retrying...');
                setTimeout(initEditor, 100);
                return;
            }

            try {
                editorRef.current = Codemirror.fromTextArea(textarea, {
                    mode: languageConfigs[language],
                    theme: theme,
                    lineNumbers: true,
                    lineWrapping: true,
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    indentUnit: 4,
                    indentWithTabs: false,
                    tabSize: 4,
                    smartIndent: true,
                    electricChars: true,
                    foldGutter: true,
                    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                    extraKeys: {
                        'Ctrl-Space': 'autocomplete',
                        'Ctrl-/': 'toggleComment',
                        'Ctrl-Enter': 'newlineAndIndent',
                        'Ctrl-D': 'selectNextOccurrence',
                        'Ctrl-F': 'find',
                        'Ctrl-H': 'replace',
                        'Ctrl-G': 'jumpToLine',
                        'F11': (cm) => {
                            cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                        },
                        'Esc': (cm) => {
                            if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                        },
                        'Tab': (cm) => {
                            if (cm.somethingSelected()) {
                                cm.indentSelection('add');
                            } else {
                                const cursor = cm.getCursor();
                                const line = cm.getLine(cursor.line);
                                const beforeCursor = line.slice(0, cursor.ch);
                                
                                // Check for snippet triggers
                                for (const [trigger, snippet] of Object.entries(snippets[language] || {})) {
                                    if (beforeCursor.endsWith(trigger)) {
                                        const start = cursor.ch - trigger.length;
                                        const end = cursor.ch;
                                        cm.replaceRange(snippet, 
                                            { line: cursor.line, ch: start }, 
                                            { line: cursor.line, ch: end }
                                        );
                                        return;
                                    }
                                }
                                
                                // Default tab behavior
                                cm.execCommand('insertSoftTab');
                            }
                        }
                    },
                    hintOptions: {
                        completeSingle: false,
                        closeOnUnfocus: false,
                        alignWithWord: true,
                        closeCharacters: /[\s()\[\]{};:>,]/,
                        completeOnSingleClick: false,
                        updateOnCursorActivity: true,
                        closeOnPick: true
                    },
                    placeholder: 'Start coding here... Press Tab for snippets, Ctrl+Space for autocomplete',
                    styleActiveLine: true,
                    showCursorWhenSelecting: true,
                    cursorBlinkRate: 530,
                    cursorHeight: 1,
                    maxHighlightLength: 10000,
                    viewportMargin: 10,
                    undoDepth: 200,
                    historyEventDelay: 1250,
                    pollInterval: 100,
                    addModeClass: true,
                    dragDrop: true,
                    allowDropFileTypes: null,
                    cursorScrollMargin: 0,
                    resetSelectionOnContextMenu: true,
                    workTime: 100,
                    workDelay: 100,
                    autocorrect: false,
                    autocapitalize: false,
                    autofocus: false,
                    direction: 'ltr',
                    rtlMoveVisually: false,
                    keyMap: 'default',
                    inputStyle: 'textarea',
                    readOnly: false,
                    disableInput: false,
                    moveInputWithCursor: true,
                    selectionPointer: true,
                    lineWiseCopyCut: true,
                    pasteLinesPerSelection: true,
                    undoRedo: true,
                    indentOnPaste: true,
                    smartBackspace: true,
                    moveOnDrag: true,
                    dragMoves: true,
                    selectOnLineNumbers: true,
                    screenReaderLabel: 'Code editor',
                    accessibilityLabel: 'Code editor',
                    tabindex: null,
                    spellcheck: false
                });

                // Add autocomplete for different languages
                editorRef.current.on('inputRead', (cm) => {
                    if (cm.state.completionActive) return;
                    
                    const cur = cm.getCursor();
                    const line = cm.getLine(cur.line);
                    const beforeCursor = line.slice(0, cur.ch);
                    
                    // Trigger autocomplete on certain characters
                    if (/[a-zA-Z_$]/.test(beforeCursor.slice(-1))) {
                        setTimeout(() => {
                            if (!cm.state.completionActive) {
                                cm.showHint({
                                    completeSingle: false,
                                    closeOnUnfocus: false,
                                    alignWithWord: true,
                                    closeCharacters: /[\s()\[\]{};:>,]/,
                                    completeOnSingleClick: false,
                                    updateOnCursorActivity: true,
                                    closeOnPick: true
                                });
                            }
                        }, 100);
                    }
                });

                // Handle code changes
                editorRef.current.on('change', (instance, changes) => {
                    const { origin } = changes;
                    const code = instance.getValue();
                    
                    // Call the onCodeChange callback
                    if (onCodeChange) {
                onCodeChange(code);
                    }
                    
                    // Emit to other clients only if not from setValue
                    if (origin !== 'setValue' && socketRef.current) {
                  socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                  });
                }
                });

                // Set initial code
                editorRef.current.setValue('// Start coding here...\nconsole.log("Hello World!");');
                
                setIsInitialized(true);
                console.log('✅ CodeMirror editor initialized successfully');

      } catch (error) {
                console.error('Error initializing CodeMirror:', error);
            }
        };

        // Initialize with a small delay to ensure DOM is ready
        const timer = setTimeout(initEditor, 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle language changes
    useEffect(() => {
        if (editorRef.current && isInitialized) {
            editorRef.current.setOption('mode', languageConfigs[language]);
            if (onLanguageChange) {
                onLanguageChange(language);
            }
        }
    }, [language, isInitialized]);

    // Handle theme changes
  useEffect(() => {
        if (editorRef.current && isInitialized) {
            editorRef.current.setOption('theme', theme);
        }
    }, [theme, isInitialized]);

    // Handle incoming code changes from other clients
    useEffect(() => {
        if (socketRef.current && editorRef.current && isInitialized) {
            const handleCodeChange = ({ code }) => {
                if (code !== null && code !== editorRef.current.getValue()) {
                    editorRef.current.setValue(code);
            }
        };

        socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
                }
            };
        }
    }, [socketRef.current, isInitialized]);

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

  return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Editor Toolbar */}
            <div style={{
                background: '#2d2d30',
                padding: '8px 16px',
                borderBottom: '1px solid #3e3e42',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Language Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ color: '#cccccc', fontSize: '12px', fontWeight: '600' }}>Language:</label>
                    <select 
                        value={language} 
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{
                            background: '#1e1e1e',
                            color: '#ffffff',
                            border: '1px solid #3e3e42',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="xml">XML</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="shell">Shell</option>
                        <option value="sql">SQL</option>
                        <option value="markdown">Markdown</option>
                    </select>
                </div>

                {/* Theme Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ color: '#cccccc', fontSize: '12px', fontWeight: '600' }}>Theme:</label>
                    <select 
                        value={theme} 
                        onChange={(e) => handleThemeChange(e.target.value)}
                        style={{
                            background: '#1e1e1e',
                            color: '#ffffff',
                            border: '1px solid #3e3e42',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                    >
                        <option value="dracula">Dracula</option>
                        <option value="material">Material</option>
                        <option value="monokai">Monokai</option>
                        <option value="solarized">Solarized</option>
                        <option value="default">Default</option>
                    </select>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => {
                            if (editorRef.current) {
                                editorRef.current.execCommand('find');
                            }
                        }}
                        style={{
                            background: '#007acc',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Find (Ctrl+F)
                    </button>
                    <button
                        onClick={() => {
                            if (editorRef.current) {
                                editorRef.current.setOption('fullScreen', !editorRef.current.getOption('fullScreen'));
                            }
                        }}
                        style={{
                            background: '#007acc',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Fullscreen (F11)
                    </button>
                </div>

                {/* Snippets Info */}
                <div style={{ color: '#888', fontSize: '11px' }}>
                    Type snippet name + Tab (e.g., "for" + Tab)
                </div>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, position: 'relative' }}>
                <textarea 
                    id="realtimeEditor" 
                    style={{ 
                        width: '100%', 
                        height: '100%',
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        padding: '10px',
                        resize: 'none'
                    }}
                    defaultValue="// Start coding here...\nconsole.log('Hello World!');"
                />
            </div>
        </div>
    );
};

export default Editor;