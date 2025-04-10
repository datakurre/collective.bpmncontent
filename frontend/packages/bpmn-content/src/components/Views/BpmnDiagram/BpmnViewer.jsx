import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import BpmnJS from 'bpmn-js/lib/Viewer';
import minimapModule from 'diagram-js-minimap';
import zoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import moveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';

// Add CSS to hide the minimap toggle
import './bpmn-viewer.css';

/**
 * BpmnViewer component that encapsulates bpmn-js rendering logic.
 * @param {Object} props - Component properties.
 * @returns {React.Component} - BpmnViewer component.
 */
const BpmnViewer = ({ xmlContent, onError }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minimapVisible, setMinimapVisible] = useState(true);

  // Initialize and render the BPMN diagram when XML content changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if XML content is valid and not empty
    if (!xmlContent || !xmlContent.trim()) {
      if (onError) {
        onError('No diagram content provided or content is empty');
      }
      return;
    }

    setLoading(true);
    
    try {
      // Clean up existing viewer if any
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      // Create a new BPMN viewer instance with navigation modules
      const viewer = new BpmnJS({
        container: containerRef.current,
        additionalModules: [
          minimapModule,
          zoomScrollModule,
          moveCanvasModule
        ]
      });
      viewerRef.current = viewer;
      
      // Enable the minimap if it should be visible
      const minimap = viewer.get('minimap');
      if (minimapVisible) {
        minimap.open();
      } else {
        minimap.close();
      }

      // Setup zoom level tracking
      const canvas = viewer.get('canvas');
      const eventBus = viewer.get('eventBus');
      
      // Use eventBus to listen for zoom changes
      eventBus.on('canvas.viewbox.changed', () => {
        setZoomLevel(canvas.zoom());
      });

      // Import the XML with proper promise handling
      viewer
        .importXML(xmlContent)
        .then(({ warnings }) => {
          if (warnings && warnings.length) {
            console.warn('BPMN import warnings:', warnings);
          }
          
          // Adjust the view after the diagram is loaded
          canvas.zoom('fit-viewport', 'auto');
          
          // Get initial zoom level
          setZoomLevel(canvas.zoom());
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error rendering the BPMN diagram', err);
          if (onError) {
            onError(`Error rendering diagram: ${err.message || 'No diagram to display'}`);
          }
          setLoading(false);
        });
    } catch (err) {
      console.error('Error initializing BPMN viewer', err);
      if (onError) {
        onError(`Error initializing diagram viewer: ${err.message}`);
      }
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying BPMN viewer', err);
        }
      }
    };
  }, [xmlContent, onError, minimapVisible]);

  // Zoom in handler
  const handleZoomIn = () => {
    if (viewerRef.current) {
      const zoomScroll = viewerRef.current.get('zoomScroll');
      zoomScroll.stepZoom(1);
    }
  };

  // Zoom out handler
  const handleZoomOut = () => {
    if (viewerRef.current) {
      const zoomScroll = viewerRef.current.get('zoomScroll');
      zoomScroll.stepZoom(-1);
    }
  };

  // Reset zoom handler
  const handleResetZoom = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport', 'auto');
    }
  };

  // Toggle minimap handler
  const toggleMinimap = () => {
    setMinimapVisible(!minimapVisible);
    
    if (viewerRef.current) {
      const minimap = viewerRef.current.get('minimap');
      if (minimapVisible) {
        minimap.close();
      } else {
        minimap.open();
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Add inline style to hide minimap toggle */}
      <style>
        {`
          .djs-minimap-toggle {
            display: none !important;
          }
        `}
      </style>
      <div 
        ref={containerRef} 
        className="bpmn-canvas" 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '1px solid #ccc',
          marginTop: '20px',
          marginBottom: '20px',
          position: 'relative'
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '4px'
          }}>
            Loading diagram...
          </div>
        )}
        
        {/* Navigation controls - moved to bottom left and up to avoid overlap */}
        <div className="bpmn-controls" style={{
          position: 'absolute',
          left: '20px',
          bottom: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px',
          padding: '5px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          zIndex: 10
        }}>
          <div style={{ fontSize: '12px', marginBottom: '5px', textAlign: 'center' }}>
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <button
              onClick={handleZoomIn}
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px 10px',
                background: 'white'
              }}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px 10px',
                background: 'white'
              }}
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={handleResetZoom}
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px 10px',
                background: 'white'
              }}
              title="Reset Zoom"
            >
              ↻
            </button>
          </div>
          <button
            onClick={toggleMinimap}
            style={{
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '5px 10px',
              background: 'white',
              width: '100%',
              textAlign: 'center'
            }}
            title={minimapVisible ? "Hide Minimap" : "Show Minimap"}
          >
            {minimapVisible ? "Hide Minimap" : "Show Minimap"}
          </button>
        </div>
      </div>
      {/* Navigation instructions */}
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '5px',
        marginBottom: '20px',
        padding: '10px',
        background: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <strong>Navigation:</strong> Use mouse wheel to zoom, drag to pan. Toggle the minimap visibility with the button in the controls.
      </div>
    </div>
          
  );
};

BpmnViewer.propTypes = {
  xmlContent: PropTypes.string,
  onError: PropTypes.func,
};

export default BpmnViewer;