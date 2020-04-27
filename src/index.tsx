import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import App from './App'
import {GraphProvider} from './stores/graph/context'
import {ProjectsProvider} from './stores/projects/context'

ReactDOM.render(
<ProjectsProvider>
    <GraphProvider>
        <App />
    </GraphProvider>
</ProjectsProvider>
, document.getElementById('app-root'));
