import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  RefreshCw, 
  Play, 
  Square, 
  Maximize2,
  Minimize2 
} from 'lucide-react';
import { ACTIONS } from '../Actions';

const LivePreview = ({ socketRef, roomId, files, username }) => {
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (socketRef.current) {
      const handleServerStarted = ({ url, port }) => {
        setServerUrl(url);
        setIsServerRunning(true);
      };

      const handleServerStopped = () => {
        setIsServerRunning(false);
        setServerUrl('');
      };

      const handleServerError = ({ error }) => {
        console.error('Live server error:', error);
        setIsServerRunning(false);
      };

      socketRef.current.on(ACTIONS.LIVE_SERVER_STARTED, handleServerStarted);
      socketRef.current.on(ACTIONS.LIVE_SERVER_STOPPED, handleServerStopped);
      socketRef.current.on(ACTIONS.LIVE_SERVER_ERROR, handleServerError);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.LIVE_SERVER_STARTED, handleServerStarted);
          socketRef.current.off(ACTIONS.LIVE_SERVER_STOPPED, handleServerStopped);
          socketRef.current.off(ACTIONS.LIVE_SERVER_ERROR, handleServerError);
        }
      };
    }
  }, []);

  const startServer = () => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.START_LIVE_SERVER, { roomId, port: 3000 });
    }
  };

  const stopServer = () => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.STOP_LIVE_SERVER, { roomId });
    }
  };

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Generate HTML content from files
  const generateHTML = () => {
    const frontendFiles = files.frontend || {};
    const htmlContent = frontendFiles['index.html'] || '<h1>No HTML file found</h1>';
    const cssContent = frontendFiles['style.css'] || '';
    const jsContent = frontendFiles['script.js'] || '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
      </html>
    `;
  };

  const previewContent = generateHTML();

  return (
    <div className={`h-full flex flex-col bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800">Live Preview</h3>
          {isServerRunning && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Server Running</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {serverUrl && (
            <a
              href={serverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in New Tab</span>
            </a>
          )}
          <button
            onClick={refreshPreview}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 text-gray-600 hover:text-gray-800"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {isServerRunning ? (
            <button
              onClick={stopServer}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Square className="w-3 h-3" />
              <span>Stop Server</span>
            </button>
          ) : (
            <button
              onClick={startServer}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Play className="w-3 h-3" />
              <span>Start Server</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isServerRunning && serverUrl ? (
          <iframe
            key={refreshKey}
            src={serverUrl}
            className="w-full h-full border-0"
            title="Live Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">🌐</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {isServerRunning ? 'Starting server...' : 'Start Live Server'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Click "Start Server" to begin live preview
              </p>
              {!isServerRunning && (
                <button
                  onClick={startServer}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mx-auto"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Server</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fallback preview for when server is not running */}
      {!isServerRunning && (
        <div className="absolute inset-0 bg-white">
          <div className="w-full h-full">
            <iframe
              key={`preview-${refreshKey}`}
              srcDoc={previewContent}
              className="w-full h-full border-0"
              title="Static Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview;
