import { BpmnDiagramView } from './components';

const applyConfig = (config) => {
  // Register the BpmnDiagramView component for bpmndiagram content type
  config.views = {
    ...config.views,
    contentTypesViews: {
      ...config.views.contentTypesViews,
      bpmndiagram: BpmnDiagramView,
    },
  };

  return config;
};

export default applyConfig;
