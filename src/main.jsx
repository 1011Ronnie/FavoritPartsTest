import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import { createAppStore } from './app/store'
import { PartsSearch } from './features/parts/PartsSearch'

const store = createAppStore()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PartsSearch />
    </Provider>
  </React.StrictMode>,
)
