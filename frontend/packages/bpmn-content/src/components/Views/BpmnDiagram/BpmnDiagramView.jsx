import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Container, Header, Segment, Dimmer, Loader } from 'semantic-ui-react';
// Import our custom BpmnViewer component
import BpmnViewer from './BpmnViewer';
// Import our custom styles
import './bpmn-diagram.css';

const messages = defineMessages({
  title: {
    id: 'BPMN Diagram',
    defaultMessage: 'BPMN Diagram',
  },
  description: {
    id: 'BPMN diagram view',
    defaultMessage: 'View for BPMN diagram content',
  },
  loading: {
    id: 'Loading BPMN diagram',
    defaultMessage: 'Loading BPMN diagram...',
  },
  error: {
    id: 'Error loading BPMN diagram',
    defaultMessage: 'Error loading BPMN diagram',
  },
});

/**
 * BpmnDiagramView component.
 * @param {Object} props - Component properties.
 * @returns {React.Component} - BpmnDiagramView component.
 */
const BpmnDiagramView = (props) => {
  const { content } = props;
  const intl = useIntl();
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // This effect runs only once after the component is mounted
  // to determine if we're in a browser environment
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // This effect runs only in the browser and only when we have content with a definition attribute
  useEffect(() => {
    if (isBrowser && content?.definition?.download) {
      setLoading(true);
      setError(null);
      
      fetch(content.definition.download)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          setFileContent(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching BPMN definition:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isBrowser, content?.definition?.download]);

  // Handle errors from the BpmnViewer component
  const handleViewerError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <Container className="view-wrapper bpmn-diagram-view">
      <Header as="h1" className="documentFirstHeading">
        {content.title}
      </Header>
      {content.description && (
        <p className="documentDescription">{content.description}</p>
      )}
      
      {/* Display diagram content */}
      <div className="bpmn-diagram-container">
        {loading && (
          <Dimmer active>
            <Loader>{intl.formatMessage(messages.loading)}</Loader>
          </Dimmer>
        )}
        
        {error && (
          <Segment color="red">
            <p>{intl.formatMessage(messages.error)}: {error}</p>
          </Segment>
        )}

        {/* Use our separate BpmnViewer component */}
        {fileContent && !loading && !error && (
          <BpmnViewer 
            xmlContent={fileContent} 
            onError={handleViewerError}
          />
        )}

        {/* Show message if no content is available */}
        {!fileContent && !loading && !error && (
          <p>No BPMN diagram content available.</p>
        )}
      </div>
    </Container>
  );
};

export default BpmnDiagramView;