import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center text-slate-500">
            Atlas console — scaffolding in progress.
          </div>
        }
      />
    </Routes>
  )
}
