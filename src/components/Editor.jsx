

import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import "codemirror/lib/codemirror.css"
import 'codemirror/theme/dracula.css';
import'codemirror/mode/javascript/javascript';
// import ACTIONS from '../../../Actions.js'
import ACTIONS from '../Actions';
// import'codemirror/addon/edit/closeTags'
import "codemirror/addon/edit/closeBrackets"
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/javascript-hint";


function Editor({socketRef,roomId,onCodeChange}) {
  const editorRef = useRef(null);

  useEffect(()=>{
    async function init(){
      editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
mode:{name:'javascript',json:true},
theme:'dracula',
autoCloseBrackets:true,
lineNumbers:true,
extraKeys: { "Ctrl-Space": "autocomplete" },


    });

    editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
            });
        }
    });
    }
    init();
    return () => {
      editorRef.current.toTextArea();
    }
  },[])

  useEffect(() => {
    if (socketRef.current) {
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            if (code !== null) {
                editorRef.current.setValue(code);
            }
        });

        socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
            if (code !== null) {
                editorRef.current.setValue(code);
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
       <textarea
      id="realtimeEditor"
      defaultValue=" function (){
      console.log('Editor goes here...');
      }"
    />
    
  )
}

export default Editor