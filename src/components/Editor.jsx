

import React, { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import ACTIONS from '../Actions';


function Editor({socketRef,roomId,onCodeChange}) {
  const editorRef = useRef(null);

  useEffect(()=>{
    async function init(){
      const startState = EditorState.create({
        doc: "function (){\n  console.log('Editor goes here...');\n}",
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const code = update.state.doc.toString();
              onCodeChange(code);
              if (socketRef.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                  roomId,
                  code,
                });
              }
            }
          })
        ]
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: document.getElementById('realtimeEditor')
      });
    }
    init();
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    }
  },[])

  useEffect(() => {
    if (socketRef.current && editorRef.current) {
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            if (code !== null) {
                editorRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: editorRef.current.state.doc.length,
                        insert: code
                    }
                });
            }
        });

        socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
            if (code !== null) {
                editorRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: editorRef.current.state.doc.length,
                        insert: code
                    }
                });
            }
        });
    }

    return () => {
        if (socketRef.current) {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
            socketRef.current.off(ACTIONS.SYNC_CODE);
        }
    };
}, [socketRef.current]);
  return (
    <div id="realtimeEditor" style={{ height: '100%', width: '100%' }}></div>
  )
}

export default Editor